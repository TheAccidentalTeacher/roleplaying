// ============================================================
// EXPLORATION ENGINE
// Handles travel, time advancement, weather, and navigation.
// Reference: EXPLORATION-SYSTEM.md
// ============================================================

import type {
  GameClock,
  Weather,
  TimeOfDay,
  Season,
  WeatherCondition,
  Temperature,
  WindLevel,
  VisibilityLevel,
  TravelPace,
  TravelMethod,
  TerrainType,
  TravelPlan,
  TravelSegment,
  TravelResources,
  TimeEffects,
} from '@/lib/types/exploration';
import { d20, d6 } from '@/lib/utils/dice';

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

// ---- Advance time ----

export function advanceTime(clock: GameClock, hours: number): GameClock {
  const updated = { ...clock };
  updated.hour += hours;

  // Roll over hours → days
  while (updated.hour >= 24) {
    updated.hour -= 24;
    updated.day += 1;
    updated.daysSinceStart += 1;
  }

  // Roll over days → months (30 days per month)
  while (updated.day > 30) {
    updated.day -= 30;
    updated.month += 1;
  }

  // Roll over months → years
  while (updated.month > 12) {
    updated.month -= 12;
    updated.year += 1;
  }

  // Update time of day
  updated.timeOfDay = getTimeOfDayFromHour(updated.hour);

  // Update season
  updated.currentSeason = getSeasonFromMonth(updated.month);

  return updated;
}

// ---- Time of day from hour ----

export function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'dusk';
  if (hour >= 19 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 2) return 'night';
  return 'midnight';
}

// ---- Season from month ----

function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// ---- Get time effects ----

export function getTimeEffects(timeOfDay: TimeOfDay): TimeEffects {
  const effects: Record<TimeOfDay, TimeEffects> = {
    dawn: {
      timeOfDay: 'dawn',
      visibility: 'lightly-obscured',
      encounterChanceModifier: -0.05,
      narrative: 'The first light of dawn paints the sky in shades of gold and crimson.',
      specialEvents: ['Some nocturnal creatures retreat', 'Dew glistens on surfaces'],
      darkvisionRequired: false,
    },
    morning: {
      timeOfDay: 'morning',
      visibility: 'clear',
      encounterChanceModifier: -0.05,
      narrative: 'The morning sun climbs higher, warming the world.',
      specialEvents: [],
      darkvisionRequired: false,
    },
    midday: {
      timeOfDay: 'midday',
      visibility: 'clear',
      encounterChanceModifier: -0.10,
      narrative: 'The sun hangs directly overhead, casting short shadows.',
      specialEvents: ['Heat may be oppressive in desert/tropical zones'],
      darkvisionRequired: false,
    },
    afternoon: {
      timeOfDay: 'afternoon',
      visibility: 'clear',
      encounterChanceModifier: 0,
      narrative: 'The afternoon stretches on, shadows growing longer.',
      specialEvents: [],
      darkvisionRequired: false,
    },
    dusk: {
      timeOfDay: 'dusk',
      visibility: 'lightly-obscured',
      encounterChanceModifier: 0.05,
      narrative: 'Twilight descends, blurring the edges of the world.',
      specialEvents: ['Nocturnal creatures begin to stir'],
      darkvisionRequired: false,
    },
    evening: {
      timeOfDay: 'evening',
      visibility: 'lightly-obscured',
      encounterChanceModifier: 0.10,
      narrative: 'Stars emerge as darkness falls across the land.',
      specialEvents: ['Disadvantage on Perception checks without light source or darkvision'],
      darkvisionRequired: true,
    },
    night: {
      timeOfDay: 'night',
      visibility: 'heavily-obscured',
      encounterChanceModifier: 0.15,
      narrative: 'Night has claimed the world. Unseen things move in the darkness.',
      specialEvents: ['Disadvantage on all ability checks requiring sight', 'Increased undead activity'],
      darkvisionRequired: true,
    },
    midnight: {
      timeOfDay: 'midnight',
      visibility: 'heavily-obscured',
      encounterChanceModifier: 0.20,
      narrative: 'The witching hour. The boundary between worlds grows thin.',
      specialEvents: ['Maximum undead activity', 'Magical anomalies possible'],
      darkvisionRequired: true,
      specialRule: 'All creatures have disadvantage on Wisdom saving throws.',
    },
  };

  return effects[timeOfDay];
}

// ---- Weather generation ----

export function generateWeather(
  season: Season,
  terrain: TerrainType,
  prevWeather?: Weather
): Weather {
  // Base weather by season
  const seasonWeather: Record<Season, WeatherCondition[]> = {
    spring: ['clear', 'overcast', 'light-rain', 'fog', 'wind'],
    summer: ['clear', 'clear', 'overcast', 'thunderstorm', 'extreme-heat'],
    autumn: ['overcast', 'light-rain', 'heavy-rain', 'fog', 'wind'],
    winter: ['overcast', 'snow', 'blizzard', 'extreme-cold', 'clear'],
  };

  // Terrain modifiers
  const terrainOverrides: Partial<Record<TerrainType, WeatherCondition[]>> = {
    desert: ['clear', 'clear', 'extreme-heat', 'sandstorm', 'wind'],
    arctic: ['snow', 'blizzard', 'extreme-cold', 'wind', 'clear'],
    swamp: ['fog', 'light-rain', 'heavy-rain', 'overcast', 'fog'],
    ocean: ['wind', 'clear', 'thunderstorm', 'fog', 'heavy-rain'],
    underground: ['clear'], // Cave — stable
  };

  const options = terrainOverrides[terrain] || seasonWeather[season] || seasonWeather.summer;
  const current = options[Math.floor(Math.random() * options.length)];

  // Determine temperature
  const temp = getTemperature(season, current, terrain);
  const wind = getWindLevel(current);
  const visibility = getVisibility(current);

  return {
    current,
    temperature: temp,
    wind,
    visibility,
    duration: d6() + d6() + 2, // 4-14 hours
    forecast: options[Math.floor(Math.random() * options.length)],
    travelModifier: getTravelModifier(current, wind),
    combatModifiers: getCombatModifiers(current, wind),
    perceptionModifier: getPerceptionModifier(current, visibility),
    survivalDC: getSurvivalDC(current, temp),
    narrativeDescription: getWeatherNarrative(current, temp, wind),
  };
}

