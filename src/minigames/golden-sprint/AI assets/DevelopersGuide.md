# Golden Sprint


## 1. Product definition

**Golden Sprint** is a short, browser-playable 2D side-scrolling survival platformer about King Midas racing to the River Pactolus to end his golden-touch curse. The player balances a gradually depleting nourishment meter with platforming, combat, safe-feast tributaries, optional wine collectibles, and two enemy types.

- **Platform:** desktop and mobile web browsers, responsive design.
- **Recommended implementation:** HTML, CSS, JavaScript, and a canvas; no game engine is required.
- **Orientation:** landscape preferred. On narrow/portrait screens, scale the game and expose touch controls rather than allowing controls to cover hazards.
- **Run length:** a few minutes for a skilled player; longer with exploration and collectibles.
- **Tone:** mythic, urgent, melancholy at first, ultimately hopeful. It is an adventure, not a grim survival simulator.
- **Visual style:** art direction is open. Soft painterly illustration, polished hand-drawn art, or pixel art can all work. The cast must look as though it belongs in one game: comparable finish, apparent resolution, lighting, palette, and anatomy.
- **Audio style:** ancient Greek-inspired and cinematic—lyre/kithara, frame drum, reed flute, restrained bronze/stone resonance. Do not make it sound like generic medieval tavern music or arcade beeps.

## 2. Design pillars

1. **The myth is understandable.** Before the first dangerous section, players know who Midas is, what he wished for, why the wish is harmful, what happened to Marigold, and why the Pactolus matters.
2. **Urgency without unfairness.** HP drains slowly enough for Midas to reach a tributary, but fast enough to discourage wasting time. Damage and hazards are clearly communicated.
3. **The curse changes play.** On land the touch is powerful but food becomes gold. In tributaries Midas can eat, but cannot use the golden touch. The real river, not a tributary, ends the curse.
4. **Enemies transform.** A successful land strike turns either enemy into a frozen, solid golden statue. The transformation is obvious and mechanically useful.
5. **Readable, finished motion.** Player and enemy animations feel deliberate and grounded. A
6. **A complete emotional arc.** The final moments show the river cleansing Midas, Marigold restored, and Midas choosing family and life over wealth.

## 3. Story: canon and presentation

### Canon

Midas is the king of Phrygia. He helps Silenus, a companion of Dionysus, and is offered a wish as a reward. Midas wishes that everything he touches turns to gold. The wish delights him until food and drink turn to metal and he cannot nourish himself. His daughter **Marigold** runs to embrace him and is transformed into a golden statue. Midas realizes that wealth has cost him what he loves.

Midas begs Dionysus for mercy. Dionysus gives him a chance: travel to the **River Pactolus** and wash there. The journey crosses smaller tributaries. Tributary water temporarily suppresses the touch, allowing Midas to eat bread and recover nourishment, but it does not remove the curse. Only reaching and washing in the true Pactolus breaks it. Marigold remains at the palace while Midas travels; he is not carrying her.

The standard ending shows Midas wash in the Pactolus, the golden power entering the river and its sands, and Midas returning to a restored Marigold. His lesson is that love and life are worth more than gold. The optional secret ending is earned by finding all three chapter wine bottles; it adds Dionysus's celebratory vineyard reward after the curse is broken.

### Opening story cards

Use four short text cards before gameplay. The player must be able to advance immediately, and a skip option is required. 

1. **The Wish:** Explain Midas, Silenus, Dionysus, and the wish/greed for the golden touch.
2. **The Curse:** Explain that food and drink turn to gold and hunger begins.
3. **The Price:** Explain Marigold's transformation and Midas's regret.
4. **The Remedy:** Explain Dionysus's instruction, the true Pactolus, and the temporary food-safe property of tributaries.

The story should be written in plain, evocative language. Avoid dumping the entire myth into one paragraph. Story cards are text-first; generate pictures to accompany texts.

### Ending cards

After final-stage completion, display at least four cards: (1) Midas reaches the true river; (2) gold streams from his hands and the curse is gone; (3) he returns to Marigold and she awakens; (4) Midas's lesson and the family reunion. The all-wines variant adds a vineyard epilogue and should not replace the basic emotional resolution. Also, generate pictures to accompany texts.

## 4. Screen flow and interface

### Title screen

