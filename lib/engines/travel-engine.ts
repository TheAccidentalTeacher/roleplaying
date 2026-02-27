// ============================================================
// TRAVEL ENGINE — Travel planning, segment resolution, fast travel
// Reference: EXPLORATION-SYSTEM.md
// ============================================================

import type {
  TravelPlan,
  TravelSegment,
  TravelSegmentResult,
  TravelResources,
  TravelDiscovery,
  TravelPace,
  TravelMethod,
  TerrainType,
  FastTravelResult,
  Weather,
} from '@/lib/types/exploration';
import type { WorldRecord, TravelRoute } from '@/lib/types/world';
import { roll } from '@/lib/utils/dice';

// ---- Speed Constants ----

const BASE_SPEED_HOURS: Record<TravelMethod, number> = {
  walking: 1,
  mounted: 2,
  cart: 1.5,
  ship: 3,
  flying: 4,
  magical: 8,
  vehicle: 2,
};

const PACE_MODIFIER: Record<TravelPace, number> = {
  slow: 0.67,
  normal: 1.0,
  fast: 1.33,
};

const TERRAIN_COST_MULTIPLIER: Record<string, number> = {
  plains: 1.0,
  forest: 1.5,
  hills: 1.5,
  mountains: 2.0,
  desert: 1.5,
  swamp: 2.0,
  tundra: 1.5,
  jungle: 2.0,
  coast: 1.0,
  ocean: 0.8,
  underground: 1.5,
  urban: 0.8,
  ruins: 1.5,
  volcanic: 2.5,
  arctic: 2.0,
};

// ---- Travel Plan Creation ----

export function createTravelPlan(
  from: string,
  to: string,
  method: TravelMethod,
  pace: TravelPace,
  terrains: TerrainType[],
  baseDistanceHours: number,
): TravelPlan {
  const speedMultiplier = BASE_SPEED_HOURS[method] * PACE_MODIFIER[pace];

  const segments: TravelSegment[] = terrains.map((terrain, i) => {
    const segmentDistance = baseDistanceHours / terrains.length;
    const terrainCost = TERRAIN_COST_MULTIPLIER[terrain] || 1.0;
    const adjustedHours = segmentDistance * terrainCost / speedMultiplier;

    return {
      segmentNumber: i + 1,
      terrain,
      distanceHours: Math.round(adjustedHours * 10) / 10,
      weatherExpected: 'clear',
      dangerLevel: getDangerLevel(terrain, pace),
      description: `Traveling through ${terrain} terrain`,
      isCompleted: false,
    };
  });

  const totalDistanceHours = segments.reduce((sum, s) => sum + s.distanceHours, 0);

  return {
    from,
    to,
    method,
    pace,
    totalDistanceHours,
    segments,
    estimatedArrival: { day: 0, hour: Math.ceil(totalDistanceHours) },
    resourcesNeeded: calculateResources(totalDistanceHours, method),
  };
}

function getDangerLevel(terrain: TerrainType, pace: TravelPace): number {
  const base: Record<string, number> = {
    plains: 1, urban: 1, coast: 2, forest: 3,
    hills: 3, desert: 4, swamp: 4, mountains: 5,
    jungle: 5, underground: 6, ruins: 5, tundra: 4,
    arctic: 5, volcanic: 7, ocean: 3,
  };
  const danger = base[terrain] || 3;
  const paceBonus = pace === 'fast' ? 1 : pace === 'slow' ? -1 : 0;
  return Math.max(1, Math.min(10, danger + paceBonus));
}

function calculateResources(hours: number, method: TravelMethod): TravelResources {
  const days = Math.ceil(hours / 8); // 8 hours of travel per day
  const isOnFoot = method === 'walking';

  return {
    foodRationsNeeded: days * (isOnFoot ? 2 : 1),
    waterNeeded: days * (isOnFoot ? 3 : 2),
    torchesNeeded: days * 2,
    goldEstimate: days * 5, // Inns, tolls, etc.
  };
}

// ---- Segment Resolution ----

