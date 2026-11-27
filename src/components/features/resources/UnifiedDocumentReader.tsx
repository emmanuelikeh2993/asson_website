import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  X,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Type,
  Maximize,
} from 'lucide-react';
import { detectDocumentKind } from '../../../lib/resourceUrl';
import { formatFileSize } from '../../../lib/utils';
import type { PdfZoomMode } from './reader/PdfReaderEngine';
import type { DocxHeadingItem } from './reader/DocxReaderEngine';

const PdfReaderEngine = lazy(() =>
  import('./reader/PdfReaderEngine').then((m) => ({ default: m.PdfReaderEngine }))
);
const DocxReaderEngine = lazy(() =>
  import('./reader/DocxReaderEngine').then((m) => ({ default: m.DocxReaderEngine }))
);
const ImageReaderEngine = lazy(() =>
  import('./reader/ImageReaderEngine').then((m) => ({ default: m.ImageReaderEngine }))
);

export interface UnifiedDocumentReaderProps {
  title: string;
  courseCode?: string;
  subtitle?: string;
  fileUrl: string | null;
  fileType?: string;
  filePath?: string;
  fileSizeBytes?: number;
  variant?: 'workspace' | 'embedded';
  onClose?: () => void;
  onExpand?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  pendingFallback?: React.ReactNode;
}

const ZOOM_PRESETS = [0.75, 1, 1.25, 1.5, 2];

