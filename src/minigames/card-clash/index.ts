import { h } from "../../lib/dom";
import type { Minigame } from "../types";
import { CARD_POOL, cardEffect, chooseBotCard, createInitialGameState, playTurn } from "./game";
import "./card-clash.css";

function mount(el: HTMLElement): () => void {
  let state = createInitialGameState();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const toggle = h("input", { type: "checkbox", checked: true, "data-mechanic": "adaptive-counterplay" });
  const scores = h("div", { class: "clash-scores", "aria-live": "polite" });
  const status = h("p", { role: "status" });
  const counts = h("p");
  const hand = h("div", { class: "clash-hand", "aria-label": "Your hand" });
  const log = h("ol", { class: "clash-log", "aria-label": "Action log", "aria-live": "polite" });
  const restart = h("button", { type: "button" }, "Restart");
  const root = h("section", { class: "card-clash" },
    h("h3", {}, "Card Clash: Race to 20"),
    h("p", {}, "Play one card per turn. Reach 20 first, or lead after six rounds. Refill one card only when your hand empties. Aim for a 1–2 minute match."),
    h("label", {}, toggle, " Adaptive Counterplay"),
    h("p", {}, "ON: the bot reacts to scores. OFF: Number 7 → Boost → Number 5 → Drain → Strike → Number 3. Changes apply to its next turn."),
    scores, status, counts, h("h4", {}, "Your hand"), hand, restart,
    h("h4", {}, "Action log"), log,
    h("p", {}, "Then check it against your own play: What did you feel? Did changing Adaptive Counterplay change your card order, attention to the opponent, or sense of competition? Play ON, then OFF, and compare."));
  el.append(root);
  function render(): void {
    scores.replaceChildren(h("strong", {}, "You: " + state.scores.player + " / 20"), h("strong", {}, "Bot: " + state.scores.bot + " / 20"));
    status.textContent = "Round " + state.round + " / 6 · " + (state.outcome === null ? state.active === "player" ? "Your turn" : "Bot's turn…" : state.outcome === "draw" ? "Draw!" : state.outcome === "player" ? "You win!" : "Bot wins!");
    counts.textContent = "Your deck: " + state.piles.player.deck.length + " · Bot: " + state.piles.bot.hand.length + " hidden cards, " + state.piles.bot.deck.length + " in deck";
    const enabled = state.active === "player" && state.outcome === null;
    hand.replaceChildren(...state.piles.player.hand.map((card, index) => {
      const def = CARD_POOL[card];
      const button = h("button", { type: "button", class: "clash-card", "data-card": card },
        h("strong", {}, def.name), h("span", {}, def.type), h("span", {}, cardEffect(card)));
      button.disabled = !enabled;
      button.addEventListener("click", () => act(index));
      return button;
    }));
    if (!state.piles.player.hand.length) {
      const pass = h("button", { type: "button" }, "Pass (no cards)");
      pass.disabled = !enabled;
      pass.addEventListener("click", () => act(null));
      hand.append(pass);
    }
    log.replaceChildren(...state.log.map(entry => h("li", {}, entry)));
  }
  function act(index: number | null): void {
    if (state.active !== "player" || state.outcome !== null) return;
    state = playTurn(state, "player", index);
    render();
    if (state.active === "bot" && state.outcome === null && timer === null) {
      timer = setTimeout(() => {
        timer = null;
        const choice = chooseBotCard(state, toggle.checked);
        state = playTurn(state, "bot", choice.index, choice.reason);
        render();
      }, 650);
    }
  }
  restart.addEventListener("click", () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    state = createInitialGameState();
    render();
  });
  render();
  return () => { if (timer !== null) clearTimeout(timer); root.remove(); };
}
export const cardClash: Minigame = { slug: "card-clash", title: "Card Clash: Race to 20", motivators: ["competition"], author: "Annniway026", mount };
