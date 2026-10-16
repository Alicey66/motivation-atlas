// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { fogScout } from "../src/minigames/fog-scout";
import { MAPS, SIZE, move, newGame, tileAt, type Direction, type ScoutState } from "../src/minigames/fog-scout/game";

const cleanups: Array<() => void> = [];
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  vi.useRealTimers();
});

// An independent breadth-first route finder supplies legal inputs to the rules/UI.
function route(map: number, from: number, to: number): Direction[] {
  const queue: Array<[number, Direction[]]> = [[from, []]];
  const seen = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const [position, path] = queue[i];
    if (position === to) return path;
    for (const [direction, dr, dc] of [["up", -1, 0], ["right", 0, 1], ["down", 1, 0], ["left", 0, -1]] as const) {
      const row = Math.floor(position / SIZE) + dr;
      const col = position % SIZE + dc;
      const next = row * SIZE + col;
      if (row < 0 || row >= SIZE || col < 0 || col >= SIZE || MAPS[map].rows[row][col] === "#" || seen.has(next)) continue;
      seen.add(next);
      queue.push([next, [...path, direction]]);
    }
  }
  throw new Error(`Map ${map}: ${to} is unreachable from ${from}`);
}

function walk(state: ScoutState, path: Direction[]): ScoutState {
  return path.reduce(move, state);
}

function winningRoute(map: number): Direction[] {
  const cells = [...MAPS[map].rows.join("")];
  const targets = cells.flatMap((tile, i) => tile === "R" ? [i] : []).concat(cells.indexOf("E"));
  let position = cells.indexOf("S");
  return targets.flatMap((target) => {
    const path = route(map, position, target);
    position = target;
    return path;
  });
}

function setup() {
  const el = document.createElement("div");
  document.body.append(el);
  const unmount = fogScout.mount(el);
  cleanups.push(() => { unmount(); el.remove(); });
  const q = <T extends HTMLElement = HTMLElement>(selector: string) => el.querySelector<T>(selector)!;
  return { el, unmount, q };
}

describe("Fog Scout's central visibility rule", () => {
  it("hides a distant relic and exit, while fog off reveals both", () => {
    expect(tileAt(newGame(true), 6)).toBe("unknown");
    expect(tileAt(newGame(true), 48)).toBe("unknown");
    expect(tileAt(newGame(false), 6)).toBe("relic");
    expect(tileAt(newGame(false), 48)).toBe("exit");
    expect([...newGame().revealed].sort()).toEqual([0, 1, 7]);
  });

  it("reveals four neighbors, not diagonals, and retains discoveries after retreat", () => {
    const original = newGame();
    const advanced = move(original, "right");
    expect(advanced.revealed).toEqual(expect.arrayContaining([0, 1, 2, 8]));
    expect(tileAt(original, 8)).toBe("unknown");
    expect(tileAt(advanced, 8)).toBe("wall");
    expect(tileAt(advanced, 9)).toBe("unknown");
    expect(tileAt(move(advanced, "left"), 8)).toBe("wall");
    expect(original.steps).toBe(0);
    expect(original.revealed).toEqual([0, 7, 1]);
  });

  it.each([0, 1])("changes only visibility, never movement, rewards or winning on map %i", (map) => {
    let hidden = newGame(true, map);
    let visible = newGame(false, map);
    for (const direction of winningRoute(map)) {
      hidden = move(hidden, direction);
      visible = move(visible, direction);
      expect({ ...hidden, fog: false }).toEqual(visible);
    }
    expect(hidden.won).toBe(true);
    expect(hidden.collected).toHaveLength(3);
  });
});

describe("Fog Scout movement and objectives", () => {
  it.each([0, 1])("map %i has exactly three relics and no unreachable floor tiles", (map) => {
    const rows = MAPS[map].rows;
    expect(rows).toHaveLength(SIZE);
    rows.forEach((row) => expect(row).toHaveLength(SIZE));
    const cells = [...rows.join("")];
    expect(cells.filter((tile) => tile === "R")).toHaveLength(3);
    expect(cells.filter((tile) => tile === "S")).toHaveLength(1);
    expect(cells.filter((tile) => tile === "E")).toHaveLength(1);
    cells.forEach((tile, i) => { if (tile !== "#") expect(() => route(map, 0, i)).not.toThrow(); });
  });

  it("blocks walls and edges without costing moves or wrapping rows", () => {
    const start = newGame();
    expect(move(start, "left")).toMatchObject({ position: 0, steps: 0, event: "edge" });
    expect(move(start, "up")).toMatchObject({ position: 0, steps: 0, event: "edge" });
    const nearWall = walk(start, ["right", "right"]);
    expect(move(nearWall, "right")).toMatchObject({ position: 2, steps: 2, event: "wall" });
    const leftEdge = move(start, "down");
    expect(move(leftEdge, "left").position).toBe(7);
  });

  it("collects a relic only once, and counts moves onto visited squares", () => {
    const first = walk(newGame(false), route(0, 0, 6));
    expect(first.collected).toEqual([6]);
    expect(tileAt(first, 6)).toBe("floor");
    const back = walk(first, ["left", "right"]);
    expect(back.collected).toEqual([6]);
    expect(back.steps).toBe(first.steps + 2);
    expect(back.backtracks).toBe(first.backtracks + 2);
  });

  it("requires all three relics at the exit, then freezes the completed round", () => {
    const earlyExit = walk(newGame(false), route(0, 0, 48));
    expect(earlyExit.won).toBe(false);
    expect(earlyExit.event).toBe("locked");
    const won = walk(newGame(), winningRoute(0));
    expect(won).toMatchObject({ won: true, position: 48, event: "escaped" });
    expect(move(won, "up")).toBe(won);
  });
});