export const UnifiedDocumentReader: React.FC<UnifiedDocumentReaderProps> = ({
  title,
  courseCode,
  subtitle,
  fileUrl,
  fileType,
  filePath,
  fileSizeBytes,
  variant = 'workspace',
  onClose,
  onExpand,
  onDownload,
  onShare,
  pendingFallback,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const kind = fileUrl ? detectDocumentKind(fileUrl, fileType, filePath) : 'unknown';

  // PDF state
  const [pdfZoomMode, setPdfZoomMode] = useState<PdfZoomMode>('fit-width');
  const [pdfCustomScale, setPdfCustomScale] = useState<number>(1.0);
  const [pdfEffectiveScale, setPdfEffectiveScale] = useState<number>(1.0);
  const [pdfNumPages, setPdfNumPages] = useState<number>(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [jumpToken, setJumpToken] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(() =>
    variant === 'workspace' && typeof window !== 'undefined' ? window.innerWidth >= 1280 : false
  );
  const [thumbnailLayout, setThumbnailLayout] = useState<'list' | 'grid'>('list');

  // Image state
  const [imageFitMode, setImageFitMode] = useState<boolean>(true);
  const [imageScale, setImageScale] = useState<number>(1.0);

  // DOCX reflow typography state
  const [docxFontPx, setDocxFontPx] = useState<number>(16);
  const [docxHeadings, setDocxHeadings] = useState<DocxHeadingItem[]>([]);

  // Shared state
  const [rotation, setRotation] = useState<number>(0);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);
  const [isCssExpanded, setIsCssExpanded] = useState<boolean>(false);

  // Reset per-document view state when file changes
  useEffect(() => {
    setPdfZoomMode('fit-width');
    setPdfCustomScale(1.0);
    setPdfNumPages(0);
    setPdfCurrentPage(1);
    setPageInput('1');
    setImageFitMode(true);
    setImageScale(1.0);
    setRotation(0);
    setDocxHeadings([]);
  }, [fileUrl]);

  // Keep page input text aligned when scroll-spy changes currentPage
  useEffect(() => {
    setPageInput(String(pdfCurrentPage));
  }, [pdfCurrentPage]);

  // Listen to native Fullscreen API state
  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(document.fullscreenElement === rootRef.current);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const isFullscreenActive = isBrowserFullscreen || isCssExpanded;

  const toggleFullscreen = useCallback(async () => {
    if (variant === 'embedded' && onExpand && !isFullscreenActive) {
      onExpand();
      return;
    }

    const node = rootRef.current;
    if (!node) return;

    if (document.fullscreenElement === node) {
      try {
        await document.exitFullscreen();
      } catch {
        setIsCssExpanded(false);
      }
      return;
    }

    if (isCssExpanded) {
      setIsCssExpanded(false);
      return;
    }

    if (typeof node.requestFullscreen === 'function') {
      try {
        await node.requestFullscreen();
        return;
      } catch {
        // Fallback smoothly on iOS Safari / embedded contexts without RequestFullscreen
      }
    }
    setIsCssExpanded(true);
  }, [variant, onExpand, isFullscreenActive, isCssExpanded]);

  const jumpToPage = useCallback(
    (target: number) => {
      if (pdfNumPages <= 0) return;
      const clamped = Math.max(1, Math.min(pdfNumPages, target));
      setPdfCurrentPage(clamped);
      setPageInput(String(clamped));
      setJumpToken((t) => t + 1);
    },
    [pdfNumPages]
  );

  const handlePageInputCommit = () => {
    const parsed = parseInt(pageInput, 10);
    if (!Number.isNaN(parsed)) {
      jumpToPage(parsed);
    } else {
      setPageInput(String(pdfCurrentPage));
    }
  };

  const handleZoomIn = useCallback(() => {
    if (kind === 'pdf') {
      const base = pdfZoomMode === 'custom' ? pdfCustomScale : pdfEffectiveScale;
      setPdfZoomMode('custom');
      setPdfCustomScale(Math.min(2.5, Number((base + 0.15).toFixed(2))));
    } else if (kind === 'image') {
      setImageFitMode(false);
      setImageScale((s) => Math.min(3, Number((s + 0.25).toFixed(2))));
    } else if (kind === 'docx') {
      setDocxFontPx((px) => Math.min(22, px + 2));
    }
  }, [kind, pdfZoomMode, pdfCustomScale, pdfEffectiveScale]);

  const handleZoomOut = useCallback(() => {
    if (kind === 'pdf') {
      const base = pdfZoomMode === 'custom' ? pdfCustomScale : pdfEffectiveScale;
      setPdfZoomMode('custom');
      setPdfCustomScale(Math.max(0.5, Number((base - 0.15).toFixed(2))));
    } else if (kind === 'image') {
      setImageFitMode(false);
      setImageScale((s) => Math.max(0.5, Number((s - 0.25).toFixed(2))));
    } else if (kind === 'docx') {
      setDocxFontPx((px) => Math.max(13, px - 2));
    }
  }, [kind, pdfZoomMode, pdfCustomScale, pdfEffectiveScale]);

  const handleFitToggle = useCallback(() => {
    if (kind === 'pdf') {
      setPdfZoomMode((prev) => (prev === 'fit-width' ? 'fit-page' : 'fit-width'));
    } else if (kind === 'image') {
      setImageFitMode((prev) => !prev);
      setImageScale(1);
    }
  }, [kind]);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  // Keyboard shortcuts inside workspace / expanded reader
  useEffect(() => {
    if (variant !== 'workspace' && !isFullscreenActive) return;

    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape') {
        if (isCssExpanded) {
          setIsCssExpanded(false);
          e.stopPropagation();
          return;
        }
        if (!document.fullscreenElement) {
          onClose?.();
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleFitToggle();
      } else if (e.key.toLowerCase() === 'r' && (kind === 'pdf' || kind === 'image')) {
        e.preventDefault();
        handleRotate();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'ArrowRight' && kind === 'pdf' && pdfNumPages > 1) {
        jumpToPage(pdfCurrentPage + 1);
      } else if (e.key === 'ArrowLeft' && kind === 'pdf' && pdfNumPages > 1) {
        jumpToPage(pdfCurrentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    variant,
    isFullscreenActive,
    isCssExpanded,
    kind,
    pdfNumPages,
    pdfCurrentPage,
    onClose,
    handleZoomIn,
    handleZoomOut,
    handleFitToggle,
    handleRotate,
    toggleFullscreen,
    jumpToPage,
  ]);

  const zoomPercent =
    kind === 'pdf'
      ? Math.round((pdfZoomMode === 'custom' ? pdfCustomScale : pdfEffectiveScale) * 100)
      : kind === 'image'
      ? Math.round((imageFitMode ? 1 : imageScale) * 100)
      : Math.round((docxFontPx / 16) * 100);

  const metaParts: string[] = [];
  if (subtitle) metaParts.push(subtitle);
  if (fileType) metaParts.push(fileType.toUpperCase());
  if (fileSizeBytes && fileSizeBytes > 0) metaParts.push(formatFileSize(fileSizeBytes));
  const metaLine = metaParts.join(' • ');

  const isSidebarSupported =
    (kind === 'pdf' && pdfNumPages > 1) || (kind === 'docx' && docxHeadings.length > 0);

  const containerClasses =
    isCssExpanded
      ? 'fixed inset-0 z-[70] flex flex-col bg-surface-bg text-text-main overflow-hidden'
      : variant === 'workspace'
      ? 'w-full h-full flex flex-col bg-surface-bg text-text-main overflow-hidden'
      : 'w-full h-[540px] sm:h-[640px] flex flex-col bg-surface-bg text-text-main rounded-2xl border border-border-light overflow-hidden shadow-card';

  return (
    <div ref={rootRef} className={containerClasses}>
      {/* =====================================================================
          DESKTOP TOP HEADER BAR (Reference 1-inspired calm single bar + green CTA)
         ===================================================================== */}
      <header className="hidden md:flex h-14 px-4 bg-surface-card border-b border-border-light items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {variant === 'workspace' && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close document reader"
              className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {courseCode ? (
            <span className="px-2.5 py-1 rounded-lg bg-brand-light text-brand-green text-xs font-mono font-extrabold tracking-tight border border-brand-green/20 shrink-0">
              {courseCode}
            </span>
          ) : (
            <span className="w-8 h-8 rounded-lg bg-brand-light text-brand-green flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </span>
          )}

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-main truncate leading-snug">{title}</h2>
            {metaLine && (
              <p className="text-xs text-text-muted truncate leading-tight">{metaLine}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              aria-label="Share document link"
              className="h-10 px-3 rounded-xl border border-border-light bg-surface-card text-text-muted hover:text-text-main hover:border-border-hover text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share link"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreenActive ? 'Exit fullscreen' : 'Open fullscreen'}
            className="h-10 px-3 rounded-xl border border-border-light bg-surface-card text-text-muted hover:text-text-main hover:border-border-hover text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isFullscreenActive ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreenActive ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>{variant === 'embedded' ? 'Expand' : 'Fullscreen'}</span>
              </>
            )}
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="h-10 px-4 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          DESKTOP UTILITY TOOLBAR (Page jumper + Rotate/Fit + Zoom presets)
         ===================================================================== */}
      {fileUrl && (
        <div className="hidden md:flex h-11 px-4 bg-surface-card border-b border-border-light items-center justify-between gap-4 shrink-0 select-none">
          {/* Left: Sidebar Toggle + Page Stepper */}
          <div className="flex items-center gap-2.5">
            {isSidebarSupported && (
              <button
                type="button"
                onClick={() => setShowSidebar((s) => !s)}
                aria-label="Toggle navigation sidebar"
                aria-pressed={showSidebar}
                className={`h-8 px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showSidebar
                    ? 'bg-brand-light text-brand-green border-brand-green/30'
                    : 'bg-surface-bg text-text-muted border-border-light hover:text-text-main'
                }`}
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span>{kind === 'pdf' ? 'Pages' : 'Sections'}</span>
              </button>
            )}

            {kind === 'pdf' && pdfNumPages > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted pl-1">
                <button
                  type="button"
                  onClick={() => jumpToPage(pdfCurrentPage - 1)}
                  disabled={pdfCurrentPage <= 1}
                  aria-label="Previous page"
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-subtle disabled:opacity-35 cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page</span>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Current page number"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ''))}
                  onBlur={handlePageInputCommit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePageInputCommit();
                      (e.currentTarget as HTMLInputElement).blur();
                    }
                  }}
                  className="w-11 h-7 text-center font-mono font-bold text-xs text-text-main bg-surface-bg border border-border-light rounded-md focus:outline-none focus:border-brand-green"
                  style={{ fontSize: '12px' }}
                />
                <span className="font-mono">of {pdfNumPages}</span>
                <button
                  type="button"
                  onClick={() => jumpToPage(pdfCurrentPage + 1)}
                  disabled={pdfCurrentPage >= pdfNumPages}
                  aria-label="Next page"
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-subtle disabled:opacity-35 cursor-pointer disabled:cursor-default"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Center: Format-Appropriate Controls */}
          <div className="flex items-center gap-2">
            {(kind === 'pdf' || kind === 'image') && (
              <>
                <button
                  type="button"
                  onClick={handleRotate}
                  aria-label="Rotate 90 degrees"
                  className="h-8 px-2.5 rounded-lg border border-border-light bg-surface-card text-text-muted hover:text-text-main text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Rotate 90° (R)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>

                <button
                  type="button"
                  onClick={handleFitToggle}
                  className={`h-8 px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    (kind === 'pdf' && pdfZoomMode !== 'custom') || (kind === 'image' && imageFitMode)
                      ? 'bg-brand-light text-brand-green border-brand-green/30'
                      : 'bg-surface-card text-text-muted border-border-light hover:text-text-main'
                  }`}
                >
                  <Maximize className="w-3.5 h-3.5" />
                  <span>
                    {kind === 'pdf'
                      ? pdfZoomMode === 'fit-page'
                        ? 'Fit Page'
                        : 'Fit Width'
                      : imageFitMode
                      ? 'Fit Screen'
                      : 'Reset Fit'}
                  </span>
                </button>
              </>
            )}

            {kind === 'docx' && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Type className="w-3.5 h-3.5 text-brand-green" />
                <span className="font-medium">Reading Text:</span>
                {[
                  { label: 'Compact', px: 14 },
                  { label: 'Comfort', px: 16 },
                  { label: 'Large', px: 18 },
                ].map((opt) => (
                  <button
                    key={opt.px}
                    type="button"
                    onClick={() => setDocxFontPx(opt.px)}
                    className={`h-7 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      docxFontPx === opt.px
                        ? 'bg-brand-light text-brand-green'
                        : 'text-text-muted hover:bg-surface-subtle'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Zoom Stepper + Dropdown */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors cursor-pointer"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {kind === 'pdf' ? (
              <select
                aria-label="Zoom level"
                value={pdfZoomMode === 'custom' ? String(pdfCustomScale) : pdfZoomMode}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'fit-width' || val === 'fit-page') {
                    setPdfZoomMode(val);
                  } else {
                    setPdfZoomMode('custom');
                    setPdfCustomScale(parseFloat(val));
                  }
                }}
                className="h-8 px-2 rounded-lg border border-border-light bg-surface-bg text-xs font-mono font-semibold text-text-main focus:outline-none focus:border-brand-green cursor-pointer"
                style={{ fontSize: '12px' }}
              >
                <option value="fit-width">Fit Width ({zoomPercent}%)</option>
                <option value="fit-page">Fit Page</option>
                {ZOOM_PRESETS.map((z) => (
                  <option key={z} value={String(z)}>
                    {Math.round(z * 100)}%
                  </option>
                ))}
              </select>
            ) : (
              <span className="min-w-[54px] text-center text-xs font-mono font-bold text-text-main">
                {zoomPercent}%
              </span>
            )}

            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors cursor-pointer"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MOBILE SOFT-TINTED HEADER ZONE (Reference 2-inspired floating corner pills)
         ===================================================================== */}
      <header className="flex md:hidden px-3 py-2.5 bg-surface-subtle border-b border-border-light items-center justify-between gap-2 shrink-0">
        <div className="shrink-0">
          {variant === 'workspace' && onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close reader"
              className="w-11 h-11 rounded-full bg-surface-card border border-border-light text-text-main flex items-center justify-center shadow-2xs active:scale-95 transition-transform cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreenActive ? 'Exit fullscreen' : 'Expand reader'}
              className="w-11 h-11 rounded-full bg-surface-card border border-border-light text-text-main flex items-center justify-center shadow-2xs active:scale-95 transition-transform cursor-pointer"
            >
              {isFullscreenActive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center px-1">
          <p className="text-xs font-extrabold text-text-main truncate">
            {courseCode ? `${courseCode} · ${title}` : title}
          </p>
          {metaLine && (
            <p className="text-xs text-text-muted truncate leading-tight">{metaLine}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              aria-label="Share document"
              className="w-11 h-11 rounded-full bg-surface-card border border-border-light text-text-main flex items-center justify-center shadow-2xs active:scale-95 transition-transform cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              aria-label="Download file"
              className="w-11 h-11 rounded-full bg-brand-green text-white flex items-center justify-center shadow-2xs active:scale-95 transition-transform cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          DOCUMENT READING BODY (PDF.js / Mammoth+DOMPurify / Pan-Zoom Image)
         ===================================================================== */}
      {!fileUrl ? (
        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-4 sm:p-8 bg-surface-bg">
          {pendingFallback || (
            <div className="max-w-md w-full bg-surface-card border border-border-light rounded-2xl p-6 text-center space-y-3 shadow-card">
              <FileText className="w-10 h-10 text-brand-green mx-auto" />
              <h3 className="text-base font-bold text-text-main">No Preview File Attached</h3>
              <p className="text-xs text-text-muted">
                This catalog entry does not have a digital file uploaded yet.
              </p>
            </div>
          )}
        </div>
      ) : kind === 'pdf' ? (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center bg-surface-bg text-xs font-mono text-text-muted">
              Preparing PDF engine…
            </div>
          }
        >
          <PdfReaderEngine
            fileUrl={fileUrl}
            zoomMode={pdfZoomMode}
            customScale={pdfCustomScale}
            rotation={rotation}
            currentPage={pdfCurrentPage}
            showThumbnails={showSidebar}
            thumbnailLayout={thumbnailLayout}
            onThumbnailLayoutChange={setThumbnailLayout}
            onNumPagesChange={setPdfNumPages}
            onPageChange={setPdfCurrentPage}
            onEffectiveScaleChange={setPdfEffectiveScale}
            onDownload={onDownload}
            jumpToken={jumpToken}
          />
        </Suspense>
      ) : kind === 'docx' ? (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center bg-surface-bg text-xs font-mono text-text-muted">
              Preparing document reader…
            </div>
          }
        >
          <DocxReaderEngine
            fileUrl={fileUrl}
            fontSizePx={docxFontPx}
            showOutline={showSidebar}
            onOutlineChange={setDocxHeadings}
            onDownload={onDownload}
          />
        </Suspense>
      ) : kind === 'image' ? (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center bg-surface-bg text-xs font-mono text-text-muted">
              Loading image viewer…
            </div>
          }
        >
          <ImageReaderEngine
            fileUrl={fileUrl}
            alt={title}
            zoomScale={imageScale}
            isFitMode={imageFitMode}
            rotation={rotation}
            onToggleFitZoom={() => {
              if (imageFitMode) {
                setImageFitMode(false);
                setImageScale(1.75);
              } else {
                setImageFitMode(true);
                setImageScale(1);
              }
            }}
            onDownload={onDownload}
          />
        </Suspense>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center p-6 bg-surface-bg">
          <div className="max-w-md w-full bg-surface-card border border-border-light rounded-2xl p-6 text-center space-y-4 shadow-card">
            <FileText className="w-10 h-10 text-brand-green mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-main">Unsupported Preview Format</h3>
              <p className="text-xs text-text-muted">
                Inline reading supports PDF, DOCX, PNG, JPG, and WebP files. Download this resource to open it locally.
              </p>
            </div>
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="min-h-[44px] px-5 rounded-xl bg-brand-green text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MOBILE THUMB-ZONE BOTTOM READING DOCK (44x44px hits, edge-to-edge UX)
         ===================================================================== */}
      {fileUrl && (
        <nav
          aria-label="Mobile reading controls"
          className="flex md:hidden items-center justify-between gap-1 px-2 py-1.5 bg-surface-card border-t border-border-light shrink-0 pb-[max(6px,env(safe-area-inset-bottom))]"
        >
          {kind === 'pdf' && (
            <>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => jumpToPage(pdfCurrentPage - 1)}
                  disabled={pdfCurrentPage <= 1}
                  aria-label="Previous page"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle disabled:opacity-35 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-2 py-1 rounded-lg bg-surface-subtle text-xs font-mono font-bold text-text-main whitespace-nowrap">
                  {pdfCurrentPage} / {pdfNumPages || '–'}
                </span>
                <button
                  type="button"
                  onClick={() => jumpToPage(pdfCurrentPage + 1)}
                  disabled={pdfCurrentPage >= pdfNumPages}
                  aria-label="Next page"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle disabled:opacity-35 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label="Zoom out"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFitToggle}
                  className="h-11 px-2.5 rounded-xl text-xs font-bold text-brand-green hover:bg-brand-light cursor-pointer"
                >
                  {pdfZoomMode === 'fit-width' ? 'Fit' : `${zoomPercent}%`}
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label="Zoom in"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreenActive ? 'Exit fullscreen' : 'Fullscreen'}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle cursor-pointer"
                >
                  {isFullscreenActive ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </>
          )}

          {kind === 'docx' && (
            <>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label="Decrease text size"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-text-main hover:bg-surface-subtle cursor-pointer"
                >
                  A-
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-surface-subtle text-xs font-mono font-bold text-text-main">
                  {docxFontPx}px
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label="Increase text size"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-text-main hover:bg-surface-subtle cursor-pointer"
                >
                  A+
                </button>
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreenActive ? 'Exit fullscreen' : 'Fullscreen'}
                className="h-11 px-3 rounded-xl text-xs font-bold text-brand-green hover:bg-brand-light inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isFullscreenActive ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Exit</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>{variant === 'embedded' ? 'Expand' : 'Fullscreen'}</span>
                  </>
                )}
              </button>
            </>
          )}

          {kind === 'image' && (
            <>
              <button
                type="button"
                onClick={handleRotate}
                aria-label="Rotate 90 degrees"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label="Zoom out"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFitToggle}
                  className="h-11 px-2.5 rounded-xl text-xs font-bold text-brand-green hover:bg-brand-light cursor-pointer"
                >
                  {imageFitMode ? 'Fit' : `${zoomPercent}%`}
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label="Zoom in"
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreenActive ? 'Exit fullscreen' : 'Fullscreen'}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-subtle cursor-pointer"
              >
                {isFullscreenActive ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </nav>
      )}
    </div>
  );
};