Text-led composition on the scenic game background or a matching subdued backdrop. Do not show a Midas character illustration on the home/title screen.

Required elements:

- Game title: **GOLDEN SPRINT**.
- Short premise: race to the River Pactolus before the curse consumes Midas.
- **Begin the myth** (opening cards, then tutorial).
- **Skip tutorial / Begin Stage I** (enabled after tutorial completion; if progress rules differ, label disabled state clearly).
- **Fast walkthrough** opens a separate playtest panel.
- **Hunger drains over time** toggle, enabled by default and persistent.
- **Sound effects** toggle, enabled by default and persistent.
- Controls/collectors guide button.

### Story and ending screens

Text cards show chapter label, title, readable body text, progress indicator, **Continue**, and **Skip**. The next card should also be reachable by a click/key without requiring a tiny target. At the end of the prologue, start the tutorial. At the end of epilogue, show results.

### Gameplay HUD

- Upper-left: HP meter with numeric percent and readable label. Color changes from healthy teal/green to amber and then red; low health may have a restrained vignette.
- Nearby power state: **GOLDEN TOUCH** on land, **SAFE TO EAT / TOUCH SUPPRESSED** in tributary water.
- Upper-right: score and three chapter wine slots (tutorial wine is practice and does not count toward the secret ending).
- Room/chapter name at start and after transitions.
- Midpoint marker in the world; changes appearance when activated.
- Context toast for important state changes: enter tributary, touch returns, checkpoint, wine pickup, gold transformation, room clear, low nourishment.
- Pause button always visible during play. Escape toggles pause on keyboard.

### Pause screen

Resume, restart room, quit to title; repeat the hunger-drain and sound toggles here. Pausing must freeze game simulation, hazards, drain, and moving projectiles. Preserve the current room and settings.

### Room-clear screen

State clearly that the room was cleared, name the newly unlocked room, and offer **Enter next room**, **Replay room**, and **Rooms / Walkthrough**. Score and collected wine persist between rooms in the same run.

### Results screen

Show win/defeat state, a clear ending title and description, elapsed time, score, and chapter wine count. Provide retry and return-to-title actions. The secret ending is based on all three chapter wines.

### Controls and collectors almanac

Text-only: list keyboard/mouse/touch controls, explain bread and water, and describe score/wine. Do not put character pictures in this panel.

### Fast walkthrough / playtest

This is not the ordinary game mode. It rapidly simulates a complete victory route at high speed, visibly following the intended path and collecting the three chapter wines. It can play all rooms or start from a selected room. Clearly label the route and demo state; do not let demo behavior affect manual gameplay.

## 5. Controls and game rules

### Inputs

| Input | Land | Tributary water |
|---|---|---|
| A/D or Left/Right | Run left/right | Swim horizontally, with drag |
| W, Up, or Space | Jump; pass upward through thin ledges | Swim upward; at the surface, deliberately launch toward ledges |
| S or Down | Crouch | Dive / submerge |
| X or left click | Forward golden strike | Disabled; explain touch suppression |
| E or right click | Turn bread into a golden brick | Eat bread and restore nourishment |
| Escape / HUD pause | Pause or resume | Pause or resume |

Support touch controls with directional movement, jump, attack, and contextual E action. Avoid triggering browser context menu on right click during play.

### Nourishment and damage

- Start every new run/room at 100% unless deliberately preserving health between rooms; the room transition should state the rule. Preferred behavior: carry health forward between rooms, but room entry must not start at an unfairly low value.
- Passive nourishment drains continuously and slowly. Use a per-room increasing rate. Make it adjustable to achieve a forgiving but urgent run at beginning of game.
- Hunger toggle switches passive drain only. Enemy damage remains on.
- Contact with an enemy and enemy projectiles cause distinct, modest damage, brief invulnerability, and knockback. Never repeatedly drain health every frame during one collision.
- Low-health feedback is readable and calm enough not to obscure play. Do not play a painful alarm continuously.
- Water eating restores 25 percentage points, up to 100. Chapter wine restores 30 and is optional.
- Midpoint checkpoint restores 10 points and records a safe respawn position. Falling below the level should return Midas to the checkpoint and apply an appropriate consequence; avoid an instant unavoidable death loop.

### Movement and platforming

