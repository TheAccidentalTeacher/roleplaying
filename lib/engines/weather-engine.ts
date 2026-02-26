// ============================================================
// WEATHER ENGINE — Weather generation, transitions, and effects
// Reference: EXPLORATION-SYSTEM.md
// ============================================================

import type {
  Weather,
  WeatherCondition,
  Temperature,
  WindLevel,
  VisibilityLevel,
  Season,
  TerrainType,
} from '@/lib/types/exploration';
import { roll } from '@/lib/utils/dice';

// ---- Weather Generation ----

const SEASON_WEIGHTS: Record<Season, Partial<Record<WeatherCondition, number>>> = {
  spring: { clear: 25, overcast: 25, 'light-rain': 20, 'heavy-rain': 10, thunderstorm: 5, fog: 10, wind: 5 },
  summer: { clear: 35, overcast: 15, 'light-rain': 10, thunderstorm: 10, 'extreme-heat': 10, wind: 10, hail: 5, fog: 5 },
  autumn: { clear: 15, overcast: 30, 'light-rain': 15, 'heavy-rain': 10, fog: 15, wind: 10, 'extreme-cold': 5 },
  winter: { clear: 10, overcast: 20, snow: 25, blizzard: 10, 'extreme-cold': 15, fog: 10, wind: 10 },
};

const TERRAIN_MODIFIERS: Partial<Record<TerrainType, Partial<Record<WeatherCondition, number>>>> = {
  desert: { 'extreme-heat': 20, sandstorm: 15, clear: 15, 'light-rain': -15 },
  arctic: { 'extreme-cold': 20, blizzard: 15, snow: 10, 'extreme-heat': -30 },
  swamp: { fog: 20, 'heavy-rain': 10, 'light-rain': 10 },
  mountains: { wind: 15, snow: 10, 'extreme-cold': 10, fog: 5 },
  coast: { wind: 15, 'heavy-rain': 10, fog: 10 },
  forest: { fog: 10, 'light-rain': 5 },
};

export function generateWeather(season: Season, terrain: TerrainType): Weather {
  const condition = pickWeatherCondition(season, terrain);
  const temperature = getTemperature(condition, season);
  const wind = getWind(condition);
  const visibility = getVisibility(condition);

  return {
    current: condition,
    temperature,
    wind,
    visibility,
    duration: roll(8) + 4, // 5-12 hours
    travelModifier: getTravelModifier(condition),
    combatModifiers: getCombatModifiers(condition),
    perceptionModifier: getPerceptionModifier(condition),
    survivalDC: getSurvivalDC(condition),
    narrativeDescription: getNarrative(condition, temperature, wind),
  };
}

