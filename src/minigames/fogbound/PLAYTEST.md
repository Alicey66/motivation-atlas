# Playtest protocol — not completed

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
- No full human run, completion-time measurement or player-feeling observation has been performed. Automated reachability checks establish that all chests and outposts can be reached, not that their placement is enjoyable.

These checks establish engineering behavior, not enjoyment or human feelings. PR CI is pending until an authorized PR exists.