Recommended baseline for a 2D canvas around 650 px high: player collision body about 34×54 world units; land horizontal max speed about 285 units/sec; jump initial velocity about −690; gravity about 1280 units/sec². Tune for the screen/world scale, but all intended platforms must be reachable with a normal jump or a clearly explained water surface launch.

- Land movement has responsive acceleration and slight friction; release should stop Midas smoothly, not abruptly or with long ice-like drift.
- Water movement is slower (roughly 155 units/sec horizontal), damped, and buoyant. It should feel like swimming, not flying. Clamp swim velocity and vertical range.
- Jump must be available over rivers. Platforms are one-way: jump through from below, land on top from above. This rule holds anywhere in a room.
- A water surface launch is intentional and triggered by jumping at/near the surface. It should be distinguishable from indefinite upward flight.
- Collision shapes are independent of painted art. Check platform collision, enemy statue collision, spikes, river detection, and goal detection at actual play scale.

### Land/water interaction

**On land:** X strikes forward. E creates a bread brick; the bread itself does not heal on land. Bricks are solid, limited (suggested maximum six), and useful as a step or weight. Midas's touch can freeze enemies.

**In tributaries:** water suppresses the touch. X has no damaging action, enemies remain enemies, and E consumes bread for +25 nourishment while Midas pauses/slows enough that the choice feels deliberate. Show water state clearly. On leaving, golden touch returns.

**At the final Pactolus:** completing the final goal ends the curse and wins. Do not make an ordinary tributary count as the cure.

## 6. Enemy specifications

There are exactly two enemy families. Do not add boars, Gorgons, snake enemies, or other active enemy types.

### Satyr — grounded melee pursuer

- Silhouette: compact Greek woodland creature, human torso, goat legs, cloven hooves, short horns, tail, expressive face, wooden club.
- Always grounded on walkable platforms. Patrols while Midas is distant; accelerates smoothly toward him when in pursuit range. Stops/attacks only at a readable close distance.
- Do not let it walk off a ledge. Clamp patrol/pursuit to its assigned ground interval. When a platform ends, turn or select a valid neighboring platform.
- Animation rate follows speed: idle/patrol at rest, four-pose hoofed run when moving, clear club attack wind-up/strike if attack animation exists.
- Never crop horns, club, tail, feet, or left-side silhouette. Do not scale its height/width inconsistently between frames.

### Harpy — airborne ranged attacker

- Silhouette: mythic Greek winged woman with human face/torso, feathered wings, taloned feet; no snake hair or unrelated parts.
- Smooth hover patrol with modest movement and visible wing cycle. Keep flight intentionally airborne; do not let her behave like a grounded Satyr.
- When Midas is in range and not hidden, show a wind-up and fire a visible, dodgeable projectile. Projectile speed/arc/cooldown should allow a human reaction. Crouching in designated cover or diving underwater can defeat its line of sight.
- No continuous unavoidable tracking. Telegraph shots; avoid spawning projectiles inside the player.

### Golden statue transition

When X hits a living Satyr or Harpy while Midas is on land:

1. Verify the forward attack zone overlaps the visible enemy body, including a hovering Harpy and a low Satyr.
2. Change enemy state to `gold/statue`; cancel velocity, AI, wind-up, projectiles owned by it, and future damage.
3. Freeze on a readable pose (do not keep animating the run/wing cycle).
4. Apply a complete warm gold material or tint that covers the whole sprite. Add a brief shimmer/glint without hiding the silhouette. The original non-gold colors must not bleed through.
5. Enable stable solid collision aligned with the statue art. Player can stand on it or be blocked by it; it must not jitter.
6. Play the unique gold-transformation cue and a short visual burst.
7. The visual should be golden colored statue of satyr or harpy.

The same rule applies to both enemy types. In water, attack must not gold enemies. Test attacks on both sides/facings and at realistic relative heights.

## 7. World, level sequence, and progression

Use four sequential rooms: tutorial, Chapter I, Chapter II, final chapter. The world is a side view with authored solid platforms, optional one-way ledges, water ranges, cover, spikes, collectibles, midpoint and exit. Scenic art is a separate layer; it must not create accidental collision.

### Tutorial — Rose Garden of Phrygia

**Purpose:** teach movement, jump-through ledges, attack/statues, brick, tributary eating, wine, checkpoint, exit. Keep this safest and most spacious.

