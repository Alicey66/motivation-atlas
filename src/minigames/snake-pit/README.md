# Snake Pit: Escape the Burrow

Motivator: Challenge and mastery. Author: jianyangg.

## Mechanic

Collect six eggs, then reach the exit. Choose either of up to two visible
eggs. New eggs wait until your tail clears their nest. **Start escape** begins;
**Hint: watch a winning route · 3×** shows one way out.
Steer with arrows, WASD, or mouse/touch direction buttons. Only the head
collects eggs. You keep moving and cannot reverse. Rocks, boundaries, and
your body end the round. **Pause** or Space pauses; **Restart** resets.

Each egg adds 18 length segments in both modes. Set **Width growth** before
starting: ON widens from 0.6 to 2.4 cells, with the new size following down
the body. OFF stays slim. After two eggs, ON cannot fit the marked shortcuts;
take a wider route. Egg clearings leave room to grow.
Speed, obstacles, egg reveal order, and objectives stay identical.

## Dynamic

**Playtest pending.** Another person’s routes, collisions, and retries with
width growth ON, then OFF, remain unrecorded. I predict that progress toward
escape costs access to shortcuts and changes route choices. The
one-to-two-minute target still needs a human playtest.

## Aesthetic

**Playtest pending.** No comments have been collected for either setting.
Claims about tension, frustration, or satisfaction must come from
what that person says after playing.

## Sources

From the course note’s Challenge and mastery section:

> Clear goals, the possibility of failure, and immediate feedback (Lazzaro 2004b, sec. 2b).

Classic Snake inspired eating, length growth, and avoiding the body. Codex
helped with code and tests. I changed its growth toggle to control width
only; length grows equally. The template and DOM helpers come from this
repository. No outside code, art, or audio was borrowed.
