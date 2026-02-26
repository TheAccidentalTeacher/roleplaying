// ============================================================
// MAP TYPES — 5-layer map system
// Reference: MAP-SYSTEM.md
// ============================================================

import type { Region, LocationSeed } from './world';

// ---- Enums & Union Types ----

export type MapStyle = 'fantasy' | 'scifi' | 'horror' | 'postapoc' | 'mythological' | 'modern';
export type MapLayer = 'world' | 'regional' | 'location' | 'dungeon' | 'tactical';

// ---- World Map ----

export interface WorldMap {
  id: string;
  worldId: string;
  geographyData: GeographyData;
  imageUrl?: string;
  svgData?: string;
  style: MapStyle;
  revealedRegions: string[]; // Region IDs
  unknownZones: string[];
  playerAnnotations: MapAnnotation[];
  questMarkers: QuestMarker[];
  createdAt: string;
  updatedAt: string;
}

export interface GeographyData {
  worldName: string;
  continents: Continent[];
  oceans: Ocean[];
  majorMountainRanges: string[];
  majorRivers: string[];
  climate: string;
  regions: Region[];
  startingRegion: string; // Region ID
}

export interface Continent {
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large' | 'massive';
  position: { x: number; y: number };
}

export interface Ocean {
  name: string;
  description: string;
  position: { x: number; y: number };
}

export interface MapAnnotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  color?: string;
  icon?: string;
  createdAt: string;
}

export interface QuestMarker {
  id: string;
  questId: string;
  questTitle: string;
  position: { x: number; y: number };
  type: 'main' | 'side' | 'genre' | 'poi';
  isActive: boolean;
}

// ---- Regional Map ----

export interface RegionalMap {
  id: string;
  regionId: string;
  regionName: string;
  locations: LocationMarker[];
  roads: Road[];
  rivers: River[];
  terrain: TerrainZone[];
  imageUrl?: string;
  svgData?: string;
  fogOfWar: string[]; // Hidden location IDs
  createdAt: string;
}

export interface LocationMarker {
  id: string;
  seed: LocationSeed;
  position: { x: number; y: number };
  isRevealed: boolean;
  isVisited: boolean;
  hasActiveQuest: boolean;
  icon: string;
}

export interface Road {
  id: string;
  name?: string;
  from: string; // Location ID
  to: string; // Location ID
  type: 'main' | 'trail' | 'path' | 'hidden';
  dangerLevel: number;
  travelTimeHours: number;
}

export interface River {
  id: string;
  name: string;
  path: { x: number; y: number }[];
  crossingPoints: string[]; // Location IDs where you can cross
}

export interface TerrainZone {
  id: string;
  type: string; // forest, mountain, desert, swamp, etc.
  boundary: { x: number; y: number }[];
  movementCost: number; // Multiplier (1.0 = normal, 2.0 = difficult)
}

// ---- Dungeon Map ----

export interface DungeonLayout {
  id: string;
  name: string;
  style: 'built' | 'cave' | 'ruin' | 'organic' | 'magical';
  floors: DungeonFloor[];
  currentFloor: number;
  createdAt: string;
}

export interface DungeonFloor {
  floorNumber: number;
  rooms: DungeonRoom[];
  connections: RoomConnection[];
  width: number;
  height: number;
}

export interface DungeonRoom {
  id: string;
  name?: string;
  type: 'entrance' | 'corridor' | 'chamber' | 'treasure' | 'boss' | 'trap' | 'puzzle' | 'rest' | 'secret' | 'exit';
  position: { x: number; y: number };
  size: { width: number; height: number };
  description: string;
  isRevealed: boolean;
  isVisited: boolean;
  isCurrentRoom: boolean;
  contents: RoomContents;
}

export interface RoomContents {
  enemies?: string[]; // Encounter seeds
  treasure?: string[];
  traps?: string[];
  npcs?: string[];
  interactables?: string[];
  environmentalFeatures: string[];
}

export interface RoomConnection {
  fromRoomId: string;
  toRoomId: string;
  type: 'door' | 'corridor' | 'stairs-up' | 'stairs-down' | 'secret' | 'locked' | 'trapped' | 'portal';
  isRevealed: boolean;
  isLocked: boolean;
  lockDC?: number;
  isTrapped: boolean;
  trapId?: string;
}

// ---- Tactical (Combat) Map ----

export interface TacticalMap {
  id: string;
  width: number; // Grid cells
  height: number;
  cellSize: number; // Pixels per cell
  cells: TacticalCell[][];
  entities: TacticalEntity[];
  effects: TacticalEffect[];
}

export interface TacticalCell {
  x: number;
  y: number;
  terrain: 'normal' | 'difficult' | 'hazardous' | 'impassable' | 'water' | 'elevation';
  cover: 'none' | 'half' | 'three-quarter' | 'full';
  elevation: number;
  features: TacticalFeature[];
  isVisible: boolean;
}

export interface TacticalFeature {
  type: 'wall' | 'pillar' | 'boulder' | 'tree' | 'furniture' | 'rubble' | 'fire' | 'water' | 'pit' | 'stairs';
  blocksMovement: boolean;
  blocksLineOfSight: boolean;
  provideCover: 'none' | 'half' | 'three-quarter' | 'full';
  description: string;
}

export interface TacticalEntity {
  id: string;
  name: string;
  type: 'player' | 'companion' | 'enemy' | 'npc';
  position: { x: number; y: number };
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
}

export interface TacticalEffect {
  id: string;
  type: 'aoe-spell' | 'zone' | 'trap' | 'environmental';
  shape: 'circle' | 'cone' | 'line' | 'square';
  position: { x: number; y: number };
  radius?: number;
  description: string;
  damagePerRound?: string;
  duration?: number;
}
