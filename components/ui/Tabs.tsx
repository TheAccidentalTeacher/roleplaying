'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: 'underline' | 'pills' | 'compact';
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
}: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-sky-500/20 text-sky-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-2 py-1 text-xs rounded transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.icon || tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Default: underline
  return (
    <div className="flex border-b border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeTab === tab.id
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
