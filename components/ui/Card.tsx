interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'parchment';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-slate-900/80 border-slate-700',
  elevated: 'bg-slate-900 border-slate-600 shadow-lg shadow-black/30',
  bordered: 'bg-slate-950 border-slate-600 border-2',
  parchment: 'bg-amber-900/10 border-amber-700/30',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({
  children,
  className = '',
  header,
  footer,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  return (
    <div className={`rounded-xl border ${variantStyles[variant]} ${className}`}>
      {header && (
        <div className="px-4 py-3 border-b border-slate-700/50 font-cinzel text-sm text-amber-400">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-slate-700/50">
          {footer}
        </div>
      )}
    </div>
  );
}
