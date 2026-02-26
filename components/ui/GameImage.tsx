'use client';

import { useState } from 'react';
import { Loader2, ZoomIn, RefreshCw, X } from 'lucide-react';

interface GameImageProps {
  src: string;
  alt: string;
  className?: string;
  onRegenerate?: () => void;
  showControls?: boolean;
}

export default function GameImage({
  src,
  alt,
  className = '',
  onRegenerate,
  showControls = false,
}: GameImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  if (error) {
    return (
      <div
        className={`bg-slate-800/50 border border-slate-700/30 rounded-lg flex flex-col items-center justify-center gap-2 p-4 ${className}`}
      >
        <span className="text-slate-600 text-sm">Image failed to load</span>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Regenerate
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Loading placeholder */}
        {!loaded && (
          <div className="absolute inset-0 bg-slate-800/50 rounded-lg flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        )}

        <img
          src={src}
          alt={alt}
          className={`rounded-lg transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />

        {/* Controls overlay */}
        {showControls && loaded && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setZoomed(true)}
              className="w-7 h-7 rounded bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="w-7 h-7 rounded bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                aria-label="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer"
          onClick={() => setZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white"
            onClick={() => setZoomed(false)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
