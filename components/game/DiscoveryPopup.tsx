// ============================================================
// DISCOVERY POPUP — Show discoveries found during travel
// ============================================================
'use client';

import React, { useState, useEffect } from 'react';
import type { TravelDiscovery } from '@/lib/types/exploration';

interface DiscoveryPopupProps {
  discovery: TravelDiscovery;
  onDismiss: () => void;
  onInvestigate?: () => void;
}

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  landmark: { icon: '🗿', color: 'text-amber-400', label: 'Landmark Discovered' },
  resource: { icon: '💎', color: 'text-green-400', label: 'Resource Found' },
  secret_path: { icon: '🛤️', color: 'text-purple-400', label: 'Secret Path' },
  hidden_area: { icon: '🔍', color: 'text-blue-400', label: 'Hidden Area' },
  lore: { icon: '📜', color: 'text-yellow-400', label: 'Lore Uncovered' },
};

export default function DiscoveryPopup({
  discovery,
  onDismiss,
  onInvestigate,
}: DiscoveryPopupProps) {
  const [visible, setVisible] = useState(false);
  const config = typeConfig[discovery.type] || typeConfig.landmark;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleDismiss}
    >
      <div
        className={`bg-slate-900 border border-slate-600 rounded-lg p-6 max-w-sm w-full mx-4 transform transition-transform duration-300 ${
          visible ? 'scale-100' : 'scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <span className="text-4xl">{config.icon}</span>
        </div>
        <h3 className={`font-cinzel text-lg text-center mb-2 ${config.color}`}>
          {config.label}
        </h3>
        <p className="text-sm text-slate-400 text-center mb-4">
          {discovery.description}
        </p>
        {discovery.investigationResult && (
          <p className="text-xs text-green-400 text-center bg-green-900/20 rounded p-2 mb-4">
            {discovery.investigationResult}
          </p>
        )}

        <div className="flex gap-2">
          {onInvestigate && (
            <button
              onClick={() => {
                handleDismiss();
                onInvestigate();
              }}
              className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
            >
              Investigate
            </button>
          )}
          <button
            onClick={handleDismiss}
            className={`${
              onInvestigate ? 'flex-1' : 'w-full'
            } py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