function getTemperature(season: Season, weather: WeatherCondition, terrain: TerrainType): Temperature {
  if (weather === 'extreme-heat' || (terrain === 'desert' && season === 'summer')) return 'scorching';
  if (weather === 'extreme-cold' || weather === 'blizzard' || terrain === 'arctic') return 'freezing';
  if (season === 'winter') return weather === 'snow' ? 'cold' : 'cool';
  if (season === 'summer') return 'warm';
  return 'mild';
}

function getWindLevel(weather: WeatherCondition): WindLevel {
  if (['blizzard', 'hurricane', 'sandstorm'].includes(weather)) return 'gale';
  if (['thunderstorm', 'wind'].includes(weather)) return 'strong-wind';
  if (weather === 'heavy-rain') return 'windy';
  return Math.random() < 0.3 ? 'breeze' : 'calm';
}

function getVisibility(weather: WeatherCondition): VisibilityLevel {
  if (['blizzard', 'sandstorm'].includes(weather)) return 'zero';
  if (['heavy-rain', 'fog', 'thunderstorm'].includes(weather)) return 'heavily-obscured';
  if (['light-rain', 'snow', 'overcast'].includes(weather)) return 'lightly-obscured';
  return 'clear';
}

function getTravelModifier(weather: WeatherCondition, wind: WindLevel): number {
  let mod = 1.0;
  if (['heavy-rain', 'snow'].includes(weather)) mod *= 0.75;
  if (['blizzard', 'sandstorm'].includes(weather)) mod *= 0.5;
  if (weather === 'thunderstorm') mod *= 0.6;
  if (wind === 'gale') mod *= 0.7;
  return Math.round(mod * 100) / 100;
}

function getCombatModifiers(weather: WeatherCondition, wind: WindLevel): string[] {
  const mods: string[] = [];
  if (['heavy-rain', 'thunderstorm'].includes(weather)) {
    mods.push('Ranged attacks have disadvantage beyond normal range');
    mods.push('Lightly obscured — disadvantage on Perception checks relying on sight');
  }
  if (['fog'].includes(weather)) {
    mods.push('Heavily obscured — effectively blinded for sight-dependent checks');
  }
  if (['blizzard', 'sandstorm'].includes(weather)) {
    mods.push('All ranged attacks have disadvantage');
    mods.push('Heavily obscured');
    mods.push('Movement costs double');
  }
  if (wind === 'gale') {
    mods.push('Flying creatures have disadvantage on attack rolls');
  }
  return mods;
}

function getPerceptionModifier(weather: WeatherCondition, visibility: VisibilityLevel): number {
  if (visibility === 'zero') return -10;
  if (visibility === 'heavily-obscured') return -5;
  if (visibility === 'lightly-obscured') return -2;
  return 0;
}

function getSurvivalDC(weather: WeatherCondition, temp: Temperature): number {
  let dc = 10;
  if (['blizzard', 'sandstorm'].includes(weather)) dc += 5;
  if (['thunderstorm', 'heavy-rain'].includes(weather)) dc += 3;
  if (['extreme-heat', 'extreme-cold'].includes(weather)) dc += 5;
  if (['freezing', 'scorching'].includes(temp)) dc += 3;
  return dc;
}

function getWeatherNarrative(weather: WeatherCondition, temp: Temperature, wind: WindLevel): string {
  const narratives: Record<WeatherCondition, string> = {
    clear: 'The sky stretches endlessly blue above, unmarred by clouds.',
    overcast: 'A blanket of gray clouds stretches from horizon to horizon.',
    'light-rain': 'A gentle rain patters down, turning the world glistening.',
    'heavy-rain': 'Rain hammers down relentlessly, turning paths to mud.',
    thunderstorm: 'Thunder cracks across the sky as lightning illuminates the churning clouds.',
    fog: 'Thick fog curls between every surface, reducing the world to ghostly shapes.',
    snow: 'Soft snowflakes drift down, blanketing the world in white silence.',
    blizzard: 'A howling blizzard tears through the area, visibility near zero.',
    hail: 'Hailstones pelt down, striking everything with stinging force.',
    wind: 'Strong winds whip across the landscape, tugging at clothing and gear.',
    sandstorm: 'A wall of sand engulfs everything, stinging eyes and filling lungs.',
    'extreme-heat': 'The air shimmers with oppressive heat. Every breath feels like fire.',
    'extreme-cold': 'Bitter cold seeps into bones. Exposed skin goes numb within minutes.',
    'magical-storm': 'The sky crackles with eldritch energy. Reality itself seems to waver.',
    eclipse: 'An unnatural darkness falls as something blots out the sun.',
    'blood-moon': 'A crimson moon hangs low, casting everything in an eerie red glow.',
  };

  return narratives[weather] || 'The weather is unremarkable.';
}

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
  magical: 10,
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
