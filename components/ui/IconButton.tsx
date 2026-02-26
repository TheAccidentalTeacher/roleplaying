'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'ghost' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  label: string; // accessibility
}

const variantStyles = {
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white',
  filled: 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600',
  outlined: 'bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500',
};

const sizeStyles = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-9 h-9 text-base',
  lg: 'w-11 h-11 text-lg',
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'ghost', size = 'md', label, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={`inline-flex items-center justify-center rounded-lg transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
export default IconButton;
