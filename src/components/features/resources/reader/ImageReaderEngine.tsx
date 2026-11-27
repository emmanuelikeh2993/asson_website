import React, { useState, useRef, useCallback } from 'react';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Button } from '../../../ui/Button';

interface ImageReaderEngineProps {
  fileUrl: string;
  alt: string;
  zoomScale: number;
  isFitMode: boolean;
  rotation: number;
  onToggleFitZoom?: () => void;
  onDownload?: () => void;
}

export const ImageReaderEngine: React.FC<ImageReaderEngineProps> = ({
  fileUrl,
  alt,
  zoomScale,
  isFitMode,
  rotation,
  onToggleFitZoom,
  onDownload,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);

  const canPan = !isFitMode && zoomScale > 1;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canPan) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        originX: pan.x,
        originY: pan.y,
      };
    },
    [canPan, pan]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    setPan({
      x: start.originX + (e.clientX - start.x),
      y: start.originY + (e.clientY - start.y),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  // Reset pan smoothly when switching back to Fit mode
  React.useEffect(() => {
    if (isFitMode || zoomScale <= 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [isFitMode, zoomScale]);

  if (hasError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-bg">
        <div className="max-w-md w-full bg-surface-card border border-border-light rounded-2xl p-6 text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-brand-red-light text-brand-red flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-text-main">Unable to Load Image</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              The scanned image could not be loaded cleanly. Check your connection and retry or download it directly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
                setReloadKey((k) => k + 1);
              }}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Retry
            </Button>
            {onDownload && (
              <Button variant="primary" size="md" onClick={onDownload} className="w-full sm:w-auto min-h-[44px]">
                <Download className="w-4 h-4 mr-1.5" /> Download Image
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={onToggleFitZoom}
      className={`flex-1 min-h-0 overflow-auto bg-surface-bg flex items-center justify-center p-2 sm:p-6 select-none relative ${
        canPan ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-zoom-in'
      }`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-mono text-text-muted">Loading image…</span>
        </div>
      )}

      <img
        key={`${fileUrl}-${reloadKey}`}
        src={fileUrl}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        draggable={false}
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${isFitMode ? 1 : zoomScale}) rotate(${rotation}deg)`,
          transition: dragStartRef.current ? 'none' : 'transform 160ms ease-out',
        }}
        className={`rounded-lg border border-border-light bg-white shadow-sm ${
          isFitMode ? 'max-w-full max-h-full object-contain' : 'max-w-none'
        } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
