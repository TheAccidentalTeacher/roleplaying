'use client';

import { useState } from 'react';
import type { WorldDefinition, WorldCategory } from '@/lib/data/world-types';
import { WORLD_CATEGORIES } from '@/lib/data/worlds';

interface WorldSelectorProps {
  selected: WorldDefinition | null;
  onSelect: (world: WorldDefinition) => void;
}

export default function WorldSelector({ selected, onSelect }: WorldSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [hoveredWorld, setHoveredWorld] = useState<WorldDefinition | null>(null);

  const previewWorld = hoveredWorld || selected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Choose Your World</h2>
        <p className="text-slate-400 text-sm">
          Select the setting for your adventure. Each world has unique origins and roles.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Category & World Grid */}
        <div className="lg:col-span-2 space-y-3">
          {WORLD_CATEGORIES.map((cat) => (
            <CategoryGroup
              key={cat.id}
              category={cat}
              expanded={expandedCategory === cat.id}
              onToggle={() =>
                setExpandedCategory(expandedCategory === cat.id ? null : cat.id)
              }
              selected={selected}
              onSelect={onSelect}
              onHover={setHoveredWorld}
            />
          ))}
        </div>

        {/* Right: World Preview Panel */}
        <div className="hidden lg:block">
          {previewWorld ? (
            <WorldPreviewCard world={previewWorld} isSelected={selected?.id === previewWorld.id} />
          ) : (
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 text-center sticky top-8">
              <p className="text-slate-500 text-sm italic">
                Hover over a world to preview its details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected world summary (mobile) */}
      {selected && (
        <div className="lg:hidden">
          <WorldPreviewCard world={selected} isSelected />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Category Accordion                     */
/* ─────────────────────────────────────── */

function CategoryGroup({
  category,
  expanded,
  onToggle,
  selected,
  onSelect,
  onHover,
}: {
  category: WorldCategory;
  expanded: boolean;
  onToggle: () => void;
  selected: WorldDefinition | null;
  onSelect: (w: WorldDefinition) => void;
  onHover: (w: WorldDefinition | null) => void;
}) {
  const hasSelected = selected && category.worlds.some((w) => w.id === selected.id);

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
          hasSelected
            ? 'bg-amber-500/10 border border-amber-500/30'
            : expanded
            ? 'bg-slate-800/80 border border-slate-600'
            : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="text-left">
            <span className="text-lg font-cinzel text-sky-400">{category.name}</span>
            <p className="text-slate-500 text-xs">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-xs">{category.worlds.length} worlds</span>
          <span className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pl-2">
          {category.worlds.map((world) => (
            <button
              key={world.id}
              onClick={() => onSelect(world)}
              onMouseEnter={() => onHover(world)}
              onMouseLeave={() => onHover(null)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg
                ${
                  selected?.id === world.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                    : 'border-slate-700 bg-slate-900/50 hover:border-sky-500/50 hover:shadow-sky-500/10'
                }
              `}
            >
              {selected?.id === world.id && (
                <span className="absolute top-2 right-2 text-amber-400 text-lg">✓</span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{world.icon}</span>
                <h3 className="font-cinzel text-white font-semibold">{world.name}</h3>
              </div>

              <p className="text-slate-400 text-xs mb-2 line-clamp-2">{world.description}</p>

              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded">
                  {world.origins.reduce((n, c) => n + c.origins.length, 0)} {world.originLabel.toLowerCase()}s
                </span>
                <span className="bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded">
                  {world.classes.length} {world.classLabel.toLowerCase()}s
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Preview Panel                          */
/* ─────────────────────────────────────── */

function WorldPreviewCard({
  world,
  isSelected,
}: {
  world: WorldDefinition;
  isSelected: boolean;
}) {
  const totalOrigins = world.origins.reduce((n, c) => n + c.origins.length, 0);

  return (
    <div
      className={`bg-slate-900/80 border rounded-xl p-6 space-y-4 sticky top-8 transition-colors ${
        isSelected ? 'border-amber-500/50' : 'border-slate-700/50'
      }`}
    >
      {/* Title */}
      <div className="text-center">
        <span className="text-4xl">{world.icon}</span>
        <h3 className="text-xl font-cinzel text-amber-400 mt-2">{world.name}</h3>
        <p className="text-slate-500 text-xs mt-1 italic">&ldquo;{world.flavor}&rdquo;</p>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm">{world.description}</p>

      {/* Origin Categories */}
      <div>
        <h4 className="text-xs text-sky-400 font-semibold uppercase tracking-wider mb-2">
          {world.originLabel}s ({totalOrigins})
        </h4>
        <div className="space-y-1">
          {world.origins.map((cat) => (
            <div key={cat.category}>
              <span className="text-[10px] text-slate-500">{cat.category}: </span>
              <span className="text-xs text-slate-300">
                {cat.origins.map((o) => o.name).join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Classes */}
      <div>
        <h4 className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">
          {world.classLabel}s ({world.classes.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {world.classes.map((c) => (
            <span
              key={c.id}
              className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
            >
              <span>{c.icon}</span> {c.name}
            </span>
          ))}
        </div>
      </div>

      {isSelected && (
        <div className="text-center pt-2 border-t border-slate-700">
          <span className="text-green-400 text-sm font-semibold">✓ Selected</span>
        </div>
      )}
    </div>
  );
}
