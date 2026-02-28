'use client';

interface HPBarProps {
  current: number;
  max: number;
  temporary?: number;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

function getBarColor(percentage: number): string {
  if (percentage > 60) return 'bg-green-500';
  if (percentage > 30) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function HPBar({
  current,
  max,
  temporary = 0,
  showNumbers = true,
  size = 'md',
  animate = true,
}: HPBarProps) {
  const total = current + temporary;
  const hpPercent = Math.min(100, Math.max(0, (current / max) * 100));
  const tempPercent = Math.min(100 - hpPercent, (temporary / max) * 100);

  const heights: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5',
  };

  return (
    <div className="w-full">
      {/* Numbers */}
      {showNumbers && (
        <div className="flex justify-between text-xs mb-0.5">
          <span className="text-slate-400">HP</span>
          <span>
            <span className={current <= max * 0.3 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {current}
            </span>
            {temporary > 0 && (
              <span className="text-cyan-400">(+{temporary})</span>
            )}
            <span className="text-slate-600">/{max}</span>
          </span>
        </div>
      )}

      {/* Bar */}
      <div className={`w-full ${heights[size]} bg-slate-800 rounded-full overflow-hidden relative`}>
        {/* HP portion */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${getBarColor(hpPercent)} ${
            animate ? 'transition-all duration-500' : ''
          }`}
          style={{ width: `${hpPercent}%` }}
        />
        {/* Temp HP portion */}
        {temporary > 0 && (
          <div
            className={`absolute top-0 h-full bg-cyan-400/50 ${
              animate ? 'transition-all duration-500' : ''
            }`}
            style={{ left: `${hpPercent}%`, width: `${tempPercent}%` }}
          />
        )}
        {/* Glow effect at low HP */}
        {hpPercent <= 25 && (
          <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-full" />
        )}
      </div>
    </div>
  );
}
