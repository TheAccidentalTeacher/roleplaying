// ============================================================
// WORLD TYPES — Generated world bible for each character's universe
// Reference: BRAINSTORM.md (World Generation section)
// ============================================================

export type WorldType =
  // Fantasy
  | 'classic-high-fantasy' | 'dark-fantasy' | 'dying-world' | 'young-world'
  | 'fallen-empire' | 'conquered-world' | 'mythic-age' | 'hidden-magic'
  | 'clockwork-fantasy' | 'planar-world'
  // Sci-Fi
  | 'deep-space-opera' | 'hard-scifi' | 'post-singularity' | 'generation-ship'
  | 'colony-world' | 'post-contact' | 'dyson-sphere' | 'time-war' | 'uploaded-world'
  // Contemporary
  | 'modern-magic-revealed' | 'zombie-apocalypse' | 'alien-occupation'
  | 'pandemic-world' | 'climate-collapse' | 'corporate-dystopia'
  | 'superhuman-emergence' | 'secret-government' | 'interdimensional-leak'
  // Historical/Mythological
  | 'norse-twilight' | 'greek-heroic-age' | 'egyptian-eternal'
  | 'arthurian-twilight' | 'feudal-japan-supernatural' | 'age-of-sail-mythology'
  | 'mesopotamian-dawn' | 'celtic-spiritworld' | 'aztec-sun-keeping'
  // Hybrid/Strange
  | 'dying-universe' | 'dream-world' | 'recursive-reality' | 'the-long-fall'
  | 'reversed-history' | 'monsters-world' | 'the-afterlife-itself'
  | 'inside-a-god' | 'pocket-universe' | 'the-void-between'
  // Catch-all for AI-generated custom types
  | string;

export type Genre =
  | 'epic-fantasy' | 'dark-fantasy' | 'horror' | 'sci-fi' | 'cyberpunk'
  | 'post-apocalypse' | 'mystery' | 'noir' | 'pirate' | 'lovecraftian'
  | 'mythological' | 'steampunk' | 'western' | 'superhero' | 'romance'
  | 'comedy' | 'political-intrigue' | 'survival' | 'military'
  | string;

export type NarrativeTone =
  | 'epic-heroic' | 'dark-unforgiving' | 'mythic-ancient'
  | 'intimate-personal' | 'political-complex' | 'cosmic-vast'
  | 'humorous-absurd' | 'tense-paranoid' | 'oppressive-claustrophobic'
  | 'wondrous-exploratory' | 'tragic-inevitable' | 'hopeful-against-odds'
  | 'surreal-dreamlike' | 'brutal-grounded' | 'philosophical-questioning'
  | string;

export type GenreArtStyle =
  | 'painterly-warm' | 'gritty-desaturated' | 'desaturated-grainy'
  | 'clean-cold-glowing' | 'neon-rain-dystopian' | 'dusty-ruined-beauty'
  | 'moody-shadows-sepia' | 'painterly-oceanic' | 'surreal-unsettling'
  | 'classical-oil-painting'
  | string;

export interface Era {
  name: string;
  description: string;
  duration: string;
  keyEvents: string[];
  legacy: string; // How this era still affects the present
}

export interface Legend {
  title: string;
  summary: string;
  isTrue: boolean; // Does the DM know this is real?
  relevanceToPlayer: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  leader: string;
  goals: string[];
  strength: 'weak' | 'moderate' | 'strong' | 'dominant';
  alignment: string;
  territory: string;
  attitude_toward_player: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
  secrets: string[];
  resources: string[];
}

export interface Region {
  id: string;
  name: string;
  description: string;
  terrain: string;
  climate: string;
  controlledBy?: string; // Faction ID or name
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  knownLocations: LocationSeed[];
  mapPosition: { x: number; y: number }; // Normalized 0-1
  pointsOfInterest: string[];
  travelNotes: string;
}

export interface LocationSeed {
  name: string;
  type: 'city' | 'town' | 'village' | 'dungeon' | 'ruin' | 'landmark' | 'wilderness' | 'camp' | 'fortress' | 'temple' | 'port';
  description: string;
  significance: string;
}

export interface Threat {
  name: string;
  nature: string; // What IS this threat
  origin: string; // Where did it come from
  motivation: string; // What does it want
  currentPhase: string; // What stage is the threat at NOW
  escalation: string[]; // How it gets worse over time
  weakness: string; // How it COULD be stopped (not obvious to player)
}

export interface Artifact {
  name: string;
  description: string;
  nature: string; // What it actually is/does
  currentLocation: string;
  guardedBy: string;
  dangerOfUse: string;
  history: string;
}

