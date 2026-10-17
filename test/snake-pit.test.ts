// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { snakePit } from "../src/minigames/snake-pit";
import { advance, BURROW, MOVE_MS, newGame, startGame, widthFor, type Direction, type Maze, type SnakeState } from "../src/minigames/snake-pit/game";
import { hitsBody, hitsWall } from "../src/minigames/snake-pit/geometry";

const pickupMaze: Maze = {
  rows: Array.from({ length: 9 }, (_, y) => y === 0 || y === 8 ? "#".repeat(32) : `#${".".repeat(30)}#`),
  start: [{ x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }],
  direction: "right",
  eggs: [{ x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }],
  exit: { x: 6, y: 5 },
};

// A wide route with enough clearance for the final 75-cell, 1.8-cell-wide snake.
const ESCAPE: readonly (readonly [Direction, number])[] = [
  ["right", 12], ["down", 20], ["left", 2],
  ["down", 2], ["right", 10], ["up", 23], ["left", 20],
  ["down", 21], ["right", 22], ["up", 22], ["left", 22], ["down", 2],
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
    expect(after.body).toEqual([{ x: 4, y: 4 }, ...before.body]);
    expect(after.eggs).toEqual(pickupMaze.eggs.slice(1));
    expect(before.body).toEqual(pickupMaze.start);
    expect(before.eggs).toHaveLength(3);
  });

  it("adds length on an egg even when width growth is OFF", () => {
    const before = startGame(newGame(false, pickupMaze));
    const after = advance(before);
    expect(after.body).toEqual([{ x: 4, y: 4 }, ...before.body]);
    expect(after.eggs).toEqual(pickupMaze.eggs.slice(1));
    expect(after.body).toHaveLength(before.body.length + 1);
    expect(after.widths).toEqual([0.6, 0.6, 0.6, 0.6]);
  });

  it.each([true, false])("one egg adds 18 segments regardless of width growth (%s)", (growth) => {
    const maze: Maze = {
      ...pickupMaze, eggs: [pickupMaze.eggs[0]], exit: { x: 1, y: 6 },
    };
    const first = advance(startGame(newGame(growth, maze)));
    expect(first.growthPending).toBe(17);
    const grown = follow(first, [["right", 17]]);
    expect(grown.phase).toBe("playing");
    expect(grown.body).toHaveLength(21);
    expect(grown.growthPending).toBe(0);
    expect(advance(grown).body).toHaveLength(grown.body.length);
  });

  it("changes only width when the same egg and movement sequence is replayed", () => {
    const maze = { ...pickupMaze, eggs: [pickupMaze.eggs[0]], exit: { x: 1, y: 6 } };
    const route: readonly (readonly [Direction, number])[] = [["right", 18]];
    const on = follow(startGame(newGame(true, maze)), route);
    const off = follow(startGame(newGame(false, maze)), route);
    expect(on.body).toEqual(off.body);
    expect(on.eggs).toEqual(off.eggs);
    expect(on.steps).toBe(off.steps);
    expect(on.growthPending).toBe(off.growthPending);
    expect(on.widths[0]).toBe(0.9);
    expect(off.widths[0]).toBe(0.6);
  });

  it.each([true, false])("queues every egg's growth even when pickups are consecutive (growth %s)", (growth) => {
    const before = startGame(newGame(growth, pickupMaze));
    const after = follow(before, [["right", 3], ["down", 1]]);
    expect(after.eggs).toHaveLength(0);
    expect(after.body).toHaveLength(7);
    expect(after.growthPending).toBe(50);
    expect(after.phase).toBe("won");
    expect(advance(after)).toBe(after);
  });

  it("collects only the active egg, leaving later nests untouched", () => {
    const maze = { ...pickupMaze, eggs: [{ x: 5, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }] };
    const first = advance(startGame(newGame(false, maze)));
    expect(first.eggs).toHaveLength(3);
    const second = advance(first);
    expect(second.eggs).toEqual(maze.eggs.slice(1));
    expect(second.eggs).toHaveLength(2);
  });
});