export function resolveSegment(
  segment: TravelSegment,
  weather: Weather,
  wisModifier: number,
  survivalBonus: number,
  pace: TravelPace,
): TravelSegmentResult {
  // Navigation check (for rough/hostile terrain)
  let navCheck = undefined;
  if (segment.dangerLevel >= 4) {
    const dc = 10 + Math.floor(segment.dangerLevel / 2);
    const navRoll = roll(20) + survivalBonus;
    navCheck = { dc, roll: navRoll, success: navRoll >= dc };
  }

  // Encounter check
  const encounterChance = getEncounterChance(segment, pace);
  const encounterRoll = Math.random();
  const encounterTriggered = encounterRoll < encounterChance;

  // Discovery check (slow pace gets advantage)
  const discoveryChance = pace === 'slow' ? 0.25 : pace === 'normal' ? 0.15 : 0.05;
  const discoveryRoll = Math.random();
  const discoveryMade = discoveryRoll < discoveryChance;

  // Resources consumed
  const baseConsumption = segment.distanceHours / 8;
  const weatherMultiplier = 1 / weather.travelModifier;
  const resourcesConsumed: Partial<TravelResources> = {
    foodRationsNeeded: Math.ceil(baseConsumption * weatherMultiplier),
    waterNeeded: Math.ceil(baseConsumption * weatherMultiplier * 1.5),
  };

  // Time advanced (accounting for weather and navigation failures)
  let timeAdvanced = segment.distanceHours / weather.travelModifier;
  if (navCheck && !navCheck.success) {
    timeAdvanced *= 1.5; // Got lost, took longer
  }

  return {
    segment: { ...segment, isCompleted: true },
    weatherActual: weather,
    navigationCheck: navCheck,
    encounterTriggered,
    discoveryMade,
    discovery: discoveryMade ? generateQuickDiscovery(segment.terrain) : undefined,
    resourcesConsumed,
    narration: buildSegmentNarration(segment, weather, navCheck, encounterTriggered, discoveryMade),
    timeAdvanced: Math.round(timeAdvanced * 10) / 10,
  };
}

function getEncounterChance(segment: TravelSegment, pace: TravelPace): number {
  const base = segment.dangerLevel * 0.05; // 5% per danger level
  const paceBonus = pace === 'fast' ? 0.1 : pace === 'slow' ? -0.05 : 0;
  return Math.min(0.6, Math.max(0.05, base + paceBonus));
}

