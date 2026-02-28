// ============================================================
// CRAFTING ENGINE
// Recipe management, crafting execution, quality tiers
// Reference: BRAINSTORM.md Crafting section
// ============================================================

import type {
  CraftingRecipe,
  CraftingResult,
  CraftingSkill,
  Material,
} from '@/lib/types/items';
import type { Character } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import { d20 } from '@/lib/utils/dice';
import { getProficiencyBonus } from '@/lib/utils/calculations';

// ---- Quality Tiers (WoW-style proc system) ----

type QualityTier = CraftingResult['quality'];

function determineQuality(roll: number, dc: number): QualityTier {
  const margin = roll - dc;
  if (margin >= 15) return 'legendary';
  if (margin >= 10) return 'masterwork';
  if (margin >= 5) return 'superior';
  if (margin >= 0) return 'fine';
  return 'normal'; // should only reach here on success
}

// ---- Recipe Filtering ----

export function getAvailableRecipes(
  recipes: CraftingRecipe[],
  character: Character,
  availableMaterials: Material[]
): CraftingRecipe[] {
  return recipes.filter((r) => {
    if (!r.isDiscovered) return false;

    // Check skill level: character must have the crafting tool proficiency
    const hasTool = character.proficiencies.tools.some(
      (t) => t.toLowerCase().includes(r.skill.toLowerCase())
    );
    if (!hasTool) return false;

    // Check materials
    const hasMaterials = r.materials.every((needed) => {
      const available = availableMaterials.find(
        (m) => m.name.toLowerCase() === needed.materialName.toLowerCase()
      );
      return available && available.quantity >= needed.quantity;
    });

    return hasMaterials;
  });
}

// ---- Crafting Execution ----

export function craft(
  character: Character,
  recipe: CraftingRecipe,
  materials: Material[],
  stationAvailable: boolean
): CraftingResult {
  // Check station requirement
  if (recipe.requiresStation && !stationAvailable) {
    return {
      success: false,
      quality: 'normal',
      materialsConsumed: false,
      xpGained: 0,
      narration: `You need a ${recipe.stationType || 'crafting station'} to craft this.`,
    };
  }

  // Determine ability modifier (INT or DEX based on skill)
  const abilityMod = getCraftingAbilityMod(recipe.skill, character);
  const profBonus = getProficiencyBonus(character.level);
  const rollResult = d20();
  const total = rollResult + abilityMod + profBonus;
  const success = total >= recipe.difficultyDC;

  if (!success) {
    // Failed crafting — materials may be partially consumed
    const materialsLost = rollResult === 1; // Nat 1 = total loss
    return {
      success: false,
      quality: 'normal',
      materialsConsumed: materialsLost,
      xpGained: Math.floor(recipe.difficultyDC / 2), // Some XP for trying
      narration: materialsLost
        ? `Your attempt at crafting ${recipe.name} fails catastrophically! The materials are ruined.`
        : `Your attempt at crafting ${recipe.name} doesn't quite come together, but the materials are salvageable.`,
    };
  }

  const quality = determineQuality(total, recipe.difficultyDC);
  const xp = calculateCraftingXP(recipe.difficultyDC, quality);

  return {
    success: true,
    quality,
    materialsConsumed: true,
    xpGained: xp,
    narration: buildCraftingNarration(recipe.name, quality, rollResult === 20),
  };
}

// ---- Recipe Discovery ----

export function discoverRecipe(
  method: 'experimentation' | 'scroll' | 'npc_taught' | 'reverse_engineer',
  recipe: CraftingRecipe
): { discovered: boolean; narration: string } {
  switch (method) {
    case 'scroll':
    case 'npc_taught':
      return {
        discovered: true,
        narration: `You learn the recipe for ${recipe.name}!`,
      };
    case 'experimentation': {
      const chance = 0.4;
      const success = Math.random() < chance;
      return {
        discovered: success,
        narration: success
          ? `Through experimentation, you discover how to craft ${recipe.name}!`
          : `Your experiment yields interesting results, but you haven't quite figured out the recipe yet.`,
      };
    }
    case 'reverse_engineer': {
      const chance = 0.6;
      const success = Math.random() < chance;
      return {
        discovered: success,
        narration: success
          ? `By carefully studying the item, you reverse-engineer the recipe for ${recipe.name}!`
          : `The construction is too complex to fully understand through examination alone.`,
      };
    }
  }
}

// ---- Helpers ----

function getCraftingAbilityMod(skill: CraftingSkill, character: Character): number {
  const dexSkills: CraftingSkill[] = ['leatherworking', 'jewelcrafting', 'tailoring', 'woodworking'];
  if (dexSkills.includes(skill)) return character.abilityScores.dex.modifier;
  // Smithing, alchemy, engineering, enchanting, cooking = INT or STR
  if (skill === 'smithing') return character.abilityScores.str.modifier;
  return character.abilityScores.int.modifier;
}

