'use client';

import { useState } from 'react';
import type { ItemRarity } from '@/lib/types/items';

interface CraftingMaterial {
  name: string;
  required: number;
  available: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  resultRarity: ItemRarity;
  materials: CraftingMaterial[];
  craftingDC: number;
  craftingTimeMinutes: number;
  requiredStation?: string;
  unlocked: boolean;
}

interface CraftingViewProps {
  recipes: Recipe[];
  characterSkillBonus: number;
  currentStation?: string;
  onCraft: (recipeId: string) => void;
  onClose?: () => void;
}

function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'junk': return 'border-slate-600 text-slate-400';
    case 'common': return 'border-slate-500 text-slate-300';
    case 'uncommon': return 'border-green-600 text-green-400';
    case 'rare': return 'border-blue-600 text-blue-400';
    case 'epic': return 'border-purple-600 text-purple-400';
    case 'legendary': return 'border-amber-600 text-amber-400';
    case 'mythic': return 'border-red-600 text-red-400';
    case 'artifact': return 'border-pink-600 text-pink-400';
    default: return 'border-slate-600 text-slate-300';
  }
}

export default function CraftingView({
  recipes,
  characterSkillBonus,
  currentStation,
  onCraft,
  onClose,
}: CraftingViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const categories = ['all', ...new Set(recipes.map((r) => r.category))];
  const filtered = selectedCategory === 'all'
    ? recipes
    : recipes.filter((r) => r.category === selectedCategory);

  const selected = recipes.find((r) => r.id === selectedRecipe);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
        <h2 className="font-cinzel text-xl font-bold">⚒️ Crafting</h2>
        {currentStation && (
          <span className="text-sm text-slate-400">Station: {currentStation}</span>
        )}
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 transition-colors" aria-label="Close crafting">
            ✕
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded text-sm capitalize whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Recipe List */}
        <div className="w-1/2 border-r border-slate-800 overflow-y-auto p-2 space-y-1">
          {filtered.map((recipe) => {
            const canCraft = recipe.materials.every((m) => m.available >= m.required) && recipe.unlocked;
            const isSelected = selectedRecipe === recipe.id;

            return (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-700 border-primary-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                } ${!recipe.unlocked ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${getRarityColor(recipe.resultRarity).split(' ')[1]}`}>
                    {recipe.unlocked ? recipe.name : '???'}
                  </span>
                  {canCraft && (
                    <span className="text-xs text-green-400">Ready</span>
                  )}
                </div>
                {recipe.unlocked && (
                  <p className="text-xs text-slate-500 mt-1">{recipe.category}</p>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-8">No recipes found</p>
          )}
        </div>

        {/* Recipe Detail */}
        <div className="w-1/2 overflow-y-auto p-4">
          {selected ? (
            <div className="space-y-4">
              <h3 className={`font-cinzel text-lg font-bold ${getRarityColor(selected.resultRarity).split(' ')[1]}`}>
                {selected.name}
              </h3>
              <p className="text-sm text-slate-400">{selected.description}</p>

              {/* Materials */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Materials</h4>
                <div className="space-y-1">
                  {selected.materials.map((mat, i) => {
                    const hasEnough = mat.available >= mat.required;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className={hasEnough ? 'text-slate-400' : 'text-red-400'}>
                          {mat.name}
                        </span>
                        <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                          {mat.available}/{mat.required}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-slate-500">DC</span>
                  <p className="font-bold">{selected.craftingDC}</p>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-slate-500">Your Bonus</span>
                  <p className="font-bold text-primary-400">+{characterSkillBonus}</p>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-slate-500">Time</span>
                  <p className="font-bold">{selected.craftingTimeMinutes}min</p>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-slate-500">Success</span>
                  <p className="font-bold">
                    {Math.min(95, Math.max(5, (21 - selected.craftingDC + characterSkillBonus) * 5))}%
                  </p>
                </div>
              </div>

              {selected.requiredStation && (
                <p className="text-xs text-slate-500">
                  Requires: <span className="text-slate-400">{selected.requiredStation}</span>
                  {currentStation === selected.requiredStation ? (
                    <span className="text-green-400 ml-2">✓</span>
                  ) : (
                    <span className="text-red-400 ml-2">✗</span>
                  )}
                </p>
              )}

              {/* Craft Button */}
              <button
                onClick={() => onCraft(selected.id)}
                disabled={!selected.materials.every((m) => m.available >= m.required)}
                className={`w-full py-3 rounded-lg font-cinzel font-bold transition-all ${
                  selected.materials.every((m) => m.available >= m.required)
                    ? 'bg-primary-600 hover:bg-primary-500 text-white'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                ⚒️ Craft
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600 text-sm">
              Select a recipe to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
