import { h, s } from "../../lib/dom";
import type { Minigame } from "../types";
import { ACTION_MS, PLOT_COUNT, advanceGarden, createGarden, remainingMs, startGarden, tendPlot, type PlotStage } from "./game";
import "./calm-garden.css";

const ACTIONS = ["Remove weeds", "Plant seeds", "Water plants", "Complete"];
const TENDING = ["Removing weeds", "Planting seeds", "Watering plants"];
const STAGES = ["Weedy", "Soil cleared", "Seeds planted", "Watered & blooming"];

/** Original, decorative garden drawings; state and controls always have text labels. */
function gardenArt(stage: PlotStage): SVGSVGElement {
  const art = s("svg", { viewBox: "0 0 160 90", "aria-hidden": "true", focusable: "false", class: "calm-garden-art" });
  art.append(s("ellipse", { cx: 80, cy: 74, rx: 65, ry: 10, class: "calm-garden-soil" }));
  for (const x of [42, 80, 118]) {
    if (stage === 0) {
      art.append(s("path", { d: `M${x} 73l-5-24m5 24l8-32m-7 20l-14-8m13 3l13-7`, class: "calm-garden-weed" }));
    } else if (stage === 1) {
      art.append(s("path", { d: `M${x - 10} 72q10-8 20 0`, class: "calm-garden-furrow" }));
    } else {
      const top = stage === 3 ? 32 : 60;
      art.append(
        s("path", { d: `M${x} 74V${top}`, class: "calm-garden-stem" }),
        s("path", { d: `M${x} ${top + 15}q-21 0-18-12q18-2 18 12m0 7q21 0 18-12q-18-2-18 12`, class: "calm-garden-leaf" }),
      );
      if (stage === 3) {
        for (const [dx, dy] of [[-7, 0], [7, 0], [0, -7], [0, 7]]) {
          art.append(s("circle", { cx: x + dx, cy: top + dy, r: 7, class: "calm-garden-petal" }));
        }
        art.append(s("circle", { cx: x, cy: top, r: 4, class: "calm-garden-flower" }));
      }
    }
  }
  return art;
}

