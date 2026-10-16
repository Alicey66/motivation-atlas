import { h } from "../../lib/dom";
import type { Minigame } from "../types";
import { MAPS, RELICS, SIZE, move, newGame, tileAt, type Direction } from "./game";
import "./fog-scout.css";

const SYMBOLS = { unknown: "?", wall: "▧", floor: "·", relic: "◆", exit: "◎" };
const KEYS: Record<string, Direction> = {
  ArrowUp: "up", ArrowRight: "right", ArrowDown: "down", ArrowLeft: "left",
  w: "up", d: "right", s: "down", a: "left",
};
let mounts = 0;

function mount(el: HTMLElement): () => void {
  const id = ++mounts;
  let state = newGame();
  let startedAt: number | null = null;
  const rounds: string[] = [];
  const controller = new AbortController();
  const listen = { signal: controller.signal };

  const fog = h("input", { type: "checkbox", checked: true, "data-mechanic": "exploration-fog" });
  const mode = h("span", { class: "fs-mode", "data-mode": "" });
  const mapName = h("span", { class: "fs-map-name" });
  const relics = h("strong", { "data-relics": "" });
  const steps = h("strong", { "data-steps": "" });
  const explored = h("strong", { "data-explored": "" });
  const status = h("p", { class: "fs-status", role: "status", "aria-atomic": "true", "data-status": "" });
  const hint = h("p", { id: `fs-hint-${id}`, class: "fs-small" },
    "Focus the map for arrow keys or WASD. Or use the direction buttons below.");
  const board = h("div", {
    class: "fs-board", role: "group", tabindex: 0,
    "aria-label": "Ruins map", "aria-describedby": hint.id,
  });
  const cells = Array.from({ length: SIZE * SIZE }, (_, i) =>
    h("span", { class: "fs-cell", role: "img", "data-cell": i }));
  board.append(...cells);
  const pad = h("div", { class: "fs-pad", role: "group", "aria-label": "Move explorer" });
  const buttons = new Map<Direction, HTMLButtonElement>();
  const directions: Array<[Direction, string]> = [["up", "↑"], ["left", "←"], ["down", "↓"], ["right", "→"]];
  for (const [direction, symbol] of directions) {
    const button = h("button", {
      type: "button", class: `fs-button fs-direction fs-${direction}`,
      "aria-label": `Move ${direction}`, "data-direction": direction,
    }, symbol);
    buttons.set(direction, button);
    button.addEventListener("click", () => takeStep(direction), listen);
    pad.append(button);
  }
  const replay = h("button", { type: "button", class: "fs-button", "data-replay": "" }, "Replay these ruins");
  const fresh = h("button", { type: "button", class: "fs-button fs-secondary", "data-fresh": "" }, "Other ruins");
  const result = h("section", { class: "fs-result", hidden: true, "data-result": "" });
  const history = h("ol", { class: "fs-history", "data-history": "" });
  const historyPanel = h("details", { class: "fs-notes" },
    h("summary", {}, "Round notes"),
    h("p", { class: "fs-small" }, "Completed rounds stay here until you leave this page. Backtracks count moves onto previously visited squares. Time starts at your first move; it is not a countdown."),
    history,
  );
  const root = h("section", { class: "fog-scout", "aria-label": "Fog Scout game" },
    h("div", { class: "fs-heading" },
      h("div", {}, h("p", { class: "fs-eyebrow" }, "FIELD EXPEDITION / 01"), mapName), mode),
    h("div", { class: "fs-toolbar" },
      h("label", { class: "fs-toggle" }, fog, " Exploration fog"),
      h("p", { class: "fs-small" }, "Changing fog restarts this map. Only visibility changes.")),
    h("div", { class: "fs-stats" },
      h("div", {}, relics, h("span", {}, "RELICS")),
      h("div", {}, steps, h("span", {}, "MOVES")),
      h("div", {}, explored, h("span", {}, "MAP VISIBLE"))),
    h("div", { class: "fs-play" },
      h("div", { class: "fs-map-wrap" }, board,
        h("p", { class: "fs-legend" }, "● You  ·  ◆ Relic  ·  ◎ Exit  ·  ▧ Wall  ·  ? Unknown")),
      h("div", { class: "fs-controls" },
        h("p", { class: "fs-objective" }, "Recover 3 relics. Find your way out."),
        hint, pad, status,
        h("div", { class: "fs-actions" }, replay, fresh))),
    result,
    h("p", { class: "fs-small fs-comparison" }, "Compare fog on, then off. Replaying the same map also tests your memory; Other ruins switches between two layouts."),
    historyPanel,
  );
  el.append(root);

  function message(): string {
    const where = `Row ${Math.floor(state.position / SIZE) + 1}, column ${state.position % SIZE + 1}.`;
    switch (state.event) {
      case "escaped": return `Expedition complete! ${state.steps} moves. Compare the other fog setting next.`;
      case "relic": return `Relic recovered! ${state.collected.length} of ${RELICS}. ${where}`;
      case "wall": return "A wall blocks that direction. Try another route.";
      case "edge": return "The ruins end here. Try another direction.";
      case "locked": return `Exit found. Recover ${RELICS - state.collected.length} more relics to leave.`;
      case "start": return state.fog ? "Your lantern reveals one square in each direction. Where will you explore first?" : "The whole map is visible. Which route will you take?";
      default: return `${where} ${state.collected.length === RELICS ? "All relics found. Reach the exit." : "Keep looking for the relics."}`;
    }
  }

  function render(): void {
    mode.textContent = state.fog ? "FOG ON" : "FOG OFF";
    mapName.textContent = MAPS[state.map].name;
    relics.textContent = `${state.collected.length} / ${RELICS}`;
    steps.textContent = String(state.steps);
    explored.textContent = `${Math.round((state.fog ? state.revealed.length : SIZE * SIZE) / (SIZE * SIZE) * 100)}%`;
    status.textContent = message();
    cells.forEach((cell, i) => {
      const tile = tileAt(state, i);
      const player = i === state.position;
      cell.className = `fs-cell fs-${tile}${player ? " fs-player" : ""}`;
      cell.textContent = player ? "●" : SYMBOLS[tile];
      cell.setAttribute("aria-label", `Row ${Math.floor(i / SIZE) + 1}, column ${i % SIZE + 1}: ${player ? "you, " : ""}${tile}`);
    });
    for (const button of buttons.values()) button.setAttribute("aria-disabled", String(state.won));
    result.hidden = !state.won;
  }

  function takeStep(direction: Direction): void {
    if (state.won) return;
    const previous = state;
    state = move(state, direction);
    if (state.steps > previous.steps && startedAt === null) startedAt = Date.now();
    if (state.won) {
      const seconds = Math.round((Date.now() - (startedAt ?? Date.now())) / 1000);
      const summary = `${MAPS[state.map].name} · Fog ${state.fog ? "ON" : "OFF"} · ${state.steps} moves · ${state.backtracks} backtracks · ${seconds}s`;
      rounds.unshift(summary);
      rounds.splice(4);
      history.replaceChildren(...rounds.map((round) => h("li", {}, round)));
      result.replaceChildren(
        h("h4", {}, "Three relics. One new perspective."),
        h("p", {}, summary),
        h("p", {}, "What did you feel while choosing a direction? Did changing fog change your route or how it felt?"),
        h("p", { class: "fs-small" }, "Try the other setting, then compare your experiences. Curiosity, frustration, calm, or something else: your account is the evidence."),
      );
    }
    render();
  }

  function restart(map = state.map): void {
    state = newGame(fog.checked, map);
    startedAt = null;
    result.replaceChildren();
    render();
  }

  fog.addEventListener("change", () => restart(), listen);
  replay.addEventListener("click", () => restart(), listen);
  fresh.addEventListener("click", () => restart((state.map + 1) % MAPS.length), listen);
  root.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    if (event.altKey || event.ctrlKey || event.metaKey || target.matches("input, textarea, select")) return;
    const direction = KEYS[event.key] ?? KEYS[event.key.toLowerCase()];
    if (!direction) return;
    event.preventDefault();
    takeStep(direction);
  }, listen);
  render();
  return () => { controller.abort(); root.remove(); };
}

export const fogScout: Minigame = {
  slug: "fog-scout", title: "Fog Scout: the unseen ruins", motivators: ["discovery"], author: "DemonRain7", mount,
};
