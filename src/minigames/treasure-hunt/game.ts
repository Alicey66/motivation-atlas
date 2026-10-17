/** DOM-free rules: 30 possible openings during a 90-second expedition. */
export const ROUND_MS = 90_000;
export const CHEST_MS = 3_000;
export const TARGET = 240;

export interface HuntState {
  randomRewards: boolean;
  startedAt: number;
  nextChestAt: number;
  score: number;
  opened: number;
  lastReward: number | null;
}

export function newHunt(randomRewards: boolean, now: number): HuntState {
  return { randomRewards, startedAt: now, nextChestAt: now, score: 0, opened: 0, lastReward: null };
}

export function rewardFor(randomRewards: boolean, sample: number): number {
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new RangeError("Sample must be in [0, 1).");
  return randomRewards ? (sample < 1 / 3 ? 30 : 0) : 10;
}

export function remainingMs(state: HuntState, now: number): number {
  return Math.max(0, ROUND_MS - (now - state.startedAt));
}

export function canOpen(state: HuntState, now: number): boolean {
  return now >= state.startedAt && remainingMs(state, now) > 0 && now >= state.nextChestAt;
}

export function openChest(state: HuntState, now: number, sample: number): HuntState {
  if (!canOpen(state, now)) return state;
  const reward = rewardFor(state.randomRewards, sample);
  return { ...state, score: state.score + reward, opened: state.opened + 1,
    lastReward: reward, nextChestAt: now + CHEST_MS };
}
