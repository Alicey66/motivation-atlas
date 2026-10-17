import { h } from "../../lib/dom";
import type { Minigame } from "../types";
import { canOpen, newHunt, openChest, remainingMs, TARGET, type HuntState } from "./game";
import "./treasure-hunt.css";

function mount(el: HTMLElement): () => void {
  let state: HuntState | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  const results: string[] = [];
  const random = h("input", { type: "checkbox", checked: true, "data-mechanic": "random-rewards" });
  const odds = h("p", { class: "hunt-odds" });
  const clock = h("span", { "data-clock": "" }, "90s");
  const score = h("output", { "data-score": "", "aria-label": "Coins collected" }, "0");
  const opened = h("span", { "data-opened": "" }, "0");
  const status = h("p", { role: "status", class: "hunt-result" }, "Choose your reward rule, then start your expedition.");
  const wait = h("p", { class: "hunt-wait" }, "A new chest is ready every 3 seconds after you open one.");
  const start = h("button", { type: "button", "data-start": "" }, "Start 90-second expedition");
  const open = h("button", { type: "button", "data-open": "", "aria-disabled": "true" }, "Open chest");
  const history = h("ol", { class: "hunt-history", "aria-label": "Last six chests" });
  const comparisons = h("ul", { "data-results": "" });
  const reflection = h("section", { class: "hunt-reflect", hidden: true },
    h("h4", {}, "What did you feel?"),
    h("p", {}, "What did you do after an empty chest or a big reward? Did you want to keep opening?"),
    h("p", {}, "Change the checkbox and play again. Did fixed rewards feel calmer, duller, or something else? Did your experience match the course note?"),
    h("p", {}, "Both rules average 10 coins per opening. Random rewards can finish above or below that average; a short round does not guarantee equal totals."), comparisons,
  );
  const root = h("div", { class: "treasure-hunt" },
    h("fieldset", {}, h("legend", {}, "One mechanic: reward uncertainty"),
      h("label", {}, random, " Random rewards (applies to your next expedition)"), odds),
    h("p", { class: "hunt-scoreboard" }, "Coins: ", score, ` / ${TARGET} goal · Time: `, clock, " · Chests: ", opened),
    h("p", {}, `Find ${TARGET} coins before time runs out. Each chest has the same odds; there are no hidden clues or better choices.`),
    h("div", { class: "hunt-actions" }, start, open), status, wait,
    h("h4", {}, "Recent finds"), history, reflection,
  );
  el.append(root);

  function showOdds(): void {
    odds.textContent = random.checked
      ? "ON: each chest independently gives 30 coins with a 1-in-3 chance, otherwise 0. Average: 10 coins."
      : "OFF: every chest gives exactly 10 coins. Average: 10 coins.";
  }

  function draw(): void {
    if (!state) return;
    const now = Date.now();
    const left = remainingMs(state, now);
    clock.textContent = `${Math.ceil(left / 1000)}s`;
    score.textContent = String(state.score);
    opened.textContent = String(state.opened);
    open.setAttribute("aria-disabled", String(!canOpen(state, now)));
    wait.textContent = left === 0 ? "Expedition complete. Switch the rule and try another round."
      : canOpen(state, now) ? "Chest ready! Open it when you want."
        : `Next chest in ${Math.ceil((state.nextChestAt - now) / 1000)}s.`;
    if (left === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
      random.disabled = false;
      start.disabled = false;
      start.textContent = "Start another expedition";
      status.textContent = `${state.score >= TARGET ? "Goal reached!" : "Time is up."} You found ${state.score} coins in ${state.opened} chests (${state.randomRewards ? "random" : "fixed"} rewards).`;
      results.unshift(`${state.randomRewards ? "ON — random" : "OFF — fixed"}: ${state.score} coins, ${state.opened} chests; expected coins for those openings: ${state.opened * 10}.`);
      comparisons.replaceChildren(...results.slice(0, 4).map((result) => h("li", {}, result)));
      reflection.hidden = false;
    }
  }

  random.addEventListener("change", showOdds);
  start.addEventListener("click", () => {
    if (timer !== null) return;
    state = newHunt(random.checked, Date.now());
    random.disabled = true;
    start.disabled = true;
    history.replaceChildren();
    reflection.hidden = true;
    status.textContent = "Your expedition has started. Your first chest is ready.";
    timer = setInterval(draw, 200);
    draw();
  });
  open.addEventListener("click", () => {
    if (!state || !canOpen(state, Date.now())) return;
    state = openChest(state, Date.now(), Math.random());
    status.textContent = state.lastReward === 0 ? "Empty chest. The next chest has the same odds."
      : `Found ${state.lastReward} coins!${state.randomRewards ? " The next chest has the same odds." : " A steady reward."}`;
    history.prepend(h("li", {}, `Chest ${state.opened}: +${state.lastReward} coins`));
    while (history.childElementCount > 6) history.lastElementChild!.remove();
    draw();
  });
  showOdds();
  return () => {
    if (timer !== null) clearInterval(timer);
    root.remove();
  };
}

export const treasureHunt: Minigame = {
  slug: "treasure-hunt", title: "Treasure Hunt: one more chest", motivators: ["chance"],
  author: "Alicey66", mount,
};

