import { h } from "../../lib/dom";
import type { Minigame } from "../types";
import { CELLS, LIVES, ROUND_MS, expire, newGame, tap, tick, type SpeedUpOptions, type SpeedUpState } from "./game";
import "./speed-up.css";

/** Quoted exactly from the Sensation section of the note. */
export const ESCALATION =
  "Escalation: invaders that speed up as you destroy them (Schell 2019, p. 56), or missiles raining down until you lose (Salen and Zimmerman 2003, ch. 24, \"The Role of the Goal\").";

function mount(el: HTMLElement): () => void {
  let options: SpeedUpOptions = { escalation: true };
  let state: SpeedUpState = { ...newGame(options), over: true };
  let started = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let litAt = 0;

  const escalation = h("input", { type: "checkbox", "data-mechanic": "escalation", checked: true });
  const hits = h("span", { class: "su-num", "data-hits": "" }, "0");
  const lives = h("span", { class: "su-num", "data-lives": "" }, String(LIVES));
  const clock = h("span", { class: "su-num", "data-clock": "" }, String(ROUND_MS / 1000));
  const speed = h("span", { class: "su-num", "data-window": "" }, "–");
  const status = h("p", { class: "su-status", "aria-live": "polite", "data-status": "" });
  const cells = Array.from({ length: CELLS }, (_, i) =>
    h("button", { type: "button", class: "su-cell", "data-cell": String(i), "aria-label": `Cell ${i + 1}` }, String(i + 1)));
  const grid = h("div", { class: "su-grid" }, ...cells);
  const startBtn = h("button", { type: "button", class: "su-btn", "data-start": "" }, "Start round");

  const root = h("div", { class: "speed-up" },
    h("div", { class: "su-stats" },
      h("div", {}, h("span", { class: "su-label" }, "Hits"), hits),
      h("div", {}, h("span", { class: "su-label" }, "Lives"), lives),
      h("div", {}, h("span", { class: "su-label" }, "Seconds"), clock),
      h("div", {}, h("span", { class: "su-label" }, "Target stays (ms)"), speed),
    ),
    grid, status,
    h("fieldset", { class: "su-mechanics" },
      h("legend", {}, "Mechanic, applied when you start a round"),
      h("label", {}, escalation, " Escalation: the target speeds up with every hit"),
      startBtn,
    ),
    h("section", { class: "su-panel" },
      h("h4", {}, "What the source says emerges"),
      h("p", {}, ESCALATION),
    ),
    h("section", { class: "su-reflect" },
      h("h4", {}, "Then check it against your own play"),
      h("ul", {},
        h("li", {}, "What did you feel in the last ten seconds of the round?"),
        h("li", {}, "Turn escalation off, play again, and notice what changed: in what you did, and in how it felt."),
        h("li", {}, "Did your experience match what the source says emerges? Where did it differ?"),
      ),
    ),
  );
  el.append(root);

  function message(): string {
    if (!started) return "Tap the lit cell before it moves. Keys 1 to 9 work too.";
    if (!state.over) return options.escalation ? "Every hit makes it faster." : "Same speed all round.";
    const why = state.misses >= LIVES ? "Out of lives." : "Time's up.";
    return `${why} ${state.hits} hits. Toggle the mechanic and play again.`;
  }

  function render(): void {
    hits.textContent = String(state.hits);
    lives.textContent = String(LIVES - state.misses);
    clock.textContent = String(Math.ceil(state.timeLeft / 1000));
    speed.textContent = started ? String(state.window) : "–";
    status.textContent = message();
    cells.forEach((c, i) => {
      const lit = started && !state.over && i === state.target;
      c.classList.toggle("lit", lit);
      c.setAttribute("aria-pressed", String(lit));
    });
    startBtn.textContent = started ? "New round" : "Start round";
  }

  function stop(): void {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function schedule(): void {
    stop();
    if (state.over) return;
    litAt = Date.now();
    timer = setTimeout(() => {
      timer = null;
      state = expire(state);
      render();
      schedule();
    }, state.window);
  }

  function press(cell: number): void {
    if (!started || state.over) return;
    state = tick(state, Date.now() - litAt);
    if (!state.over) state = tap(state, cell);
    render();
    schedule();
  }

  cells.forEach((c, i) => c.addEventListener("click", () => press(i)));
  root.addEventListener("keydown", (e) => {
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= CELLS) { e.preventDefault(); press(n - 1); }
  });
  startBtn.addEventListener("click", () => {
    options = { escalation: escalation.checked };
    state = newGame(options);
    started = true;
    render();
    schedule();
  });

  render();
  return () => {
    stop();
    root.remove();
  };
}

export const speedUp: Minigame = {
  slug: "speed-up",
  title: "Speed-up: escalation",
  motivators: ["sensation"],
  author: "joshuahkung",
  mount,
};
