'use client';

import { formatModifier } from '@/lib/utils/formatters';
import type { CharacterRace, CharacterClass, BackgroundType } from '@/lib/types/character';

interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

interface PersonalityTraitsInput {
  traits: string[];
  ideal: string;
  bond: string;
  flaw: string;
}

interface CharacterPreviewProps {
  name: string;
  onNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  storyHook: string;
  onStoryHookChange: (hook: string) => void;
  race: CharacterRace | null;
  characterClass: CharacterClass | null;
  background: BackgroundType | null;
  abilityScores: AbilityScores;
  personality: PersonalityTraitsInput;
  worldName?: string;
  worldIcon?: string;
  originLabel?: string;
  classLabel?: string;
}

export default function CharacterPreview({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  storyHook,
  onStoryHookChange,
  race,
  characterClass,
  background,
  abilityScores,
  personality,
  worldName,
  worldIcon,
  originLabel = 'Race',
  classLabel = 'Class',
}: CharacterPreviewProps) {
  const getMod = (score: number) => Math.floor((score - 10) / 2);

  const capitalize = (s: string | null) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') : '—';

  const totalStats = Object.values(abilityScores).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Name & Description</h2>
        <p className="text-slate-400 text-sm">
          Give your character a name, describe their appearance, and optionally provide a story hook.
        </p>
      </div>

      {/* Name & Description Inputs */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-semibold block mb-1">
              Character Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter your character's name..."
              maxLength={40}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg font-cinzel placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
            <p className="text-slate-600 text-xs mt-1">{name.length}/40</p>
          </div>

          <div>
            <label className="text-sm text-slate-300 font-semibold block mb-1">
              Physical Description
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Tall and weathered, with a scar across the left cheek and piercing green eyes..."
              rows={4}
              maxLength={500}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">{description.length}/500</p>
          </div>

          <div>
            <label className="text-sm text-slate-300 font-semibold block mb-1">
              Story Hook <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={storyHook}
              onChange={(e) => onStoryHookChange(e.target.value)}
              placeholder="One sentence that shapes your world: 'A kingdom where music is forbidden' or 'I'm searching for the dragon who raised me'..."
              rows={2}
              maxLength={200}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">
              This sentence will influence the AI-generated world. {storyHook.length}/200
            </p>
          </div>
        </div>

        {/* Character Preview Card */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="text-center border-b border-slate-700 pb-4">
            <h3 className="text-xl font-cinzel text-amber-400">
              {name || 'Unnamed Hero'}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {capitalize(race)} {capitalize(characterClass)}
            </p>
            {background && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">
                {capitalize(background)}
              </span>
            )}
            {worldName && (
              <div className="mt-2">
                <span className="inline-block px-2 py-0.5 bg-sky-900/30 border border-sky-500/20 rounded text-xs text-sky-400">
                  {worldIcon} {worldName}
                </span>
              </div>
            )}
          </div>

          {/* Ability Scores Mini Display */}
          <div className="grid grid-cols-6 gap-2 text-center">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((key) => (
              <div key={key} className="bg-slate-800 rounded p-2">
                <div className="text-[10px] text-slate-500 uppercase">{key}</div>
                <div className="text-white font-bold">{abilityScores[key]}</div>
                <div className={`text-xs ${getMod(abilityScores[key]) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatModifier(getMod(abilityScores[key]))}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="text-xs text-slate-500 text-center">
            Total: {totalStats} • Avg: {(totalStats / 6).toFixed(1)}
          </div>

          {/* Personality Summary */}
          {(personality.traits.length > 0 || personality.ideal || personality.bond || personality.flaw) && (
            <div className="space-y-2 border-t border-slate-700 pt-3">
              {personality.traits.length > 0 && (
                <div>
                  <span className="text-xs text-slate-500">Traits: </span>
                  <span className="text-xs text-slate-300">
                    {personality.traits.join(' • ')}
                  </span>
                </div>
              )}
              {personality.ideal && (
                <div>
                  <span className="text-xs text-slate-500">Ideal: </span>
                  <span className="text-xs text-sky-300">{personality.ideal}</span>
                </div>
              )}
              {personality.bond && (
                <div>
                  <span className="text-xs text-slate-500">Bond: </span>
                  <span className="text-xs text-green-300">{personality.bond}</span>
                </div>
              )}
              {personality.flaw && (
                <div>
                  <span className="text-xs text-slate-500">Flaw: </span>
                  <span className="text-xs text-red-300">{personality.flaw}</span>
                </div>
              )}
            </div>
          )}

          {/* Description Preview */}
          {description && (
            <div className="border-t border-slate-700 pt-3">
              <span className="text-xs text-slate-500">Appearance: </span>
              <span className="text-xs text-slate-300 italic">{description}</span>
            </div>
          )}

          {/* Story Hook Preview */}
          {storyHook && (
            <div className="border-t border-slate-700 pt-3">
              <span className="text-xs text-slate-500">Story Hook: </span>
              <span className="text-xs text-amber-300 italic">&ldquo;{storyHook}&rdquo;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