**Setting:** subdued palace garden with ruins, rose/olive greenery, and a few gold details. Do not tell the story solely through scenery; the text prologue establishes it.

Teach in order: walk/jump; jump through and land on a ledge; strike a Satyr and see it turn into a statue; E on land makes a brick; enter tributary and eat; use a ledge above water; collect a practice wine; reach midpoint and exit. Tutorial practice wine does not count toward the three secret-ending wines.

### Chapter I — Crumbling Foothills

**Purpose:** introduce hazard timing and the two enemy roles. Rocky Greek foothills with grounded ruins and visible cliffs. First chapter wine should reward an optional risky detour. Keep only satyr(short ranged attacker) in this chapter.

### Chapter II — Tributary Groves

**Purpose:** combine ground pursuit, ranged attacks, water-safe eating, hiding, and ledges above water. Dense but readable woodland; do not let vegetation obscure enemies or platforms. Keep only harpy(long ranged attacker) in this chapter.


### Final Chapter — Pactolus Canyon

**Purpose:** combine familiar challenges at higher density, with the final river and strong ending. Use a dramatic canyon and broad river, but preserve contrast and safe silhouettes. Keep both harpy & satyr here.
If level geometry changes, retain the sequence, intended mechanic, safe routes, midpoint, and reachable collectibles. Ensure every gap can be crossed by a reasonable jump, water surface launch, or intentionally placed platform.

### Escalation

- Tutorial: low pressure and safe demonstrations.
- Chapter I: first meaningful enemy/hazard combinations; modestly faster drain.
- Chapter II: alternating water/land, cover, and more coordinated enemy placement.
- Final Chapter: denser combinations, higher timing pressure, final river. Do not introduce a surprise enemy class or a new mandatory control at the end.

Increase only a few pressure variables at a time: passive drain, enemy density, projectile cooldown, or platforming. Every damage source needs a visual warning and reaction window. Checkpoints should precede especially demanding sections.

## 8. Visual art direction and composition

### Style target

No single medium is required. A strong default is softly rendered, illustrated Greek fantasy: warm stone, olive/forest greens, muted terracotta, distant blue-violet hills, and restrained gold/purple accents. A clean pixel-art direction is equally valid if all major characters, scenery, and props use it consistently. 

### Character readability

- Show full figure and clear side-view silhouette at gameplay size.
- Match approximate height and detail level across Midas, Satyr, and Harpy while preserving their different body plans.
- Feet/hooves should meet their ground line. Harpy has intentional air clearance. Weapons and wings remain inside the frame.
- Keep costume and palette stable across every animation frame.
- Design silhouettes so attack, jump, hurt, and gold states are distinguishable without relying on color alone.

### Background and river

- Background can be static. Use distant mountains, sloped hills, grounded columns/ruins, olive trees, cliffs, or a grounded village silhouette. Buildings must rest on terrain; nothing should float.
- Use atmospheric depth and subdued contrast. Do not use generic triangles/circles or repetitive noisy marks as the main scenery.
- Background and collision geometry are different systems. Platforms, spikes, river extents, checkpoints, and exits must be explicit and legible in front of scenery.
- River may be static or move subtly. Use layered depth, banks, and restrained highlights; avoid overly busy animation or a repeating stripe pattern. Make water boundaries clear enough for state changes and collision.
- Avoid background parallax so strong that it causes visual discomfort; keep a stable horizon.

### Interface art

Title and controls/almanac are text-only regarding characters. Use an ancient Greek-inspired display face for headings if legible, paired with a simple sans-serif for body/UI. Avoid small low-contrast serif paragraphs. Do not let decorative trim compete with controls.

## 9. Asset generation workflow and prompts

These prompts work without supplied reference images. Replace `[STYLE]` with a chosen medium and keep that phrase consistent across the main cast. Prefer separate transparent assets if a model cannot make aligned sprite sheets reliably.

### General workflow

