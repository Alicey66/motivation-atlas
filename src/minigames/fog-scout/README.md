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

Human playtest pending: this section is not yet an observation report.
The design hypothesis is that fog encourages scouting and backtracking,
while a visible map encourages planning a direct collection route.
After another person plays fog on, then off, replace this paragraph with
their observed choices and round notes. Note whether map familiarity affected
the second round; agent testing is not human playtest evidence.

## Aesthetic

Human feedback pending. Ask what choosing a direction felt like in each
condition and whether changing fog changed that feeling. Record the player's
actual account, including unexpected preferences; omit their name and
identifying details.

## Sources

The course note's Discovery section quotes "the strategic unveiling of hidden
information adds suspense and tension" (Salen and Zimmerman 2003, ch. 17,
"Hiding and Revealing Systems"). This is a hypothesis to test against play.
Codex assisted design, implementation, and tests. I kept its suggestion that
fog change only visibility, leaving movement and rewards constant. Code uses
the Atlas template and DOM helper; visuals use CSS and text without external
assets.
