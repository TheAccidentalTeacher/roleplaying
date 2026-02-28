'use client';

import { useEffect, useState } from 'react';
import type { Achievement } from '@/lib/types/session';

interface AchievementPopupProps {
  achievement: Achievement;
  onDismiss: () => void;
  autoDismissMs?: number;
}

function getRarityStyle(rarity: Achievement['rarity']): { border: string; glow: string; text: string } {
  switch (rarity) {
    case 'common':
      return { border: 'border-slate-500', glow: 'shadow-slate-500/20', text: 'text-slate-300' };
    case 'uncommon':
      return { border: 'border-green-500', glow: 'shadow-green-500/20', text: 'text-green-400' };
    case 'rare':
      return { border: 'border-blue-500', glow: 'shadow-blue-500/30', text: 'text-blue-400' };
    case 'legendary':
      return { border: 'border-amber-500', glow: 'shadow-amber-500/40', text: 'text-amber-400' };
  }
}

export default function AchievementPopup({
  achievement,
  onDismiss,
  autoDismissMs = 5000,
}: AchievementPopupProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const style = getRarityStyle(achievement.rarity);

  useEffect(() => {
    // Entrance animation
    const enterTimer = setTimeout(() => setVisible(true), 50);

    // Auto dismiss
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 500);
    }, autoDismissMs);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [autoDismissMs, onDismiss]);

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 transition-all duration-500
        ${visible && !exiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          bg-slate-900 rounded-lg border-2 ${style.border} shadow-lg ${style.glow}
          p-4 max-w-xs cursor-pointer
        `}
        onClick={() => {
          setExiting(true);
          setTimeout(onDismiss, 500);
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
              Achievement Unlocked!
            </p>
            <h3 className={`font-cinzel font-bold ${style.text}`}>
              {achievement.name}
            </h3>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">{achievement.description}</p>
        <p className={`text-[10px] mt-2 capitalize ${style.text}`}>
          {achievement.rarity}
        </p>
      </div>
    </div>
  );
}
