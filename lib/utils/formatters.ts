// ============================================================
// FORMATTERS — Display formatting for game values
// ============================================================

import type { GameClock, TimeOfDay } from '@/lib/types/exploration';

/**
 * Format an ability modifier with sign: +2, -1, +0
 */
export function formatModifier(mod: number): string {
  if (mod >= 0) return `+${mod}`;
  return `${mod}`;
}

/**
 * Format HP display: "45/52"
 */
export function formatHP(current: number, max: number): string {
  return `${current}/${max}`;
}

/**
 * Format gold with comma separators: "1,250 gp"
 */
export function formatGold(amount: number): string {
  return `${amount.toLocaleString()} gp`;
}

/**
 * Format a currency breakdown: "12 gp, 5 sp, 3 cp"
 */
export function formatCurrency(gold: number, silver: number = 0, copper: number = 0): string {
  const parts: string[] = [];
  if (gold > 0) parts.push(`${gold.toLocaleString()} gp`);
  if (silver > 0) parts.push(`${silver} sp`);
  if (copper > 0) parts.push(`${copper} cp`);
  return parts.length > 0 ? parts.join(', ') : '0 gp';
}

/**
 * Format time of day into readable string.
 */
export function formatTimeOfDay(time: TimeOfDay): string {
  const labels: Record<TimeOfDay, string> = {
    dawn: 'Dawn',
    morning: 'Morning',
    midday: 'Midday',
    afternoon: 'Afternoon',
    dusk: 'Dusk',
    evening: 'Evening',
    night: 'Night',
    midnight: 'Midnight',
  };
  return labels[time] ?? time;
}

/**
 * Format a GameClock into a readable date string.
 */
export function formatDate(clock: GameClock): string {
  return `Day ${clock.day}, ${formatTimeOfDay(clock.timeOfDay)} — ${clock.currentSeason}`;
}

/**
 * Truncate text to a max length, adding "..." if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format XP with progress: "1,250 / 2,700 XP"
 */
export function formatXP(current: number, nextLevel: number): string {
  return `${current.toLocaleString()} / ${nextLevel.toLocaleString()} XP`;
}

/**
 * Format a percentage: "73%"
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format weight: "15.5 lbs"
 */
export function formatWeight(lbs: number): string {
  return `${lbs.toFixed(1)} lbs`;
}

/**
 * Format a duration in rounds to readable time: "3 rounds (18s)"
 */
export function formatRounds(rounds: number): string {
  const seconds = rounds * 6;
  if (rounds === 1) return '1 round (6s)';
  return `${rounds} rounds (${seconds}s)`;
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a snake_case or kebab-case string to Title Case.
 */
export function toTitleCase(str: string): string {
  return str
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format item rarity with color hint.
 */
export function formatRarity(rarity: string): { label: string; color: string } {
  const rarityColors: Record<string, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    very_rare: '#a855f7',
    epic: '#f59e0b',
    legendary: '#f97316',
    mythic: '#ef4444',
    artifact: '#ec4899',
  };

  return {
    label: toTitleCase(rarity),
    color: rarityColors[rarity] ?? '#9ca3af',
  };
}

/**
 * Format a distance: "30 ft." or "5 miles"
 */
export function formatDistance(feet: number): string {
  if (feet >= 5280) {
    const miles = feet / 5280;
    return `${miles.toFixed(1)} miles`;
  }
  return `${feet} ft.`;
}