function calculateCraftingXP(dc: number, quality: QualityTier): number {
  const baseXP = dc * 5;
  const qualityMult: Record<QualityTier, number> = {
    normal: 1,
    fine: 1.25,
    superior: 1.5,
    masterwork: 2,
    legendary: 3,
  };
  return Math.round(baseXP * qualityMult[quality]);
}

function buildCraftingNarration(itemName: string, quality: QualityTier, natTwenty: boolean): string {
  if (natTwenty) {
    return `With a flash of inspiration, you craft a truly magnificent ${itemName}! The work exceeds even your own expectations.`;
  }
  switch (quality) {
    case 'legendary':
      return `You have created a legendary ${itemName}. This is the kind of work that will be remembered for generations.`;
    case 'masterwork':
      return `Your ${itemName} is a masterwork — exceptional in every way. Other crafters would be envious.`;
    case 'superior':
      return `You craft a superior ${itemName}. The quality is noticeably above average.`;
    case 'fine':
      return `You successfully craft a fine ${itemName}. It's solid, functional work.`;
    default:
      return `You complete the ${itemName}. It's serviceable, if not remarkable.`;
  }
}

// ---- Prompt for AI crafting station lookup ----

export function buildCraftingStationPrompt(location: string): string {
  return `What crafting stations are available at: "${location}"?
Respond as JSON array:
[
  {
    "stationType": "forge|alchemy_lab|enchanting_table|tannery|kitchen|workshop",
    "quality": "basic|good|excellent",
    "available": true,
    "cost": number (gold per hour, 0 if free)
  }
]`;
}

// ---- World Crafting Integration ----

/**
 * Convert world crafting recipes to engine-compatible CraftingRecipe format.
 * World recipes start as undiscovered — players find them through gameplay.
 */
export function getWorldCraftingRecipes(
  world: WorldRecord,
): CraftingRecipe[] {
  if (!world.crafting?.recipes?.length) return [];

  const difficultyToDC: Record<string, number> = {
    novice: 10,
    journeyman: 15,
    expert: 20,
    master: 25,
  };

  const difficultyToTime: Record<string, number> = {
    novice: 1,
    journeyman: 2,
    expert: 4,
    master: 8,
  };

  return world.crafting.recipes.map((r, i) => ({
    id: `world-recipe-${i}`,
    name: r.name,
    skill: r.discipline.toLowerCase() as CraftingSkill,
    skillLevelRequired: difficultyToDC[r.difficulty] ? Math.floor(difficultyToDC[r.difficulty] / 5) : 3,
    materials: r.inputs.map(inp => ({
      materialName: inp.material,
      quantity: inp.quantity,
    })),
    resultDescription: r.output,
    difficultyDC: difficultyToDC[r.difficulty] || 15,
    craftingTimeHours: difficultyToTime[r.difficulty] || 2,
    requiresStation: true,
    stationType: r.discipline,
    isDiscovered: false, // Must be discovered through gameplay
  }));
}

/**
 * Get available crafting disciplines from the world data.
 */
export function getWorldCraftingDisciplines(
  world: WorldRecord,
): { name: string; tool: string; description: string }[] {
  if (!world.crafting?.disciplines?.length) return [];

  return world.crafting.disciplines.map(d => ({
    name: d.name,
    tool: d.toolRequired,
    description: d.description,
  }));
}

/**
 * Build a prompt asking the AI about crafting options at a location,
 * informed by the world's crafting system.
 */
export function buildWorldCraftingPrompt(
  world: WorldRecord,
  location: string,
  character: Character
): string {
  const craftingInfo = world.crafting
    ? `\nWORLD CRAFTING SYSTEM: ${world.crafting.description}
Disciplines: ${world.crafting.disciplines.map(d => `${d.name} (requires ${d.toolRequired})`).join(', ')}
Available recipes: ${world.crafting.recipes.map(r => `${r.name} [${r.difficulty}]`).join(', ')}`
    : '';

  const materials = world.economy?.rareMaterials?.length
    ? `\nRARE MATERIALS IN WORLD: ${world.economy.rareMaterials.map(m => `${m.name} — found at ${m.source}`).join(', ')}`
    : '';

  const tools = character.proficiencies.tools?.length
    ? `\nPLAYER TOOL PROFICIENCIES: ${character.proficiencies.tools.join(', ')}`
    : '';

  return `What crafting opportunities are available at "${location}" in ${world.worldName}?${craftingInfo}${materials}${tools}

Return JSON:
{
  "availableStations": [{"type": "string", "quality": "basic|good|excellent", "cost": number}],
  "availableRecipes": [{"name": "string", "discipline": "string", "difficulty": "string", "materialsNeeded": ["string"]}],
  "localMaterials": [{"name": "string", "cost": number, "source": "string"}],
  "craftingNPCs": [{"name": "string", "specialty": "string", "canTeach": boolean}]
}`;
}
