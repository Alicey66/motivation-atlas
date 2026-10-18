// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { calmGarden } from "../src/minigames/calm-garden";
import {
  ACTION_MS, LIMIT_MS, PLOT_COUNT, advanceGarden, createGarden,
  remainingMs, startGarden, tendPlot,
} from "../src/minigames/calm-garden/game";

function finishGarden(timed: boolean) {
  let state = startGarden(createGarden(timed), 0);
  let now = 0;
  for (let plot = 0; plot < PLOT_COUNT; plot++) {
    for (let step = 0; step < 3; step++) {
      state = tendPlot(state, plot, now);
      now += ACTION_MS;
      state = advanceGarden(state, now);
    }
  }
  return state;
}

describe("Calm Garden rules", () => {
  it("starts with twelve untouched plots and the approved timing", () => {
    const state = createGarden();
    expect(PLOT_COUNT).toBe(12);
    expect(ACTION_MS).toBe(1500);
    expect(LIMIT_MS).toBe(75000);
    expect(state.plots).toEqual(Array(12).fill(0));
    expect(state.status).toBe("ready");
    expect(state.timed).toBe(false);
    expect(state.active).toBeNull();
    expect(remainingMs(state, 100000)).toBeNull();
  });

  it("waits for Start before accepting work or starting the deadline", () => {
    const ready = createGarden(true);
    expect(tendPlot(ready, 0, 10000)).toBe(ready);
    expect(advanceGarden(ready, 100000)).toBe(ready);
    expect(remainingMs(ready, 100000)).toBe(75000);
    const playing = startGarden(ready, 10000);
    expect(playing.deadline).toBe(85000);
    expect(startGarden(playing, 20000)).toBe(playing);
  });

  it("advances weeds, seeds, and watering only after each full action", () => {
    let state = startGarden(createGarden(), 0);
    for (let stage = 0; stage < 3; stage++) {
      const before = state;
      state = tendPlot(state, 4, stage * ACTION_MS);
      expect(before.active).toBeNull();
      expect(state.plots[4]).toBe(stage);
      expect(advanceGarden(state, (stage + 1) * ACTION_MS - 1).plots[4]).toBe(stage);
      state = advanceGarden(state, (stage + 1) * ACTION_MS);
      expect(state.plots[4]).toBe(stage + 1);
      expect(state.active).toBeNull();
    }
    expect(tendPlot(state, 4, 5000)).toBe(state);
    expect(state.plots.filter(stage => stage === 3)).toHaveLength(1);
  });

  it("allows any plot order but prevents overlapping or queued actions", () => {
    const state = tendPlot(startGarden(createGarden(), 0), 11, 0);
    expect(tendPlot(state, 0, 500)).toBe(state);
    expect(tendPlot(state, 11, 500)).toBe(state);
    expect(advanceGarden(state, 100000).plots).toEqual([...Array(11).fill(0), 1]);
  });

  it.each([-1, 12, 0.5, NaN])("ignores invalid plot index %s", plot => {
    const state = startGarden(createGarden(), 0);
    expect(tendPlot(state, plot, 0)).toBe(state);
  });

  it("has identical plot progression in both modes before the deadline", () => {
    let relaxed = startGarden(createGarden(false), 0);
    let timed = startGarden(createGarden(true), 0);
    for (let action = 0; action < 20; action++) {
      const now = action * ACTION_MS;
      const plot = Math.floor(action / 3);
      relaxed = advanceGarden(tendPlot(relaxed, plot, now), now + ACTION_MS);
      timed = advanceGarden(tendPlot(timed, plot, now), now + ACTION_MS);
      expect(timed.plots).toEqual(relaxed.plots);
      expect(timed.active).toEqual(relaxed.active);
      expect(timed.status).toBe(relaxed.status);
    }
  });

  it("never expires relaxed play, even after a long pause", () => {
    const state = startGarden(createGarden(), 0);
    expect(advanceGarden(state, 999999999).status).toBe("playing");
    expect(tendPlot(state, 2, 999999999).active?.plot).toBe(2);
  });

  it("expires at exactly 75 seconds and retains partial work", () => {
    let state = startGarden(createGarden(true), 0);
    state = advanceGarden(tendPlot(state, 0, 0), ACTION_MS);
    expect(advanceGarden(state, LIMIT_MS - 1).status).toBe("playing");
    expect(remainingMs(state, LIMIT_MS - 1)).toBe(1);
    state = advanceGarden(state, LIMIT_MS);
    expect(state.status).toBe("timeout");
    expect(state.plots[0]).toBe(1);
    expect(remainingMs(state, 999999)).toBe(0);
    expect(tendPlot(state, 1, LIMIT_MS)).toBe(state);
  });

  it.each([LIMIT_MS, LIMIT_MS + 1])("does not credit an action finishing at or after the deadline (%s)", end => {
    const state = tendPlot(startGarden(createGarden(true), 0), 0, end - ACTION_MS);
    const expired = advanceGarden(state, end);
    expect(expired.status).toBe("timeout");
    expect(expired.plots[0]).toBe(0);
    expect(expired.active).toBeNull();
  });

  it("credits work completed before the deadline despite a delayed callback", () => {
    const state = tendPlot(startGarden(createGarden(true), 0), 0, LIMIT_MS - ACTION_MS - 1);
    const expired = advanceGarden(state, LIMIT_MS + 10000);
    expect(expired.status).toBe("timeout");
    expect(expired.plots[0]).toBe(1);
  });

  it.each([false, true])("ends on full completion with the time limit set to %s", timed => {
    const state = finishGarden(timed);
    expect(state.status).toBe("complete");
    expect(state.plots).toEqual(Array(12).fill(3));
    expect(state.endedAt).toBe(54000);
    expect(advanceGarden(state, 999999)).toBe(state);
    expect(tendPlot(state, 0, 55000)).toBe(state);
    expect(remainingMs(state, 999999)).toBe(timed ? 21000 : null);
  });

  it("preserves early completion when the final callback arrives after the deadline", () => {
    let state = startGarden(createGarden(true), 0);
    for (let action = 0; action < 35; action++) {
      state = advanceGarden(tendPlot(state, Math.floor(action / 3), action * ACTION_MS), (action + 1) * ACTION_MS);
    }
    state = tendPlot(state, 11, 52500);
    expect(advanceGarden(state, 100000).status).toBe("complete");
  });

  it("creates independent gardens without mutating previous states", () => {
    const first = createGarden(true);
    const playing = startGarden(first, 0);
    const next = advanceGarden(tendPlot(playing, 0, 0), ACTION_MS);
    expect(first.status).toBe("ready");
    expect(playing.plots[0]).toBe(0);
    expect(next.plots[0]).toBe(1);
    expect(createGarden(true)).toEqual(first);
  });
});