1. Select one medium and rendering finish for all gameplay characters. Pixel art is optional.
2. Generate transparent-background assets or a clearly dimensioned sprite atlas. Exclude background, labels, letters, watermarks, extra figures, and frame dividers.
3. For atlases, specify rows/columns, frame count, equal cell dimensions, view angle, facing, scale, baseline/anchor, lighting, and pose sequence.
4. Inspect every frame at native resolution and at gameplay size. Reject cropped horns/feet/wings/club, anatomy errors, duplicated limbs, shifting proportions, or parts from another cell.
5. Record image dimensions, cell size, crop rectangle, display scale, anchor point, and animation rate. Do not rely on undocumented crop offsets.
6. Test on light and dark backgrounds. Use nearest-neighbor only for pixel art; use smooth resampling for painted art.
7. Keep original generated images and versioned alternatives. Never overwrite the only known-good asset before testing its replacement.

### Midas atlas prompt

> Create a production-ready 2D game sprite atlas for King Midas, a middle-aged Greek king with a kind but worried face, short dark beard, gold laurel crown, red-brown tunic, leather belt, and sandals. **[STYLE: specify one coherent visual medium and finish.]** Transparent background. One character only, no text, scenery, labels, borders, watermark, or shadows detached from the feet. Exact 4 columns × 4 rows, equal frame cells, consistent side-view facing right, camera, body scale, lighting, outfit, and baseline. Leave safe transparent padding so no crown, hand, foot, or costume is cropped. Row 1: four subtle idle/turn poses. Row 2: four distinct running strides, feet visibly contacting the same ground line. Row 3: jump ascent, jump apex, falling pose, forward punch. Row 4: two natural swimming strokes, diving pose, eating bread. Change pose clearly between frames without changing body proportions. Keep limbs anatomically clean and separated from cell boundaries. Designed for individual canvas frame crops.

### Satyr atlas prompt

> Create a production-ready transparent 2D game sprite atlas for one Greek woodland Satyr. **[STYLE: use the exact visual medium, finish, palette richness, line/detail density, lighting, and apparent resolution specified for Midas.]** Compact athletic humanoid torso, expressive face, short curved horns, goat legs, cloven hooves, small tail, and a clearly visible wooden club. Exactly four equal horizontal cells in one row; side view facing right; no text, labels, borders, scenery, extra creatures, snakes, boar traits, or watermark. Show four readable run-cycle poses: contact, passing, opposite contact, passing. Hooves touch the same baseline in every cell. Keep the complete horns, club, tail, and hooves inside each frame with transparent margin. Preserve scale/anatomy; no squashing or floating. The silhouette must read clearly at small game size.

### Harpy atlas prompt

> Create a production-ready transparent 2D game sprite atlas for one mythic Greek Harpy, a winged woman with expressive human face and torso, feathered wings, taloned feet, and restrained classical-fantasy costume. **[STYLE: use the same chosen medium and finish as Midas and Satyr.]** Exactly four equal horizontal cells in one row, side view facing left, no text, labels, borders, scenery, extra characters, snake hair, watermark, or cropped body parts. Show a continuous wingbeat: raised wings, transition, full downstroke, transition. Keep wing tips and talons inside every cell; keep body center and scale stable. Clean readable silhouette at small gameplay size.

### Static scenic background prompt

> Create a wide static side-scrolling 2D game background for an ancient Greek myth adventure near Phrygia and the River Pactolus. **Soft atmospheric illustrated landscape**, restrained painterly detail, warm limestone, muted terracotta, olive greens, and distant blue-violet mountains. Layered composition: sky and far hills, midground wooded slopes with Greek ruins and columns, nearer grounded cliffs/trees/riverbank stones framing the play area. Every building rests visibly on a slope or foundation; nothing floats. Keep the central playable zone relatively low-detail so small characters and hazards remain readable. No characters, interface, words, geometric pattern wallpaper, roads that look like platforms, pixel grid, or high-contrast clutter. Broad landscape aspect ratio; suitable for gentle color tinting in a browser game.

### Wine collectible prompt

> Create a standalone collectible sprite for a Greek-myth browser platformer: a small ancient wine flask associated with Dionysus, recognizable silhouette, deep grape-purple liquid, pale ceramic or glass highlights, a subtle vine ornament. **[STYLE: match chosen game art.]** Transparent background, centered, no text/pedestal/extra objects. Provide three equal-size animation cells (rest, small glint, subtle glow); consistent bottle scale and center; readable when displayed at about 48–64 pixels.

### Golden transformation effect prompt

