import React, { useEffect, useState, useRef, useCallback } from 'react';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Button } from '../../../ui/Button';

export interface DocxHeadingItem {
  id: string;
  text: string;
  level: number;
}

interface DocxReaderEngineProps {
  fileUrl: string;
  fontSizePx: number;
  showOutline: boolean;
  onOutlineChange?: (items: DocxHeadingItem[]) => void;
  onDownload?: () => void;
}

export const DocxReaderEngine: React.FC<DocxReaderEngineProps> = ({
  fileUrl,
  fontSizePx,
  showOutline,
  onOutlineChange,
  onDownload,
}) => {
  const [cleanHtml, setCleanHtml] = useState<string>('');
  const [headings, setHeadings] = useState<DocxHeadingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const proseContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setCleanHtml('');
    setHeadings([]);

    fetch(fileUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.arrayBuffer();
      })
      .then(async (arrayBuffer) => {
        if (controller.signal.aborted) return;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (controller.signal.aborted) return;

        const sanitized = DOMPurify.sanitize(result.value, {
          USE_PROFILES: { html: true },
          FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        });

        // Parse headings from sanitized DOM fragment so clickable section jump stays accurate
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitized, 'text/html');
        const extractedHeadings: DocxHeadingItem[] = [];
        doc.querySelectorAll('h1, h2, h3').forEach((node, index) => {
          const text = (node.textContent || '').trim();
          if (!text) return;
          const id = `asson-doc-sec-${index + 1}`;
          node.setAttribute('id', id);
          extractedHeadings.push({
            id,
            text,
            level: Number(node.tagName.replace('H', '')) || 2,
          });
        });

        setHeadings(extractedHeadings);
        onOutlineChange?.(extractedHeadings);
        setCleanHtml(doc.body.innerHTML);
        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error && err.message ? err.message : 'Unable to parse Word document.');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [fileUrl, reloadKey, onOutlineChange]);

  const scrollToHeading = useCallback((id: string) => {
    const root = proseContainerRef.current;
    if (!root) return;
    const escaped = CSS.escape ? CSS.escape(id) : id;
    const el = root.querySelector(`#${escaped}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-bg">
        <div className="max-w-md w-full bg-surface-card border border-border-light rounded-2xl p-6 text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-brand-red-light text-brand-red flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-text-main">Unable to Open Word Document</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              This `.docx` file could not be rendered inline ({error}). You can retry or download the file directly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              variant="outline"
              size="md"
              onClick={() => setReloadKey((k) => k + 1)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Retry
            </Button>
            {onDownload && (
              <Button
                variant="primary"
                size="md"
                onClick={onDownload}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download DOCX
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden bg-surface-bg">
      {/* Optional Desktop Section Outline Rail */}
      {showOutline && headings.length > 0 && (
        <aside
          aria-label="Document sections"
          className="hidden md:flex flex-col w-56 shrink-0 bg-surface-card border-r border-border-light p-3 overflow-y-auto"
        >
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider px-2 pb-2">
            Sections
          </p>
          <nav className="space-y-1">
            {headings.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => scrollToHeading(h.id)}
                style={{ paddingLeft: `${Math.max(8, (h.level - 1) * 12 + 8)}px` }}
                className="w-full text-left py-1.5 pr-2 rounded-lg text-xs text-text-muted hover:text-brand-green hover:bg-surface-subtle transition-colors truncate cursor-pointer"
                title={h.text}
              >
                {h.text}
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* Reflowable Academic Paper Canvas */}
      <div className="flex-1 min-w-0 overflow-auto px-2 py-3 sm:px-6 sm:py-6">
        {isLoading ? (
          <div className="max-w-[780px] mx-auto bg-surface-card border border-border-light rounded-xl p-6 sm:p-10 space-y-4 shadow-card animate-pulse">
            <div className="h-6 bg-surface-subtle rounded w-2/3" />
            <div className="h-4 bg-surface-subtle rounded w-full" />
            <div className="h-4 bg-surface-subtle rounded w-5/6" />
            <div className="h-4 bg-surface-subtle rounded w-4/5" />
          </div>
        ) : cleanHtml.trim() ? (
          <article
            ref={proseContainerRef}
            style={{ fontSize: `${fontSizePx}px` }}
            className="max-w-[780px] mx-auto bg-surface-card border border-border-light rounded-xl sm:rounded-2xl px-4 py-5 sm:px-10 sm:py-9 shadow-card asson-docx-prose mb-16 md:mb-6"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        ) : (
          <div className="max-w-md mx-auto bg-surface-card border border-border-light rounded-2xl p-6 text-center space-y-3 shadow-card">
            <p className="text-sm font-semibold text-text-main">No Readable Text Found</p>
            <p className="text-xs text-text-muted">
              This Word document appears empty or contains formatting only supported natively.
            </p>
            {onDownload && (
              <Button variant="primary" size="md" onClick={onDownload} className="min-h-[44px]">
                <Download className="w-4 h-4 mr-1.5" /> Download DOCX
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
