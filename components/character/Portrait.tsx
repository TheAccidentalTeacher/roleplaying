'use client';

import GameImage from '@/components/ui/GameImage';

interface PortraitProps {
  url?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRegenerate?: () => void;
}

const SIZES = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

export default function Portrait({
  url,
  name,
  size = 'md',
  className = '',
  onRegenerate,
}: PortraitProps) {
  const sizeClass = SIZES[size];

  if (!url) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-cinzel font-bold border-2 border-amber-500/30 ${className}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className}`}>
      <GameImage
        src={url}
        alt={`Portrait of ${name}`}
        className={`${sizeClass} rounded-full object-cover border-2 border-amber-500/30`}
        showControls={!!onRegenerate}
        onRegenerate={onRegenerate}
      />
    </div>
  );
}
