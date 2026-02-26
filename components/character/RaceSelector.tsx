'use client';

import { useState } from 'react';
import type { CharacterRace } from '@/lib/types/character';
import type { OriginCategory, OriginLabel } from '@/lib/data/world-types';

// Default fantasy data (fallback when no world selected)
const DEFAULT_ORIGINS: OriginCategory[] = [
  {
    category: 'Common',
    origins: [
      { id: 'human', name: 'Human', description: 'Versatile and ambitious, found everywhere.', bonuses: '+1 to all abilities' },
      { id: 'elf', name: 'Elf', description: 'Graceful and long-lived, attuned to magic.', bonuses: '+2 DEX' },
      { id: 'dwarf', name: 'Dwarf', description: 'Sturdy and resilient, master crafters.', bonuses: '+2 CON' },
      { id: 'halfling', name: 'Halfling', description: 'Small but brave, lucky by nature.', bonuses: '+2 DEX' },
      { id: 'gnome', name: 'Gnome', description: 'Curious and inventive, naturally magical.', bonuses: '+2 INT' },
      { id: 'half-elf', name: 'Half-Elf', description: 'Charismatic diplomats of two worlds.', bonuses: '+2 CHA, +1 to two' },
      { id: 'half-orc', name: 'Half-Orc', description: 'Powerful warriors with indomitable will.', bonuses: '+2 STR, +1 CON' },
    ],
  },
  {
    category: 'Uncommon',
    origins: [
      { id: 'tiefling', name: 'Tiefling', description: 'Infernal heritage, feared and misunderstood.', bonuses: '+2 CHA, +1 INT' },
      { id: 'dragonborn', name: 'Dragonborn', description: 'Draconic warriors with elemental breath.', bonuses: '+2 STR, +1 CHA' },
      { id: 'orc', name: 'Orc', description: 'Fierce and proud, strength above all.', bonuses: '+2 STR, +1 CON' },
      { id: 'goblin', name: 'Goblin', description: 'Small, cunning, and surprisingly nimble.', bonuses: '+2 DEX, +1 CON' },
      { id: 'goliath', name: 'Goliath', description: 'Mountain-born giants, endurance personified.', bonuses: '+2 STR, +1 CON' },
      { id: 'firbolg', name: 'Firbolg', description: 'Gentle forest guardians with natural magic.', bonuses: '+2 WIS, +1 STR' },
      { id: 'tabaxi', name: 'Tabaxi', description: 'Feline wanderers driven by curiosity.', bonuses: '+2 DEX, +1 CHA' },
      { id: 'aasimar', name: 'Aasimar', description: 'Celestial-touched, radiant protectors.', bonuses: '+2 CHA, +1 WIS' },
      { id: 'genasi', name: 'Genasi', description: "Elemental-blooded, embodying nature's forces.", bonuses: '+2 CON' },
    ],
  },
  {
    category: 'Exotic',
    origins: [
      { id: 'changeling', name: 'Changeling', description: 'Shapeshifters who can become anyone.', bonuses: '+2 CHA, +1 any' },
      { id: 'warforged', name: 'Warforged', description: 'Living constructs, built for war.', bonuses: '+2 CON, +1 any' },
      { id: 'centaur', name: 'Centaur', description: 'Half-horse nomads of the open plains.', bonuses: '+2 STR, +1 WIS' },
      { id: 'kenku', name: 'Kenku', description: 'Cursed corvids who speak only in mimicry.', bonuses: '+2 DEX, +1 WIS' },
      { id: 'lizardfolk', name: 'Lizardfolk', description: 'Cold-blooded survivalists, alien minds.', bonuses: '+2 CON, +1 WIS' },
      { id: 'satyr', name: 'Satyr', description: 'Fey revelers with magic resistance.', bonuses: '+2 CHA, +1 DEX' },
      { id: 'fairy', name: 'Fairy', description: 'Tiny fey beings with innate flight.', bonuses: '+2 DEX, +1 CHA' },
    ],
  },
];

interface RaceSelectorProps {
  selected: CharacterRace | null;
  onSelect: (race: CharacterRace) => void;
  /** World-specific origin categories — falls back to default fantasy races */
  origins?: OriginCategory[];
  /** What "race" is called in this setting (Race, Species, Origin, etc.) */
  originLabel?: OriginLabel;
}

export default function RaceSelector({
  selected,
  onSelect,
  origins,
  originLabel = 'Race',
}: RaceSelectorProps) {
  const data = origins && origins.length > 0 ? origins : DEFAULT_ORIGINS;
  const [expandedCategory, setExpandedCategory] = useState<string>(data[0]?.category ?? '');

  const totalCount = data.reduce((n, c) => n + c.origins.length, 0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">
          Choose Your {originLabel}
        </h2>
        <p className="text-slate-400 text-sm">
          Your {originLabel.toLowerCase()} determines innate abilities, stat bonuses, and how the world sees you.
        </p>
        <p className="text-slate-600 text-xs mt-1">{totalCount} options available</p>
      </div>

      {data.map((category) => (
        <div key={category.category}>
          <button
            onClick={() =>
              setExpandedCategory(
                expandedCategory === category.category ? '' : category.category
              )
            }
            className="w-full flex items-center justify-between text-left px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors mb-2"
          >
            <span className="text-lg font-cinzel text-sky-400">{category.category}</span>
            <span className="text-slate-500 text-sm">
              {category.origins.length} {originLabel.toLowerCase()}s
            </span>
          </button>

          {expandedCategory === category.category && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {category.origins.map((origin) => (
                <button
                  key={origin.id}
                  onClick={() => onSelect(origin.id as CharacterRace)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/10
                    ${
                      selected === origin.id
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                        : 'border-slate-700 bg-slate-900/50 hover:border-sky-500/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-cinzel text-white font-semibold">{origin.name}</h3>
                    {selected === origin.id && (
                      <span className="text-amber-400 text-lg">✓</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mb-2">{origin.description}</p>
                  <p className="text-sky-400 text-xs font-mono">{origin.bonuses}</p>
                  {origin.traits && origin.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {origin.traits.map((t) => (
                        <span
                          key={t}
                          className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