describe("Snake Pit: width growth", () => {
  it("gets wider after each of four eggs ON, and stays slim OFF", () => {
    expect([0, 1, 2, 3, 4].map((eggs) => widthFor(true, eggs))).toEqual([0.6, 0.9, 1.2, 1.5, 1.8]);
    expect(widthFor(false, 4)).toBe(0.6);
  });

  it("lets new width travel down the body instead of inflating the tail through rocks", () => {
    const state = advance(startGame(newGame(true, pickupMaze)));
    expect(state.widths).toEqual([0.9, 0.6, 0.6, 0.6]);
  });

  it("closes a one-cell shortcut after two eggs while a three-cell passage stays open", () => {
    const narrow = ["#########", "#.......#", "#########"];
    const wide = ["#########", "#.......#", "#.......#", "#.......#", "#########"];
    const from = { x: 3, y: 1 }, to = { x: 4, y: 1 };
    expect(hitsWall(narrow, from, to, widthFor(true, 1))).toBe(false);
    expect(hitsWall(narrow, from, to, widthFor(true, 2))).toBe(true);
    expect(hitsWall(narrow, from, to, widthFor(false, 4))).toBe(false);
    expect(hitsWall(wide, { x: 3, y: 2 }, { x: 4, y: 2 }, widthFor(true, 4))).toBe(false);
  });

  it("uses body thickness when checking a near miss, not only occupied cell centers", () => {
    const body = [{ x: 3, y: 5 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }];
    const from = { x: 4, y: 5 }, to = { x: 5, y: 5 };
    expect(hitsBody(from, to, 0.6, body, body.map(() => 0.6))).toBe(false);
    expect(hitsBody(from, to, 1.8, body, body.map(() => 1.8))).toBe(true);
  });

  it("provides pickup clearance for the full grown width from every open approach", () => {
    for (const egg of BURROW.eggs) {
      for (const delta of [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
        expect(hitsWall(BURROW.rows, { x: egg.x + delta.x, y: egg.y + delta.y }, egg, 1.8)).toBe(false);
      }
    }
  });

  it.each([true, false])("eating near a rock grows forward without enlarging the tail behind the head (%s)", (mode) => {
    const maze = {
      ...BURROW, start: [{ x: 24, y: 7 }, { x: 24, y: 6 }, { x: 24, y: 5 }],
      direction: "down" as const,
    };
    const state: SnakeState = {
      ...startGame(newGame(mode, maze)), eggs: BURROW.eggs.slice(1),
      widths: [widthFor(mode, 1), 0.6, 0.6],
    };
    const next = advance(state);
    expect(next.phase).toBe("playing");
    expect(next.eggs).toHaveLength(2);
    expect(next.widths).toEqual([widthFor(mode, 2), widthFor(mode, 1), 0.6, 0.6]);
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
    expect(advance(state, "left").body[0]).toEqual({ x: 4, y: 4 });
  });

  it("loses on a wall and freezes the final state", () => {
    const state = follow(startGame(newGame(true, pickupMaze)), [["up", 4]]);
    expect(state.phase).toBe("lost");
    expect(state.collision).toBe("wall");
    expect(advance(state, "right")).toBe(state);
  });

  it("allows entry into the tail cell when the tail moves away", () => {
    const state: SnakeState = {
      ...startGame(newGame(false, pickupMaze)), direction: "down",
      body: [{ x: 3, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      widths: [0.6, 0.6, 0.6, 0.6],
    };
    const next = advance(state, "left");
    expect(next.phase).toBe("playing");
    expect(next.body[0]).toEqual({ x: 2, y: 2 });
  });

  it("loses on a body segment that is not moving away", () => {
    const state: SnakeState = {
      ...startGame(newGame(true, pickupMaze)), direction: "down",
      body: [{ x: 3, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }],
      widths: [0.6, 0.6, 0.6, 0.6, 0.6],
    };
    expect(advance(state, "left").collision).toBe("body");
  });

  it("keeps the tail solid while queued growth is still being added", () => {
    const state: SnakeState = {
      ...startGame(newGame(true, pickupMaze)), direction: "down", growthPending: 1,
      body: [{ x: 3, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      widths: [0.6, 0.6, 0.6, 0.6],
    };
    expect(advance(state, "left").collision).toBe("body");
  });

  it("does not let an early visit to the exit win", () => {
    const maze = { ...pickupMaze, exit: { x: 3, y: 5 } };
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
    expect(state.body).toHaveLength(75);
    expect(state.growthPending).toBe(0);
    expect(state.widths[0]).toBe(growth ? 1.8 : 0.6);
    expect(state.steps * MOVE_MS).toBeLessThanOrEqual(120_000);
  });

  it("blocks the actual rock shortcut ON after two eggs while the same length fits OFF", () => {
    const body = [
      { x: 16, y: 11 },
      ...Array.from({ length: 15 }, (_, i) => ({ x: 16, y: 12 + i })),
      ...Array.from({ length: 14 }, (_, i) => ({ x: 15 - i, y: 26 })),
      ...Array.from({ length: 9 }, (_, i) => ({ x: 2, y: 25 - i })),
    ];
    const stateAtShortcut = (mode: boolean): SnakeState => ({
      ...startGame(newGame(mode)), eggs: BURROW.eggs.slice(2), direction: "up",
      body, widths: body.map(() => widthFor(mode, 2)),
    });
    expect(body).toHaveLength(39);
    expect(follow(stateAtShortcut(true), [["right", 5]]).collision).toBe("clearance");
    expect(follow(stateAtShortcut(false), [["right", 5]]).phase).toBe("playing");
  });

  it("keeps four pickups and the larger growth payoff", () => {
    expect(BURROW.eggs).toHaveLength(4);
    expect(new Set(BURROW.eggs.map((egg) => `${egg.x},${egg.y}`)).size).toBe(4);
    expect(follow(startGame(newGame(true)), ESCAPE).body).toHaveLength(75);
  });

  it.each([true, false])("keeps a clearance route between every remaining objective at every width stage (%s)", (mode) => {
    for (let stage = 0; stage <= 4; stage++) {
      const from = stage === 0 ? BURROW.start[0] : BURROW.eggs[stage - 1];
      const pending = [from];
      const visited = new Set([`${from.x},${from.y}`]);
      for (let i = 0; i < pending.length; i++) {
        const cell = pending[i];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const next = { x: cell.x + dx, y: cell.y + dy };
          const key = `${next.x},${next.y}`;
          if (visited.has(key) || hitsWall(BURROW.rows, cell, next, widthFor(mode, stage))) continue;
          visited.add(key);
          pending.push(next);
        }
      }
      for (const target of [...BURROW.eggs.slice(stage), BURROW.exit]) {
        expect(visited.has(`${target.x},${target.y}`), `stage ${stage}: target ${target.x},${target.y}`).toBe(true);
      }
    }
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
    expect(q("[data-eggs]").textContent).toBe("0 / 4");
    expect(q(".snake-pit-eggs").querySelectorAll("ellipse")).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
    q<HTMLButtonElement>("[data-action]").click();
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("playing");
    expect(q<HTMLInputElement>("[data-mechanic='width-growth']").disabled).toBe(true);
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
    vi.advanceTimersByTime(MOVE_MS * 1 + 16);
    q<HTMLButtonElement>("[data-direction='down']").click();
    vi.advanceTimersByTime(MOVE_MS * 1.5);
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("playing");
    for (const segment of q("[data-snake]").querySelectorAll("polyline")) {
      const points = segment.getAttribute("points")!.split(" ").map((point) => point.split(",").map(Number));
      for (let i = 1; i < points.length; i++) {
        expect(points[i][0] === points[i - 1][0] || points[i][1] === points[i - 1][1]).toBe(true);
      }
    }
  });

  it("shows the collision and a reflection question after a loss", () => {
    const { q } = setup();
    q<HTMLButtonElement>("[data-action]").click();
    vi.advanceTimersByTime(MOVE_MS * 24);
    expect(q("[data-phase]").getAttribute("data-phase")).toBe("lost");
    expect(q("[data-status]").textContent).toMatch(/rock|boundary/i);
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
    expect(q("[data-eggs]").textContent).toBe("4 / 4");
    expect(q("[data-length]").textContent).toBe("75");
    expect(q("[data-width]").textContent).toBe(growth ? "1.8" : "0.6");
    expect(q("[data-status]").textContent).toContain("Escaped in 0:42");
    expect(Number(q("[data-head]").getAttribute("r"))).toBe((growth ? 1.8 : 0.6) / 2);
    expect(q("[data-shortcut]").getAttribute("data-closed")).toBe(String(growth));
    for (const segment of q("[data-snake]").querySelectorAll("polyline")) {
      expect(Number(segment.getAttribute("stroke-width"))).toBeGreaterThanOrEqual(0.6);
      expect(Number(segment.getAttribute("stroke-width"))).toBeLessThanOrEqual(growth ? 1.8 : 0.6);
    }
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
