// ============================================================
// CLOCK ENGINE — Game time tracking and time-of-day effects
// Reference: EXPLORATION-SYSTEM.md
// ============================================================

import type { GameClock, TimeOfDay, Season, TimeEffects } from '@/lib/types/exploration';

// ---- Default Calendar ----

const DEFAULT_MONTH_NAMES = [
  'Frostmere', 'Snowthaw', 'Greenrise', 'Bloomtide',
  'Sunpeak', 'Goldflame', 'Harvestmoon', 'Leaffall',
  'Mistreach', 'Duskveil', 'Darkhold', 'Winterdeep',
];

const DEFAULT_DAY_NAMES = [
  'Moonday', 'Towerday', 'Windday', 'Thornday',
  'Fireday', 'Starday', 'Sunday',
];

// ---- Clock Creation ----

export function createClock(
  calendarName: string = 'Standard Reckoning',
  startYear: number = 1247,
  startMonth: number = 3,
  startDay: number = 15,
  startHour: number = 9,
): GameClock {
  return {
    year: startYear,
    month: startMonth,
    day: startDay,
    hour: startHour,
    timeOfDay: getTimeOfDay(startHour),
    calendarName,
    monthNames: DEFAULT_MONTH_NAMES,
    weekLength: 7,
    dayNames: DEFAULT_DAY_NAMES,
    daysSinceStart: 0,
    currentSeason: getSeason(startMonth),
  };
}

// ---- Time Advancement ----

export function advanceTime(clock: GameClock, hours: number): GameClock {
  let newHour = clock.hour + hours;
  let newDay = clock.day;
  let newMonth = clock.month;
  let newYear = clock.year;
  let daysSinceStart = clock.daysSinceStart;

  while (newHour >= 24) {
    newHour -= 24;
    newDay += 1;
    daysSinceStart += 1;
  }
  while (newHour < 0) {
    newHour += 24;
    newDay -= 1;
    daysSinceStart -= 1;
  }

  // 30 days per month for simplicity
  while (newDay > 30) {
    newDay -= 30;
    newMonth += 1;
  }
  while (newMonth > 12) {
    newMonth -= 12;
    newYear += 1;
  }

  return {
    ...clock,
    year: newYear,
    month: newMonth,
    day: newDay,
    hour: Math.floor(newHour),
    timeOfDay: getTimeOfDay(Math.floor(newHour)),
    daysSinceStart,
    currentSeason: getSeason(newMonth),
  };
}

export function advanceDays(clock: GameClock, days: number): GameClock {
  return advanceTime(clock, days * 24);
}

// ---- Time-of-Day Mapping ----

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 13) return 'midday';
  if (hour >= 13 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'dusk';
  if (hour >= 19 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 1) return 'night';
  return 'midnight';
}

export function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// ---- Time Effects ----

export function getTimeEffects(timeOfDay: TimeOfDay): TimeEffects {
  switch (timeOfDay) {
    case 'dawn':
      return {
        timeOfDay,
        visibility: 'lightly-obscured',
        encounterChanceModifier: -0.1,
        narrative: 'The first rays of light paint the sky in soft golds and purples.',
        specialEvents: ['early-riser NPCs active', 'nocturnal creatures retreating'],
        darkvisionRequired: false,
        specialRule: 'Advantage on Stealth checks against creatures without darkvision',
      };
    case 'morning':
      return {
        timeOfDay,
        visibility: 'clear',
        encounterChanceModifier: 0,
        narrative: 'The sun climbs higher, casting long shadows across the land.',
        specialEvents: ['merchants open shops', 'guards change shift'],
        darkvisionRequired: false,
      };
    case 'midday':
      return {
        timeOfDay,
        visibility: 'clear',
        encounterChanceModifier: -0.05,
        narrative: 'The sun sits high overhead, bathing everything in bright light.',
        specialEvents: ['peak market activity', 'shadows at their shortest'],
        darkvisionRequired: false,
      };
    case 'afternoon':
      return {
        timeOfDay,
        visibility: 'clear',
        encounterChanceModifier: 0,
        narrative: 'The day wanes as shadows grow longer.',
        specialEvents: ['taverns begin to fill'],
        darkvisionRequired: false,
      };
    case 'dusk':
      return {
        timeOfDay,
        visibility: 'lightly-obscured',
        encounterChanceModifier: 0.1,
        narrative: 'Twilight descends, blurring the line between day and darkness.',
        specialEvents: ['nocturnal creatures stir', 'street lamps lit'],
        darkvisionRequired: false,
        specialRule: 'Perception checks at disadvantage for creatures without darkvision',
      };
    case 'evening':
      return {
        timeOfDay,
        visibility: 'heavily-obscured',
        encounterChanceModifier: 0.15,
        narrative: 'Darkness has claimed the land, broken only by torchlight and stars.',
        specialEvents: ['taverns lively', 'thieves guild active'],
        darkvisionRequired: true,
      };
    case 'night':
      return {
        timeOfDay,
        visibility: 'heavily-obscured',
        encounterChanceModifier: 0.2,
        narrative: 'The moon casts pale silver light across a silent world.',
        specialEvents: ['undead encounters possible', 'magical phenomena'],
        darkvisionRequired: true,
        specialRule: 'Disadvantage on Perception checks without light source or darkvision',
      };
    case 'midnight':
      return {
        timeOfDay,
        visibility: 'zero',
        encounterChanceModifier: 0.25,
        narrative: 'The witching hour. The world holds its breath.',
        specialEvents: ['dark rituals', 'spirit encounters', 'powerful magic'],
        darkvisionRequired: true,
        specialRule: 'Supernatural encounters more likely. Even darkvision is dim.',
      };
  }
}

// ---- Display Helpers ----

export function formatGameDate(clock: GameClock): string {
  const dayName = clock.dayNames[(clock.daysSinceStart) % clock.weekLength];
  const monthName = clock.monthNames[clock.month - 1];
  return `${dayName}, ${clock.day}${getOrdinal(clock.day)} of ${monthName}, Year ${clock.year}`;
}

export function formatGameTime(clock: GameClock): string {
  const hourStr = clock.hour.toString().padStart(2, '0');
  return `${hourStr}:00`;
}

function getOrdinal(n: number): string {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function getTimeIcon(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'dawn': return '🌅';
    case 'morning': return '☀️';
    case 'midday': return '🌞';
    case 'afternoon': return '🌤️';
    case 'dusk': return '🌇';
    case 'evening': return '🌆';
    case 'night': return '🌙';
    case 'midnight': return '🌑';
  }
}
