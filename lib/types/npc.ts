// ============================================================
// NPC TYPES — NPC persistence, relationships, dialogue
// Reference: BRAINSTORM.md (NPC System), ECONOMY-SYSTEM.md (Merchant)
// ============================================================

// ---- Enums & Union Types ----

export type RelationshipType =
  | 'stranger' | 'acquaintance' | 'friend' | 'close-friend'
  | 'rival' | 'enemy' | 'companion' | 'romantic' | 'mentor'
  | 'student' | 'patron' | 'neutral';

export type AttitudeTier = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';

export type NPCRole =
  | 'quest-giver' | 'merchant' | 'companion' | 'villain' | 'informant'
  | 'guard' | 'ruler' | 'priest' | 'sage' | 'artisan' | 'entertainer'
  | 'beggar' | 'soldier' | 'mage' | 'healer' | 'thief' | 'noble'
  | 'commoner' | 'innkeeper' | 'blacksmith'
  | string;

export type StoryRole = 'major' | 'minor' | 'background';

// ---- Interfaces ----

export interface NPC {
  id: string;
  worldId: string;
  characterId: string; // The player character this NPC is associated with
  name: string;
  age?: number;
  race: string;
  role: NPCRole;
  storyRole: StoryRole;

  // Appearance & Voice
  physicalDescription: string;
  voiceDescription: string;
  voiceId?: string; // TTS voice ID
  portraitUrl?: string;

  // Personality
  personalityCore: string;
  motivation: string;
  fear: string;
  secret: string;
  speechPattern: string;

  // Relationship with player
  relationshipScore: number; // -100 to +100
  relationshipType: RelationshipType;
  attitudeTier: AttitudeTier;
  sharedHistory: string[];
  currentEmotionalState: string;

  // World position
  faction?: string;
  location: string;
  knowledgeOf: string[]; // Topics this NPC knows about

  // Status
  isAlive: boolean;
  isCompanion: boolean;

  // Combat stats (if applicable)
  combatStats?: NPCCombatStats;

  // Memories of player actions
  memories: NPCMemory[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface NPCCombatStats {
  level: number;
  hp: { current: number; max: number };
  ac: number;
  attackBonus: number;
  damage: string;
  specialAbilities: string[];
}

export interface NPCMemory {
  event: string;
  playerAction: string;
  npcReaction: string;
  emotionalImpact: number; // How much this affected relationship (-10 to +10)
  timestamp: string;
}

export interface DialogueContext {
  npcId: string;
  npcName: string;
  personality: string;
  motivation: string;
  attitudeTier: AttitudeTier;
  relationshipScore: number;
  recentMemories: NPCMemory[];
  currentLocation: string;
  currentEmotionalState: string;
  knowledgeOf: string[];
  speechPattern: string;
  secret: string;
}
