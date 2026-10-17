// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { canOpen, newHunt, openChest, remainingMs, rewardFor, ROUND_MS } from "../src/minigames/treasure-hunt/game";
import { treasureHunt } from "../src/minigames/treasure-hunt";

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe("Treasure Hunt central rule", () => {
  it("switches uncertain rewards to a fixed 10 while preserving expected value", () => {
    const samples = [0, 1 / 3, 2 / 3];
    expect(samples.map((sample) => rewardFor(true, sample))).toEqual([30, 0, 0]);
    expect(samples.map((sample) => rewardFor(false, sample))).toEqual([10, 10, 10]);
    expect(samples.reduce((sum, sample) => sum + rewardFor(true, sample), 0) / 3).toBe(10);
    expect(openChest(newHunt(true, 0), 0, .9).score).toBe(0);
    expect(openChest(newHunt(false, 0), 0, .9).score).toBe(10);
  });

  it("blocks rapid repeat openings and ends at exactly 90 seconds", () => {
    let state = openChest(newHunt(false, 0), 0, .5);
    expect(openChest(state, 2999, .5)).toBe(state);
    expect(canOpen(state, 3000)).toBe(true);
    for (let now = 3000; now < ROUND_MS; now += 3000) state = openChest(state, now, .5);
    expect(state.opened).toBe(30);
    expect(state.score).toBe(300);
    expect(openChest(state, ROUND_MS, .1)).toBe(state);
    expect(remainingMs(state, ROUND_MS + 1000)).toBe(0);
  });

  it("does not mutate the previous state or grant a pity reward after misses", () => {
    const initial = newHunt(true, 0);
    const miss = openChest(initial, 0, .8);
    expect(initial.opened).toBe(0);
    expect(openChest(miss, 3000, .8).lastReward).toBe(0);
    expect(openChest(miss, 3000, .1).lastReward).toBe(30);
  });

  it("connects the toggle, ends the round, compares modes, and cleans up timers", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.spyOn(Math, "random").mockReturnValue(.9);
    const host = document.createElement("div");
    const unmount = treasureHunt.mount(host);
    const toggle = host.querySelector<HTMLInputElement>("[data-mechanic]")!;
    const start = host.querySelector<HTMLButtonElement>("[data-start]")!;
    const open = host.querySelector<HTMLButtonElement>("[data-open]")!;
    expect(host.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
    start.click(); open.click();
    expect(host.querySelector("[data-score]")!.textContent).toBe("0");
    expect(toggle.disabled).toBe(true);
    vi.advanceTimersByTime(ROUND_MS);
    open.click();
    expect(host.querySelector("[data-opened]")!.textContent).toBe("1");
    expect(host.textContent).toContain("What did you feel?");
    toggle.checked = false;
    toggle.dispatchEvent(new Event("change"));
    start.click(); open.click(); open.click();
    expect(host.querySelector("[data-score]")!.textContent).toBe("10");
    vi.advanceTimersByTime(ROUND_MS);
    expect(host.querySelector("[data-results]")!.textContent).toContain("OFF — fixed");
    expect(host.querySelector("[data-results]")!.textContent).toContain("ON — random");
    start.click(); unmount();
    expect(host.childNodes).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
