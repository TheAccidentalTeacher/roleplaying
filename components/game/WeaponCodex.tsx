// ============================================================
// WEAPON CODEX — In-game browsable weapon catalog
// Players can browse all 241+ weapons, filter by category /
// rarity / genre, and generate AI images of any entry.
// Discovered weapons (found in inventory) show full detail;
// undiscovered show only name + ??? until found or crafted.
// ============================================================
'use client';

import { useState, useMemo, useCallback } from 'react';
import { X, Search, Image as ImageIcon, Loader2, Lock, Sparkles, Sword } from 'lucide-react';
import { ALL_WEAPONS } from '@/lib/data/weapons';
import type { WeaponCatalogEntry, WeaponCategory, GenreFamily } from '@/lib/data/weapons/types';
import { buildWeaponImagePrompt } from '@/lib/utils/weapon-image-prompt';

// ── Rarity display mapping ────────────────────────────────

const RARITY_META: Record<string, { border: string; text: string; bg: string; label: string }> = {
  junk:       { border: 'border-slate-600/50', text: 'text-slate-400',  bg: 'bg-slate-800/40',   label: 'Junk' },
  common:     { border: 'border-slate-500/50', text: 'text-slate-300',  bg: 'bg-slate-800/50',   label: 'Common' },
  uncommon:   { border: 'border-green-500/50', text: 'text-green-400',  bg: 'bg-green-900/10',   label: 'Uncommon' },
  rare:       { border: 'border-blue-500/50',  text: 'text-blue-400',   bg: 'bg-blue-900/10',    label: 'Rare' },
  'very-rare':{ border: 'border-cyan-500/50',  text: 'text-cyan-400',   bg: 'bg-cyan-900/10',    label: 'Very Rare' },
  epic:       { border: 'border-purple-500/50',text: 'text-purple-400', bg: 'bg-purple-900/10',  label: 'Epic' },
  legendary:  { border: 'border-amber-500/50', text: 'text-amber-400',  bg: 'bg-amber-900/10',   label: 'Legendary' },
  mythic:     { border: 'border-red-500/50',   text: 'text-red-400',    bg: 'bg-red-900/10',     label: 'Mythic' },
  artifact:   { border: 'border-amber-300/70', text: 'text-amber-300',  bg: 'bg-amber-900/15',   label: 'Artifact' },
};

const CATEGORY_ICONS: Record<WeaponCategory, string> = {
  bow:     '🏹',
  sword:   '⚔️',
  axe:     '🪓',
  knife:   '🗡️',
  polearm: '⛏️',
  blunt:   '🔨',
  exotic:  '🌀',
  firearm: '🔫',
  energy:  '⚡',
};

const ALL_CATEGORIES: WeaponCategory[] = ['bow','sword','axe','knife','polearm','blunt','exotic','firearm','energy'];
const RARITY_ORDER = ['junk','common','uncommon','rare','very-rare','epic','legendary','mythic','artifact'];

// ── Genre → display label ─────────────────────────────────

const GENRE_LABELS: Record<string, string> = {
  'medieval-fantasy': 'Fantasy',
  'dark-fantasy':     'Dark Fantasy',
  'post-apocalypse':  'Post-Apoc',
  'steampunk':        'Steampunk',
  'cyberpunk':        'Cyberpunk',
  'sci-fi':           'Sci-Fi',
  'contemporary':     'Modern',
  'mythological':     'Mythological',
  'pirate':           'Pirate',
  'western':          'Western',
  'japanese':         'Japanese',
  'cosmic-horror':    'Cosmic Horror',
};

// ── Props ─────────────────────────────────────────────────

interface WeaponCodexProps {
  onClose: () => void;
  /** World genre (filters to genre by default) */
  worldGenre?: string;
  /** Character inventory — strings — used to detect discovered weapons */
  inventory?: string[];
}

// ── Image generation state per weapon ────────────────────

interface ImageState {
  loading: boolean;
  url: string | null;
  error: string | null;
}

// ─── Component ───────────────────────────────────────────

