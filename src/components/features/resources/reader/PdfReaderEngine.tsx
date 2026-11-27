import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { AlertCircle, Download, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { Button } from '../../../ui/Button';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type PdfZoomMode = 'fit-width' | 'fit-page' | 'custom';

interface PdfReaderEngineProps {
  fileUrl: string;
  zoomMode: PdfZoomMode;
  customScale: number;
  rotation: number;
  currentPage: number;
  showThumbnails: boolean;
  thumbnailLayout: 'list' | 'grid';
  onThumbnailLayoutChange: (layout: 'list' | 'grid') => void;
  onNumPagesChange: (total: number) => void;
  onPageChange: (page: number) => void;
  onEffectiveScaleChange?: (scale: number) => void;
  onDownload?: () => void;
  jumpToken?: number;
}

interface PageDimensions {
  width: number;
  height: number;
}

interface PdfPageSlotProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  baseDimensions: PageDimensions;
  isNearViewport: boolean;
  scrollRoot: HTMLElement | null;
  onVisibleChange: (pageNumber: number, isVisible: boolean) => void;
  registerElement: (pageNumber: number, el: HTMLDivElement | null) => void;
}

const PdfPageSlot: React.FC<PdfPageSlotProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  baseDimensions,
  isNearViewport,
  scrollRoot,
  onVisibleChange,
  registerElement,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const [renderedKey, setRenderedKey] = useState<string>('');

  // Compute CSS pixel dimensions from unrotated/rotated base page proportions
  const isQuarterTurn = rotation % 180 !== 0;
  const displayWidth = Math.max(120, Math.round((isQuarterTurn ? baseDimensions.height : baseDimensions.width) * scale));
  const displayHeight = Math.max(160, Math.round((isQuarterTurn ? baseDimensions.width : baseDimensions.height) * scale));
  const targetKey = `${pageNumber}:${scale.toFixed(3)}:${rotation}`;

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      registerElement(pageNumber, node);
    },
    [pageNumber, registerElement]
  );

  // Track proximity to scroll viewport for lazy rendering
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          onVisibleChange(pageNumber, entry.isIntersecting);
        }
      },
      {
        root: scrollRoot,
        rootMargin: '500px 0px',
        threshold: 0.01,
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [pageNumber, scrollRoot, onVisibleChange]);

  // Render crisp HiDPI canvas + selectable PDF.js TextLayer when near viewport
  useEffect(() => {
    if (!isNearViewport || renderedKey === targetKey) return;

    let cancelled = false;
    let renderTask: RenderTask | null = null;
    let textLayerInstance: { render: () => Promise<void>; cancel?: () => void } | null = null;

    const renderPage = async () => {
      try {
        const page: PDFPageProxy = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, viewport.width, viewport.height);

        renderTask = page.render({
          canvas,
          canvasContext: ctx,
          viewport,
        });
        await renderTask.promise;
        if (cancelled) return;

        // Render selectable text overlay aligned over the canvas
        const textContainer = textLayerRef.current;
        if (textContainer) {
          textContainer.innerHTML = '';
          textContainer.style.setProperty('--scale-factor', String(viewport.scale));
          const textContent = await page.getTextContent();
          if (cancelled) return;

          const TextLayerCtor = (pdfjsLib as unknown as {
            TextLayer?: new (opts: {
              textContentSource: unknown;
              container: HTMLElement;
              viewport: unknown;
            }) => { render: () => Promise<void>; cancel?: () => void };
          }).TextLayer;

          if (TextLayerCtor) {
            textLayerInstance = new TextLayerCtor({
              textContentSource: textContent,
              container: textContainer,
              viewport,
            });
            await textLayerInstance.render();
          }
        }

        if (!cancelled) {
          setRenderedKey(targetKey);
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== 'RenderingCancelledException') {
          // Non-fatal single-page render interruption
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
      if (textLayerInstance?.cancel) {
        try {
          textLayerInstance.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, scale, rotation, isNearViewport, renderedKey, targetKey]);

  return (
    <div
      ref={setRefs}
      data-page-number={pageNumber}
      style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
      className="relative bg-white border border-border-light shadow-sm rounded-sm overflow-hidden shrink-0 mx-auto"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div ref={textLayerRef} className="asson-pdf-text-layer" />
      {renderedKey !== targetKey && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs font-mono text-text-muted pointer-events-none">
          Rendering page {pageNumber}…
        </div>
      )}
    </div>
  );
};

interface ThumbnailItemProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  isActive: boolean;
  compact: boolean;
  onSelect: (pageNumber: number) => void;
}

const PdfThumbnailItem: React.FC<ThumbnailItemProps> = ({
  pdfDoc,
  pageNumber,
  isActive,
  compact,
  onSelect,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const node = buttonRef.current;
    if (!node || rendered) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        pdfDoc
          .getPage(pageNumber)
          .then(async (page) => {
            if (cancelled) return;
            const baseVp = page.getViewport({ scale: 1 });
            const targetW = compact ? 70 : 124;
            const thumbScale = targetW / baseVp.width;
            const viewport = page.getViewport({ scale: thumbScale });
            const canvas = canvasRef.current;
            if (!canvas || cancelled) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);
            canvas.style.width = `${Math.round(viewport.width)}px`;
            canvas.style.height = `${Math.round(viewport.height)}px`;

            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) return;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, viewport.width, viewport.height);

            await page.render({ canvas, canvasContext: ctx, viewport }).promise;
            if (!cancelled) setRendered(true);
          })
          .catch(() => {});
      },
      { rootMargin: '120px 0px' }
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [pdfDoc, pageNumber, compact, rendered]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onSelect(pageNumber)}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={isActive ? 'page' : undefined}
      className="group flex flex-col items-center gap-1.5 w-full text-center cursor-pointer focus:outline-none"
    >
      <div
        className={`relative rounded-md overflow-hidden bg-white transition-all shadow-2xs ${
          isActive
            ? 'ring-2 ring-brand-green border border-brand-green'
            : 'border border-border-light group-hover:border-border-hover'
        }`}
      >
        <canvas ref={canvasRef} className="block bg-white min-w-[60px] min-h-[80px]" />
      </div>
      <span
        className={`text-xs font-mono leading-none ${
          isActive ? 'font-bold text-brand-green' : 'font-medium text-text-muted'
        }`}
      >
        {pageNumber}
      </span>
    </button>
  );
};

