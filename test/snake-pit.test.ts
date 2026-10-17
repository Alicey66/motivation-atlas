// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { snakePit } from "../src/minigames/snake-pit";
import { advance, BURROW, MOVE_MS, newGame, startGame, type Direction, type Maze, type SnakeState } from "../src/minigames/snake-pit/game";

const pickupMaze: Maze = {
  rows: ["########", "#......#", "#......#", "########"],
  start: [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
  direction: "right",
  eggs: [{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }],
  exit: { x: 6, y: 2 },
};

// An 80-cell circuit, with detours into the arena to make room for a 75-cell body.
const LAP: readonly (readonly [Direction, number])[] = [
  ["right", 6], ["down", 2], ["right", 4], ["up", 2], ["right", 6],
  ["down", 7], ["left", 2], ["down", 4], ["right", 2], ["down", 7],
  ["left", 5], ["up", 2], ["left", 4], ["down", 2], ["left", 7], ["up", 18],
];
const ESCAPE: readonly (readonly [Direction, number])[] = [
  ["right", 2], ...LAP.slice(1), ...Array.from({ length: 5 }, () => LAP).flat(),
];

function follow(state: SnakeState, route: readonly (readonly [Direction, number])[]): SnakeState {
  for (const [direction, steps] of route) {
    for (let i = 0; i < steps; i++) state = advance(state, direction);
  }
  return state;
}

describe("Snake Pit: the growth mechanic", () => {
  it("keeps the tail and adds exactly one segment when an egg is eaten with growth ON", () => {
    const before = startGame(newGame(true, pickupMaze));
    const after = advance(before);
    expect(after.body).toEqual([{ x: 4, y: 1 }, ...before.body]);
    expect(after.eggs).toEqual(pickupMaze.eggs.slice(1));
    expect(before.body).toEqual(pickupMaze.start);
    expect(before.eggs).toHaveLength(3);
  });

  it("moves the tail and keeps the same length when an egg is eaten with growth OFF", () => {
    const before = startGame(newGame(false, pickupMaze));
    const after = advance(before);
    expect(after.body).toEqual([{ x: 4, y: 1 }, ...before.body.slice(0, -1)]);
    expect(after.eggs).toEqual(pickupMaze.eggs.slice(1));
    expect(after.body).toHaveLength(before.body.length);
  });

  it.each([true, false])("one egg adds six segments over the following moves only with growth ON (%s)", (growth) => {
    const maze: Maze = {
      rows: ["#################", "#...............#", "#...............#", "#################"],
      start: pickupMaze.start, direction: "right", eggs: [{ x: 4, y: 1 }], exit: { x: 1, y: 2 },
    };
    const first = advance(startGame(newGame(growth, maze)));
    expect(first.growthPending).toBe(growth ? 5 : 0);
    const grown = follow(first, [["right", 5]]);
    expect(grown.phase).toBe("playing");
    expect(grown.body).toHaveLength(growth ? 9 : 3);
    expect(grown.growthPending).toBe(0);
    expect(advance(grown).body).toHaveLength(grown.body.length);
  });

  it.each([true, false])("queues every egg's growth even when pickups are consecutive (growth %s)", (growth) => {
    const before = startGame(newGame(growth, pickupMaze));
    const after = follow(before, [["right", 3], ["down", 1]]);
    expect(after.eggs).toHaveLength(0);
    expect(after.body).toHaveLength(growth ? 7 : 3);
    expect(after.growthPending).toBe(growth ? 14 : 0);
    expect(after.phase).toBe("won");
    expect(advance(after)).toBe(after);
  });

  it("collects only the active egg and counts repeated visits to a nest separately", () => {
    const maze = { ...pickupMaze, eggs: [{ x: 5, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }] };
    const first = advance(startGame(newGame(false, maze)));
    expect(first.eggs).toHaveLength(3);
    const second = advance(first);
    expect(second.eggs).toEqual(maze.eggs.slice(1));
    const all = follow(second, [["down", 1], ["left", 1], ["up", 1], ["right", 1]]);
    expect(all.eggs).toHaveLength(0);
    expect(all.phase).toBe("playing");
  });
});

describe("Snake Pit: movement and goals", () => {
  it("uses the exact same maze, spawn, eggs, and exit in both modes", () => {
    const on = newGame(true);
    const off = newGame(false);
    expect(on.maze).toBe(off.maze);
    expect(on.body).toEqual(off.body);
    expect(on.eggs).toEqual(off.eggs);
    expect(advance(on)).toBe(on);
  });

  it("rejects a reversal and keeps moving forward", () => {
    const state = startGame(newGame(false, pickupMaze));
    expect(advance(state, "left").body[0]).toEqual({ x: 4, y: 1 });
  });

  it("loses on a wall and freezes the final state", () => {
    const state = advance(startGame(newGame(true, pickupMaze)), "up");
    expect(state.phase).toBe("lost");
    expect(state.collision).toBe("wall");
    expect(advance(state, "right")).toBe(state);
  });

  it("allows entry into the tail cell when the tail moves away", () => {
    const state: SnakeState = {
      ...startGame(newGame(false, pickupMaze)), direction: "down",
      body: [{ x: 3, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    };
    const next = advance(state, "left");
    expect(next.phase).toBe("playing");
    expect(next.body[0]).toEqual({ x: 2, y: 2 });
  });

  it("loses on a body segment that is not moving away", () => {
    const state: SnakeState = {
      ...startGame(newGame(true, pickupMaze)), direction: "down",
      body: [{ x: 3, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }],
    };
    expect(advance(state, "left").collision).toBe("body");
  });

  it("keeps the tail solid while queued growth is still being added", () => {
    const state: SnakeState = {
      ...startGame(newGame(true, pickupMaze)), direction: "down", growthPending: 1,
      body: [{ x: 3, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    };
    expect(advance(state, "left").collision).toBe("body");
  });

  it("does not let an early visit to the exit win", () => {
    const maze = { ...pickupMaze, exit: { x: 3, y: 2 } };
    const state = advance(startGame(newGame(false, maze)), "down");
    expect(state.body[0]).toEqual(maze.exit);
    expect(state.phase).toBe("playing");
    expect(state.eggs).toHaveLength(3);
  });
});

describe("Snake Pit: the actual burrow", () => {
  it.each([true, false])("has a complete escape route in both modes (growth %s)", (growth) => {
    const state = follow(startGame(newGame(growth)), ESCAPE);
    expect(state.phase).toBe("won");
    expect(state.eggs).toHaveLength(0);
    expect(state.body).toHaveLength(growth ? 75 : 3);
    expect(state.growthPending).toBe(0);
    expect(state.steps * MOVE_MS).toBeGreaterThanOrEqual(60_000);
    expect(state.steps * MOVE_MS).toBeLessThanOrEqual(120_000);
  });

  it("blocks a backtrack across the recent trail ON while the same route stays clear OFF", () => {
    const turn: readonly (readonly [Direction, number])[] = [
      ["down", 1], ["left", 1], ["up", 1],
    ];
    const on = follow(startGame(newGame(true)), [["right", 12]]);
    const off = follow(startGame(newGame(false)), [["right", 12]]);
    expect(on.eggs).toHaveLength(11);
    expect(off.eggs).toHaveLength(11);
    expect(follow(on, turn).collision).toBe("body");
    expect(follow(off, turn).phase).toBe("playing");
  });

  it("spaces the fixed sequence far enough apart that neither mode can rush a round in seconds", () => {
    let previous = BURROW.start[0];
    let minimumSteps = 0;
    for (const cell of [...BURROW.eggs, BURROW.exit]) {
      minimumSteps += Math.abs(cell.x - previous.x) + Math.abs(cell.y - previous.y);
      previous = cell;
    }
    expect(minimumSteps * MOVE_MS).toBeGreaterThanOrEqual(60_000);
    expect(BURROW.eggs).toHaveLength(12);
  });

  it("has connected passages, with no forced dead-end egg pockets", () => {
    const floors = new Set<string>();
    BURROW.rows.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell === ".") floors.add(`${x},${y}`);
    }));
    const neighbors = (key: string) => {
      const [x, y] = key.split(",").map(Number);
      return [`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`].filter((cell) => floors.has(cell));
    };
    for (const cell of floors) expect(neighbors(cell).length).toBeGreaterThanOrEqual(2);
    const visited = new Set<string>();
    const pending = [floors.values().next().value!];
    while (pending.length) {
      const cell = pending.pop()!;
      if (visited.has(cell)) continue;
      visited.add(cell);
      pending.push(...neighbors(cell));
    }
    expect(visited).toEqual(floors);
    expect(BURROW.rows.every((row) => row.length === BURROW.rows[0].length)).toBe(true);
  });
});

describe("Snake Pit: controls and lifecycle", () => {
  const cleanups: (() => void)[] = [];

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id));
  });

  afterEach(() => {
    for (const cleanup of cleanups.splice(0)) cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function setup() {
    const host = document.createElement("div");
    document.body.append(host);
    const unmount = snakePit.mount(host);
    cleanups.push(() => { unmount(); host.remove(); });
    const q = <T extends Element = HTMLElement>(selector: string) => host.querySelector<T>(selector)!;
    return { host, unmount, q };
  }

  it("previews the maze without starting a clock, then locks the mechanic during play", () => {
    const { q } = setup();
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("ready");
    expect(q("[data-eggs]").textContent).toBe("0 / 12");
    expect(q(".snake-pit-eggs").querySelectorAll("ellipse")).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
    q<HTMLButtonElement>("[data-action]").click();
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("playing");
    expect(q<HTMLInputElement>("[data-mechanic='egg-growth']").disabled).toBe(true);
    expect(document.activeElement).toBe(q("[data-board]"));
    // The first full cell should arrive within a quarter second.
    vi.advanceTimersByTime(256);
    expect(q("[data-board]").getAttribute("data-steps")).toBe("1");
  });

  it("applies OFF before a new round and keeps it through restart", () => {
    const { q } = setup();
    q<HTMLInputElement>("[data-mechanic]").click();
    expect(q<HTMLInputElement>("[data-mechanic]").checked).toBe(false);
    q<HTMLButtonElement>("[data-action]").click();
    vi.advanceTimersByTime(MOVE_MS + 32);
    q<HTMLButtonElement>("[data-restart]").click();
    expect(q("[data-board]").getAttribute("data-steps")).toBe("0");
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("ready");
    expect(q<HTMLInputElement>("[data-mechanic]").checked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("pauses and resumes without advancing during the pause", () => {
    const { q } = setup();
    q<HTMLButtonElement>("[data-action]").click();
    vi.advanceTimersByTime(160);
    q<HTMLButtonElement>("[data-action]").click();
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("paused");
    vi.advanceTimersByTime(60_000);
    expect(q("[data-board]").getAttribute("data-steps")).toBe("0");
    expect(vi.getTimerCount()).toBe(0);
    q<HTMLButtonElement>("[data-action]").click();
    vi.advanceTimersByTime(MOVE_MS);
    expect(q("[data-board]").getAttribute("data-steps")).toBe("1");
  });

  it("buffers one turn, supports pointer buttons, and scopes keyboard input to the game", () => {
    const { q } = setup();
    q<HTMLButtonElement>("[data-action]").click();
    q<HTMLButtonElement>("[data-direction='down']").click();
    q<HTMLButtonElement>("[data-direction='up']").click();
    expect(q("[data-direction='down']").getAttribute("data-queued")).toBe("true");
    expect(q("[data-direction='up']").getAttribute("data-queued")).toBe("false");
    const inside = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    q("[data-board]").dispatchEvent(inside);
    expect(inside.defaultPrevented).toBe(true);
    const shortcut = new KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true, cancelable: true });
    q("[data-board]").dispatchEvent(shortcut);
    expect(shortcut.defaultPrevented).toBe(false);
    const outside = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    document.body.dispatchEvent(outside);
    expect(outside.defaultPrevented).toBe(false);
  });

  it("pauses on focus loss and clears the animation and global listeners on unmount", () => {
    const { host, q, unmount } = setup();
    q<HTMLButtonElement>("[data-action]").click();
    window.dispatchEvent(new Event("blur"));
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("paused");
    q<HTMLButtonElement>("[data-action]").click();
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(host.childNodes.length).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    window.dispatchEvent(new Event("blur"));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("follows a right-angle turn without drawing diagonal body segments", () => {
    const { q } = setup();
    q<HTMLButtonElement>("[data-action]").click();
    vi.advanceTimersByTime(MOVE_MS * 9 + 16);
    q<HTMLButtonElement>("[data-direction='down']").click();
    vi.advanceTimersByTime(MOVE_MS * 1.5);
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("playing");
    const points = q(".snake-pit-body").getAttribute("points")!.split(" ").map((point) => point.split(",").map(Number));
    for (let i = 1; i < points.length; i++) {
      expect(points[i][0] === points[i - 1][0] || points[i][1] === points[i - 1][1]).toBe(true);
    }
  });

  it("shows the collision and a reflection question after a loss", () => {
    const { q } = setup();
    q<HTMLButtonElement>("[data-action]").click();
    vi.advanceTimersByTime(MOVE_MS * 13);
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("lost");
    expect(q("[data-status]").textContent).toMatch(/wall/i);
    expect(q("[data-reflect]").hidden).toBe(false);
    expect(q("[data-reflect]").textContent).toContain("What did you feel");
    expect(q<HTMLInputElement>("[data-mechanic]").disabled).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([true, false])("plays the full escape through the controls and shows the result (growth %s)", (growth) => {
    const { q } = setup();
    if (!growth) q<HTMLInputElement>("[data-mechanic]").click();
    q<HTMLButtonElement>("[data-action]").click();
    let total = 0;
    let elapsed = 0;
    for (let i = 0; i < ESCAPE.length - 1; i++) {
      total += ESCAPE[i][1] * MOVE_MS;
      const inputAt = total - MOVE_MS / 2;
      vi.advanceTimersByTime(inputAt - elapsed);
      elapsed = inputAt;
      const direction = ESCAPE[i + 1][0];
      if (growth) q<HTMLButtonElement>(`[data-direction='${direction}']`).click();
      else {
        const key = { up: "w", right: "ArrowRight", down: "s", left: "ArrowLeft" }[direction];
        q("[data-board]").dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
      }
    }
    total += ESCAPE[ESCAPE.length - 1][1] * MOVE_MS;
    vi.advanceTimersByTime(total + 16 - elapsed);
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("won");
    expect(q("[data-eggs]").textContent).toBe("12 / 12");
    expect(q("[data-length]").textContent).toBe(growth ? "75" : "3");
    expect(q("[data-status]").textContent).toContain("Escaped in 1:54");
    expect(q("[data-reflect]").hidden).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("pauses instead of catching up through unseen moves after a long frame gap", () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now() + MOVE_MS * 3), 16));
    const { q } = setup();
    q<HTMLButtonElement>("[data-action]").click();
    vi.advanceTimersByTime(16);
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("paused");
    expect(q("[data-board]").getAttribute("data-steps")).toBe("0");
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("Snake Pit: attribution", () => {
  it("quotes the course note exactly and leaves both playtest findings pending", () => {
    const note = readFileSync("content/player-motivations.md", "utf8");
    const readme = readFileSync("src/minigames/snake-pit/README.md", "utf8");
    const quote = "Clear goals, the possibility of failure, and immediate feedback (Lazzaro 2004b, sec. 2b).";
    expect(note).toContain(quote);
    expect(readme).toContain(quote);
    expect(readme).toContain("Codex");
    expect(readme).toContain("Snake");
    expect(readme.match(/Playtest pending/g)).toHaveLength(2);
  });
});