export default function WeaponCodex({ onClose, worldGenre, inventory = [] }: WeaponCodexProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<WeaponCategory | 'all'>('all');
  const [activeRarity, setActiveRarity] = useState<string | 'all'>('all');
  const [activeGenre, setActiveGenre] = useState<string | 'all'>(
    // Pre-select world genre if provided
    worldGenre ? mapWorldGenreToFamily(worldGenre) ?? 'all' : 'all'
  );
  const [discoveredOnly, setDiscoveredOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Per-weapon image generation state
  const [imageStates, setImageStates] = useState<Record<string, ImageState>>({});

  // Derive discovered weapon IDs from inventory
  const discoveredIds = useMemo<Set<string>>(() => {
    const invLower = inventory.map(n => n.toLowerCase().trim());
    const ids = new Set<string>();
    for (const w of ALL_WEAPONS) {
      if (invLower.some(n => n === w.name.toLowerCase() || n.includes(w.name.toLowerCase()))) {
        ids.add(w.id);
      }
    }
    return ids;
  }, [inventory]);

  // Available genres in the catalog
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    for (const w of ALL_WEAPONS) {
      for (const g of w.genreFamilies) genres.add(g);
    }
    return Array.from(genres).sort();
  }, []);

  // Filtered weapon list
  const filteredWeapons = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_WEAPONS.filter(w => {
      if (activeCategory !== 'all' && w.category !== activeCategory) return false;
      if (activeRarity !== 'all' && w.rarity !== activeRarity) return false;
      if (activeGenre !== 'all' && !w.genreFamilies.includes(activeGenre as GenreFamily)) return false;
      if (discoveredOnly && !discoveredIds.has(w.id)) return false;
      if (q) {
        const hit =
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.flavorText.toLowerCase().includes(q) ||
          w.tags.some(t => t.toLowerCase().includes(q)) ||
          w.archetypeTags.some(t => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [search, activeCategory, activeRarity, activeGenre, discoveredOnly, discoveredIds]);

  // Sort: discovered first, then by rarity tier, then alphabetically
  const sortedWeapons = useMemo(() => {
    return [...filteredWeapons].sort((a, b) => {
      const aDisc = discoveredIds.has(a.id) ? 0 : 1;
      const bDisc = discoveredIds.has(b.id) ? 0 : 1;
      if (aDisc !== bDisc) return aDisc - bDisc;
      const rA = RARITY_ORDER.indexOf(a.rarity);
      const rB = RARITY_ORDER.indexOf(b.rarity);
      if (rA !== bDisc) return rB - rA; // higher rarity first within each group
      return a.name.localeCompare(b.name);
    });
  }, [filteredWeapons, discoveredIds]);

  // Generate image for a weapon
  const generateImage = useCallback(async (entry: WeaponCatalogEntry) => {
    setImageStates(prev => ({
      ...prev,
      [entry.id]: { loading: true, url: null, error: null },
    }));

    const prompt = buildWeaponImagePrompt(entry);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          task: 'image_item',
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageStates(prev => ({
          ...prev,
          [entry.id]: { loading: false, url: data.imageUrl, error: null },
        }));
      } else {
        throw new Error(data.error || 'No image returned');
      }
    } catch (err) {
      setImageStates(prev => ({
        ...prev,
        [entry.id]: {
          loading: false,
          url: null,
          error: err instanceof Error ? err.message : 'Generation failed',
        },
      }));
    }
  }, []);

  const totalCount = ALL_WEAPONS.length;
  const discoveredCount = discoveredIds.size;

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-slate-950/98 backdrop-blur-md animate-fadeIn">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-slate-700/50 bg-slate-900/80 px-4 py-3">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center flex-shrink-0">
            <Sword className="w-4 h-4 text-amber-100" />
          </div>
          <div>
            <h1 className="font-cinzel text-amber-400 text-lg font-bold leading-none">Weapon Codex</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {discoveredCount} of {totalCount} entries discovered
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs ml-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search weapons, tags, abilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Discovered toggle */}
            <button
              onClick={() => setDiscoveredOnly(v => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                discoveredOnly
                  ? 'border-amber-500/60 bg-amber-900/20 text-amber-400'
                  : 'border-slate-600/40 bg-slate-800/40 text-slate-400 hover:text-slate-300'
              }`}
            >
              {discoveredOnly ? '✓ Discovered only' : 'All weapons'}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-slate-800/60 bg-slate-900/60 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-2 max-w-7xl mx-auto min-w-max">

          {/* Category filters */}
          <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mr-1 flex-shrink-0">Type:</span>
          <button
            onClick={() => setActiveCategory('all')}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex-shrink-0 ${
              activeCategory === 'all'
                ? 'border-amber-500/60 bg-amber-900/20 text-amber-400'
                : 'border-slate-700/40 bg-slate-800/30 text-slate-400 hover:text-slate-300'
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex-shrink-0 ${
                activeCategory === cat
                  ? 'border-amber-500/60 bg-amber-900/20 text-amber-400'
                  : 'border-slate-700/40 bg-slate-800/30 text-slate-400 hover:text-slate-300'
              }`}
            >
              {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-700 mx-1 flex-shrink-0" />

          {/* Rarity filter */}
          <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mr-1 flex-shrink-0">Rarity:</span>
          <select
            value={activeRarity}
            onChange={e => setActiveRarity(e.target.value)}
            className="text-xs bg-slate-800/60 border border-slate-600/40 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500/50 flex-shrink-0"
          >
            <option value="all">All rarities</option>
            {RARITY_ORDER.map(r => (
              <option key={r} value={r}>{RARITY_META[r]?.label ?? r}</option>
            ))}
          </select>

          <div className="w-px h-4 bg-slate-700 mx-1 flex-shrink-0" />

          {/* Genre filter */}
          <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mr-1 flex-shrink-0">Genre:</span>
          <select
            value={activeGenre}
            onChange={e => setActiveGenre(e.target.value)}
            className="text-xs bg-slate-800/60 border border-slate-600/40 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500/50 flex-shrink-0"
          >
            <option value="all">All genres</option>
            {availableGenres.map(g => (
              <option key={g} value={g}>{GENRE_LABELS[g] ?? g}</option>
            ))}
          </select>

          <div className="ml-4 flex-shrink-0 text-xs text-slate-600">
            {filteredWeapons.length} weapon{filteredWeapons.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ── Weapon Grid ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sortedWeapons.map(weapon => (
            <WeaponCard
              key={weapon.id}
              weapon={weapon}
              discovered={discoveredIds.has(weapon.id)}
              expanded={expandedId === weapon.id}
              onToggleExpand={() => setExpandedId(prev => prev === weapon.id ? null : weapon.id)}
              imageState={imageStates[weapon.id] ?? null}
              onGenerateImage={() => generateImage(weapon)}
            />
          ))}

          {sortedWeapons.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🗡️</div>
              <p className="text-slate-400 font-medium">No weapons match your filters.</p>
              <p className="text-slate-600 text-sm mt-1">Try adjusting category, rarity, or genre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Weapon Card ──────────────────────────────────────────

interface WeaponCardProps {
  weapon: WeaponCatalogEntry;
  discovered: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  imageState: ImageState | null;
  onGenerateImage: () => void;
}

function WeaponCard({ weapon, discovered, expanded, onToggleExpand, imageState, onGenerateImage }: WeaponCardProps) {
  const meta = RARITY_META[weapon.rarity] ?? RARITY_META.common;
  const icon = CATEGORY_ICONS[weapon.category] ?? '⚔️';

  return (
    <div
      className={`relative rounded-xl border ${meta.border} ${meta.bg} overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.01]`}
    >
      {/* Generated / placeholder image strip */}
      {imageState?.url ? (
        <div className="w-full aspect-square overflow-hidden bg-slate-900">
          <img
            src={imageState.url}
            alt={weapon.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onGenerateImage}
            title="Regenerate image"
            className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-black/80 transition-colors"
          >
            <ImageIcon className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className={`w-full aspect-video flex items-center justify-center ${meta.bg} border-b ${meta.border}`}>
          {imageState?.loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-[10px] text-slate-500">Generating…</span>
            </div>
          ) : imageState?.error ? (
            <div className="flex flex-col items-center gap-1 px-3 text-center">
              <span className="text-2xl">⚠️</span>
              <span className="text-[10px] text-red-400">{imageState.error.slice(0, 60)}</span>
              <button onClick={onGenerateImage} className="text-[10px] text-amber-400 hover:text-amber-300 mt-1">Retry</button>
            </div>
          ) : discovered ? (
            <div className="flex flex-col items-center gap-2 opacity-40">
              <span className="text-4xl">{icon}</span>
              <span className="text-[10px] text-slate-500">No image yet</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Lock className="w-8 h-8 text-slate-700" />
              <span className="text-[10px] text-slate-700 font-medium uppercase tracking-wider">Undiscovered</span>
            </div>
          )}
        </div>
      )}

      {/* Card body */}
      <div className="flex-1 p-3 flex flex-col gap-2">

        {/* Name row */}
        <div className="flex items-start justify-between gap-1">
          <div>
            {discovered ? (
              <h3 className={`font-cinzel font-bold text-sm leading-tight ${meta.text}`}>
                {weapon.name}
              </h3>
            ) : (
              <h3 className="font-cinzel font-bold text-sm leading-tight text-slate-700">
                ???
              </h3>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider">{weapon.category}</span>
              <span className="text-slate-700">·</span>
              <span className={`text-[9px] uppercase tracking-wider font-semibold ${meta.text}`}>
                {meta.label}
              </span>
              {weapon.craftingOnly && discovered && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-[9px] text-orange-400 uppercase tracking-wider font-semibold">Craft-only</span>
                </>
              )}
              {weapon.requiresAttunement && discovered && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-[9px] text-violet-400 uppercase tracking-wider">Attune</span>
                </>
              )}
            </div>
          </div>

          {/* Damage badge */}
          {discovered && (
            <div className="flex-shrink-0 bg-slate-800/80 rounded-md px-1.5 py-1 text-center border border-slate-700/30">
              <div className="text-[11px] font-mono font-bold text-white leading-none">{weapon.damage}</div>
              <div className="text-[8px] text-slate-500 mt-0.5">{weapon.damageType}</div>
            </div>
          )}
        </div>

        {/* Description (discovered only) */}
        {discovered && (
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
            {weapon.description}
          </p>
        )}

        {/* Flavor text */}
        {discovered && weapon.flavorText && (
          <p className="text-[10px] text-slate-600 italic leading-relaxed line-clamp-2">
            "{weapon.flavorText}"
          </p>
        )}

        {/* Expanded details */}
        {expanded && discovered && (
          <div className="space-y-2 border-t border-slate-700/30 pt-2 mt-1">
            {weapon.specialAbility && (
              <div>
                <span className="text-[9px] text-purple-400 uppercase tracking-wider font-bold">Special: </span>
                <span className="text-[10px] text-slate-400">{weapon.specialAbility}</span>
              </div>
            )}
            {weapon.specialAbilityDescription && (
              <p className="text-[10px] text-slate-500">{weapon.specialAbilityDescription}</p>
            )}
            {weapon.loreText && (
              <p className="text-[10px] text-slate-600 italic">{weapon.loreText}</p>
            )}
            {weapon.range && (
              <div className="text-[9px] text-slate-500">
                Range: {weapon.range.normal}ft / {weapon.range.max}ft
              </div>
            )}
            {weapon.archetypeTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {weapon.archetypeTags.map(t => (
                  <span key={t} className="text-[9px] bg-slate-800 border border-slate-700/40 rounded px-1.5 py-0.5 text-slate-500">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {weapon.genreFamilies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {weapon.genreFamilies.map(g => (
                  <span key={g} className="text-[9px] bg-slate-800/70 border border-slate-700/30 rounded px-1.5 py-0.5 text-slate-600">
                    {GENRE_LABELS[g] ?? g}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          {discovered && (
            <>
              <button
                onClick={onToggleExpand}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                {expanded ? '▲ Less' : '▼ Details'}
              </button>
              <div className="flex-1" />
              <button
                onClick={onGenerateImage}
                disabled={imageState?.loading}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                  imageState?.loading
                    ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                    : 'border-amber-500/40 bg-amber-900/10 text-amber-400 hover:bg-amber-900/20 hover:border-amber-500/60'
                }`}
              >
                {imageState?.loading ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : imageState?.url ? (
                  <Sparkles className="w-2.5 h-2.5" />
                ) : (
                  <ImageIcon className="w-2.5 h-2.5" />
                )}
                {imageState?.url ? 'Regenerate' : 'Generate Image'}
              </button>
            </>
          )}
          {!discovered && (
            <span className="text-[10px] text-slate-700 italic">Find this weapon to unlock its secrets.</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Utility: map World Genre → GenreFamily ────────────────

function mapWorldGenreToFamily(genre: string): string | null {
  const MAP: Record<string, string> = {
    'epic-fantasy': 'medieval-fantasy',
    'dark-fantasy': 'dark-fantasy',
    'post-apocalypse': 'post-apocalypse',
    'survival': 'post-apocalypse',
    'steampunk': 'steampunk',
    'cyberpunk': 'cyberpunk',
    'sci-fi': 'sci-fi',
    'pirate': 'pirate',
    'western': 'western',
    'mythological': 'mythological',
    'lovecraftian': 'cosmic-horror',
    'noir': 'contemporary',
    'contemporary': 'contemporary',
    'japanese': 'japanese',
  };
  return MAP[genre] ?? null;
}