export interface Prophecy {
  text: string; // The actual prophetic text
  interpretation: string; // What people THINK it means
  truth: string; // What it REALLY means
  relevanceToPlayer: string;
}

export interface VillainProfile {
  name: string;
  title: string;
  description: string;
  motivation: string; // Comprehensible, human motivation
  history: string; // How they became what they are
  somethingTheyLove: string; // Makes them dangerous AND human
  missedPoint: string; // When they could have been stopped
  genuineArgument: string; // Could they be right about anything?
  currentPlan: string; // What they're doing RIGHT NOW
  resources: string[];
  weaknesses: string[];
  archetype: VillainArchetype;
}

export type VillainArchetype =
  | 'idealist-gone-too-far' | 'wounded-god' | 'the-mirror'
  | 'the-machine' | 'grieving-parent' | 'the-revolutionary'
  | 'the-last-believer' | 'the-one-who-knows' | 'the-replaced'
  | 'the-forgotten'
  | string;

export interface OriginScenario {
  setting: string; // Where the story begins
  situation: string; // What's happening
  hook: string; // Why the player is involved
  firstNPCIntro: string; // How they meet the first NPC
  initialChoices: string[]; // 3-5 opening action options
}

export interface MagicSystem {
  name: string;
  description: string;
  source: string; // Where magic comes from
  cost: string; // What using magic costs
  limitations: string[];
  socialAttitude: string; // How society views magic
  schools?: string[]; // Categories of magic if applicable
}

export interface WorldRecord {
  // Identity
  id: string;
  characterId: string;
  worldName: string;
  createdAt: string;

  // Cosmology & Structure
  worldType: WorldType;
  magicSystem: MagicSystem;
  technologyLevel: string;
  cosmology: string;
  afterlife: string;
  time: string; // Linear, cyclical, broken, etc.

  // History
  ageOfWorld: string;
  majorHistoricalEras: Era[];
  catastrophes: string[];
  legends: Legend[];

  // Current State
  factions: Faction[];
  geography: Region[];
  currentConflicts: string[];
  powerVacuums: string[];

  // The Central Story
  mainThreat: Threat;
  centralArtifact?: Artifact;
  prophecy?: Prophecy;
  villainCore: VillainProfile;
  secretHistory: string;

  // The Player's Place
  playerRole: string;
  originScenario: OriginScenario;

  // Tone & Feel
  narrativeTone: NarrativeTone[];
  primaryGenre: Genre;
  genreBlends: Genre[];
  genreArtStyle: GenreArtStyle;
  thematicCore: string;

  // Currency (genre-adaptive)
  currencyNames: {
    primary: string;   // GP, Credits, Caps, etc.
    secondary?: string; // SP, etc.
    tertiary?: string;  // CP, etc.
  };

  // ══════════════════════════════════════════════════════════════
  // DEEP WORLDBUILDING — Generated in multi-step pipeline
  // All fields optional for backward compatibility
  // ══════════════════════════════════════════════════════════════

  // Companion roster — recruitable party members (DnD meets Mass Effect)
  companions?: CompanionProfile[];

  // Bestiary — creature types native to this world
  bestiary?: CreatureTemplate[];

  // Dungeon & location blueprints — pre-planned adventure sites
  dungeons?: DungeonBlueprint[];

  // City & settlement details — economy, NPCs, services
  settlements?: SettlementDetail[];

  // Economy scaffolding — trade routes, price regions, rare materials
  economy?: WorldEconomy;

  // Encounter tables — by region and danger level
  encounterTables?: RegionEncounterTable[];

  // Story arc — the full campaign structure with acts and beats
  storyArc?: CampaignArc;

  // Relationship web — how factions, NPCs, and the villain connect
  relationshipWeb?: RelationshipNode[];

  // World-specific loot tables — unique items, crafting materials
  lootTables?: WorldLootTable[];

  // Crafting system — materials, recipes, stations
  crafting?: CraftingSystem;

  // Random events — world events that can fire during play
  randomEvents?: WorldEvent[];

  // Travel network — how locations connect, travel times, hazards
  travelNetwork?: TravelRoute[];
}

// ══════════════════════════════════════════════════════════════
// COMPANION SYSTEM — Recruitable party members
// ══════════════════════════════════════════════════════════════

