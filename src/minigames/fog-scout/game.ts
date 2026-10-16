/** Pure rules: no rendering, clocks, randomness or browser APIs. */
export const SIZE = 7;
export const RELICS = 3;
export type Direction = "up" | "right" | "down" | "left";
export type Tile = "unknown" | "wall" | "floor" | "relic" | "exit";

export const MAPS = [
  { name: "Amber Court", rows: [
    "S..#..R", ".#.#.#.", ".#...#.", "...#R..", "##.#.#.", "R..#...", "...#..E",
  ] },
  { name: "Jade Archive", rows: [
    "S...#R.", ".##.#..", "..R...#", "#.##...", "...#.#.", ".#...#.", "R..#..E",
  ] },
] as const;

export interface ScoutState {
  readonly map: number;
  readonly fog: boolean;
  readonly position: number;
  readonly revealed: readonly number[];
  readonly visited: readonly number[];
  readonly collected: readonly number[];
  readonly steps: number;
  readonly backtracks: number;
  readonly won: boolean;
  readonly event: "start" | "moved" | "wall" | "edge" | "relic" | "locked" | "escaped";
}

function terrain(map: number, position: number): string {
  return MAPS[map].rows[Math.floor(position / SIZE)][position % SIZE];
}

/** Reveal the current square and four neighbors; known squares stay known. */
function reveal(known: readonly number[], position: number): number[] {
  const row = Math.floor(position / SIZE);
  const col = position % SIZE;
  const nearby = [position];
  if (row > 0) nearby.push(position - SIZE);
  if (row < SIZE - 1) nearby.push(position + SIZE);
  if (col > 0) nearby.push(position - 1);
  if (col < SIZE - 1) nearby.push(position + 1);
  return [...new Set([...known, ...nearby])];
}

export function newGame(fog = true, map = 0): ScoutState {
  if (!Number.isInteger(map) || !MAPS[map]) throw new Error("Unknown ruins map");
  const position = MAPS[map].rows.join("").indexOf("S");
  return {
    map, fog, position, revealed: reveal([], position), visited: [position],
    collected: [], steps: 0, backtracks: 0, won: false, event: "start",
  };
}

/** Project visible information only; unknown squares disclose no terrain. */
export function tileAt(state: ScoutState, position: number): Tile {
  if (state.fog && !state.revealed.includes(position)) return "unknown";
  const tile = terrain(state.map, position);
  if (tile === "#") return "wall";
  if (tile === "E") return "exit";
  if (tile === "R" && !state.collected.includes(position)) return "relic";
  return "floor";
}

export function move(state: ScoutState, direction: Direction): ScoutState {
  if (state.won) return state;
  const row = Math.floor(state.position / SIZE);
  const col = state.position % SIZE;
  const [dr, dc] = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1] }[direction];
  const nextRow = row + dr;
  const nextCol = col + dc;
  if (nextRow < 0 || nextRow >= SIZE || nextCol < 0 || nextCol >= SIZE) return { ...state, event: "edge" };
  const position = nextRow * SIZE + nextCol;
  const tile = terrain(state.map, position);
  if (tile === "#") return { ...state, event: "wall" };
  const found = tile === "R" && !state.collected.includes(position);
  const collected = found ? [...state.collected, position] : state.collected;
  const won = tile === "E" && collected.length === RELICS;
  return {
    ...state, position, collected, won,
    revealed: reveal(state.revealed, position),
    visited: [...new Set([...state.visited, position])],
    steps: state.steps + 1,
    backtracks: state.backtracks + Number(state.visited.includes(position)),
    event: won ? "escaped" : tile === "E" ? "locked" : found ? "relic" : "moved",
  };
}
