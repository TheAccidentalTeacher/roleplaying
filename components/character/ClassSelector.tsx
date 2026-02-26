'use client';

import type { CharacterClass } from '@/lib/types/character';

const CLASS_DATA: {
  value: CharacterClass;
  label: string;
  description: string;
  hitDie: string;
  primaryStat: string;
  role: string;
  icon: string;
}[] = [
  { value: 'warrior', label: 'Warrior', description: 'Master of weapons and armor, the front line of every battle.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage', icon: '⚔️' },
  { value: 'mage', label: 'Mage', description: 'Scholar of the arcane, wielding reality-bending spells.', hitDie: 'd6', primaryStat: 'INT', role: 'Damage / Control', icon: '🔮' },
  { value: 'rogue', label: 'Rogue', description: 'Shadow specialist — stealth, precision, and cunning.', hitDie: 'd8', primaryStat: 'DEX', role: 'Damage / Utility', icon: '🗡️' },
  { value: 'cleric', label: 'Cleric', description: 'Divine servant channeling healing and holy wrath.', hitDie: 'd8', primaryStat: 'WIS', role: 'Healer / Support', icon: '✝️' },
  { value: 'ranger', label: 'Ranger', description: 'Wilderness expert, tracker, and beast companion.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Scout', icon: '🏹' },
  { value: 'bard', label: 'Bard', description: 'Charismatic entertainer whose magic flows through music.', hitDie: 'd8', primaryStat: 'CHA', role: 'Support / Face', icon: '🎵' },
  { value: 'paladin', label: 'Paladin', description: 'Holy warrior sworn to an oath, armored in faith.', hitDie: 'd10', primaryStat: 'STR / CHA', role: 'Tank / Healer', icon: '🛡️' },
  { value: 'druid', label: 'Druid', description: 'Nature\'s champion who can shift into beast forms.', hitDie: 'd8', primaryStat: 'WIS', role: 'Healer / Control', icon: '🌿' },
  { value: 'warlock', label: 'Warlock', description: 'Pact-bound channeler of eldritch power from beyond.', hitDie: 'd8', primaryStat: 'CHA', role: 'Damage / Utility', icon: '👁️' },
  { value: 'monk', label: 'Monk', description: 'Martial artist whose body is the ultimate weapon.', hitDie: 'd8', primaryStat: 'DEX / WIS', role: 'Damage / Mobility', icon: '👊' },
  { value: 'artificer', label: 'Artificer', description: 'Inventor who infuses mundane objects with magic.', hitDie: 'd8', primaryStat: 'INT', role: 'Support / Utility', icon: '⚙️' },
  { value: 'blood-mage', label: 'Blood Mage', description: 'Forbidden caster who pays for power with life force.', hitDie: 'd6', primaryStat: 'CON / INT', role: 'Damage / Risk', icon: '🩸' },
];

interface ClassSelectorProps {
  selected: CharacterClass | null;
  onSelect: (cls: CharacterClass) => void;
  recommendedClasses?: CharacterClass[];
}

export default function ClassSelector({ selected, onSelect, recommendedClasses = [] }: ClassSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Choose Your Class</h2>
        <p className="text-slate-400 text-sm">Your class defines your combat style, abilities, and path through the world.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLASS_DATA.map((cls) => {
          const isRecommended = recommendedClasses.includes(cls.value);
          return (
            <button
              key={cls.value}
              onClick={() => onSelect(cls.value)}
              className={`
                relative p-5 rounded-xl border-2 text-left transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg
                ${
                  selected === cls.value
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                    : isRecommended
                    ? 'border-sky-500/50 bg-sky-500/5 hover:border-sky-400'
                    : 'border-slate-700 bg-slate-900/50 hover:border-sky-500/50'
                }
              `}
            >
              {isRecommended && selected !== cls.value && (
                <span className="absolute top-2 right-2 text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
              {selected === cls.value && (
                <span className="absolute top-2 right-2 text-amber-400 text-lg">✓</span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{cls.icon}</span>
                <h3 className="font-cinzel text-white font-semibold text-lg">{cls.label}</h3>
              </div>

              <p className="text-slate-400 text-xs mb-3">{cls.description}</p>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {cls.hitDie}
                </span>
                <span className="bg-slate-800 text-sky-400 px-2 py-0.5 rounded">
                  {cls.primaryStat}
                </span>
                <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded">
                  {cls.role}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
