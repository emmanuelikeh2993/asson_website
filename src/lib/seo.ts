export interface RouteMetadataOptions {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

const SITE_ORIGIN = 'https://asson-ui.vercel.app';

function upsertMeta(selector: string, attrName: 'name' | 'property', attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Synchronizes document title, description, canonical URL, OpenGraph, Twitter,
 * and robots indexing directives per active route.
 */
export function applyRouteMetadata({ title, description, path, noindex = false }: RouteMetadataOptions): void {
  if (typeof document === 'undefined') return;

  const cleanPath = path === '/' ? '/' : path.replace(/\/+$/, '');
  const fullUrl = `${SITE_ORIGIN}${cleanPath}`;

  document.title = title;
  upsertCanonical(fullUrl);
  upsertMeta('meta[name="description"]', 'name', 'description', description);
  upsertMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', fullUrl);
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
}