const cleanups: Array<() => void> = [];
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function mountGarden(timed = false) {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  vi.spyOn(performance, "now").mockImplementation(() => Date.now());
  const el = document.createElement("div");
  document.body.append(el);
  const unmount = calmGarden.mount(el);
  cleanups.push(() => { unmount(); el.remove(); });
  const q = <T extends HTMLElement = HTMLElement>(selector: string) => el.querySelector<T>(selector)!;
  const toggle = q<HTMLInputElement>("[data-mechanic='time-limit']");
  if (timed) toggle.click();
  return {
    el, q, toggle, unmount,
    start: () => q<HTMLButtonElement>("[data-start]").click(),
    restart: () => q<HTMLButtonElement>("[data-restart]").click(),
    plot: (index: number) => q<HTMLButtonElement>(`[data-plot='${index}'] button`),
  };
}

describe("Calm Garden interface", () => {
  it("mounts the registered garden with twelve accessible plots and no active timers", () => {
    const { el, q, toggle } = mountGarden();
    expect(calmGarden.slug).toBe("calm-garden");
    expect(calmGarden.author).toBe("RuaJ77");
    expect(calmGarden.motivators).toEqual(["submission"]);
    expect(el.querySelectorAll("[data-plot]")).toHaveLength(12);
    expect(toggle.checked).toBe(false);
    expect(toggle.closest("label")?.textContent).toContain("Time limit: 75 seconds");
    expect(q("[data-countdown]").hidden).toBe(true);
    expect(q("[data-reflection]").hidden).toBe(true);
    expect(q("[data-status]").textContent).toContain("Start garden");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not allow tending before Start", () => {
    const { plot, q } = mountGarden();
    plot(0).click();
    vi.advanceTimersByTime(ACTION_MS);
    expect(q("[data-plot='0']").dataset.stage).toBe("0");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows the selected countdown but does not consume it before Start", () => {
    const { q, start } = mountGarden(true);
    expect(q("[data-countdown]").hidden).toBe(false);
    expect(q("[data-countdown]").textContent).toContain("1:15");
    vi.advanceTimersByTime(90000);
    expect(q("[data-countdown]").textContent).toContain("1:15");
    start();
    vi.advanceTimersByTime(5000);
    expect(q("[data-countdown]").textContent).toContain("1:10");
  });

  it("locks the mode during play and restores it if a change event is forced", () => {
    const { start, toggle, q } = mountGarden(true);
    start();
    expect(toggle.disabled).toBe(true);
    toggle.checked = false;
    toggle.dispatchEvent(new Event("change"));
    expect(toggle.checked).toBe(true);
    vi.advanceTimersByTime(LIMIT_MS);
    expect(q("[data-status]").textContent).toContain("Time’s up");
  });

  it("keeps plot focus while tending and advances the next action after 1.5 seconds", () => {
    const { start, plot, q } = mountGarden();
    start();
    const button = plot(0);
    button.focus();
    button.click();
    plot(1).click();
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(q("[data-status]").textContent).toContain("Removing weeds");
    vi.advanceTimersByTime(1499);
    expect(q("[data-plot='0']").dataset.stage).toBe("0");
    vi.advanceTimersByTime(1);
    expect(document.activeElement).toBe(button);
    expect(button.textContent).toBe("Plant seeds");
    expect(button.getAttribute("aria-label")).toContain("Plot 1");
    expect(q("[data-plot='0']").dataset.stage).toBe("1");
    expect(q("[data-plot='1']").dataset.stage).toBe("0");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps relaxed play available after a long idle period without idle timers", () => {
    const { start, plot, q } = mountGarden();
    start();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(3600000);
    plot(0).click();
    vi.advanceTimersByTime(ACTION_MS);
    expect(q("[data-plot='0']").dataset.stage).toBe("1");
    expect(q("[data-countdown]").hidden).toBe(true);
  });

  it.each([false, true])("finishes the whole garden and reveals reflection (timed: %s)", timed => {
    const { start, plot, q } = mountGarden(timed);
    start();
    for (let index = 0; index < 12; index++) {
      for (let stage = 0; stage < 3; stage++) {
        plot(index).click();
        vi.advanceTimersByTime(ACTION_MS);
      }
    }
    expect(q("[data-status]").textContent).toContain("Garden complete");
    expect(q("[data-completed]").textContent).toContain("12 of 12");
    expect(q("[data-reflection]").hidden).toBe(false);
    expect(q("[data-reflection]").textContent).toContain("What did you feel");
    expect(q("[data-reflection]").textContent).toContain("countdown");
    expect(vi.getTimerCount()).toBe(0);
    plot(0).click();
    start();
    expect(q("[data-status]").textContent).toContain("Garden complete");
  });

  it("times out with partial progress, stops work, and reveals reflection", () => {
    const { start, plot, q } = mountGarden(true);
    start();
    plot(0).click();
    vi.advanceTimersByTime(ACTION_MS);
    vi.advanceTimersByTime(LIMIT_MS - ACTION_MS - 500);
    plot(0).click();
    vi.advanceTimersByTime(500);
    expect(q("[data-status]").textContent).toContain("Time’s up");
    expect(q("[data-status]").textContent).toContain("1 of 36");
    expect(q("[data-plot='0']").dataset.stage).toBe("1");
    expect(q("[data-reflection]").hidden).toBe(false);
    expect(q("[data-countdown]").textContent).toContain("0:00");
    expect(vi.getTimerCount()).toBe(0);
    plot(1).click();
    vi.advanceTimersByTime(ACTION_MS);
    expect(q("[data-plot='1']").dataset.stage).toBe("0");
  });

  it.each([false, true])("restart cancels pending work and restores ready state (timed: %s)", timed => {
    const { start, plot, restart, q, toggle } = mountGarden(timed);
    start();
    plot(0).click();
    vi.advanceTimersByTime(500);
    restart();
    expect(vi.getTimerCount()).toBe(0);
    expect(toggle.checked).toBe(timed);
    expect(toggle.disabled).toBe(false);
    expect(q("[data-status]").textContent).toContain("Start garden");
    vi.advanceTimersByTime(100000);
    expect(q("[data-plot='0']").dataset.stage).toBe("0");
    toggle.click();
    start();
    expect(q("[data-countdown]").hidden).toBe(timed);
  });

  it.each(["complete", "timeout"])("can restart after %s", ending => {
    const { start, restart, plot, q } = mountGarden(true);
    start();
    if (ending === "complete") {
      for (let action = 0; action < 36; action++) {
        plot(Math.floor(action / 3)).click();
        vi.advanceTimersByTime(ACTION_MS);
      }
    } else vi.advanceTimersByTime(LIMIT_MS);
    restart();
    expect(q("[data-reflection]").hidden).toBe(true);
    expect(q("[data-countdown]").textContent).toContain("1:15");
    start();
    expect(q("[data-status]").textContent).not.toContain("Time’s up");
  });

  it("unmount cancels timers and removes listeners even on retained controls", () => {
    const { start, plot, toggle, unmount, el, q } = mountGarden(true);
    const startButton = q<HTMLButtonElement>("[data-start]");
    const restartButton = q<HTMLButtonElement>("[data-restart]");
    const plotButton = plot(0);
    start();
    plotButton.click();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(el.childNodes).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    restartButton.click();
    toggle.dispatchEvent(new Event("change"));
    startButton.click();
    plotButton.click();
    vi.advanceTimersByTime(100000);
    expect(el.childNodes).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    unmount();
  });

  it("keeps two mounted gardens independent", () => {
    const first = mountGarden();
    const second = mountGarden(true);
    first.start();
    second.start();
    first.plot(2).click();
    vi.advanceTimersByTime(ACTION_MS);
    expect(first.q("[data-plot='2']").dataset.stage).toBe("1");
    expect(second.q("[data-plot='2']").dataset.stage).toBe("0");
    first.unmount();
    vi.advanceTimersByTime(LIMIT_MS);
    expect(second.q("[data-status]").textContent).toContain("Time’s up");
  });
});

describe("Calm Garden documentation", () => {
  it("quotes the Submission note verbatim and records only the supplied AI decision", () => {
    const note = readFileSync("content/player-motivations.md", "utf8");
    const readme = readFileSync("src/minigames/calm-garden/README.md", "utf8");
    const quote = 'Rhythmic repetition, "the meditative patterns of Tetris" (Salen and Zimmerman 2003, ch. 24, "Patterns of Pleasure").';
    expect(note).toContain(quote);
    expect(readme).toContain(quote);
    for (const section of ["Mechanic", "Dynamic", "Aesthetic", "Sources"]) expect(readme).toContain(`## ${section}`);
    expect(readme).toContain("two-second");
    expect(readme).toContain("90-second");
    expect(readme).toContain("1.5-second");
    expect(readme).toContain("75-second");
    expect(readme).toContain("hypotheses");
    expect(readme).toContain("another player");
  });
});