export interface CompanionProfile {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  role: 'tank' | 'healer' | 'dps-melee' | 'dps-ranged' | 'support' | 'utility';
  personality: string;
  backstory: string;
  motivation: string;
  recruitLocation: string;        // Where to find them
  recruitCondition: string;       // What triggers recruitment
  loyaltyTriggers: string[];      // Actions that increase loyalty
  betrayalTriggers: string[];     // Actions that decrease loyalty
  personalQuest: string;          // Their companion-specific quest
  combatStyle: string;            // How they fight
  signature: string;              // Signature ability or trait
  relationships: {                // Opinions of other companions
    companionId: string;
    attitude: 'hostile' | 'rival' | 'neutral' | 'friendly' | 'romantic-potential';
    reason: string;
  }[];
  dialogueStyle: string;          // How they speak
  secretOrFlaw: string;           // Hidden depth
}

// ══════════════════════════════════════════════════════════════
// BESTIARY — World-native creatures
// ══════════════════════════════════════════════════════════════

export interface CreatureTemplate {
  id: string;
  name: string;
  type: string;                    // beast, undead, elemental, etc.
  challengeRating: number;
  habitat: string[];               // Which regions/terrains
  description: string;
  behavior: string;                // How it acts in combat and exploration
  loot: string[];                  // What it drops
  weaknesses: string[];
  resistances: string[];
  isUnique: boolean;               // Boss creature?
  loreConnection: string;          // How it ties to world history/factions
}

// ══════════════════════════════════════════════════════════════
// DUNGEON BLUEPRINTS — Pre-planned adventure sites
// ══════════════════════════════════════════════════════════════

export interface DungeonBlueprint {
  id: string;
  name: string;
  location: string;                // Which region/settlement
  type: 'dungeon' | 'cave' | 'tower' | 'ruins' | 'stronghold' | 'labyrinth' | 'mine' | 'crypt' | 'temple' | 'lair';
  levelRange: { min: number; max: number };
  floors: WorldDungeonFloor[];
  boss: string;                    // Creature or NPC name
  lore: string;                    // Why this place exists
  reward: string;                  // What's at the end
  traps: string[];
  puzzles: string[];
  secretRooms: string[];
  factionTies: string[];           // Which factions care about this place
}

export interface WorldDungeonFloor {
  level: number;
  name: string;
  description: string;
  roomCount: number;
  keyEncounters: string[];
  environmentalHazards: string[];
  lootHighlights: string[];
}

// ══════════════════════════════════════════════════════════════
// SETTLEMENTS — Cities, towns, villages with full detail
// ══════════════════════════════════════════════════════════════

export interface SettlementDetail {
  id: string;
  name: string;
  type: 'capital' | 'city' | 'town' | 'village' | 'outpost' | 'camp' | 'port' | 'fortress';
  region: string;
  population: string;
  government: string;
  controllingFaction: string;
  description: string;
  districts: SettlementDistrict[];
  keyNPCs: SettlementNPC[];
  services: string[];              // inn, smith, temple, market, etc.
  rumors: string[];                // Hooks for side quests
  laws: string[];                  // Local rules that affect gameplay
  economicProfile: string;         // What they trade in, wealth level
}

export interface SettlementDistrict {
  name: string;
  description: string;
  notableLocations: string[];
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  atmosphere: string;
}

export interface SettlementNPC {
  name: string;
  role: string;                    // Innkeeper, guard captain, fence, etc.
  personality: string;
  secret: string;                  // Everyone has one
  questHook?: string;
}

// ══════════════════════════════════════════════════════════════
// WORLD ECONOMY — Trade, materials, price regions
// ══════════════════════════════════════════════════════════════

export interface WorldEconomy {
  tradeGoods: TradeGood[];
  rareMaterials: RareMaterial[];
  priceRegions: PriceRegion[];
  blackMarket: string;             // Description of the underground economy
  economicTensions: string[];      // Trade wars, embargoes, etc.
}

export interface TradeGood {
  name: string;
  baseValue: number;
  abundance: 'scarce' | 'uncommon' | 'common' | 'abundant';
  producedIn: string[];            // Region names
  demandedIn: string[];            // Region names
}

export interface RareMaterial {
  name: string;
  description: string;
  source: string;                  // Where to find it
  uses: string[];                  // What it can craft
  value: number;
  dangerToObtain: string;
}

export interface PriceRegion {
  region: string;
  priceModifier: number;           // 0.8 = cheap, 1.2 = expensive
  specialties: string[];           // What's cheap here
  scarcities: string[];            // What's expensive here
}

// ══════════════════════════════════════════════════════════════
// ENCOUNTER TABLES — By region
// ══════════════════════════════════════════════════════════════

export interface RegionEncounterTable {
  regionId: string;
  regionName: string;
  encounters: EncounterEntry[];
}

