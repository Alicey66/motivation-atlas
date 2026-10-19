# glyph-adventure

Original planning notes below, retained as design history.

## Implemented direction

The prototype now uses a 13-by-17 river made of Gardiner hieroglyphs,
one sign per square, rendered with the locally bundled NewGardiner font.
You begin in a P1 boat, find the shipwrecked A10 sailor, and bring them to a
landing house. A fish pool and turtle backwater reward optional exploration;
a crocodile blocks a shortcut but can be bypassed. Fog and mist is the only
toggle and restarts the same map with hidden or fully visible surroundings.
The current rules and credits are in README.md. The earlier island and
collectible-glyph ideas below were replaced by this river rescue.

## Core idea

A short adventure about exploring an unfamiliar island, collecting three
glyphs, and returning to your boat. Aim for a round of one or two minutes.

**Motivator:** Discovery.
**Mechanic:** Hidden information, revealed as the player explores.
**Intended dynamic:** Players choose unexplored paths, discover landmarks,
and revise their route as they learn the island's layout.
**Intended feeling:** Curiosity, surprise, and the satisfaction of finding
something. These are hypotheses to compare with what players actually feel.

## One toggle: Fog and mist

- **On:** Only visited spaces and spaces immediately next to the player are
  visible. Everything else is covered by fog and mist. Exploring reveals
  terrain, glyphs, and landmarks. Previously revealed spaces stay visible.
- **Off:** The entire island, including glyph locations, is visible from
  the start. Players can plan a route directly.

Keep the island, movement rules, and goal identical in both settings so the
comparison focuses on hidden information. No speed, damage, or movement
penalty from the fog and mist: it changes what you can see.

## Small first version

- A compact grid, perhaps 6 by 6 spaces, with paths, impassable water or rocks,
  three glyphs, and a boat that serves as the starting and ending space.
- Move one space at a time, up, down, left, or right. No diagonal movement.
- Collect glyphs automatically when entering their spaces.
- Win by returning to the boat with all three glyphs.
- No enemies or deadline in the first version; the exploration is the game.
- Show glyphs collected and moves taken, without rewarding speed.
- Use one handcrafted, connected island initially. Every glyph must be reachable.
- A New adventure button restarts the same island, making comparison possible.
  Changing the toggle should also restart, with a clear explanation: once a
  player has seen the island, hiding it again cannot restore the surprise.

## Controls and presentation

- Plain text, simple symbols, and a small grid are enough. Make glyphs
  visually distinct, with readable text names rather than a deciphering quiz.
- Direction buttons work with mouse and touch. Support keyboard controls
  through ordinary buttons; arrow keys could be an additional convenience.
- Give the player, boat, terrain, hidden spaces, and glyphs distinct labels.
  Do not rely on color alone, and do not expose hidden locations through
  accessible labels or status messages.
- Describe the current position and newly discovered objects in a status area.
- Keep controls large enough for touch and the board within a phone screen.
- Use the Atlas's color tokens so light and dark modes both work.
- Create the appearance with text and CSS; no outside assets are needed.

## End-of-round reflection

Ask: What did you feel while exploring? Did turning fog and mist on or off
change your curiosity, route, or sense of adventure?

Encourage trying the other setting. Replaying a known map will naturally
reduce surprise; acknowledge this when comparing the two rounds.

## Possible implementation files

When ready to build, copy the template's files into this folder without
overwriting these notes.

- `index.ts`: export the minigame with slug `glyph-adventure`, motivator
  `discovery`, title and author; mount the board and controls and return cleanup.
- `game.ts`: pure rules for movement, visibility, glyph collection, and winning.
- `glyph-adventure.css`: scoped layout and visual styles, if needed.
- `README.md`: player-facing Mechanic section, then Dynamic, Aesthetic,
  and Sources. Read the course note's Discovery section and quote relevant
  passages exactly with their citations before writing the source section.
- `test/glyph-adventure.test.ts` at the repository root: central rule tests.

## Useful checks when building

- With fog and mist on, a distant glyph is hidden until the player gets near;
  with it off, the same glyph is visible immediately.
- Moving into blocked terrain or outside the island does not move the player.
- A glyph can only be collected once, and winning requires all three plus
  returning to the boat.
- All glyphs are reachable from the boat.
- Unmount removes the game and any document or window listeners.
- Run `npm test`, typecheck, and build; then play both settings on the Discovery
  page, including a phone-sized screen and keyboard controls.

## Decisions to revisit after a rough prototype

- Is a 6 by 6 island enough exploration for a minute or two?
- Do branching paths create interesting choices without becoming frustrating?
- Is revealing neighboring spaces enough to navigate comfortably?
- Does a second island help compare settings after the first map is familiar?
  Keep this optional until the basic toggle clearly changes the experience.
