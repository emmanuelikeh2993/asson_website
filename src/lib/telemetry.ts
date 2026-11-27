export type TelemetryEventName =
  | 'search_zero_results'
  | 'resource_downloaded'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'cgpa_computed';

export type TelemetryPrimitive = string | number | boolean;
export type TelemetryProps = Record<string, TelemetryPrimitive>;

export interface RecordedTelemetryEvent {
  name: TelemetryEventName;
  props: TelemetryProps;
  route: string;
  timestamp: string;
}

export interface ErrorReportPayload {
  name: string;
  message: string;
  stack?: string;
  source: 'error_boundary' | 'window_error' | 'unhandled_rejection' | 'manual';
  route: string;
  timestamp: string;
}

const PII_KEY_PATTERN = /(email|password|token|secret|phone|matric|student_?id|user|name|auth|cookie)/i;
const MAX_BUFFERED_EVENTS = 50;

const eventBuffer: RecordedTelemetryEvent[] = [];
const errorBuffer: ErrorReportPayload[] = [];
let errorSink: ((payload: ErrorReportPayload) => void) | null = null;
let listenersInitialized = false;

declare global {
  interface Window {
    va?: (command: 'event' | 'pageview', payload?: Record<string, unknown>) => void;
  }
}

function getSafeRoute(): string {
  if (typeof window === 'undefined' || !window.location) return '/';
  return window.location.pathname || '/';
}

function sanitizeProps(props?: Record<string, unknown>): TelemetryProps {
  const safe: TelemetryProps = {};
  if (!props) return safe;

  for (const [key, value] of Object.entries(props)) {
    if (PII_KEY_PATTERN.test(key)) continue;
    if (typeof value === 'string') {
      safe[key] = value.slice(0, 120);
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      safe[key] = value;
    } else if (typeof value === 'boolean') {
      safe[key] = value;
    }
  }
  return safe;
}

export function setErrorReportSink(sink: ((payload: ErrorReportPayload) => void) | null): void {
  errorSink = sink;
}

export function getTelemetrySnapshot(): {
  events: readonly RecordedTelemetryEvent[];
  errors: readonly ErrorReportPayload[];
} {
  return {
    events: [...eventBuffer],
    errors: [...errorBuffer],
  };
}

export function clearTelemetrySnapshot(): void {
  eventBuffer.length = 0;
  errorBuffer.length = 0;
}

function postBeaconOrKeepalive(endpoint: string | undefined, body: object): void {
  if (!endpoint || typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(body);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([serialized], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    }
    if (typeof fetch === 'function') {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Telemetry must never break student workflows
  }
}

/**
 * Records a privacy-respecting product analytics event (zero PII).
 */
export function trackEvent(name: TelemetryEventName, props?: Record<string, unknown>): void {
  const safeProps = sanitizeProps(props);
  const entry: RecordedTelemetryEvent = {
    name,
    props: safeProps,
    route: getSafeRoute(),
    timestamp: new Date().toISOString(),
  };

  eventBuffer.push(entry);
  if (eventBuffer.length > MAX_BUFFERED_EVENTS) {
    eventBuffer.shift();
  }

  if (typeof window !== 'undefined' && typeof window.va === 'function') {
    try {
      window.va('event', { name, ...safeProps });
    } catch {
      // ignore analytics provider errors
    }
  }

  const endpoint = import.meta.env?.VITE_ANALYTICS_ENDPOINT as string | undefined;
  postBeaconOrKeepalive(endpoint, entry);
}

/**
 * Captures and forwards unexpected production runtime exceptions without leaking PII.
 */
export function reportError(
  error: unknown,
  source: ErrorReportPayload['source'] = 'manual',
  componentStack?: string
): void {
  const errObj = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown platform error');
  const rawStack = componentStack || errObj.stack || '';
  const payload: ErrorReportPayload = {
    name: errObj.name || 'Error',
    message: (errObj.message || 'Unknown platform error').slice(0, 300),
    stack: rawStack ? rawStack.split('\n').slice(0, 6).join('\n').slice(0, 600) : undefined,
    source,
    route: getSafeRoute(),
    timestamp: new Date().toISOString(),
  };

  errorBuffer.push(payload);
  if (errorBuffer.length > MAX_BUFFERED_EVENTS) {
    errorBuffer.shift();
  }

  if (errorSink) {
    try {
      errorSink(payload);
    } catch {
      // ignore sink errors
    }
  }

  const endpoint = import.meta.env?.VITE_ERROR_REPORTING_ENDPOINT as string | undefined;
  postBeaconOrKeepalive(endpoint, payload);
}

/**
 * Registers global window error & unhandledrejection hooks once on startup.
 */
export function initErrorMonitoring(): void {
  if (listenersInitialized || typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
    return;
  }
  listenersInitialized = true;

  window.addEventListener('error', (event: ErrorEvent) => {
    reportError(event.error || event.message, 'window_error');
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    reportError(event.reason, 'unhandled_rejection');
  });
}
