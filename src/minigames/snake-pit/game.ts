export interface Cell { readonly x: number; readonly y: number }
export type Direction = "up" | "right" | "down" | "left";
export interface Maze {
  readonly rows: readonly string[];
  /** Head first. */
  readonly start: readonly Cell[];
  readonly direction: Direction;
  readonly eggs: readonly Cell[];
  readonly exit: Cell;
}
export interface SnakeState {
  readonly maze: Maze;
  readonly growth: boolean;
  readonly body: readonly Cell[];
  /** Segments still to add, one per move, after eating. */
  readonly growthPending: number;
  readonly direction: Direction;
  readonly eggs: readonly Cell[];
  readonly phase: "ready" | "playing" | "won" | "lost";
  readonly collision: "wall" | "body" | null;
  readonly steps: number;
}

/** One shared clock and layout; growth is the only rule that changes. */
export const MOVE_MS = 240;
export const SEGMENTS_PER_EGG = 6;
const ROCKS = [{ x: 5, y: 4 }, { x: 11, y: 11 }, { x: 4, y: 14 }];
export const BURROW: Maze = {
  rows: Array.from({ length: 21 }, (_, y) => Array.from({ length: 19 }, (_, x) => {
    const rock = ROCKS.some((rock) => x >= rock.x && x < rock.x + 3 && y >= rock.y && y < rock.y + 3);
    return x === 0 || x === 18 || y === 0 || y === 20 || rock ? "#" : ".";
  }).join("")),
  start: [{ x: 5, y: 1 }, { x: 4, y: 1 }, { x: 3, y: 1 }],
  direction: "right",
  // Fixed nests alternate across the arena. Only the first remaining egg is active.
  eggs: [
    { x: 17, y: 1 }, { x: 1, y: 19 }, { x: 16, y: 1 }, { x: 2, y: 19 },
    { x: 17, y: 2 }, { x: 1, y: 18 }, { x: 15, y: 1 }, { x: 3, y: 19 },
    { x: 17, y: 1 }, { x: 1, y: 19 }, { x: 17, y: 3 }, { x: 2, y: 19 },
  ],
  exit: { x: 1, y: 1 },
};

const VECTORS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 }, right: { x: 1, y: 0 },
  down: { x: 0, y: 1 }, left: { x: -1, y: 0 },
};

export const sameCell = (a: Cell, b: Cell): boolean => a.x === b.x && a.y === b.y;

export function canTurn(current: Direction, requested: Direction): boolean {
  return VECTORS[current].x + VECTORS[requested].x !== 0
    || VECTORS[current].y + VECTORS[requested].y !== 0;
}

export function newGame(growth: boolean, maze: Maze = BURROW): SnakeState {
  return {
    maze, growth, body: maze.start.map((cell) => ({ ...cell })), direction: maze.direction,
    eggs: maze.eggs.map((cell) => ({ ...cell })), growthPending: 0,
    phase: "ready", collision: null, steps: 0,
  };
}

export function startGame(state: SnakeState): SnakeState {
  return state.phase === "ready" ? { ...state, phase: "playing" } : state;
}

/** One cell per tick. Illegal reversals continue forward; terminal states never move. */
export function advance(state: SnakeState, requested: Direction = state.direction): SnakeState {
  if (state.phase !== "playing") return state;
  const direction = canTurn(state.direction, requested) ? requested : state.direction;
  const delta = VECTORS[direction];
  const head = { x: state.body[0].x + delta.x, y: state.body[0].y + delta.y };
  if (state.maze.rows[head.y]?.[head.x] !== ".") {
    return { ...state, direction, phase: "lost", collision: "wall" };
  }
  const eating = state.eggs[0] !== undefined && sameCell(head, state.eggs[0]);
  const growthPending = state.growth ? state.growthPending + (eating ? SEGMENTS_PER_EGG : 0) : 0;
  const grows = growthPending > 0;
  const occupied = grows ? state.body : state.body.slice(0, -1);
  if (occupied.some((cell) => sameCell(head, cell))) {
    return { ...state, direction, phase: "lost", collision: "body" };
  }
  const body = [head, ...occupied];
  const eggs = eating ? state.eggs.slice(1) : state.eggs;
  return {
    ...state, body, direction, eggs, steps: state.steps + 1,
    growthPending: grows ? growthPending - 1 : 0,
    phase: eggs.length === 0 && sameCell(head, state.maze.exit) ? "won" : "playing",
  };
}