> Create a short transparent-background 2D game effect for an enemy turning to gold: a compact expanding golden ring, a few warm metallic glints, and restrained shimmer. No character, text, scene, opaque bloom, or large particles. Keep a fixed canvas size and center; do not obscure the character silhouette. Readable over bright and dark backgrounds.

### Ground props prompt

> Create a small set of separate transparent 2D Greek landscape props in **[STYLE]**: olive tree, low broken column, stone block, riverbank reed/grass tuft, and scattered limestone rocks. Each prop is isolated with its own visible grounded base, no text, no shadows detached from the object, no background, no repeated tiled scenery. Keep game-scale silhouettes simple and readable.

## 10. Animation and rendering requirements

- Animation is state-driven: idle, run, jump up, fall, attack, hurt, swim, dive, eat; Satyr idle/patrol/run/attack/gold; Harpy hover/wingbeat/wind-up/shot/gold.
- Advance frames using elapsed time, not draw-call count. Clamp simulation delta after tab pauses. Frame rate should remain consistent across refresh rates.
- Keep state transitions deliberate. A punch should visibly extend; an attack should not be represented only by a brief static flash.
- Tie Satyr run cadence to movement speed. Do not play a fast run cycle when it is standing still.
- Ground Midas and Satyr using a foot/baseline anchor. Use a separate center/flight anchor for Harpy. Flipping must not shift the anchor.
- Sprite sheets need documented crop coordinates. Use isolated per-pose images when atlas generation quality is poor.
- Keep collision and art anchors separate but aligned. Statue collision should fit visible gold shape.
- Smooth acceleration/deceleration and enemy steering. Avoid sudden teleporting or position snapping except explicit respawn/launch.
- Keep hit-flash short and readable. Gold statues remain gold and frozen until the room resets.
- Background can remain static; subtle water or ambient motion is optional and must not affect collision.
- Fit the canvas to the viewport and account for device pixel ratio. Preserve input responsiveness on touch screens.

## 11. Audio direction, sound map, and prompt

The intended sound is **ancient Greek mythic adventure**, not medieval European fantasy. The sound palette can evoke lyre/kithara plucks, frame drum/tambourine, hand percussion, breathy aulos/reed flute, restrained low drone, and bronze/stone resonance. Keep most action cues short and dry. Music, if added, should support urgency and sorrow without making the game feel like a tavern, battle RTS, or arcade cabinet.

### Sound event map

| Event | Character |
|---|---|
| Menu selection / toggle | Soft single lyre-like pluck |
| Jump | Short airy lift/whoosh, light pluck accent |
| Landing | Sandal/stone or earth impact, quiet |
| Footsteps | Soft, spaced, surface-appropriate; never constant loud tapping |
| Punch | Compact body/cloth impact |
| Enemy becomes gold | Distinct bright bronze/gold shimmer; signature cue |
| Hurt | Brief low dissonance and muted impact; no prolonged alarm |
| Enter/leave water | Small natural splash, distinct from UI sound |
| Eat bread | Warm, gentle reassuring plucks |
| Bread becomes brick | Dull stone/metal thud |
| Harpy projectile | Brief feathered rush/air attack |
| Wine | Bright, slightly magical lyre/chime flourish |
| Checkpoint | Reassuring two- or three-note lyre phrase |
| Room clear | Short ascending lyre with light frame drum |
| Victory | Original celebratory Greek-inspired phrase, warm rather than bombastic |
| Defeat | Quiet descending lyre phrase |

### Audio generation prompt

> Create original short sound effects for an ancient Greek myth-inspired 2D platform adventure. Acoustic palette: lyre/kithara, small frame drum, hand percussion, breathy reed flute, subtle bronze/stone resonance, restrained cinematic ambience. Avoid generic medieval tavern clichés, electric chiptune, modern drum kits, recognizable melodies, vocals, and named-artist imitation. Deliver separate clean, low-latency clips with consistent loudness and minimal reverb: menu pluck; jump whoosh/pluck; sandal step and stone landing; compact punch; bright gold transformation shimmer; brief hurt sting; small water splash; warm eating cue; dull bread-to-brick thunk; airy Harpy projectile; Dionysian wine chime; reassuring checkpoint motif; short room-clear phrase; warm original victory phrase; quiet descending defeat phrase. Keep tails short so effects do not mask one another.

