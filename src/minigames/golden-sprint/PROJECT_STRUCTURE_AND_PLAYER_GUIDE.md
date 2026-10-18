# Golden Sprint: project structure and player guide

This folder contains the Atlas minigame implementation. The separate rules test is at `test/golden-sprint.test.ts`.

```text
golden-sprint/
├── AI assets/
│   ├── DevelopersGuide.md
│   ├── GameDesc.md
│   ├── cinematic-scenes.png
│   ├── dionysus.png
│   ├── harpy-flight-v2.png
│   ├── marigold-statue.png
│   ├── midas-sprites.png
│   ├── plot.jpg
│   ├── satyr-run-v4.png
│   └── wine-sprites-v2.png
├── platformer/
│   ├── game.js
│   ├── index.html
│   └── styles.css
├── PROJECT_STRUCTURE_AND_PLAYER_GUIDE.md
├── README.md
├── game.ts
├── golden-sprint.css
└── index.ts

test/
└── golden-sprint.test.ts
```

## How to start and play

1. Open the Atlas **Progress** page and scroll to **Play with it → Golden Sprint**.
2. Set **Hunger drains over time** above the game. This is the mechanic to compare: enabled drain gradually increases across rooms; disabled drain stops passive loss. Enemy and hazard damage still applies either way.
3. Inside the game, enter a runner name and select **Begin the Myth**. Read the short story by clicking, tapping, or pressing a key. Use **Skip story** if you want to start moving sooner.
4. In the Rose Garden tutorial, keep the pinned control legend and current lesson visible as you learn. It stays on screen until you enter the next room. Then move through the four rooms, collect optional wine, touch checkpoints, and reach the River Pactolus. Room clears unlock the next room. If Midas falls, choose **Retry [room]** to try again from that room's entrance with the progress he had when he entered it.
5. At the result screen, review the time, points, and leaderboard entry. Winning runs are ranked locally in this browser; the export button saves run history as a text file. Record what the player felt with drain on and off in the Dynamic and Aesthetic sections of `README.md`.

**Controls:** move with **A/D** or **←/→**; jump/swim upward with **W**, **↑**, or **Space**; crouch/dive with **S** or **↓**; attack with **X** or left-click; use bread with **E** or right-click. In water, **E** eats and restores nourishment while **X** is unavailable. On phones, use the on-screen buttons. Use **Expand game** above the frame for fullscreen play.

The **Fast Walkthrough** option is a non-scoring demonstration for previewing rooms; it does not unlock campaign progress. Click or tap inside the game frame before using keyboard controls.

## Files and responsibilities

- `index.ts` is the Atlas adapter. It exports the minigame, maps local images to the paths expected by the platformer, embeds the platformer HTML/CSS/JavaScript into an iframe, connects the Atlas hunger checkbox to the game, provides the expand-screen button, and cleans up its listeners and iframe on unmount.
- `golden-sprint.css` styles the Atlas-facing wrapper, mechanic control, iframe, and fullscreen layout.
- `game.ts` contains DOM-free helpers for the hunger-drain multiplier, nourishment calculation, and leaderboard ordering.
- `README.md` is the player-facing minigame write-up rendered by the Atlas. It includes controls, the toggle mechanic, dynamics, aesthetics, and the cited course-note source. Its playtest observation placeholders need real player feedback before submission.
- `platformer/index.html` defines the in-game screens and interface: title, story, HUD, controls, pause, room-complete, results, and leaderboard.
- `platformer/styles.css` defines the platformer's visual presentation, animations, HUD, responsive layout, and touch controls.
- `platformer/game.js` implements the playable game: movement, jumping, rooms, enemies, combat, hunger, water, pickups, checkpoints, score/time, leaderboard, and audio.
- `AI assets/plot.jpg` supplies the menu and story background artwork.
- `AI assets/GameDesc.md` is the original comprehensive game concept and design brief.
- `AI assets/DevelopersGuide.md` is the detailed implementation/design guide. Both reference documents are kept with the game's art and are not loaded by the game code.
- `AI assets/cinematic-scenes.png` supplies story and result-scene artwork.
- `AI assets/midas-sprites.png` supplies Midas's animated player sprites and story character poses.
- `AI assets/satyr-run-v4.png` supplies Satyr enemy animation.
- `AI assets/harpy-flight-v2.png` supplies Harpy enemy animation.
- `AI assets/wine-sprites-v2.png` supplies wine collectible animation.
- `AI assets/dionysus.png` and `AI assets/marigold-statue.png` supply the story character artwork.
- `test/golden-sprint.test.ts` checks the central hunger-toggle rule and leaderboard tie-breaking. It is outside the minigame folder so the project's test runner discovers it.

All files under this game folder and `test/golden-sprint.test.ts` are additions relative to `main`; the shared Atlas template and other tracked files are unchanged.
