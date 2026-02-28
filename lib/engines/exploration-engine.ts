// ============================================================
// EXPLORATION ENGINE
// Handles travel, time advancement, weather, and navigation.
// Reference: EXPLORATION-SYSTEM.md
// ============================================================

import { getTimeOfDay, getTimeEffects as canonicalGetTimeEffects, advanceTime as clockAdvanceTime } from '@/lib/engines/clock-engine';
import { generateWeather as weatherGenerateWeather } from '@/lib/engines/weather-engine';
import type {
  GameClock,
  Weather,
  Season,
  TravelPace,
  TravelMethod,
  TerrainType,
  TravelPlan,
  TravelSegment,
  TravelResources,
} from '@/lib/types/exploration';

// ---- Initialize a game clock ----

export function initGameClock(calendarName: string = 'Imperial Calendar'): GameClock {
  return {
    year: 1247,
    month: 3,
    day: 15,
    hour: 8,
    timeOfDay: 'morning',
    calendarName,
    monthNames: [
      'Deepwinter', 'Thawing', 'Springtide', 'Planting',
      'Midsummer', 'Highsun', 'Harvest', 'Leaffall',
      'Frostfall', 'Deepnight', 'Midwinter', 'Yearend',
    ],
    weekLength: 7,
    dayNames: ['Moonday', 'Twosday', 'Thirdsday', 'Fourthday', 'Freeday', 'Starday', 'Sunday'],
    daysSinceStart: 0,
    currentSeason: 'spring',
  };
}

// ---- Advance time (delegates to clock-engine canonical implementation) ----
export const advanceTime = clockAdvanceTime;

// Time-of-day and time effects are imported from clock-engine.ts (canonical source)
// Re-export for backward compatibility
export { getTimeOfDay as getTimeOfDayFromHour } from '@/lib/engines/clock-engine';
export const getTimeEffects = canonicalGetTimeEffects;

// ---- Season from month ----

function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// ---- Weather generation (delegates to weather-engine canonical implementation) ----
export const generateWeather = (
  season: Season,
  terrain: TerrainType,
  _prevWeather?: Weather
): Weather => weatherGenerateWeather(season, terrain);

// ---- Travel planning ----

const PACE_SPEEDS: Record<TravelPace, number> = {
  slow: 2,    // 2 miles/hour
  normal: 3,  // 3 miles/hour
  fast: 4,    // 4 miles/hour
};

const METHOD_MULTIPLIERS: Record<TravelMethod, number> = {
  walking: 1,
  mounted: 2,
  cart: 1.5,
  ship: 3,
  flying: 4,
  magical: 8,  // Aligned with travel-engine BASE_SPEED_HOURS
  vehicle: 2,
};

export function createTravelPlan(params: {
  from: string;
  to: string;
  distanceMiles: number;
  pace: TravelPace;
  method: TravelMethod;
  terrain: TerrainType;
  weatherModifier?: number;
}): TravelPlan {
  const { from, to, distanceMiles, pace, method, terrain, weatherModifier = 1 } = params;

  const speed = PACE_SPEEDS[pace] * METHOD_MULTIPLIERS[method] * weatherModifier;
  const totalHours = Math.ceil(distanceMiles / speed);

  // Break into 4-hour segments
  const segmentCount = Math.max(1, Math.ceil(totalHours / 4));
  const hoursPerSegment = totalHours / segmentCount;

  const segments: TravelSegment[] = Array.from({ length: segmentCount }, (_, i) => ({
    segmentNumber: i + 1,
    terrain,
    distanceHours: hoursPerSegment,
    weatherExpected: 'clear',
    dangerLevel: Math.max(1, Math.min(5, Math.floor(Math.random() * 3) + 1)),
    description: `Segment ${i + 1} of the journey through ${terrain} terrain.`,
    isCompleted: false,
  }));

  const resources: TravelResources = {
    foodRationsNeeded: Math.ceil(totalHours / 8),
    waterNeeded: Math.ceil(totalHours / 6),
    torchesNeeded: Math.ceil(totalHours / 4),
    goldEstimate: Math.ceil(distanceMiles * 0.5),
  };

  return {
    from,
    to,
    method,
    pace,
    totalDistanceHours: totalHours,
    segments,
    estimatedArrival: { day: 0, hour: 0 }, // Caller fills in from game clock
    resourcesNeeded: resources,
  };
}
