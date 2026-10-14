# Playtesting — student self-test recorded; other-person comparison pending

AI-use disclosure: Codex drafted the protocol. Only the student and a real player may supply observations.

Student rationale (paraphrase of the student's account): I like exploring without a guide, finding optional chests, and doing exploration work early so its rewards make later play easier. Fogbound focuses on discovery, supported by collection and sight upgrades.

## Another-person session, about 6–8 minutes

1. Open the Discovery page. Read only the controls and goal; do not tell the player which feelings to expect.
2. Start with Fog of war checked. Let the other person play unassisted. Record time, relic count, route choices, pauses, and any help or technical problems. If unfinished after two minutes, record that; allow completion or stop honestly.
3. Ask: “What did you feel?” and “What made you decide where to go?” Record their words without leading them.
4. Uncheck Fog of war (resets the run). The same person plays again, with the same map, rewards and controls.
5. Ask the same questions, then “What changed?” and “How much did remembering the first round help?”
6. Do not collect names or identifying information. Update README Dynamic and Aesthetic from the actual observations. A student self-test or assistant browser check is separate evidence and does not satisfy this requirement.

## Evidence to fill after the session

Status: Not conducted. No observations, quotations or feeling ratings recorded.

| Evidence | Fog on | Fog off |
| --- | --- | --- |
| Duration and completion | Pending | Pending |
| Outposts / relics | Pending | Pending |
| Detours and decisions | Pending | Pending |
| Player's own feeling words | Pending | Pending |
| Assistance / errors | Pending | Pending |

Same-map order is required on then off by the assignment; memory and practice can influence the comparison. This single small session cannot isolate fog's effect from learning or generalize to all players.

## Assistant checks

Checked 2026-10-13 (America/New_York):

- Before implementation: existing suite 98 tests passed.
- After implementation and input-focus fix: `npm test` — 108 tests passed across 20 files, including 8 Fogbound tests.
- `npm run typecheck` and `npm run build` passed.
- `npm run e2e` — 16 upstream browser tests passed. These cover desktop and phone, but do not include the new Discovery game page.
- Separate assistant browser check on Discovery: game mounts and starts; direction control changes player position; fog toggle resets position/mode; at 390×844 viewport, document width 375 <= viewport width 390, no horizontal overflow. Screenshot inspected.
- The first local-server/e2e attempts were blocked by sandbox port restrictions; the same commands ran with approved local-listening permissions and succeeded.
- At the time of these engineering checks, no human run, completion-time measurement or player-feeling observation had been recorded. The later student self-test is recorded separately below. Automated reachability checks establish that all chests and outposts can be reached, not that their placement is enjoyable.

These checks establish engineering behavior, not enjoyment or human feelings. PR CI is pending until an authorized PR exists.


## Student self-test feedback — 2026-10-13, prototype ac06930

Provenance: student-reported in this chat, paraphrased by Codex. This is the designer's self-test, not another-person playtest. No measured duration, complete route, relic count, or explicit paired fog-off run was supplied. It does not fill the pending comparison table above.

Reported observations:

- Chest purpose and interaction were unclear. The student wanted E / Space prompts inside the game viewport near the chest. On opening, the main visible change was the chest losing its fill; no clear reward or player animation was noticed.
- Clicking outside the viewport caused uncertainty about how to resume keyboard movement. The student also reported apparent freezes resolved by Restart expedition, and described this as frustrating. The exact trigger of each freeze is not established.
- Three outpost hits felt arbitrary and poorly signposted. The student wanted a nearby prompt, visible three-step progress, hit reactions and an opening effect.
- Opening the second outpost halted play. The student wanted a win announcement followed by continued movement and optional chest collection.
- Movement felt somewhat slow. The student suggested a slightly faster speed, brief acceleration and almost immediate stopping, without noticeable drift.
- Dim remembered terrain was preferred to fully black terrain after leaving. Fog was reported to encourage exploring the map. This is the student's perception, not a measured causal on/off result.
- Walls were considered useful for finding chests.

Ideas proposed by the student, not observed features:

- Chest-opening particles or pop-out rewards, player feedback, and more functional chest rewards.
- Outpost text/hit scaling and a burst on the third hit.
- A centered You Win announcement shrinking into a corner while free exploration continues.
- An optional alternative: collected chest resources charge a three-segment outpost bar. This would change core progression and is not approved as the next design.

Assistant code inspection (separate from observations): keyboard handlers are scoped to the focusable board; leaving it stops keyboard control. Hiding the document sets paused=true, with Resume currently outside the viewport. Completion explicitly disables move/interact and skips the update loop. Chest interactions do update relic state, counter and a story message, but the message is below the viewport; no in-world prompt or opening animation exists. These facts explain several reported symptoms but do not establish the trigger of every reported freeze.


## Approved second revision — 2026-10-13

User approved a local iteration: in-world prompts, feedback, focus-loss pause and click-to-resume, faster movement with brief acceleration and immediate stopping, and continued collecting after win. The user additionally suggested supplies for outposts and more corner collectibles. Implemented small version: 6 ordinary supply chests and 2 optional star relics; first pulse at each outpost consumes one supply, next two pulses cost none. No relic speed bonuses yet. Two ordinary chests are required for victory; remaining collection is optional. These rules are identical with fog on and off.

Technical evidence (assistant, not new human observations): 112 tests across 20 files passed, including 12 Fogbound tests; typecheck and build passed. Upstream e2e: 16 passed (not specific to Discovery). Actual browser: near-chest prompt appears inside viewport; opening updates treasures to 1/8, supplies to 1 and shows a reward message/burst; clicking outside shows paused overlay; clicking resume preserves player coordinates and inventory. New page has no horizontal overflow at 390px. Independent read-only review found no blocking issue.

Known scope: stars are collectible, not power-ups. Timing and enjoyment of this revision have not been measured by a human. First-win statistics are frozen; later exploration continues separately. This revision has not been pushed and no PR has been opened.


### Pause-overlay regression — 2026-10-13

Student reported that clicking the paused viewport failed while the lower Resume button worked. Assistant reproduced it in the in-app browser: overlay remained visible and status paused after clicking. Root cause: hiding the focused overlay generated a null-target focusout, which re-paused the game before board.focus ran. Fix transfers focus to the board before hiding the overlay. Regression test reproduced the browser-specific hiding/focusout side effect at the DOM boundary and failed before the fix, passed after. Actual browser recheck: overlay click resumed; direction input moved x from 3.5 to 3.932; clicking outside then the overlay again preserved x=3.932 and resumed. Full suite 113 tests passed; typecheck and build passed. No new human-experience evidence, no push or PR.


### Compass visibility refinement — 2026-10-13

Student requested hiding the edge compass when the destination flag is visible. Implemented: arrow remains for off-screen targets or on-screen targets still hidden by unexplored fog; it disappears for lit or remembered target markers inside the camera viewport. It reappears when the target is off-screen, and no arrow is shown when all outposts are open. Regression covers these states in both fog modes. 114 tests, typecheck and build passed. Local change only; no push or PR.


### Movement easing iteration — 2026-10-13

Student reported that start/stop acceleration did not feel effective and requested refinement. Replaced the short linear scalar ramp with exponential velocity easing: approach full speed over roughly 120ms, release easing time constant 18ms (maximum residual travel about 0.039 tiles), and continuous direction changes. Pause/focus-loss clears velocity immediately. Maximum speed remains 2.16 tiles/s; rewards, layout and fog rules are unchanged. Simulation updates every 16ms instead of 40ms, with unchanged tile colors skipped during DOM updates. This is a configured update interval, not measured guaranteed browser FPS.

Regression tests failed on the previous abrupt-stop/reversal behavior before the fix. Full suite: 116 passed including 16 Fogbound tests; typecheck/build passed. Tests verify limited stopping travel, continuous reversal, diagonal normalization and equivalent displacement at different update frequencies. Subjective feel of this iteration still needs the student's next self-test; other-person comparison remains pending. Not pushed.


### In-viewport start entry — 2026-10-13

Student requested starting directly inside the freshly loaded game. Added a full-viewport Click to start button with WASD/arrows and E/Space instructions; clicking the viewport starts a new expedition and focuses movement. The lower equipment/restart button remains available. Changing fog returns to the start screen. Focus is transferred before the entry overlay is hidden, preserving the pause-overlay regression fix.

Regression failed before the implementation; 117 tests (17 Fogbound), typecheck and build passed afterward. Actual browser: click entry hides start screen without pausing, direction input moves x from 3.5 to 3.978; reset returns to entry. This is an assistant technical check. No new human observations, no push or PR.
