# Fog Scout: the unseen ruins

Motivator: Discovery. Author: DemonRain7.

## Mechanic

Recover three relics (◆), then reach the exit (◎) in a seven-by-seven ruin.
Focus the map and use arrow keys or WASD, or click/tap the direction buttons.
Walls (▧) block movement. There is no countdown or move limit; aim for a
one-to-two-minute expedition. **Exploration fog** hides unexplored squares;
each move reveals your square and its four neighbors permanently. Turn fog
off to see everything. Changing the toggle restarts the same map with identical
movement and collection rules. **Replay these ruins** resets the round;
**Other ruins** switches layouts. Round notes retain your last four completions.

## Dynamic

The intended dynamic is scouting and backtracking with fog, compared with
planning a direct collection route when the map is visible. Each discovery
can change the next destination. Previously revealed squares stay visible,
so exploration gradually becomes route planning. Replaying the same layout
also introduces map familiarity, which must be considered when comparing
the two conditions. Playtest observations are pending.

## Aesthetic

The intended aesthetic is curiosity about unexplored space. A visible map
may instead support a sense of control. These are design expectations;
the player's reported feelings in each condition are pending.

## Sources

The course note's Discovery section quotes "the strategic unveiling of hidden
information adds suspense and tension" (Salen and Zimmerman 2003, ch. 17,
"Hiding and Revealing Systems"). This is a hypothesis to test against play.
Codex assisted design and implementation. I kept its suggestion that
fog change only visibility, leaving movement and rewards constant. Code uses
the Atlas template and DOM helper; visuals use CSS and text without external
assets.