Use original/generated or properly licensed files and record licenses/attribution. Browser audio must start only after user interaction. Persist sound on/off. Avoid duplicate event calls, excessive footsteps, and low-health sounds that repeat painfully.

## 12. Technical implementation blueprint

This section gives a minimal architecture; another architecture is acceptable if it preserves the behavior.

### Data model

- `GameState`: screen, current room, health/nourishment, score, wine flags, settings, pause state, elapsed time, checkpoint, effects, projectiles.
- `Player`: world position/velocity, collision body, facing, grounded state, water state, invulnerability, action timers, current animation state.
- `Enemy`: type (`satyr` or `harpy`), position/velocity, home/patrol bounds, AI state, attack timer, alive/gold state, animation state.
- `Room`: world width, backdrop palette, solid floor segments, one-way ledges, water ranges, cover, spikes, enemy spawn data, treasure, wine, midpoint, goal, drain rate.
- `Settings`: passive hunger drain on/off and sound on/off; persisted safely in local storage.

### Update order

Each frame: (1) cap delta time; (2) process input; (3) update timers/passive drain; (4) update player motion and water state; (5) resolve platform/wall/fall collisions; (6) update enemies and projectiles; (7) resolve damage, attacks, pickups, checkpoint, and exit; (8) update camera/effects/UI; (9) render background, geometry, effects, enemies, player, and HUD. Keep simulation separate from drawing to prevent frame-rate-dependent physics.

### Collision notes

- Use world-coordinate rectangles or similarly stable shapes.
- One-way ledges only collide when the player is descending and the previous feet position was above the platform top.
- Solid floors and walls use explicit level geometry.
- Water membership should use a defined horizontal range and surface/depth rule; avoid toggling rapidly when Midas touches a boundary.
- Spike damage must match visible spike tips, not a broad invisible region.
- Projectiles should be removed after leaving useful bounds and should collide once per hit.
- Use brief invulnerability after damage to prevent repeated hits during one overlap.
- Gold enemies are statues: no AI, attack, projectile, or movement updates; solid collision remains.

### Persistence and progression

Persist settings and unlocked-room progress. On storage errors, continue with defaults. Unlock rooms sequentially after completing the prior room. Keep current-run score and wines between rooms; define whether they persist on restart and make UI match. Three chapter wines (not tutorial practice wine) unlock the secret ending.

## 13. Balance targets

Balance is judged by play, not by copying a number. Use these initial targets:

- Tutorial can be completed by a first-time player without a perfect run.
- On normal difficulty with drain enabled, a competent player has a meaningful margin for exploration and at least one safe meal; they should not be forced to speedrun without understanding the controls.
- Passive drain should be slow and predictable. A visible bar and low-health cue communicate urgency; no mysterious depletion.
- Enemies cause noticeable but recoverable damage. A hit should not erase the entire run unless the player is already near defeat.
- At least one safe tributary eating opportunity is available in the water-focused chapter; eating still requires situational choice.
- Optional wines reward detours with health/score and secret ending progress, not mandatory progression.
- Death/failure explains why and allows a quick retry.
- Difficulty rises across the four rooms but the final challenge uses known mechanics.

## 14. Atlas integration and rule tests

If this game is being added to the Atlas minigame collection, copy `src/minigames/_template/` into a directory named for the game (recommended slug: `golden-sprint`). Atlas discovers minigames from that directory. Follow the Atlas repository's `AGENTS.md` for required files, structure, APIs, and test conventions; those repository-specific instructions take precedence over assumptions in this guide. Run `npm test` from the Atlas project root before handoff.

Add a focused test at `test/golden-sprint.test.ts` for the central gameplay rule. Prefer testing a small game-rule function or state transition rather than browser rendering, animation timing, or an entire level. Keep the test deterministic and name it after the behavior it protects.

### Recommended central rule

**The golden touch works on land and is suppressed in tributary water.** Given a living enemy in range, a land strike changes it into a gold statue; the same strike while Midas is in tributary water leaves the enemy alive and unchanged. This is the strongest single rule to test because it protects the game's signature land/water contrast.

Example test intent (adapt imports and function names to the Atlas template and implementation):