function generateQuickDiscovery(terrain: TerrainType): TravelDiscovery {
  const types: TravelDiscovery['type'][] = ['landmark', 'ruin', 'camp', 'resource', 'secret'];
  const type = types[Math.floor(Math.random() * types.length)];

  const names: Record<string, string[]> = {
    landmark: ['Ancient Standing Stone', 'Weathered Statue', 'Crossroads Shrine'],
    ruin: ['Crumbling Tower', 'Overgrown Foundation', 'Collapsed Bridge'],
    camp: ['Abandoned Campsite', 'Ranger Cache', 'Merchant Rest Stop'],
    resource: ['Herb Patch', 'Mineral Vein', 'Berry Thicket'],
    secret: ['Hidden Cave Entrance', 'Buried Chest', 'Concealed Trail'],
  };

  const name = names[type]?.[Math.floor(Math.random() * (names[type]?.length || 1))] || 'Unknown Discovery';

  return {
    id: `disc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    name,
    description: `You spot something interesting among the ${terrain} terrain.`,
    isRevealed: true,
    canInvestigate: true,
    addedToMap: false,
  };
}

function buildSegmentNarration(
  segment: TravelSegment,
  weather: Weather,
  navCheck: { dc: number; roll: number; success: boolean } | undefined,
  encounter: boolean,
  discovery: boolean,
): string {
  let narration = `You press through the ${segment.terrain}. ${weather.narrativeDescription}`;

  if (navCheck) {
    narration += navCheck.success
      ? ' Your navigation skills keep you on the right path.'
      : ' You lose your way briefly, costing precious time.';
  }

  if (discovery) {
    narration += ' Something catches your eye off the trail...';
  }

  if (encounter) {
    narration += ' But you are not alone here.';
  }

  return narration;
}

// ---- Fast Travel ----

export function fastTravel(
  from: string,
  to: string,
  distanceHours: number,
  method: TravelMethod,
): FastTravelResult {
  const encounterChance = 0.2;
  const encounterTriggered = Math.random() < encounterChance;

  const resources: TravelResources = calculateResources(distanceHours, method);

  return {
    from,
    to,
    hoursElapsed: distanceHours,
    resourcesConsumed: resources,
    encounterTriggered,
    narration: encounterTriggered
      ? `Your journey from ${from} to ${to} is interrupted...`
      : `You travel safely from ${from} to ${to}, arriving after ${distanceHours} hours.`,
  };
}

// ---- Pace Info ----

export function getPaceDescription(pace: TravelPace): {
  speed: string;
  stealth: string;
  perception: string;
} {
  switch (pace) {
    case 'slow':
      return {
        speed: '2/3 normal speed',
        stealth: 'Can use Stealth',
        perception: 'Advantage on discovering hidden things',
      };
    case 'normal':
      return {
        speed: 'Normal speed',
        stealth: 'Cannot use Stealth',
        perception: 'Normal Perception',
      };
    case 'fast':
      return {
        speed: '4/3 normal speed',
        stealth: 'Cannot use Stealth',
        perception: '-5 to passive Perception',
      };
  }
}

// ---- World Travel Network Integration ----

/**
 * Look up a pre-defined travel route from the world's travel network.
 * Returns the route if found, or null if the journey must use generic terrain costs.
 */
export function lookupWorldRoute(
  world: WorldRecord,
  from: string,
  to: string
): TravelRoute | null {
  if (!world.travelNetwork?.length) return null;

  // Search both directions (routes may be defined A→B but traveled B→A)
  return world.travelNetwork.find(r =>
    (r.from.toLowerCase() === from.toLowerCase() && r.to.toLowerCase() === to.toLowerCase()) ||
    (r.from.toLowerCase() === to.toLowerCase() && r.to.toLowerCase() === from.toLowerCase())
  ) ?? null;
}

/**
 * Create a travel plan using a world-defined route instead of generic terrain costs.
 * Falls back to generic createTravelPlan for routes not in the network.
 */
export function createWorldTravelPlan(
  route: TravelRoute,
  method: TravelMethod,
  pace: TravelPace,
): TravelPlan {
  // Convert route's travel days to hours (8 hours per day)
  const baseHours = route.travelDays * 8;

  // Map route method to terrain type for segment generation
  const terrainMap: Record<string, TerrainType> = {
    road: 'plains',
    trail: 'forest',
    river: 'coast',
    sea: 'ocean',
    air: 'plains',
    underground: 'underground',
    portal: 'plains',
    wilderness: 'forest',
  };

  const terrain = terrainMap[route.method] || ('plains' as TerrainType);
  const segmentCount = Math.max(1, Math.ceil(route.travelDays));
  const terrains: TerrainType[] = Array(segmentCount).fill(terrain);

  const plan = createTravelPlan(route.from, route.to, method, pace, terrains, baseHours);

  // Override segments with route-specific data
  plan.segments.forEach((seg, i) => {
    seg.dangerLevel = route.dangerLevel;
    seg.description = i === 0
      ? `${route.description}. Hazards: ${route.hazards.join(', ') || 'none known'}`
      : `Continuing via ${route.method} toward ${route.to}`;
  });

  return plan;
}

/**
 * Build a travel route prompt for AI generation of routes not in the world network.
 */
export function buildTravelRoutePrompt(
  world: WorldRecord,
  from: string,
  to: string
): string {
  const knownRoutes = world.travelNetwork?.length
    ? `\nKNOWN ROUTES IN THIS WORLD:\n${world.travelNetwork.map(r =>
      `- ${r.from} → ${r.to}: ${r.method}, ${r.travelDays}d, danger ${r.dangerLevel}/5`
    ).join('\n')}\nUse these as reference for distance/danger calibration.`
    : '';

  const regionContext = world.geography?.length
    ? `\nREGIONS: ${world.geography.map(r => `${r.name} (${r.terrain}, danger ${r.dangerLevel}/5)`).join(', ')}`
    : '';

  return `Determine the travel route from "${from}" to "${to}" in ${world.worldName}.${knownRoutes}${regionContext}

Return JSON:
{
  "method": "road|trail|river|sea|air|underground|portal|wilderness",
  "travelDays": number,
  "dangerLevel": 1-5,
  "description": "1-2 sentence route description",
  "hazards": ["hazard1", "hazard2"],
  "pointsOfInterest": ["poi1"],
  "terrainTypes": ["plains", "forest", ...],
  "controlledBy": "faction name or null"
}`;
}
