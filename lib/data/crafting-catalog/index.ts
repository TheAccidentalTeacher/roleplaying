// ============================================================
// CRAFTING CATALOG — INDEX
// Exports all crafting recipe collections
// ============================================================

export { POST_APOC_RECIPES, getRecipeByWeaponId, getRecipesByStation, getRecipesBySkillLevel } from './post-apocalypse';
export type { PostApocCraftingRecipe, PostApocStation, PostApocMaterial } from './post-apocalypse';

export { FANTASY_RECIPES, getFantasyRecipeByWeaponId, getFantasyRecipesByStation, getFantasyRecipesBySkillLevel } from './fantasy';
export type { FantasyCraftingRecipe, FantasyStation, FantasyMaterial } from './fantasy';