```ts
describe('Midas golden touch', () => {
  it('turns an enemy to gold on land', () => {
    const enemy = createLivingEnemy();
    strikeEnemy({ player: createMidas({ inWater: false }), enemy });
    expect(enemy.state).toBe('gold');
  });

  it('does not affect an enemy in tributary water', () => {
    const enemy = createLivingEnemy();
    strikeEnemy({ player: createMidas({ inWater: true }), enemy });
    expect(enemy.state).toBe('alive');
  });
});
```

These function names are illustrative pseudocode, not a required API. If the implementation has no testable rule boundary, extract only the smallest pure function/state transition needed; do not restructure unrelated gameplay just to match this example.

### Other good rule-test candidates

Choose one central rule for the required minimum test; add more only when useful:

- **Tributary eating:** eating in water restores 25 nourishment; using the bread action on land creates a golden brick and does not heal.
- **True-river ending:** an ordinary tributary does not complete the game; reaching the final Pactolus goal does.
- **Statue behavior:** a golden enemy stops moving and attacking and is solid to player collision.
- **One-way ledge behavior:** the player can jump upward through a thin ledge and land on it while descending.
- **Hunger toggle:** disabling passive drain stops time-based nourishment loss but does not prevent enemy damage.
- **Progression:** clearing a room unlocks the next room, while an uncleared room remains locked.

Tests should protect actual game rules and stay independent of animation frame rate, visual effects, and random rendering details.

## 15. Acceptance checklist

Do not consider the game complete until these are verified in a browser.

### Story and screens

- [ ] A player unfamiliar with the myth understands the wish, curse, Marigold, tributary behavior, and Pactolus goal after the opening.
- [ ] Marigold is not carried during the run.
- [ ] Title screen has text but no Midas character image.
- [ ] Controls/collectors guide is text-only for characters.
- [ ] Standard ending resolves the cure, Marigold, and Midas's lesson; the secret ending adds the vineyard.
- [ ] Continue, skip, pause, results, retry, and navigation controls work.

### Movement, enemies, and art

- [ ] Jump reaches intended ledges; one-way ledges can be crossed from below and landed on from above, including above rivers.
- [ ] Water movement is controlled; Midas neither flies uncontrollably nor becomes trapped.
- [ ] Satyr is grounded, proportionate, smoothly animated, club visible, and never cropped/floating.
- [ ] Harpy flies smoothly, has clean anatomy, and telegraphs a dodgeable projectile.
- [ ] Only Satyr and Harpy appear as enemies.
- [ ] X transforms both enemy types into frozen, fully gold, solid statues on land; water suppresses the transformation.
- [ ] Background is coherent and grounded; scenery does not float and geometry/hazards remain distinct.
- [ ] River, spikes, wine, and checkpoints are easy to read.

### Progression, audio, and browser

- [ ] Hunger drains slowly by default; its toggle affects passive drain only.
- [ ] Tributary eating restores 25; land E creates a brick; wine restores nourishment.
- [ ] Midpoints are reachable and save a fair respawn; room completion unlocks the next room.
- [ ] Fast walkthrough visibly demonstrates the victory route and chapter wines without affecting manual play.
- [ ] Pause freezes simulation and resumes cleanly.
- [ ] Sound toggle persists; cues feel mythic/ancient Greek rather than generic medieval/electronic, without painful repetition.
- [ ] Runs from the documented browser entry point without external network dependencies.
- [ ] Test desktop and mobile/narrow viewport, keyboard/mouse/touch, asset loading, browser console, and local-storage failure.
- [ ] If integrated into Atlas, `npm test` passes and `test/golden-sprint.test.ts` covers the golden-touch land/water rule.

## 16. Reconstruction priorities

If building from zero, implement in this order:

1. Canvas sizing, input, player physics, solid platforms, one-way ledges, and camera.
2. Four rooms with explicit floor, ledge, water, hazard, checkpoint, collectible, enemy, and exit data.
3. Nourishment, tributary rules, land attack/statues, bread brick/eating, damage, and room progression.
4. Satyr and Harpy AI with telegraphs and damage.
5. Title, story cards, HUD, pause, room-clear, results, and text-only almanac.
6. Character/background/collectible assets and state-driven animation; verify crop and silhouette at gameplay size.
7. Sound, responsive touch controls, walkthrough, secret ending, visual polish, and full checklist pass.

At every stage, test the game loop rather than relying on a static mockup. A visually attractive page is not a reconstruction unless movement, hunger, water, enemy transformation, progression, and ending all work.

