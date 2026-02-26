'use client';

import { useState } from 'react';
import type { CharacterRace } from '@/lib/types/character';

// Race data with categories and descriptions
const RACE_DATA: {
  category: string;
  races: { value: CharacterRace; label: string; description: string; bonuses: string }[];
}[] = [
  {
    category: 'Common',
    races: [
      { value: 'human', label: 'Human', description: 'Versatile and ambitious, found everywhere.', bonuses: '+1 to all abilities' },
      { value: 'elf', label: 'Elf', description: 'Graceful and long-lived, attuned to magic.', bonuses: '+2 DEX' },
      { value: 'dwarf', label: 'Dwarf', description: 'Sturdy and resilient, master crafters.', bonuses: '+2 CON' },
      { value: 'halfling', label: 'Halfling', description: 'Small but brave, lucky by nature.', bonuses: '+2 DEX' },
      { value: 'gnome', label: 'Gnome', description: 'Curious and inventive, naturally magical.', bonuses: '+2 INT' },
      { value: 'half-elf', label: 'Half-Elf', description: 'Charismatic diplomats of two worlds.', bonuses: '+2 CHA, +1 to two' },
      { value: 'half-orc', label: 'Half-Orc', description: 'Powerful warriors with indomitable will.', bonuses: '+2 STR, +1 CON' },
    ],
  },
  {
    category: 'Uncommon',
    races: [
      { value: 'tiefling', label: 'Tiefling', description: 'Infernal heritage, feared and misunderstood.', bonuses: '+2 CHA, +1 INT' },
      { value: 'dragonborn', label: 'Dragonborn', description: 'Draconic warriors with elemental breath.', bonuses: '+2 STR, +1 CHA' },
      { value: 'orc', label: 'Orc', description: 'Fierce and proud, strength above all.', bonuses: '+2 STR, +1 CON' },
      { value: 'goblin', label: 'Goblin', description: 'Small, cunning, and surprisingly nimble.', bonuses: '+2 DEX, +1 CON' },
      { value: 'goliath', label: 'Goliath', description: 'Mountain-born giants, endurance personified.', bonuses: '+2 STR, +1 CON' },
      { value: 'firbolg', label: 'Firbolg', description: 'Gentle forest guardians with natural magic.', bonuses: '+2 WIS, +1 STR' },
      { value: 'tabaxi', label: 'Tabaxi', description: 'Feline wanderers driven by curiosity.', bonuses: '+2 DEX, +1 CHA' },
      { value: 'aasimar', label: 'Aasimar', description: 'Celestial-touched, radiant protectors.', bonuses: '+2 CHA, +1 WIS' },
      { value: 'genasi', label: 'Genasi', description: "Elemental-blooded, embodying nature's forces.", bonuses: '+2 CON' },
    ],
  },
  {
    category: 'Exotic',
    races: [
      { value: 'changeling', label: 'Changeling', description: 'Shapeshifters who can become anyone.', bonuses: '+2 CHA, +1 any' },
      { value: 'warforged', label: 'Warforged', description: 'Living constructs, built for war.', bonuses: '+2 CON, +1 any' },
      { value: 'centaur', label: 'Centaur', description: 'Half-horse nomads of the open plains.', bonuses: '+2 STR, +1 WIS' },
      { value: 'kenku', label: 'Kenku', description: 'Cursed corvids who speak only in mimicry.', bonuses: '+2 DEX, +1 WIS' },
      { value: 'lizardfolk', label: 'Lizardfolk', description: 'Cold-blooded survivalists, alien minds.', bonuses: '+2 CON, +1 WIS' },
      { value: 'satyr', label: 'Satyr', description: 'Fey revelers with magic resistance.', bonuses: '+2 CHA, +1 DEX' },
      { value: 'fairy', label: 'Fairy', description: 'Tiny fey beings with innate flight.', bonuses: '+2 DEX, +1 CHA' },
    ],
  },
];

interface RaceSelectorProps {
  selected: CharacterRace | null;
  onSelect: (race: CharacterRace) => void;
}

export default function RaceSelector({ selected, onSelect }: RaceSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string>('Common');

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Choose Your Race</h2>
        <p className="text-slate-400 text-sm">Your race determines innate abilities, stat bonuses, and how the world sees you.</p>
      </div>

      {RACE_DATA.map((category) => (
        <div key={category.category}>
          <button
            onClick={() => setExpandedCategory(expandedCategory === category.category ? '' : category.category)}
            className="w-full flex items-center justify-between text-left px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors mb-2"
          >
            <span className="text-lg font-cinzel text-sky-400">{category.category}</span>
            <span className="text-slate-500 text-sm">{category.races.length} races</span>
          </button>

          {expandedCategory === category.category && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {category.races.map((race) => (
                <button
                  key={race.value}
                  onClick={() => onSelect(race.value)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/10
                    ${
                      selected === race.value
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                        : 'border-slate-700 bg-slate-900/50 hover:border-sky-500/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-cinzel text-white font-semibold">{race.label}</h3>
                    {selected === race.value && (
                      <span className="text-amber-400 text-lg">✓</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mb-2">{race.description}</p>
                  <p className="text-sky-400 text-xs font-mono">{race.bonuses}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
