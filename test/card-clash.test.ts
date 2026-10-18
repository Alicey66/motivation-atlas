// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { CARD_POOL, applyCard, chooseBotCard, createDeck, createInitialGameState, dealInitialHands, drawCard, playTurn, seededRandom, shuffleDeck, type Card, type GameState } from "../src/minigames/card-clash/game";
import { cardClash } from "../src/minigames/card-clash";
import { minigamesFor } from "../src/minigames/registry";
function fixture(active: "player" | "bot" = "player", cards: Card[] = ["number-3"]): GameState {
  const s = createInitialGameState(seededRandom(1));
  return { ...s, active, piles: { player: { hand: [...cards], deck: [] }, bot: { hand: [...cards], deck: [] } } };
}
afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); });
describe("Card Clash rules", () => {
  it.each(["player", "bot"] as const)("%s wins immediately and cannot act afterward", side => {
    const s = fixture(side);
    s.scores[side] = 17;
    const won = playTurn(s, side, 0);
    expect(won.outcome).toBe(side);
    expect(won.scores[side]).toBe(20);
    expect(playTurn(won, side, 0)).toBe(won);
    expect(s.scores[side]).toBe(17);
  });
  it("resolves all six effects with flooring and active-side symmetry", () => {
    for (const side of ["player", "bot"] as const) {
      const other = side === "player" ? "bot" : "player";
      for (const card of Object.keys(CARD_POOL) as Card[]) {
        const scores = applyCard({ player: 1, bot: 1 }, side, card);
        expect(scores[side]).toBe(1 + CARD_POOL[card].gain);
        expect(scores[other]).toBe(Math.max(0, 1 - CARD_POOL[card].attack));
      }
    }
    expect(applyCard({ player: 18, bot: 1 }, "player", "drain")).toEqual({ player: 20, bot: 0 });
  });
  it.each([[5, 3, "player"], [3, 5, "bot"], [5, 5, "draw"]] as const)("settles six completed rounds %s/%s", (player, bot, outcome) => {
    const s = fixture("player", []);
    s.round = 6; s.scores = { player, bot };
    const mid = playTurn(s, "player", null);
    expect(mid.outcome).toBeNull();
    expect(mid.round).toBe(6);
    expect(playTurn(mid, "bot", null).outcome).toBe(outcome);
  });
  it("rejects opponent, illegal card indices, and passes with cards", () => {
    const s = fixture();
    for (const index of [-1, 1, 0.5, null]) expect(playTurn(s, "player", index)).toBe(s);
    expect(playTurn(s, "bot", 0)).toBe(s);
  });
  it("uses exactly twelve turns at the six-round limit, including passes", () => {
    let s = fixture("player", []);
    for (let i = 0; i < 12; i++) {
      expect(s.outcome).toBeNull();
      s = playTurn(s, s.active, null);
    }
    expect(s.outcome).toBe("draw");
    expect(s.log).toHaveLength(12);
  });
});
describe("finite decks", () => {
  it("builds the configured sixteen cards", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(16);
    for (const card of Object.keys(CARD_POOL) as Card[]) expect(deck.filter(c => c === card)).toHaveLength(CARD_POOL[card].copies);
    expect(dealInitialHands(deck)).toEqual({ hand: deck.slice(0, 5), deck: deck.slice(5) });
  });
  it("deals independent decks of identical composition with reproducible shuffles", () => {
    const s = createInitialGameState(seededRandom(123));
    expect(s).toEqual(createInitialGameState(seededRandom(123)));
    expect(s.piles.player.hand).toHaveLength(5);
    expect(s.piles.bot.hand).toHaveLength(5);
    expect(s.piles.player.hand).not.toEqual(s.piles.bot.hand);
    expect(s.piles.player.deck).not.toBe(s.piles.bot.deck);
    for (const pile of Object.values(s.piles)) expect([...pile.hand, ...pile.deck].sort()).toEqual(createDeck().sort());
    expect(shuffleDeck(createDeck(), seededRandom(7))).toEqual(shuffleDeck(createDeck(), seededRandom(7)));
  });
  it("draws exactly one existing card and never manufactures cards", () => {
    const pile = { hand: ["boost"] as Card[], deck: ["drain", "strike"] as Card[] };
    expect(drawCard(pile)).toEqual({ hand: ["boost", "drain"], deck: ["strike"] });
    expect(pile.deck).toHaveLength(2);
    const empty = { hand: [], deck: [] };
    expect(drawCard(empty)).toBe(empty);
  });
  it("refills only an emptied hand, and plays remaining cards after deck exhaustion", () => {
    const s = fixture("player", ["strike", "boost"]);
    s.piles.player.deck = ["drain", "number-7"];
    const first = playTurn(s, "player", 0);
    expect(first.piles.player).toEqual({ hand: ["boost"], deck: ["drain", "number-7"] });
    const second = playTurn({ ...first, active: "player" }, "player", 0);
    expect(second.piles.player).toEqual({ hand: ["drain"], deck: ["number-7"] });
    let exhausted = fixture("player", ["strike"]);
    exhausted = playTurn(exhausted, "player", 0);
    expect(exhausted.piles.player).toEqual({ hand: [], deck: [] });
    expect(playTurn({ ...exhausted, active: "player" }, "player", null).log.at(-1)).toContain("pass");
  });
});
describe("bot policy", () => {
  it("takes an immediate win before defending", () => {
    const s = fixture("bot", ["strike", "number-5", "number-7"]);
    s.scores = { player: 19, bot: 15 };
    expect(chooseBotCard(s, true).index).toBe(1);
  });
  it("changes its next decision at the threat threshold without changing state or effects", () => {
    const s = fixture("bot", ["strike", "number-7", "drain"]);
    s.scores = { player: 17, bot: 0 };
    const before = structuredClone(s);
    expect(chooseBotCard(s, true).index).toBe(0);
    expect(chooseBotCard(s, false).index).toBe(1);
    expect(s).toEqual(before);
    expect(playTurn(s, "bot", 0).scores).toEqual({ player: 14, bot: 0 });
    s.scores.player = 0;
    expect(chooseBotCard(s, true).index).toBe(1);
  });
  it("follows every fixed priority regardless of scores", () => {
    const priority: Card[] = ["number-7", "boost", "number-5", "drain", "strike", "number-3"];
    for (let i = 0; i < priority.length; i++) {
      const s = fixture("bot", priority.slice(i).reverse());
      for (const player of [0, 17, 19]) {
        s.scores = { player, bot: 19 };
        expect(s.piles.bot.hand[chooseBotCard(s, false).index!]).toBe(priority[i]);
      }
    }
  });
  it("chooses legal cards, breaks ties by hand order, and passes with no cards", () => {
    for (const adaptive of [true, false]) {
      for (const card of Object.keys(CARD_POOL) as Card[]) expect(chooseBotCard(fixture("bot", [card]), adaptive).index).toBe(0);
      expect(chooseBotCard(fixture("bot", ["boost", "boost"]), adaptive).index).toBe(0);
      const s = fixture("bot", []);
      const choice = chooseBotCard(s, adaptive);
      expect(choice.index).toBeNull();
      expect(playTurn(s, "bot", choice.index).active).toBe("player");
    }
  });
});
describe("Atlas UI", () => {
  it("registers for competition and blocks duplicate input, restarts, and clears pending timers", () => {
    vi.useFakeTimers();
    expect(minigamesFor("competition")).toContain(cardClash);
    const el = document.createElement("div");
    document.body.append(el);
    const dispose = cardClash.mount(el);
    expect(el.querySelectorAll("[data-mechanic]")).toHaveLength(1);
    const card = el.querySelector<HTMLButtonElement>("[data-card]")!;
    card.click(); card.click();
    expect(el.querySelectorAll(".clash-log li")).toHaveLength(1);
    expect([...el.querySelectorAll<HTMLButtonElement>("[data-card]")].every(b => b.disabled)).toBe(true);
    const toggle = el.querySelector<HTMLInputElement>("input")!;
    toggle.checked = false;
    vi.advanceTimersByTime(650);
    expect(el.querySelectorAll(".clash-log li")).toHaveLength(2);
    expect(el.textContent).toContain("Fixed card priority");
    el.querySelector<HTMLButtonElement>("[data-card]")!.click();
    [...el.querySelectorAll("button")].find(b => b.textContent === "Restart")!.click();
    expect(el.querySelectorAll(".clash-log li")).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    el.querySelector<HTMLButtonElement>("[data-card]")!.click();
    dispose();
    expect(el.childNodes).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
