'use client';

import {
  Swords,
  Shield,
  Eye,
  Moon,
  ShoppingBag,
  Map,
  MessageCircle,
  Search,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'look',
    label: 'Look Around',
    icon: <Eye className="w-4 h-4" />,
    action: 'I look around and observe my surroundings carefully.',
    color: 'text-sky-400 hover:bg-sky-500/10',
  },
  {
    id: 'search',
    label: 'Search',
    icon: <Search className="w-4 h-4" />,
    action: 'I search the area thoroughly for anything useful or hidden.',
    color: 'text-amber-400 hover:bg-amber-500/10',
  },
  {
    id: 'rest',
    label: 'Short Rest',
    icon: <Moon className="w-4 h-4" />,
    action: 'I take a short rest to recover some energy and tend to my wounds.',
    color: 'text-purple-400 hover:bg-purple-500/10',
  },
  {
    id: 'defend',
    label: 'Defend',
    icon: <Shield className="w-4 h-4" />,
    action: 'I take a defensive stance and ready myself for potential threats.',
    color: 'text-emerald-400 hover:bg-emerald-500/10',
  },
  {
    id: 'attack',
    label: 'Attack',
    icon: <Swords className="w-4 h-4" />,
    action: 'I draw my weapon and attack the nearest threat!',
    color: 'text-red-400 hover:bg-red-500/10',
  },
  {
    id: 'talk',
    label: 'Talk',
    icon: <MessageCircle className="w-4 h-4" />,
    action: 'I attempt to speak with whoever is nearby.',
    color: 'text-cyan-400 hover:bg-cyan-500/10',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <ShoppingBag className="w-4 h-4" />,
    action: 'I check my inventory and belongings.',
    color: 'text-orange-400 hover:bg-orange-500/10',
  },
  {
    id: 'map',
    label: 'Map',
    icon: <Map className="w-4 h-4" />,
    action: 'I consult my map and get my bearings.',
    color: 'text-lime-400 hover:bg-lime-500/10',
  },
];

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function QuickActions({
  onAction,
  disabled = false,
  compact = false,
}: QuickActionsProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 px-4 py-2">
        {QUICK_ACTIONS.slice(0, 4).map((qa) => (
          <button
            key={qa.id}
            onClick={() => onAction(qa.action)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700/50 text-xs ${qa.color} disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
            title={qa.label}
          >
            {qa.icon}
            <span className="hidden sm:inline">{qa.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="border-t border-slate-700/30 bg-slate-900/40 px-4 py-2">
      <div className="max-w-3xl mx-auto">
        <p className="text-[10px] text-slate-600 mb-1.5 font-semibold uppercase tracking-wider">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.id}
              onClick={() => onAction(qa.action)}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs ${qa.color} disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
            >
              {qa.icon}
              {qa.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
