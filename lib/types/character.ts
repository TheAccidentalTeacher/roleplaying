// ============================================================
// CHARACTER TYPES — Full character system
// Reference: PLAYER-HANDBOOK.md, BRAINSTORM.md
// ============================================================

import type { Genre } from './world';

// ---- Enums & Union Types ----

export type CreationMode = 'quick-spark' | 'questionnaire' | 'builder' | 'import' | 'collaborative';
export type AbilityScoreMethod = 'roll' | 'point-buy' | 'standard-array' | 'ai-recommended';
export type Alignment = 'lawful-good' | 'neutral-good' | 'chaotic-good' | 'lawful-neutral' | 'true-neutral' | 'chaotic-neutral' | 'lawful-evil' | 'neutral-evil' | 'chaotic-evil' | 'unaligned';

export type CharacterClass =
  | 'warrior' | 'mage' | 'rogue' | 'cleric' | 'ranger' | 'bard'
  | 'paladin' | 'druid' | 'warlock' | 'monk' | 'artificer' | 'blood-mage'
  | string; // AI can generate custom classes per world

export type CharacterRace =
  // Common
  | 'human' | 'elf' | 'dwarf' | 'halfling' | 'gnome' | 'half-elf' | 'half-orc'
  // Uncommon
  | 'tiefling' | 'dragonborn' | 'orc' | 'goblin' | 'goliath' | 'firbolg'
  | 'tabaxi' | 'kenku' | 'lizardfolk' | 'aasimar' | 'genasi'
  // Exotic
  | 'changeling' | 'warforged' | 'centaur' | 'minotaur' | 'satyr'
  | 'fairy' | 'harengon' | 'owlin' | 'autognome' | 'plasmoid'
  // World-generated
  | string;

export type BackgroundType =
  | 'soldier' | 'criminal' | 'sage' | 'noble' | 'outlander' | 'acolyte'
  | 'folk-hero' | 'hermit' | 'merchant' | 'sailor' | 'entertainer'
  | 'artisan' | 'urchin' | 'charlatan'
  | string; // AI-generated world-specific backgrounds

export type SkillName =
  | 'acrobatics' | 'animal-handling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleight-of-hand'
  | 'stealth' | 'survival';

export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type ConditionType =
  | 'blinded' | 'charmed' | 'deafened' | 'exhaustion' | 'frightened'
  | 'grappled' | 'incapacitated' | 'invisible' | 'paralyzed'
  | 'petrified' | 'poisoned' | 'prone' | 'restrained' | 'stunned'
  | 'unconscious' | 'concentrating'
  | string; // Custom conditions

// ---- Core Interfaces ----

export interface AbilityScore {
  base: number;
  racialBonus: number;
  itemBonus: number;
  score: number;     // base + racialBonus + itemBonus
  modifier: number;  // Math.floor((score - 10) / 2)
}

export interface AbilityScores {
  str: AbilityScore;
  dex: AbilityScore;
  con: AbilityScore;
  int: AbilityScore;
  wis: AbilityScore;
  cha: AbilityScore;
}

export interface HitPoints {
  current: number;
  max: number;
  temporary: number;
  hitDice: {
    total: number;
    remaining: number;
    dieType: number; // 6, 8, 10, 12
  };
}

export interface Mana {
  current: number;
  max: number;
}

export interface SpellSlot {
  level: number;
  total: number;
  remaining: number;
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damage?: string;
  savingThrow?: AbilityName;
  isPrepared: boolean;
  isRitual: boolean;
}

export interface Spellcasting {
  ability: AbilityName;
  spellSaveDC: number;
  spellAttackBonus: number;
  spellSlots: SpellSlot[];
  knownSpells: Spell[];
  preparedSpells: string[]; // spell IDs
  cantrips: Spell[];
}

export interface Skill {
  name: SkillName;
  ability: AbilityName;
  proficient: boolean;
  expertise: boolean;
  bonus: number; // ability mod + proficiency (if prof) + expertise (if exp)
}

export interface SavingThrow {
  ability: AbilityName;
  proficient: boolean;
  bonus: number;
}

