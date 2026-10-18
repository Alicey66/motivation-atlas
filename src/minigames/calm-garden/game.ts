export const PLOT_COUNT = 12;
export const ACTION_MS = 1500;
export const LIMIT_MS = 75000;

/** Weeds, cleared soil, planted seeds, and a watered/completed plot. */
export type PlotStage = 0 | 1 | 2 | 3;
export interface GardenState {
  plots: readonly PlotStage[];
  timed: boolean;
  status: "ready" | "playing" | "complete" | "timeout";
  deadline: number | null;
  active: { plot: number; endsAt: number } | null;
  endedAt: number | null;
}

export function createGarden(timed = false): GardenState {
  return {
    plots: Array<PlotStage>(PLOT_COUNT).fill(0), timed, status: "ready",
    deadline: null, active: null, endedAt: null,
  };
}

/** All timestamps come from the caller's monotonic clock; no browser dependencies. */
export function startGarden(state: GardenState, now: number): GardenState {
  if (state.status !== "ready") return state;
  return { ...state, status: "playing", deadline: state.timed ? now + LIMIT_MS : null };
}

export function advanceGarden(state: GardenState, now: number): GardenState {
  if (state.status !== "playing") return state;
  let next = state;
  const action = state.active;
  // Resolve events chronologically, even after background-tab timer throttling.
  // An action at the exact deadline is too late; earlier work still counts.
  if (action && now >= action.endsAt && (state.deadline === null || action.endsAt < state.deadline)) {
    const plots = state.plots.map((stage, plot) => plot === action.plot ? (stage + 1) as PlotStage : stage);
    next = { ...state, plots, active: null };
    if (plots.every(stage => stage === 3)) {
      return { ...next, status: "complete", endedAt: action.endsAt };
    }
  }
  if (next.deadline !== null && now >= next.deadline) {
    return { ...next, status: "timeout", active: null, endedAt: next.deadline };
  }
  return next;
}

export function tendPlot(state: GardenState, plot: number, now: number): GardenState {
  const next = advanceGarden(state, now);
  if (next.status !== "playing" || next.active !== null || !Number.isInteger(plot)
    || plot < 0 || plot >= PLOT_COUNT || next.plots[plot] === 3) return next;
  return { ...next, active: { plot, endsAt: now + ACTION_MS } };
}

export function remainingMs(state: GardenState, now: number): number | null {
  if (!state.timed) return null;
  if (state.deadline === null) return LIMIT_MS;
  return Math.max(0, state.deadline - (state.endedAt ?? now));
}
