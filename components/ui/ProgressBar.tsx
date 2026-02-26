'use client';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showText?: boolean;
  color?: 'red' | 'blue' | 'green' | 'amber' | 'purple';
  size?: 'xs' | 'sm' | 'md';
  animated?: boolean;
}

const colorStyles = {
  red: 'from-red-600 to-red-500',
  blue: 'from-sky-600 to-sky-400',
  green: 'from-green-600 to-green-400',
  amber: 'from-amber-600 to-amber-400',
  purple: 'from-purple-600 to-purple-400',
};

const sizeStyles = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
};

export default function ProgressBar({
  value,
  max,
  label,
  showText = false,
  color = 'red',
  size = 'sm',
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {(label || showText) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span className="text-slate-400">{label}</span>}
          {showText && (
            <span className="text-slate-300 font-mono">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} bg-gradient-to-r ${colorStyles[color]} rounded-full ${
            animated ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
