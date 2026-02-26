type BadgeVariant = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  common: 'bg-slate-700 text-slate-300',
  uncommon: 'bg-green-900/50 text-green-400 border-green-700/50',
  rare: 'bg-blue-900/50 text-blue-400 border-blue-700/50',
  epic: 'bg-purple-900/50 text-purple-400 border-purple-700/50',
  legendary: 'bg-amber-900/50 text-amber-400 border-amber-700/50',
  artifact: 'bg-red-900/50 text-red-400 border-red-700/50 animate-pulse',
  default: 'bg-slate-800 text-slate-400 border-slate-600',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
