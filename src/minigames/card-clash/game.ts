export type Card = 'number-3' | 'number-5' | 'number-7' | 'strike' | 'drain' | 'boost';
export type Side = 'player' | 'bot';
export type Outcome = Side | 'draw' | null;
export const CARD_POOL: Record<Card, { name: string; type: 'Number' | 'Action'; gain: number; attack: number; copies: number }> = {
  'number-3': { name: 'Number 3', type: 'Number', gain: 3, attack: 0, copies: 4 },
  'number-5': { name: 'Number 5', type: 'Number', gain: 5, attack: 0, copies: 4 },
  'number-7': { name: 'Number 7', type: 'Number', gain: 7, attack: 0, copies: 2 },
  strike: { name: 'Strike', type: 'Action', gain: 0, attack: 3, copies: 2 },
  drain: { name: 'Drain', type: 'Action', gain: 2, attack: 2, copies: 2 },
  boost: { name: 'Boost', type: 'Action', gain: 4, attack: 0, copies: 2 },
};
export interface Pile { hand: Card[]; deck: Card[] }
export interface GameState {
  scores: Record<Side, number>; piles: Record<Side, Pile>; active: Side;
  round: number; outcome: Outcome; log: string[];
}
export const TARGET = 20;
export const MAX_ROUNDS = 6;
export function createDeck(): Card[] {
  return (Object.keys(CARD_POOL) as Card[]).flatMap(card => Array<Card>(CARD_POOL[card].copies).fill(card));
}
export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}
export function shuffleDeck(deck: readonly Card[], random = Math.random): Card[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function drawCard(pile: Pile): Pile {
  if (!pile.deck.length) return pile;
  return { hand: [...pile.hand, pile.deck[0]], deck: pile.deck.slice(1) };
}
export function dealInitialHands(deck: readonly Card[]): Pile { return { hand: deck.slice(0, 5), deck: deck.slice(5) }; }
export function createInitialGameState(random = Math.random): GameState {
  return { scores: { player: 0, bot: 0 },
    piles: { player: dealInitialHands(shuffleDeck(createDeck(), random)), bot: dealInitialHands(shuffleDeck(createDeck(), random)) },
    active: 'player', round: 1, outcome: null, log: [] };
}
/** Gain first, then reduction, then victory after the complete effect. */
export function applyCard(scores: GameState['scores'], side: Side, card: Card): GameState['scores'] {
  const other = side === 'player' ? 'bot' : 'player';
  const effect = CARD_POOL[card];
  return { ...scores, [side]: scores[side] + effect.gain, [other]: Math.max(0, scores[other] - effect.attack) };
}
export function getWinner(scores: GameState['scores'], active: Side, completed = false): Outcome {
  if (scores[active] >= TARGET) return active;
  const other = active === 'player' ? 'bot' : 'player';
  if (scores[other] >= TARGET) return other;
  return completed ? scores.player === scores.bot ? 'draw' : scores.player > scores.bot ? 'player' : 'bot' : null;
}
export function advanceTurn(state: GameState): GameState {
  if (state.outcome !== null) return state;
  if (state.active === 'bot' && state.round === MAX_ROUNDS) return { ...state, outcome: getWinner(state.scores, state.active, true) };
  return { ...state, active: state.active === 'player' ? 'bot' : 'player', round: state.round + (state.active === 'bot' ? 1 : 0) };
}
/** null is a legal pass only with an empty hand. Invalid actions preserve identity. */
export function playTurn(state: GameState, side: Side, index: number | null, reason = ''): GameState {
  if (state.outcome !== null || state.active !== side) return state;
  const pile = state.piles[side];
  if (index === null ? pile.hand.length !== 0 : !Number.isInteger(index) || index < 0 || index >= pile.hand.length) return state;
  const card = index === null ? null : pile.hand[index];
  const scores = card === null ? state.scores : applyCard(state.scores, side, card);
  let nextPile = { hand: pile.hand.filter((_, i) => i !== index), deck: [...pile.deck] };
  if (nextPile.hand.length === 0) nextPile = drawCard(nextPile);
  const entry = `${side === 'player' ? 'You' : 'Bot'}: ${card === null ? 'pass' : CARD_POOL[card].name}. You ${state.scores.player} → ${scores.player}; bot ${state.scores.bot} → ${scores.bot}.${reason ? ` ${reason}` : ''}`;
  return advanceTurn({ ...state, scores, piles: { ...state.piles, [side]: nextPile }, outcome: getWinner(scores, side), log: [...state.log, entry] });
}
const FIXED: Card[] = ['number-7', 'boost', 'number-5', 'drain', 'strike', 'number-3'];
export function chooseBotCard(state: GameState, adaptive: boolean): { index: number | null; reason: string } {
  const hand = state.piles.bot.hand;
  if (!hand.length) return { index: null, reason: 'No cards available.' };
  if (!adaptive) return { index: hand.indexOf(FIXED.find(card => hand.includes(card))!), reason: 'Fixed card priority.' };
  const win = hand.findIndex(card => state.scores.bot + CARD_POOL[card].gain >= TARGET);
  if (win >= 0) return { index: win, reason: 'Adaptive: reach 20 now.' };
  const threatened = state.scores.player >= 17;
  const values = hand.map(card => CARD_POOL[card].gain + Math.min(state.scores.player, CARD_POOL[card].attack) * (threatened ? 4 : 0.75));
  const index = values.indexOf(Math.max(...values));
  return { index, reason: threatened && CARD_POOL[hand[index]].attack > 0 ? 'Adaptive: reduce your immediate scoring threat.' : 'Adaptive: best gain plus effective opponent reduction.' };
}
export function cardEffect(card: Card): string {
  const { gain, attack } = CARD_POOL[card];
  return [gain ? `Gain ${gain}` : '', attack ? `Opponent loses ${attack} (minimum 0)` : ''].filter(Boolean).join('; ') + '.';
}