// Follows the template's mount/export contract; all state belongs to this mount.
function mount(el: HTMLElement): () => void {
  let state = createGarden();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  const listeners: Array<() => void> = [];

  const toggle = h("input", { type: "checkbox", "data-mechanic": "time-limit" });
  const start = h("button", { type: "button", class: "calm-garden-button", "data-start": "" }, "Start garden");
  const restart = h("button", { type: "button", class: "calm-garden-button calm-garden-secondary", "data-restart": "" }, "Restart");
  const mode = h("strong", { class: "calm-garden-mode" });
  const countdown = h("span", { "data-countdown": "", role: "timer", "aria-live": "off" });
  const completed = h("span", { "data-completed": "" });
  const totalProgress = h("progress", { max: PLOT_COUNT * 3, value: 0, "aria-label": "Garden actions completed" });
  const status = h("p", { class: "calm-garden-status", "data-status": "", role: "status", "aria-live": "polite", "aria-atomic": "true" });
  const actionProgress = h("progress", { max: ACTION_MS, value: 0, "aria-label": "Current tending action" });
  const actionLabel = h("span", {}, "One plot at a time · 1.5 seconds per action");
  const modeHint = h("p", { class: "calm-garden-hint" });
  const grid = h("ol", { class: "calm-garden-grid", "aria-label": "Twelve garden plots" });
  const plots = Array.from({ length: PLOT_COUNT }, (_, index) => {
    const art = h("div", { class: "calm-garden-picture" });
    const stage = h("span", { class: "calm-garden-stage" });
    const button = h("button", { type: "button", class: "calm-garden-button" });
    const card = h("li", { class: "calm-garden-plot", "data-plot": index },
      h("span", { class: "calm-garden-plot-number" }, `Plot ${index + 1}`), art, stage, button,
    );
    grid.append(card);
    return { art, stage, button, card };
  });
  const reflection = h("section", { class: "calm-garden-reflection", "data-reflection": "", "aria-label": "Reflect on your garden" },
    h("h4", {}, "Then check it against your own play"),
    h("p", {}, "Restart and try the other mode with the same garden. These questions are for you; no answers are collected."),
    h("ul", {},
      h("li", {}, "What did you feel while tending without a timer?"),
      h("li", {}, "What changed in your actions and feelings with the countdown enabled?"),
      h("li", {}, "Did repetition feel soothing, satisfying, boring, or something else?"),
      h("li", {}, "Did either mode help you disengage from thoughts outside the game?"),
    ),
  );
  const root = h("div", { class: "calm-garden", role: "group", "aria-label": "Calm Garden" },
    h("div", { class: "calm-garden-intro" },
      h("span", { class: "calm-garden-eyebrow" }, "A little tending, one plot at a time"),
      h("p", {}, "Choose a plot. Remove weeds, plant seeds, then water. Every finished plot becomes a small patch of flowers."),
    ),
    h("fieldset", { class: "calm-garden-controls" },
      h("legend", {}, "Choose your pace"),
      h("label", { class: "calm-garden-toggle" }, toggle, " Time limit: 75 seconds"),
      modeHint,
      h("div", { class: "calm-garden-actions" }, start, restart),
    ),
    h("div", { class: "calm-garden-summary" }, mode, countdown, completed, totalProgress),
    status,
    h("div", { class: "calm-garden-tending" }, actionLabel, actionProgress),
    grid, reflection,
  );
  el.append(root);

  function listen(element: HTMLElement, event: "click" | "change", handler: () => void): void {
    element.addEventListener(event, handler);
    listeners.push(() => element.removeEventListener(event, handler));
  }

  function cancelTimer(): void {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function render(now: number): void {
    const count = state.plots.filter(stage => stage === 3).length;
    const actions = state.plots.reduce<number>((sum, stage) => sum + stage, 0);
    const ended = state.status === "complete" || state.status === "timeout";
    root.dataset.state = state.status;
    toggle.checked = state.timed;
    toggle.disabled = state.status !== "ready";
    start.setAttribute("aria-disabled", String(state.status !== "ready"));
    mode.textContent = state.timed ? "Timed Mode" : "Relaxed Mode · no time limit";
    modeHint.textContent = state.status === "ready"
      ? "Only the deadline changes. Choose a mode, then start."
      : "Restart to reset the garden and choose either mode.";
    const remaining = remainingMs(state, now);
    countdown.hidden = remaining === null;
    if (remaining !== null) {
      const seconds = Math.ceil(remaining / 1000);
      countdown.textContent = `Time left: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    }
    completed.textContent = `${count} of ${PLOT_COUNT} plots complete · ${actions} of ${PLOT_COUNT * 3} actions`;
    totalProgress.value = actions;
    let message = "Choose a mode, then press Start garden.";
    if (state.status === "complete") message = "Garden complete. Take a moment to enjoy what you tended.";
    else if (state.status === "timeout") message = `Time’s up. You completed ${count} of ${PLOT_COUNT} plots and ${actions} of ${PLOT_COUNT * 3} actions. Your work stays here to enjoy.`;
    else if (state.active) message = `${TENDING[state.plots[state.active.plot]]} on plot ${state.active.plot + 1}…`;
    else if (state.status === "playing") message = "Choose a plot for its next action. Nothing in the garden deteriorates.";
    // Avoid announcing the same status on every visual clock update.
    if (status.textContent !== message) status.textContent = message;
    reflection.hidden = !ended;
    actionProgress.hidden = state.active === null;
    actionProgress.value = state.active ? Math.max(0, ACTION_MS - (state.active.endsAt - now)) : 0;
    actionLabel.textContent = state.active ? "Tending… let this action finish before choosing the next." : "One plot at a time · 1.5 seconds per action";
    plots.forEach(({ art, stage, button, card }, index) => {
      const value = state.plots[index];
      if (card.dataset.stage !== String(value)) {
        card.dataset.stage = String(value);
        art.replaceChildren(gardenArt(value));
        stage.textContent = STAGES[value];
      }
      card.dataset.tending = String(state.active?.plot === index);
      button.textContent = ACTIONS[value];
      button.setAttribute("aria-label", `Plot ${index + 1}: ${ACTIONS[value]}`);
      // Keep the element focusable, as Pig does, but guard every action in the rules.
      button.setAttribute("aria-disabled", String(state.status !== "playing" || state.active !== null || value === 3));
    });
  }

  function update(): void {
    cancelTimer();
    if (disposed) return;
    const now = performance.now();
    state = advanceGarden(state, now);
    render(now);
    if (state.status === "playing" && (state.active || state.timed)) {
      const nextEvent = Math.min(state.active?.endsAt ?? Infinity, state.deadline ?? Infinity);
      timer = setTimeout(update, Math.min(100, Math.max(1, nextEvent - now)));
    }
  }

  listen(toggle, "change", () => {
    if (state.status === "ready") state = createGarden(toggle.checked);
    update();
  });
  listen(start, "click", () => {
    state = startGarden(state, performance.now());
    update();
  });
  listen(restart, "click", () => {
    cancelTimer();
    state = createGarden(state.timed);
    update();
  });
  plots.forEach(({ button }, index) => listen(button, "click", () => {
    state = tendPlot(state, index, performance.now());
    update();
  }));
  update();

  return () => {
    disposed = true;
    cancelTimer();
    listeners.splice(0).forEach(remove => remove());
    root.remove();
  };
}

export const calmGarden: Minigame = {
  slug: "calm-garden", title: "Calm Garden", motivators: ["submission"], author: "RuaJ77", mount,
};
