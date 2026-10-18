/** Effective passive drain after easing the former 4x tuning by 10%. */
export const HUNGER_DRAIN_MULTIPLIER = 3.6;

export interface ScoreEntry {
  name: string;
  time: number;
  points: number;
}

/** Higher points rank first; equal scores are broken by faster completion. */
export function rankScores<T extends ScoreEntry>(scores: T[]): T[] {
  return [...scores].sort((a, b) => b.points - a.points || a.time - b.time || a.name.localeCompare(b.name));
}

export function drainNourishment(health: number, seconds: number, enabled: boolean, rate: number): number {
  if (!enabled) return health;
  return Math.max(0, health - Math.max(0, seconds) * Math.max(0, rate) * HUNGER_DRAIN_MULTIPLIER);
}
