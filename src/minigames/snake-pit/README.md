# Snake Pit: Escape the Burrow

Motivator: Challenge and mastery. Author: jianyangg.

## Mechanic

Collect six eggs, then reach the exit. Two are available at once: choose
either, and another appears until only the last remains. Press **Start escape**.
Steer with arrows, WASD, or direction buttons using a mouse or touchscreen.
You keep moving and cannot reverse. Rocks, boundaries, and your body end
the round. **Pause** or Space pauses; **Restart** resets.

Each egg adds 18 length segments in both modes. Set **Width growth** before
starting: ON widens from 0.6 to 2.4 cells, with the new size following down
the body. OFF stays slim. After two eggs, ON cannot fit the marked shortcuts;
take a wider route. Egg clearings leave room to grow.
Speed, obstacles, egg reveal order, and objectives stay identical.

## Dynamic

**Playtest pending.** Another person has not yet tried width growth ON, then
OFF. Routes, collisions, and retries remain unrecorded. My prediction is
that progress toward escape costs access to shortcuts and changes route
choices. The one-to-two-minute target still needs a human playtest.

## Aesthetic

**Playtest pending.** No comments have been collected for either setting.
Any claims about tension, frustration, or satisfaction will come from
what that person says after trying both modes.

## Sources

From the course note’s Challenge and mastery section:

> Clear goals, the possibility of failure, and immediate feedback (Lazzaro 2004b, sec. 2b).

Classic Snake inspired eating, length growth, and avoiding the body. Codex
helped with code and tests. I changed its growth toggle to control width
only; length grows equally. The template and DOM helpers come from this
repository. No outside code, art, or audio was borrowed.