describe("Fog Scout controls and evidence", () => {
  it("keeps undiscovered items out of visible text, labels and classes", () => {
    const { q, el } = setup();
    expect(q('[data-cell="6"]').getAttribute("aria-label")).toContain("unknown");
    expect(q('[data-cell="6"]').textContent).toBe("?");
    expect(el.querySelectorAll(".fs-relic, .fs-exit")).toHaveLength(0);
    q<HTMLInputElement>("[data-mechanic]").click();
    expect(el.querySelectorAll(".fs-unknown")).toHaveLength(0);
    expect(el.querySelectorAll(".fs-relic")).toHaveLength(3);
    expect(el.querySelectorAll(".fs-exit")).toHaveLength(1);
  });

  it("restarts when fog changes and preserves keyboard focus", () => {
    const { q } = setup();
    q<HTMLButtonElement>('[data-direction="right"]').click();
    const checkbox = q<HTMLInputElement>("[data-mechanic]");
    checkbox.focus();
    checkbox.click();
    expect(document.activeElement).toBe(checkbox);
    expect(q("[data-mode]").textContent).toBe("FOG OFF");
    expect(q("[data-steps]").textContent).toBe("0");
    checkbox.click();
    expect(q("[data-mode]").textContent).toBe("FOG ON");
    expect(q("[data-explored]").textContent).toBe("6%");
  });

  it("supports arrows and WASD only inside this game, without hijacking form controls", () => {
    const { q } = setup();
    const press = (target: HTMLElement, key: string) => target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    expect(press(q(".fs-board"), "ArrowRight")).toBe(false);
    press(q(".fs-board"), "D");
    expect(q("[data-steps]").textContent).toBe("2");
    press(document.body, "ArrowLeft");
    press(q("[data-mechanic]"), "ArrowLeft");
    expect(q("[data-steps]").textContent).toBe("2");
  });

  it("completes a round, records it once, asks for reflection, and resets correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-16T12:00:00Z"));
    const { q, el } = setup();
    const path = winningRoute(0);
    q<HTMLButtonElement>(`[data-direction="${path[0]}"]`).click();
    vi.advanceTimersByTime(75000);
    path.slice(1).forEach((direction) => q<HTMLButtonElement>(`[data-direction="${direction}"]`).click());
    expect(q("[data-result]").hidden).toBe(false);
    expect(q("[data-result]").textContent).toContain("What did you feel");
    expect(q("[data-history]").textContent).toContain("75s");
    expect(q("[data-relics]").textContent).toBe("3 / 3");
    q<HTMLButtonElement>('[data-direction="left"]').click();
    expect(el.querySelectorAll("[data-history] li")).toHaveLength(1);
    q<HTMLButtonElement>("[data-replay]").click();
    expect(q("[data-result]").hidden).toBe(true);
    expect(q("[data-relics]").textContent).toBe("0 / 3");
    expect(q("[data-steps]").textContent).toBe("0");
    expect(el.querySelectorAll("[data-history] li")).toHaveLength(1);
    q<HTMLButtonElement>("[data-fresh]").click();
    expect(q(".fs-map-name").textContent).toBe("Jade Archive");
    q<HTMLButtonElement>("[data-fresh]").click();
    expect(q(".fs-map-name").textContent).toBe("Amber Court");
  });

  it("unmounts listeners and DOM, and keeps two instances independent", () => {
    vi.useFakeTimers();
    const a = setup();
    const b = setup();
    const button = a.q<HTMLButtonElement>('[data-direction="right"]');
    const steps = a.q("[data-steps]");
    button.click();
    expect(b.q("[data-steps]").textContent).toBe("0");
    a.unmount();
    button.click();
    expect(steps.textContent).toBe("1");
    expect(a.el.childNodes).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
