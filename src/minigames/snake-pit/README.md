# Snake Pit: Escape the Burrow

Motivator: Challenge and mastery. Author: jianyangg.

## Mechanic

Collect four eggs, one at a time, then reach the exit. Press **Start escape**.
Steer with arrows, WASD, or direction buttons using a mouse or touchscreen.
You keep moving and cannot reverse. Rocks, boundaries, and your body end
the round. **Pause** or Space pauses; **Restart** resets.

Each egg adds 18 length segments in both modes, reaching 75. Set **Width
growth** before starting: ON also makes the head wider, with the new size
following down the body. OFF stays slim. After two eggs, ON cannot fit the
marked shortcuts; take a wider route. Egg clearings leave room to grow.
Speed, obstacles, eggs, and objectives stay identical.

## Dynamic

**Playtest pending.** Another person’s routes, collisions, and retries with
width growth ON, then OFF, are still pending.
I expect progress toward escape to cost access to shortcuts, changing
route choices. That is a prediction, not a finding. The one-to-two-minute
round target still needs a human playtest.

## Aesthetic

**Playtest pending.** There are no player comments for either setting.
Whether width growth changes tension, frustration, or satisfaction needs
to come from what that person says after playing each mode.

## Sources

From the course note’s Challenge and mastery section:

> Clear goals, the possibility of failure, and immediate feedback (Lazzaro 2004b, sec. 2b).

Classic Snake inspired eating, length growth, and avoiding the body. Codex
helped with code and tests. I changed its growth toggle to control width
only; length grows equally. The template and DOM helpers come from this
repository. No outside code, art, or audio was borrowed.