export const PdfReaderEngine: React.FC<PdfReaderEngineProps> = ({
  fileUrl,
  zoomMode,
  customScale,
  rotation,
  currentPage,
  showThumbnails,
  thumbnailLayout,
  onThumbnailLayoutChange,
  onNumPagesChange,
  onPageChange,
  onEffectiveScaleChange,
  onDownload,
  jumpToken = 0,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const programmaticScrollUntilRef = useRef<number>(0);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [baseDimensions, setBaseDimensions] = useState<PageDimensions>({ width: 595, height: 842 });
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [viewportBox, setViewportBox] = useState<{ width: number; height: number }>({ width: 800, height: 700 });
  const [nearPages, setNearPages] = useState<Set<number>>(() => new Set([1, 2]));

  // Observe reading stage dimensions so Fit Width / Fit Page stays crisp on resize/rotate
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      setViewportBox({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load PDF document via PDF.js
  useEffect(() => {
    let cancelled = false;
    setPdfDoc(null);
    setNumPages(0);
    setLoadProgress(0);
    setLoadError(null);

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      rangeChunkSize: 65536,
    });

    loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
      if (cancelled) return;
      if (total > 0) {
        setLoadProgress(Math.min(99, Math.round((loaded / total) * 100)));
      }
    };

    loadingTask.promise
      .then(async (doc) => {
        if (cancelled) {
          doc.cleanup().catch(() => {});
          return;
        }
        const firstPage = await doc.getPage(1);
        if (cancelled) {
          doc.cleanup().catch(() => {});
          return;
        }
        const vp1 = firstPage.getViewport({ scale: 1 });
        setBaseDimensions({ width: vp1.width, height: vp1.height });
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoadProgress(100);
        onNumPagesChange(doc.numPages);
        onPageChange(1);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Unable to load this PDF inside the browser.';
        setLoadError(message);
      });

    return () => {
      cancelled = true;
      loadingTask.destroy().catch(() => {});
    };
  }, [fileUrl, reloadKey, onNumPagesChange, onPageChange]);

  // Compute active zoom scale
  const effectiveScale = useMemo(() => {
    const isQuarterTurn = rotation % 180 !== 0;
    const unscaledW = isQuarterTurn ? baseDimensions.height : baseDimensions.width;
    const unscaledH = isQuarterTurn ? baseDimensions.width : baseDimensions.height;
    const isSmallScreen = viewportBox.width < 640;
    const horizontalPadding = isSmallScreen ? 16 : 48;
    const verticalPadding = isSmallScreen ? 24 : 40;

    if (zoomMode === 'fit-width') {
      const availW = Math.max(240, viewportBox.width - horizontalPadding);
      // Cap comfortable reading line width slightly on ultra-wide monitors while filling mobile edge-to-edge
      const targetW = isSmallScreen ? availW : Math.min(availW, 960);
      return Math.max(0.4, Math.min(2.5, targetW / unscaledW));
    }

    if (zoomMode === 'fit-page') {
      const availW = Math.max(240, viewportBox.width - horizontalPadding);
      const availH = Math.max(240, viewportBox.height - verticalPadding);
      return Math.max(0.35, Math.min(2.5, Math.min(availW / unscaledW, availH / unscaledH)));
    }

    return Math.max(0.4, Math.min(2.75, customScale));
  }, [zoomMode, customScale, rotation, baseDimensions, viewportBox]);

  useEffect(() => {
    onEffectiveScaleChange?.(effectiveScale);
  }, [effectiveScale, onEffectiveScaleChange]);

  const registerElement = useCallback((pageNumber: number, el: HTMLDivElement | null) => {
    if (el) {
      pageElementsRef.current.set(pageNumber, el);
    } else {
      pageElementsRef.current.delete(pageNumber);
    }
  }, []);

  const handleVisibleChange = useCallback((pageNumber: number, visible: boolean) => {
    setNearPages((prev) => {
      const has = prev.has(pageNumber);
      if (has === visible) return prev;
      const next = new Set(prev);
      if (visible) next.add(pageNumber);
      else next.delete(pageNumber);
      return next;
    });
  }, []);

  // Jump cleanly to target page when triggered by controls/thumbnails
  useEffect(() => {
    if (!jumpToken) return;
    const targetEl = pageElementsRef.current.get(currentPage);
    if (!targetEl) return;
    programmaticScrollUntilRef.current = Date.now() + 650;
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [jumpToken, currentPage]);

  // Update active page indicator as user scrolls naturally
  const handleScroll = useCallback(() => {
    if (Date.now() < programmaticScrollUntilRef.current) return;
    const container = scrollContainerRef.current;
    if (!container || numPages <= 1) return;

    const containerRect = container.getBoundingClientRect();
    const anchorY = containerRect.top + containerRect.height * 0.35;

    let bestPage = currentPage;
    let bestDistance = Number.POSITIVE_INFINITY;

    pageElementsRef.current.forEach((el, pageNum) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= anchorY && rect.bottom >= anchorY) {
        bestPage = pageNum;
        bestDistance = 0;
        return;
      }
      const dist = Math.min(Math.abs(rect.top - anchorY), Math.abs(rect.bottom - anchorY));
      if (dist < bestDistance) {
        bestDistance = dist;
        bestPage = pageNum;
      }
    });

    if (bestPage !== currentPage) {
      onPageChange(bestPage);
    }
  }, [numPages, currentPage, onPageChange]);

  const selectThumbnailPage = useCallback(
    (pageNumber: number) => {
      const targetEl = pageElementsRef.current.get(pageNumber);
      programmaticScrollUntilRef.current = Date.now() + 650;
      onPageChange(pageNumber);
      targetEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [onPageChange]
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, idx) => idx + 1),
    [numPages]
  );

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-bg">
        <div className="max-w-md w-full bg-surface-card border border-border-light rounded-2xl p-6 text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-brand-red-light text-brand-red flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-text-main">Unable to Render PDF</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              We could not render this document inline ({loadError}). You can retry or download the original file directly.
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
                <Download className="w-4 h-4 mr-1.5" /> Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden bg-surface-bg">
      {/* Desktop Collapsible Thumbnail Rail (Inspired by Reference 1) */}
      {showThumbnails && pdfDoc && numPages > 1 && (
        <aside
          aria-label="Page thumbnails"
          className="hidden md:flex flex-col w-44 shrink-0 bg-surface-card border-r border-border-light select-none"
        >
          <div className="flex-1 overflow-y-auto p-3">
            <div className={thumbnailLayout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3.5'}>
              {pageNumbers.map((pageNum) => (
                <PdfThumbnailItem
                  key={pageNum}
                  pdfDoc={pdfDoc}
                  pageNumber={pageNum}
                  isActive={currentPage === pageNum}
                  compact={thumbnailLayout === 'grid'}
                  onSelect={selectThumbnailPage}
                />
              ))}
            </div>
          </div>

          <div className="h-10 border-t border-border-light px-3 flex items-center justify-center gap-2 shrink-0 bg-surface-card">
            <button
              type="button"
              onClick={() => onThumbnailLayoutChange('list')}
              aria-label="Single column thumbnail list"
              className={`w-8 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                thumbnailLayout === 'list'
                  ? 'bg-brand-light text-brand-green'
                  : 'text-text-muted hover:bg-surface-subtle'
              }`}
              title="Single column view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onThumbnailLayoutChange('grid')}
              aria-label="Two column thumbnail grid"
              className={`w-8 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                thumbnailLayout === 'grid'
                  ? 'bg-brand-light text-brand-green'
                  : 'text-text-muted hover:bg-surface-subtle'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Continuous Scroll Canvas */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-w-0 overflow-auto px-2 py-3 sm:px-6 sm:py-6 relative"
      >
        {!pdfDoc ? (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-48 h-1.5 rounded-full bg-border-light overflow-hidden">
              <div
                className="h-full bg-brand-green transition-all duration-200"
                style={{ width: `${Math.max(12, loadProgress)}%` }}
              />
            </div>
            <p className="text-xs font-medium text-text-muted font-mono">
              Loading document {loadProgress > 0 && loadProgress < 100 ? `(${loadProgress}%)` : '…'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:gap-5 pb-16 md:pb-6">
            {pageNumbers.map((pageNum) => (
              <PdfPageSlot
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNumber={pageNum}
                scale={effectiveScale}
                rotation={rotation}
                baseDimensions={baseDimensions}
                isNearViewport={nearPages.has(pageNum) || Math.abs(pageNum - currentPage) <= 1}
                scrollRoot={scrollContainerRef.current}
                onVisibleChange={handleVisibleChange}
                registerElement={registerElement}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
