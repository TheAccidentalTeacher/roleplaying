// ============================================================
// EXPLORATION TYPES — Time, weather, travel, discovery
// Reference: EXPLORATION-SYSTEM.md
// ============================================================

// ---- Enums & Union Types ----

export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type WeatherCondition =
  | 'clear' | 'overcast' | 'light-rain' | 'heavy-rain' | 'thunderstorm'
  | 'fog' | 'snow' | 'blizzard' | 'hail' | 'wind' | 'sandstorm'
  | 'extreme-heat' | 'extreme-cold' | 'magical-storm' | 'eclipse' | 'blood-moon';

export type Temperature = 'freezing' | 'cold' | 'cool' | 'mild' | 'warm' | 'hot' | 'scorching';
export type WindLevel = 'calm' | 'breeze' | 'windy' | 'strong-wind' | 'gale' | 'hurricane';
export type VisibilityLevel = 'clear' | 'lightly-obscured' | 'heavily-obscured' | 'zero';
export type TravelPace = 'slow' | 'normal' | 'fast';
export type TravelMethod = 'walking' | 'mounted' | 'cart' | 'ship' | 'flying' | 'magical' | 'vehicle';

export type TerrainType =
  | 'plains' | 'forest' | 'hills' | 'mountains' | 'desert' | 'swamp'
  | 'tundra' | 'jungle' | 'coast' | 'ocean' | 'underground' | 'urban'
  | 'ruins' | 'volcanic' | 'arctic'
  | string;

// ---- Interfaces ----

export interface GameClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  timeOfDay: TimeOfDay;
  calendarName: string;
  monthNames: string[];
  weekLength: number;
  dayNames: string[];
  daysSinceStart: number;
  currentSeason: Season;
}

export interface Weather {
  current: WeatherCondition;
  temperature: Temperature;
  wind: WindLevel;
  visibility: VisibilityLevel;
  duration: number; // Hours remaining
  forecast?: WeatherCondition; // What's coming next
  travelModifier: number; // Speed multiplier (e.g., 0.75 = 25% slower)
  combatModifiers: string[];
  perceptionModifier: number;
  survivalDC: number;
  narrativeDescription: string;
}

export interface TimeEffects {
  timeOfDay: TimeOfDay;
  visibility: VisibilityLevel;
  encounterChanceModifier: number; // Additive modifier
  narrative: string;
  specialEvents: string[];
  darkvisionRequired: boolean;
  specialRule?: string;
}

export interface TravelPlan {
  from: string; // Location name
  to: string;
  method: TravelMethod;
  pace: TravelPace;
  totalDistanceHours: number;
  segments: TravelSegment[];
  estimatedArrival: { day: number; hour: number };
  resourcesNeeded: TravelResources;
}

export interface TravelSegment {
  segmentNumber: number;
  terrain: TerrainType;
  distanceHours: number;
  weatherExpected: WeatherCondition;
  dangerLevel: number;
  description: string;
  isCompleted: boolean;
}

export interface TravelResources {
  foodRationsNeeded: number;
  waterNeeded: number;
  torchesNeeded: number;
  goldEstimate: number; // For inns, tolls, etc.
}

export interface TravelSegmentResult {
  segment: TravelSegment;
  weatherActual: Weather;
  navigationCheck?: { dc: number; roll: number; success: boolean };
  encounterTriggered: boolean;
  encounterId?: string;
  discoveryMade: boolean;
  discovery?: TravelDiscovery;
  resourcesConsumed: Partial<TravelResources>;
  narration: string;
  timeAdvanced: number;
}

export interface TravelDiscovery {
  id: string;
  type: 'landmark' | 'ruin' | 'camp' | 'resource' | 'secret' | 'npc' | 'anomaly';
  name: string;
  description: string;
  isRevealed: boolean;
  canInvestigate: boolean;
  investigationResult?: string;
  addedToMap: boolean;
}

export interface NavigationCheck {
  dc: number;
  terrain: TerrainType;
  weather: WeatherCondition;
  hasMap: boolean;
  hasGuide: boolean;
  survivalBonus: number;
  roll: number;
  success: boolean;
  consequence: string; // What happens on failure (lost time, wrong direction, etc.)
}

export interface FastTravelResult {
  from: string;
  to: string;
  hoursElapsed: number;
  resourcesConsumed: TravelResources;
  encounterTriggered: boolean;
  encounterId?: string;
  narration: string;
}