export interface EncounterEntry {
  name: string;
  type: 'combat' | 'social' | 'environmental' | 'mystery' | 'merchant' | 'ambush';
  difficulty: 'easy' | 'moderate' | 'hard' | 'deadly';
  description: string;
  creatures: string[];             // Creature template IDs or names
  levelRange: { min: number; max: number };
  timeOfDay?: string;
  special?: string;                // Any unique mechanic
}

// ══════════════════════════════════════════════════════════════
// CAMPAIGN ARC — Full story structure
// ══════════════════════════════════════════════════════════════

export interface CampaignArc {
  title: string;
  logline: string;                 // One-sentence hook
  acts: CampaignAct[];
  possibleEndings: CampaignEnding[];
  keyTwists: string[];
  recurringThemes: string[];
  playerAgencyPoints: string[];    // Where player choices matter most
}

export interface CampaignAct {
  actNumber: number;
  title: string;
  summary: string;
  keyBeats: StoryBeat[];
  estimatedSessions: number;
  levelRange: { min: number; max: number };
  mainLocations: string[];
  newCompanions?: string[];        // Companion IDs available this act
  villainPhase: string;            // What the villain is doing
}

export interface StoryBeat {
  name: string;
  type: 'quest' | 'revelation' | 'boss-fight' | 'choice' | 'companion-event' | 'world-event' | 'dungeon' | 'social';
  description: string;
  location: string;
  involvedNPCs: string[];
  consequences: string;            // What changes after this beat
  optional: boolean;
}

export interface CampaignEnding {
  name: string;
  condition: string;               // What leads to this ending
  description: string;
  tone: 'triumphant' | 'bittersweet' | 'tragic' | 'ambiguous' | 'pyrrhic';
}

// ══════════════════════════════════════════════════════════════
// RELATIONSHIP WEB — How everything connects
// ══════════════════════════════════════════════════════════════

export interface RelationshipNode {
  entityA: string;
  entityAType: 'faction' | 'npc' | 'companion' | 'villain' | 'player' | 'creature';
  entityB: string;
  entityBType: 'faction' | 'npc' | 'companion' | 'villain' | 'player' | 'creature';
  relationship: 'ally' | 'enemy' | 'rival' | 'servant' | 'patron' | 'lover' | 'family' | 'trade-partner' | 'debtor' | 'secret-ally' | 'former-ally';
  details: string;
  canChange: boolean;              // Can the player affect this?
}

// ══════════════════════════════════════════════════════════════
// LOOT TABLES — World-specific items and rewards
// ══════════════════════════════════════════════════════════════

export interface WorldLootTable {
  name: string;
  context: string;                 // When to use this table
  items: LootEntry[];
}

export interface LootEntry {
  name: string;
  type: string;                    // weapon, armor, consumable, quest-item, material
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  description: string;
  properties: string[];            // stat bonuses, effects
  value: number;
  loreNote?: string;               // World-specific flavor
}

// ══════════════════════════════════════════════════════════════
// CRAFTING SYSTEM — Materials, recipes, stations
// ══════════════════════════════════════════════════════════════

export interface CraftingSystem {
  description: string;             // How crafting works in this world
  disciplines: CraftingDiscipline[];
  recipes: WorldCraftingRecipe[];
}

export interface CraftingDiscipline {
  name: string;                    // Blacksmithing, Alchemy, Enchanting, etc.
  description: string;
  toolRequired: string;
  skillRequirements: string;
}

export interface WorldCraftingRecipe {
  name: string;
  discipline: string;
  inputs: { material: string; quantity: number }[];
  output: string;
  difficulty: 'novice' | 'journeyman' | 'expert' | 'master';
  specialConditions?: string;      // "Must be crafted during full moon"
}

// ══════════════════════════════════════════════════════════════
// RANDOM EVENTS — World events that fire during play
// ══════════════════════════════════════════════════════════════

export interface WorldEvent {
  name: string;
  type: 'weather' | 'political' | 'economic' | 'supernatural' | 'military' | 'social' | 'natural-disaster';
  description: string;
  triggerCondition: string;        // When this event can happen
  effects: string[];               // How it changes the world
  duration: string;
  playerInteraction: string;       // How the player can respond
}

// ══════════════════════════════════════════════════════════════
// TRAVEL NETWORK — Connections between locations
// ══════════════════════════════════════════════════════════════

export interface TravelRoute {
  from: string;
  to: string;
  method: 'road' | 'trail' | 'river' | 'sea' | 'air' | 'underground' | 'portal' | 'wilderness';
  travelDays: number;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  description: string;
  hazards: string[];
  pointsOfInterest: string[];
  controlledBy?: string;           // Faction controlling the route
}