export interface ClassFeature {
  id: string;
  name: string;
  source: 'class' | 'subclass' | 'race' | 'background' | 'story' | 'feat';
  level: number; // Level gained
  description: string;
  uses?: {
    max: number;
    remaining: number;
    rechargeOn: 'short-rest' | 'long-rest' | 'dawn' | 'never';
  };
  isPassive: boolean;
}

export interface ActiveCondition {
  type: ConditionType;
  source: string;
  duration?: number; // Rounds remaining, undefined = until dispelled
  saveDC?: number;
  saveType?: AbilityName;
}

export interface DeathSaves {
  successes: number; // 0-3
  failures: number;  // 0-3
}

export interface PersonalityTraits {
  traits: string[];    // 2 personality traits
  ideal: string;
  bond: string;
  flaw: string;
}

export interface Character {
  // Identity
  id: string;
  worldId: string;
  userId: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  subclass?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;

  // Core Stats
  abilityScores: AbilityScores;
  hitPoints: HitPoints;
  mana?: Mana;
  armorClass: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;

  // Skills & Saves
  skills: Skill[];
  savingThrows: SavingThrow[];
  passivePerception: number;

  // Spellcasting (if applicable)
  spellcasting?: Spellcasting;

  // Features & Abilities
  features: ClassFeature[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };

  // Equipment & Inventory
  equipment: EquippedItems;
  inventory: string[]; // Item IDs in backpack
  gold: number;
  carryWeight: number;
  carryCapacity: number;
  encumbrance: EncumbranceLevel;

  // Background & Personality
  background: BackgroundType;
  alignment: Alignment;
  personality: PersonalityTraits;
  appearance: string;
  backstory?: string;
  creationMode: CreationMode;

  // Companions
  companionIds: string[];
  activeCompanionId?: string;

  // Status
  conditions: ActiveCondition[];
  exhaustionLevel: number; // 0-6
  deathSaves: DeathSaves;
  isAlive: boolean;
  isRetired: boolean;

  // Metadata
  portraitUrl?: string;
  currentLocation: string;
  playTimeMinutes: number;
  sessionCount: number;
  createdAt: string;
  updatedAt: string;
}

export type EncumbranceLevel = 'light' | 'medium' | 'heavy' | 'overloaded';

export type EquipSlot =
  | 'head' | 'neck' | 'chest' | 'back' | 'hands' | 'belt'
  | 'legs' | 'feet' | 'ring-l' | 'ring-r'
  | 'weapon-main' | 'weapon-off'
  | 'trinket-1' | 'trinket-2'
  | 'pack' | 'secret';

export interface EquippedItems {
  head?: string;       // Item ID
  neck?: string;
  chest?: string;
  back?: string;
  hands?: string;
  belt?: string;
  legs?: string;
  feet?: string;
  'ring-l'?: string;
  'ring-r'?: string;
  'weapon-main'?: string;
  'weapon-off'?: string;
  'trinket-1'?: string;
  'trinket-2'?: string;
  pack?: string;
  secret?: string;
}

// Character creation input (before full Character is built)
export interface CharacterCreationInput {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  background: BackgroundType;
  abilityScoreMethod: AbilityScoreMethod;
  abilityScores: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  personality?: PersonalityTraits;
  appearance?: string;
  playerSentence?: string; // The "one sentence" optional story hook
  creationMode: CreationMode;
  worldType?: string; // World definition id (e.g. 'cyberpunk', 'dark-fantasy')
}

// Party companion (simplified character for NPC party members)
export interface PartyMember {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  hitPoints: HitPoints;
  mana?: Mana;
  armorClass: number;
  initiative: number;
  abilities: ClassFeature[];
  passiveEffects: string[];
  tactics: TacticSettings;
  personality: string;
  loyalty: number; // 0-100
  portraitUrl?: string;
  isControlled: boolean;
  canDie: boolean;
}

export interface TacticSettings {
  aggressiveness: 'defensive' | 'balanced' | 'aggressive';
  targetPriority: 'weakest' | 'strongest' | 'closest' | 'caster' | 'healer';
  useAbilities: boolean;
  healThreshold: number; // HP% at which to heal
  fleeThreshold: number; // HP% at which to suggest fleeing
}
