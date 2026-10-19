# Signal Keeper: a moving target

Motivator: Challenge. Author: ghanikhalid.

## Mechanic

Catch the moving signal inside the outlined target. Choose Adaptive
difficulty, then start. Tap or click Lock signal, or focus it and press
Space or Enter. Ten trials last six seconds each, with one attempt per
trial. Hits earn one point; misses and skipped attempts earn nothing.

With the toggle on, a hit narrows the next target by six percentage points;
a miss widens it by six, within limits of 3% and 60%. With it off, the
target stays 36% wide. Speed, round length, and scoring stay identical.
Restart resets everything. Change modes between rounds.

## Dynamic

One other player scored 6/10 with adaptation on and 10/10 with it off,
using the earlier 12% minimum. The difference is consistent with narrower
targets making hits harder, but scores alone do not show their strategy.
Behavior observations are still pending. After this playtest, the minimum
was lowered to 3%; this revised version has not yet been playtested.

## Aesthetic

Playtest pending. Ask what they felt in each mode and record their words
without identifying details. Did adaptation feel satisfying or frustrating?
Did fixed difficulty become comfortable or boring? Replace these questions
with their actual response, including unexpected results.

## Sources

Challenge dynamics in the course note: “Difficulty that rises as the player's
ability grows” (Malone 1980, p. 54). Hits approximate performance, not a
measurement of ability. The adaptive target tests this connection.

Built with Codex. This version keeps Codex’s suggestion to widen targets
after misses, allowing recovery. Original code and CSS; no borrowed art or
sound. Uses the course’s minigame template and DOM helper.
