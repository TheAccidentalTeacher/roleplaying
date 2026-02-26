'use client';

import { formatModifier } from '@/lib/utils/formatters';
import type { CharacterRace, CharacterClass, BackgroundType } from '@/lib/types/character';
import AIHelpButton from './AIHelpButton';
import AIEnhancePopover from './AIEnhancePopover';

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
  backstory: string;
  onBackstoryChange: (bs: string) => void;
  motivation: string;
  onMotivationChange: (m: string) => void;
  fears: string;
  onFearsChange: (f: string) => void;
  mannerisms: string;
  onMannerismsChange: (m: string) => void;
  connections: string;
  onConnectionsChange: (c: string) => void;
  race: CharacterRace | null;
  characterClass: CharacterClass | null;
  background: BackgroundType | null;
  abilityScores: AbilityScores;
  personality: PersonalityTraitsInput;
  worldName?: string;
  worldIcon?: string;
  worldGenre?: string;
  originLabel?: string;
  classLabel?: string;
  classRole?: string;
}

export default function CharacterPreview({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  storyHook,
  onStoryHookChange,
  backstory,
  onBackstoryChange,
  motivation,
  onMotivationChange,
  fears,
  onFearsChange,
  mannerisms,
  onMannerismsChange,
  connections,
  onConnectionsChange,
  race,
  characterClass,
  background,
  abilityScores,
  personality,
  worldName,
  worldIcon,
  worldGenre,
  originLabel = 'Race',
  classLabel = 'Class',
  classRole,
}: CharacterPreviewProps) {
  const getMod = (score: number) => Math.floor((score - 10) / 2);

  const capitalize = (s: string | null) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') : '—';

  const totalStats = Object.values(abilityScores).reduce((a, b) => a + b, 0);

  // Build the AI context object from all currently decided fields
  const aiContext = {
    worldName,
    worldGenre,
    origin: race ? capitalize(race) : undefined,
    className: characterClass ? capitalize(characterClass) : undefined,
    classRole,
    background: background ? capitalize(background) : undefined,
    abilityScores: abilityScores as unknown as Record<string, number>,
    personality,
    name: name || undefined,
    description: description || undefined,
    backstory: backstory || undefined,
    motivation: motivation || undefined,
    storyHook: storyHook || undefined,
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Build Your Character</h2>
        <p className="text-slate-400 text-sm">
          Flesh out your character with details. Use ✨ AI buttons for inspiration, then edit freely.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* ═══ LEFT COLUMN: Input Fields (3/5 width) ═══ */}
        <div className="md:col-span-3 space-y-5">

          {/* ── Character Name ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Character Name <span className="text-red-400">*</span>
              </label>
              <AIHelpButton
                field="name"
                context={aiContext}
                onSelect={onNameChange}
                label="✨ Suggest Names"
                compact
              />
            </div>
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

          {/* ── Physical Description ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Physical Description
              </label>
              <div className="flex items-center gap-2">
                <AIEnhancePopover
                  fullText={description}
                  onReplace={onDescriptionChange}
                  context={aiContext}
                  fieldLabel="Description"
                />
                <AIHelpButton
                  field="description"
                  context={aiContext}
                  onSelect={onDescriptionChange}
                  label="✨ Suggest"
                  compact
                />
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Tall and weathered, with a scar across the left cheek and piercing green eyes. Wears a battered leather coat over chainmail..."
              rows={3}
              maxLength={500}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">{description.length}/500</p>
          </div>

          {/* ── Backstory ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Backstory
              </label>
              <div className="flex items-center gap-2">
                <AIEnhancePopover
                  fullText={backstory}
                  onReplace={onBackstoryChange}
                  context={aiContext}
                  fieldLabel="Backstory"
                />
                <AIHelpButton
                  field="backstory"
                  context={aiContext}
                  onSelect={onBackstoryChange}
                  label="✨ Write Backstory"
                  compact
                />
              </div>
            </div>
            <textarea
              value={backstory}
              onChange={(e) => onBackstoryChange(e.target.value)}
              placeholder="Where did your character come from? What shaped them? A formative event, a key relationship, a turning point that set them on the adventurer's path..."
              rows={5}
              maxLength={1500}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">{backstory.length}/1500</p>
          </div>

          {/* ── Motivation & Goals ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Motivation &amp; Goals
              </label>
              <div className="flex items-center gap-2">
                <AIEnhancePopover
                  fullText={motivation}
                  onReplace={onMotivationChange}
                  context={aiContext}
                  fieldLabel="Motivation"
                />
                <AIHelpButton
                  field="motivation"
                  context={aiContext}
                  onSelect={onMotivationChange}
                  label="✨ Suggest"
                  compact
                />
              </div>
            </div>
            <textarea
              value={motivation}
              onChange={(e) => onMotivationChange(e.target.value)}
              placeholder="What drives your character forward? What do they want more than anything? What deeper need lies beneath the surface goal?"
              rows={2}
              maxLength={500}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">{motivation.length}/500</p>
          </div>

          {/* ── Fears & Weaknesses ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Fears &amp; Weaknesses
              </label>
              <div className="flex items-center gap-2">
                <AIEnhancePopover
                  fullText={fears}
                  onReplace={onFearsChange}
                  context={aiContext}
                  fieldLabel="Fears"
                />
                <AIHelpButton
                  field="fears"
                  context={aiContext}
                  onSelect={onFearsChange}
                  label="✨ Suggest"
                  compact
                />
              </div>
            </div>
            <textarea
              value={fears}
              onChange={(e) => onFearsChange(e.target.value)}
              placeholder="What terrifies your character? What could make them hesitate or break? A phobia, a traumatic memory, a moral weakness..."
              rows={2}
              maxLength={500}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">{fears.length}/500</p>
          </div>

          {/* ── Mannerisms & Speech ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Mannerisms &amp; Speech
              </label>
              <div className="flex items-center gap-2">
                <AIEnhancePopover
                  fullText={mannerisms}
                  onReplace={onMannerismsChange}
                  context={aiContext}
                  fieldLabel="Mannerisms"
                />
                <AIHelpButton
                  field="mannerisms"
                  context={aiContext}
                  onSelect={onMannerismsChange}
                  label="✨ Suggest"
                  compact
                />
              </div>
            </div>
            <textarea
              value={mannerisms}
              onChange={(e) => onMannerismsChange(e.target.value)}
              placeholder="How does your character talk, move, and act? Verbal tics, body language, habits, catchphrases, accent..."
              rows={2}
              maxLength={500}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">{mannerisms.length}/500</p>
          </div>

          {/* ── Relationships & Connections ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Relationships &amp; Connections
              </label>
              <div className="flex items-center gap-2">
                <AIEnhancePopover
                  fullText={connections}
                  onReplace={onConnectionsChange}
                  context={aiContext}
                  fieldLabel="Connections"
                />
                <AIHelpButton
                  field="connections"
                  context={aiContext}
                  onSelect={onConnectionsChange}
                  label="✨ Suggest"
                  compact
                />
              </div>
            </div>
            <textarea
              value={connections}
              onChange={(e) => onConnectionsChange(e.target.value)}
              placeholder="Who does your character know? A mentor, a rival, a loved one, an enemy, an old ally... These NPCs may appear in your adventure."
              rows={3}
              maxLength={800}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
            />
            <p className="text-slate-600 text-xs mt-1">{connections.length}/800</p>
          </div>

          {/* ── Story Hook ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300 font-semibold">
                Story Hook <span className="text-slate-500">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <AIEnhancePopover
                  fullText={storyHook}
                  onReplace={onStoryHookChange}
                  context={aiContext}
                  fieldLabel="Story Hook"
                />
                <AIHelpButton
                  field="storyHook"
                  context={aiContext}
                  onSelect={onStoryHookChange}
                  label="✨ Suggest"
                  compact
                />
              </div>
            </div>
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

        {/* ═══ RIGHT COLUMN: Preview Card (2/5 width) ═══ */}
        <div className="md:col-span-2">
          <div className="sticky top-8 bg-slate-900/80 border border-slate-700 rounded-xl p-5 space-y-4">
            {/* Name & Identity */}
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
            <div className="grid grid-cols-6 gap-1.5 text-center">
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((key) => (
                <div key={key} className="bg-slate-800 rounded p-1.5">
                  <div className="text-[10px] text-slate-500 uppercase">{key}</div>
                  <div className="text-white font-bold text-sm">{abilityScores[key]}</div>
                  <div className={`text-[10px] ${getMod(abilityScores[key]) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatModifier(getMod(abilityScores[key]))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 text-center">
              Total: {totalStats} • Avg: {(totalStats / 6).toFixed(1)}
            </div>

            {/* Personality Summary */}
            {(personality.traits.length > 0 || personality.ideal || personality.bond || personality.flaw) && (
              <div className="space-y-1.5 border-t border-slate-700 pt-3">
                {personality.traits.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500">Traits: </span>
                    <span className="text-[11px] text-slate-300">{personality.traits.join(' • ')}</span>
                  </div>
                )}
                {personality.ideal && (
                  <div>
                    <span className="text-[10px] text-slate-500">Ideal: </span>
                    <span className="text-[11px] text-sky-300">{personality.ideal}</span>
                  </div>
                )}
                {personality.bond && (
                  <div>
                    <span className="text-[10px] text-slate-500">Bond: </span>
                    <span className="text-[11px] text-green-300">{personality.bond}</span>
                  </div>
                )}
                {personality.flaw && (
                  <div>
                    <span className="text-[10px] text-slate-500">Flaw: </span>
                    <span className="text-[11px] text-red-300">{personality.flaw}</span>
                  </div>
                )}
              </div>
            )}

            {/* Content Previews */}
            <div className="space-y-2 border-t border-slate-700 pt-3">
              {description && (
                <PreviewSection label="Appearance" text={description} color="text-slate-300" />
              )}
              {backstory && (
                <PreviewSection label="Backstory" text={backstory} color="text-slate-300" />
              )}
              {motivation && (
                <PreviewSection label="Motivation" text={motivation} color="text-sky-300" />
              )}
              {fears && (
                <PreviewSection label="Fears" text={fears} color="text-red-300" />
              )}
              {mannerisms && (
                <PreviewSection label="Mannerisms" text={mannerisms} color="text-purple-300" />
              )}
              {connections && (
                <PreviewSection label="Connections" text={connections} color="text-green-300" />
              )}
              {storyHook && (
                <div>
                  <span className="text-[10px] text-slate-500">Story Hook: </span>
                  <span className="text-[11px] text-amber-300 italic">&ldquo;{storyHook}&rdquo;</span>
                </div>
              )}
            </div>

            {/* Completion Meter */}
            <div className="border-t border-slate-700 pt-3">
              <CompletionMeter
                fields={{
                  name: !!name,
                  description: !!description,
                  backstory: !!backstory,
                  motivation: !!motivation,
                  fears: !!fears,
                  mannerisms: !!mannerisms,
                  connections: !!connections,
                  storyHook: !!storyHook,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Collapsible preview section for the sidebar */
function PreviewSection({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div>
      <span className="text-[10px] text-slate-500">{label}: </span>
      <span className={`text-[11px] ${color} italic line-clamp-2`}>{text}</span>
    </div>
  );
}

/** Visual completion meter */
function CompletionMeter({ fields }: { fields: Record<string, boolean> }) {
  const entries = Object.entries(fields);
  const filled = entries.filter(([, v]) => v).length;
  const total = entries.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500">Character Depth</span>
        <span className={`text-[10px] font-mono ${pct >= 75 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-slate-500'}`}>
          {filled}/{total} fields
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-600'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 50 && (
        <p className="text-[10px] text-slate-600 mt-1 italic">
          Use ✨ AI buttons to quickly fill out your character
        </p>
      )}
      {pct >= 75 && pct < 100 && (
        <p className="text-[10px] text-green-500/60 mt-1 italic">
          Great depth! Your character will feel truly alive
        </p>
      )}
      {pct === 100 && (
        <p className="text-[10px] text-green-400 mt-1 italic">
          ✨ Fully realized character — ready for adventure!
        </p>
      )}
    </div>
  );
}
