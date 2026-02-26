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
}
