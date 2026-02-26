'use client';

import { useState } from 'react';
import type { Character, ClassFeature, Spell } from '@/lib/types/character';
import { ChevronDown, ChevronRight, Sparkles, Star } from 'lucide-react';

interface AbilitiesTabProps {
  character: Character;
}

export default function AbilitiesTab({ character }: AbilitiesTabProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [spellFilter, setSpellFilter] = useState<number | 'all'>('all');

  // Group features by source
  const featuresBySource = character.features.reduce<Record<string, ClassFeature[]>>(
    (acc, f) => {
      const key = f.source;
      if (!acc[key]) acc[key] = [];
      acc[key].push(f);
      return acc;
    },
    {}
  );

  const sourceLabels: Record<string, string> = {
    class: 'Class Features',
    subclass: 'Subclass Features',
    race: 'Racial Traits',
    background: 'Background Features',
    story: 'Story Abilities',
    feat: 'Feats',
  };

  // Group spells by level
  const spells = character.spellcasting?.knownSpells || [];
  const cantrips = character.spellcasting?.cantrips || [];
  const allSpells = [...cantrips, ...spells];
  const filteredSpells =
    spellFilter === 'all'
      ? allSpells
      : allSpells.filter((s) => s.level === spellFilter);

  const spellLevels = Array.from(new Set(allSpells.map((s) => s.level))).sort(
    (a, b) => a - b
  );

  return (
    <div className="space-y-5">
      {/* Class Features */}
      {Object.entries(featuresBySource).map(([source, features]) => (
        <div key={source}>
          <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            {sourceLabels[source] || source}
          </h4>
          <div className="space-y-1">
            {features
              .sort((a, b) => a.level - b.level)
              .map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  expanded={expandedFeature === feature.id}
                  onToggle={() =>
                    setExpandedFeature(
                      expandedFeature === feature.id ? null : feature.id
                    )
                  }
                />
              ))}
          </div>
        </div>
      ))}

      {character.features.length === 0 && (
        <div className="text-center py-4 text-sm text-slate-600 italic">
          No features yet. Level up to unlock abilities!
        </div>
      )}

      {/* Spellcasting */}
      {character.spellcasting && (
        <div className="pt-2 border-t border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Spellcasting
            </h4>
            <div className="text-[10px] text-slate-500">
              DC {character.spellcasting.spellSaveDC} • Atk{' '}
              {character.spellcasting.spellAttackBonus >= 0 ? '+' : ''}
              {character.spellcasting.spellAttackBonus}
            </div>
          </div>

          {/* Spell Slots */}
          {character.spellcasting.spellSlots.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-slate-600 mb-1.5">Spell Slots</p>
              <div className="flex flex-wrap gap-2">
                {character.spellcasting.spellSlots.map((slot) => (
                  <div
                    key={slot.level}
                    className="bg-slate-800/60 rounded-lg px-2 py-1 border border-slate-700/30 text-center"
                  >
                    <div className="text-[10px] text-slate-500">Lv {slot.level}</div>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: slot.total }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < slot.remaining
                              ? 'bg-blue-400'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spell filter */}
          {spellLevels.length > 1 && (
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                onClick={() => setSpellFilter('all')}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  spellFilter === 'all'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                All
              </button>
              {spellLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSpellFilter(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    spellFilter === lvl
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lvl === 0 ? 'Cantrip' : `Lv ${lvl}`}
                </button>
              ))}
            </div>
          )}

          {/* Spell List */}
          <div className="space-y-1">
            {filteredSpells.map((spell) => (
              <SpellCard key={spell.id} spell={spell} />
            ))}
            {filteredSpells.length === 0 && (
              <p className="text-xs text-slate-600 italic text-center py-2">
                No spells known
              </p>
            )}
          </div>
        </div>
      )}

      {/* Proficiencies */}
      <div className="pt-2 border-t border-slate-700/30">
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Proficiencies
        </h4>
        <div className="space-y-2">
          {character.proficiencies.armor.length > 0 && (
            <ProficiencyRow label="Armor" items={character.proficiencies.armor} />
          )}
          {character.proficiencies.weapons.length > 0 && (
            <ProficiencyRow label="Weapons" items={character.proficiencies.weapons} />
          )}
          {character.proficiencies.tools.length > 0 && (
            <ProficiencyRow label="Tools" items={character.proficiencies.tools} />
          )}
          {character.proficiencies.languages.length > 0 && (
            <ProficiencyRow label="Languages" items={character.proficiencies.languages} />
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  expanded,
  onToggle,
}: {
  feature: ClassFeature;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-700/20 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-slate-200">{feature.name}</span>
          {feature.isPassive && (
            <span className="ml-1.5 text-[10px] text-emerald-400">passive</span>
          )}
        </div>
        {feature.uses && (
          <span className="text-[10px] text-slate-500 flex-shrink-0">
            {feature.uses.remaining}/{feature.uses.max}
          </span>
        )}
        <span className="text-[10px] text-slate-600 flex-shrink-0">
          Lv{feature.level}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-2 text-xs text-slate-400 border-t border-slate-700/20 pt-2">
          {feature.description}
          {feature.uses && (
            <p className="text-[10px] text-slate-600 mt-1">
              Recharges on: {feature.uses.rechargeOn.replace('-', ' ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SpellCard({ spell }: { spell: Spell }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-700/20 transition-colors"
      >
        <Star
          className={`w-3 h-3 flex-shrink-0 ${
            spell.isPrepared ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
          }`}
        />
        <span className="text-sm text-slate-200 flex-1 truncate">{spell.name}</span>
        <span className="text-[10px] text-slate-500 flex-shrink-0">
          {spell.level === 0 ? 'Cantrip' : `Lv ${spell.level}`}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-2 text-xs text-slate-400 border-t border-slate-700/20 pt-2 space-y-1">
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
            <span>{spell.school}</span>
            <span>{spell.castingTime}</span>
            <span>{spell.range}</span>
            <span>{spell.duration}</span>
          </div>
          <p className="text-xs text-slate-400">{spell.description}</p>
          {spell.damage && (
            <p className="text-xs text-red-400">Damage: {spell.damage}</p>
          )}
        </div>
      )}
    </div>
  );
}

function ProficiencyRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <span className="text-[10px] text-slate-600 font-semibold">{label}: </span>
      <span className="text-xs text-slate-400">{items.join(', ')}</span>
    </div>
  );
}
