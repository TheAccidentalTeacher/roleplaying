'use client';

import { useState } from 'react';
import type { Character } from '@/lib/types/character';
import OverviewTab from './OverviewTab';
import AbilitiesTab from './AbilitiesTab';
import InventoryTab from './InventoryTab';
import JournalTab from './JournalTab';
import { User, Swords, ShoppingBag, BookOpen, Sparkles } from 'lucide-react';

type SheetTab = 'overview' | 'abilities' | 'inventory' | 'journal';

const TABS: { id: SheetTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
  { id: 'abilities', label: 'Abilities', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'journal', label: 'Journal', icon: <BookOpen className="w-4 h-4" /> },
];

interface CharacterSheetProps {
  character: Character;
}

export default function CharacterSheet({ character }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<SheetTab>('overview');

  return (
    <div className="flex flex-col h-full">
      {/* Tab navigation */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 px-2">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className="hidden xl:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewTab character={character} />}
        {activeTab === 'abilities' && <AbilitiesTab character={character} />}
        {activeTab === 'inventory' && <InventoryTab character={character} />}
        {activeTab === 'journal' && <JournalTab character={character} />}
      </div>
    </div>
  );
}