function pickWeatherCondition(season: Season, terrain: TerrainType): WeatherCondition {
  const base = { ...SEASON_WEIGHTS[season] };
  const terrainMods = TERRAIN_MODIFIERS[terrain] || {};

  // Apply terrain modifiers
  for (const [cond, mod] of Object.entries(terrainMods)) {
    const key = cond as WeatherCondition;
    base[key] = Math.max(0, (base[key] || 0) + mod);
  }

  // Weighted random pick
  const entries = Object.entries(base) as [WeatherCondition, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;

  for (const [condition, weight] of entries) {
    r -= weight;
    if (r <= 0) return condition;
  }

  return 'clear';
}

// ---- Derived Properties ----

function getTemperature(condition: WeatherCondition, season: Season): Temperature {
  if (condition === 'extreme-heat') return 'scorching';
  if (condition === 'extreme-cold' || condition === 'blizzard') return 'freezing';
  if (condition === 'snow') return 'cold';

  switch (season) {
    case 'summer': return roll(4) >= 3 ? 'hot' : 'warm';
    case 'winter': return roll(4) >= 3 ? 'cold' : 'cool';
    case 'spring': return 'mild';
    case 'autumn': return 'cool';
  }
}

function getWind(condition: WeatherCondition): WindLevel {
  switch (condition) {
    case 'blizzard':
    case 'sandstorm': return 'gale';
    case 'thunderstorm': return 'strong-wind';
    case 'wind': return 'windy';
    case 'heavy-rain': return 'windy';
    default: return roll(4) === 4 ? 'breeze' : 'calm';
  }
}

function getVisibility(condition: WeatherCondition): VisibilityLevel {
  switch (condition) {
    case 'blizzard':
    case 'sandstorm': return 'zero';
    case 'fog':
    case 'heavy-rain': return 'heavily-obscured';
    case 'light-rain':
    case 'snow':
    case 'overcast': return 'lightly-obscured';
    default: return 'clear';
  }
}

function getTravelModifier(condition: WeatherCondition): number {
  switch (condition) {
    case 'blizzard':
    case 'sandstorm': return 0.25;
    case 'heavy-rain':
    case 'thunderstorm':
    case 'snow': return 0.5;
    case 'fog':
    case 'wind':
    case 'hail': return 0.75;
    case 'light-rain':
    case 'overcast': return 0.9;
    default: return 1.0;
  }
}

function getCombatModifiers(condition: WeatherCondition): string[] {
  const mods: string[] = [];
  switch (condition) {
    case 'heavy-rain':
    case 'thunderstorm':
      mods.push('Disadvantage on ranged attacks beyond 30ft');
      mods.push('Disadvantage on Perception (hearing)');
      break;
    case 'fog':
      mods.push('Heavily obscured beyond 30ft');
      mods.push('Lightly obscured within 30ft');
      break;
    case 'blizzard':
    case 'sandstorm':
      mods.push('Disadvantage on all ranged attacks');
      mods.push('Half movement speed');
      mods.push('CON save DC 10 each hour or gain 1 exhaustion');
      break;
    case 'wind':
      mods.push('Disadvantage on ranged attacks beyond 60ft');
      break;
    case 'extreme-heat':
      mods.push('CON save DC 10 each hour or gain 1 exhaustion');
      break;
    case 'extreme-cold':
      mods.push('CON save DC 10 each hour without cold weather gear or gain 1 exhaustion');
      break;
  }
  return mods;
}

function getPerceptionModifier(condition: WeatherCondition): number {
  switch (condition) {
    case 'blizzard':
    case 'sandstorm': return -10;
    case 'fog':
    case 'heavy-rain':
    case 'thunderstorm': return -5;
    case 'light-rain':
    case 'snow':
    case 'wind': return -2;
    default: return 0;
  }
}

function getSurvivalDC(condition: WeatherCondition): number {
  switch (condition) {
    case 'blizzard':
    case 'sandstorm': return 20;
    case 'thunderstorm':
    case 'extreme-cold':
    case 'extreme-heat': return 15;
    case 'heavy-rain':
    case 'snow': return 12;
    case 'fog':
    case 'wind': return 10;
    default: return 5;
  }
}

// ---- Weather Transition ----

export function transitionWeather(current: Weather, season: Season, terrain: TerrainType): Weather {
  // Check if weather duration expired
  if (current.duration <= 1) {
    return generateWeather(season, terrain);
  }

  // Natural transitions with small chance
  if (Math.random() < 0.1) {
    const newCondition = getTransition(current.current);
    if (newCondition !== current.current) {
      return {
        ...current,
        current: newCondition,
        visibility: getVisibility(newCondition),
        travelModifier: getTravelModifier(newCondition),
        combatModifiers: getCombatModifiers(newCondition),
        perceptionModifier: getPerceptionModifier(newCondition),
        duration: roll(6) + 2,
        narrativeDescription: getNarrative(
          newCondition,
          current.temperature,
          current.wind
        ),
      };
    }
  }

  return { ...current, duration: current.duration - 1 };
}

function getTransition(current: WeatherCondition): WeatherCondition {
  const transitions: Partial<Record<WeatherCondition, WeatherCondition[]>> = {
    clear: ['overcast', 'clear'],
    overcast: ['light-rain', 'clear', 'wind'],
    'light-rain': ['heavy-rain', 'overcast', 'clear'],
    'heavy-rain': ['thunderstorm', 'light-rain', 'overcast'],
    thunderstorm: ['heavy-rain', 'overcast'],
    fog: ['overcast', 'clear'],
    snow: ['blizzard', 'overcast', 'clear'],
    blizzard: ['snow', 'overcast'],
  };

  const options = transitions[current] || ['clear'];
  return options[Math.floor(Math.random() * options.length)];
}

// ---- Narrative ----

function getNarrative(
  condition: WeatherCondition,
  temperature: Temperature,
  wind: WindLevel
): string {
  const tempDesc: Record<Temperature, string> = {
    freezing: 'bitter, bone-chilling cold',
    cold: 'a cold nip in the air',
    cool: 'a crisp coolness',
    mild: 'pleasant, mild temperatures',
    warm: 'a comfortable warmth',
    hot: 'oppressive heat',
    scorching: 'unbearable, searing heat',
  };

  const desc: Record<WeatherCondition, string> = {
    clear: 'The sky is clear, offering an unobstructed view of the heavens.',
    overcast: 'A blanket of grey clouds covers the sky, muting the light.',
    'light-rain': 'A gentle drizzle falls, creating a soft patter on leaves and stone.',
    'heavy-rain': 'Rain pours down in heavy sheets, drenching everything in sight.',
    thunderstorm: 'Thunder cracks overhead as lightning illuminates roiling storm clouds.',
    fog: 'A thick fog blankets the land, reducing the world to ghostly shapes.',
    snow: 'Soft snowflakes drift down, dusting the landscape in white.',
    blizzard: 'A howling blizzard rages, visibility reduced to mere feet.',
    hail: 'Hailstones clatter down, bouncing off armor and stone.',
    wind: 'Strong gusts tug at cloaks and banners, carrying distant sounds.',
    sandstorm: 'A wall of sand screams across the landscape, scouring everything.',
    'extreme-heat': 'The air shimmers with heat waves rising from the baked earth.',
    'extreme-cold': 'The cold bites relentlessly, frost forming on every surface.',
    'magical-storm': 'Arcane energy crackles through the air as an unnatural storm rages.',
    eclipse: 'The sun darkens unnaturally, casting the world into twilight.',
    'blood-moon': 'A crimson moon hangs low, bathing the world in eerie red light.',
  };

  return `${desc[condition]} There is ${tempDesc[temperature]}.${
    wind !== 'calm' ? ` The wind is ${wind.replace('-', ' ')}.` : ''
  }`;
}

// ---- AI Prompt Builder ----

export function buildWeatherNarrativePrompt(weather: Weather): string {
  return `Current weather conditions:
- Condition: ${weather.current}
- Temperature: ${weather.temperature}
- Wind: ${weather.wind}
- Visibility: ${weather.visibility}
- Survival DC: ${weather.survivalDC}
${weather.combatModifiers.length > 0 ? `- Combat effects: ${weather.combatModifiers.join('; ')}` : ''}

Weave these conditions naturally into your descriptions. They should affect NPC behavior, available actions, and the atmosphere of scenes.`;
}
