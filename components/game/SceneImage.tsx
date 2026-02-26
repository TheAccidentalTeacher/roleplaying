'use client';

import GameImage from '@/components/ui/GameImage';

interface SceneImageProps {
  src: string;
  alt?: string;
  caption?: string;
}

export default function SceneImage({ src, alt = 'Scene', caption }: SceneImageProps) {
  return (
    <div className="my-4 max-w-2xl mx-auto">
      <GameImage
        src={src}
        alt={alt}
        className="w-full rounded-xl border border-slate-700/30 shadow-lg"
        showControls
      />
      {caption && (
        <p className="text-center text-xs text-slate-500 italic mt-2">{caption}</p>
      )}
    </div>
  );
}
