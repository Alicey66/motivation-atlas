# Lantern Trail

Motivator: Discovery. Author: nc3244.

## Mechanic

Find three relics (*) and return to camp (C) before 36 successful moves.
You are @; # marks a wall. Use the four direction buttons, or focus a button
and use arrow keys. Blocked moves cost nothing. A round is intended to take
one or two minutes. Restart repeats the same map and clears collected relics.

With **Fog of war** checked, only your tile, its immediate neighbors, and
previously revealed tiles are visible. Question marks conceal the rest.
Unchecking it reveals every wall and relic immediately. The toggle changes
information, not movement, relic locations, or the move budget. Switch during
a round to inspect the contrast, or restart between conditions.

## Dynamic

**Human playtest pending.** Ask another person to play with fog on, then off.
Record how they chose routes, whether they explored dead ends, their move
counts, and whether they returned with all relics. Replace this paragraph
with their observed behavior before submission. Repeating the same map also
introduces learning; do not attribute every second-round improvement to fog.

## Aesthetic

**Human playtest pending.** Ask what they felt in each condition, without
suggesting an answer. Record their actual comparison here, without identifying
details. Curiosity with fog and deliberate planning without it are design
hypotheses, not reported findings.

## Sources

The course note, “Discovery, curiosity, and novelty,” describes: “Hidden
information revealed bit by bit” (Malone 1980, p. 67). Lantern Trail makes
that information rule switchable while preserving the physical task.

Codex generated the implementation and tests and suggested using the same
map for both conditions. That suggestion was retained in the implementation
to make the information contrast inspectable.
No external code, art, or sound was borrowed beyond the Atlas template and
existing project dependencies.
