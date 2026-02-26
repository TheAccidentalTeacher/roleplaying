'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white hover:border-slate-500 transition-colors"
      >
        <span className={selected ? 'text-white' : 'text-slate-500'}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.icon} {selected.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <span className="text-slate-500 ml-2">▾</span>
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                opt.value === value
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
