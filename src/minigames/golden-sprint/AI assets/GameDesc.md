Golden Sprint



🏺 MIDAS TOUCH: BROWSER DESIGN COMPREHENSIVE

A Mythological Survival Platformer for Web Browsers

---

📜 1. The Core Narrative Context

The Setup

King Midas, consumed by absolute greed, begged Dionysus (the God of Wine) for the power to turn everything he touched into gold. The god granted his wish, but the blessing instantly became an agonizing nightmare. Midas accidentally transformed his beloved daughter, Marigold, into a cold, lifeless golden statue. Worse, he discovered he could no longer eat or drink, as all nourishment hardened into solid metal before it could pass his lips.

Desperate, weeping, and starving, Midas cried out for mercy. Taking pity on his tragic plight, Dionysus gave him one final chance:

"Race to the River Pactolus. Wash your hands in its source, and the curse will be broken, restoring your daughter. But hurry, Midas—your mortal flesh cannot survive starvation for long."

Lifting his golden daughter in his arms, Midas sprints out of his palace gates. His life force is draining by the second, and the wild monsters of Greece stand between him and salvation. He has packed an unlimited supply of bread rations for the journey, but on dry land, his own body remains his worst enemy.

The Main Menu

* [ Play Game ]
* [ Skip Tutorial & Begin Journey ] (Instantly launches into Stage 1 with a full HP bar for experienced players)

---

🎮 2. The Core Mechanics & MDA Framework

The game utilizes the MDA (Mechanics, Dynamics, Aesthetics) framework to drive high-tension, short-burst minigame loops:

* 🏆 Challenge: Balancing a constantly dropping health bar while shifting between combat physics and stealth evasion.
* 🌌 Fantasy & 🌟 Meaning: A deep, tragic mythological urgency that makes every second feel critical to saving Marigold.
* 🎲 Chance & Progress: Deciding exactly when to risk a leap to grab a hidden reward or sacrifice health to move faster.

The Two Gameplay Phases

🎰 Phase 1: The Golden Wilds (High Magic, Ticking Clock)

* The Midas Touch: Striking or jumping on an enemy instantly turns them into a frozen, solid golden statue. Midas can use these statues as heavy weights for puzzles or extra platform stepping stones to reach high ledges.
* The Starvation Curse: Midas' HP/Energy bar is constantly draining at a flat rate of 1% per second. Taking damage from enemies drastically slices your remaining time.
* The Golden Bread Trap: Midas carries unlimited bread rations in his inventory, but pressing the Eat button on land causes his fingers to instantly flash gold. The loaf hardens into a heavy Golden Brick. While it provides zero healing, Midas can drop these bricks manually anywhere to weigh down pressure plates, block enemy projectiles, or build his own stepping stones.

🌊 Phase 2: The Pactolus Tributary (Defenseless Evasion)

* Powerless Midas: When Midas steps into a river tributary, a blue flash cleanses his hands. He cannot turn anything to gold, his attack button is disabled, and he cannot drop Golden Bricks. Enemies must be snuck past using tall grass or timed platforming leaps.
* The Safe Feast: Because his hands are cleansed by the water, the water stream is the only place Midas can safely eat. Pressing the Eat button here allows him to consume his packed bread rations without them transforming, with each loaf restoring 25% of his Hunger Gauge. Players must find a safe hiding spot in the water to spend precious seconds eating before returning to dry land.

🍇 Hidden Rewards (Dionysus’ Wine Bottles)

Tucked away in dangerous, hard-to-reach secret areas across the levels are Dionysus' hidden wine bottles. Because wine is a divine liquid, Midas can drink it on dry land without it turning to gold. Finding a bottle acts as an instant 30% health burst and counts toward the secret perfect ending.

---

💻 3. Exact Browser Control Scheme & Event Architecture

To make the transition between Phase 1 and Phase 2 feel smooth and immediate, the engine maps the exact same buttons to different contextual actions based on a boolean toggle variable (isInWater).

⌨️ Desktop Keyboard & Web Browser Bindings

Input Key	Land Phase Action (Gold Active 🟡)	Water Phase Action (Cleansed 🔵)
		
A / D or ← / →	Move Left / Right	Swim Left / Right (Slower, drifting physics)
W or Spacebar	Jump (Standard crisp platforming arc)	Surface (Swim upward toward air)
S or ↓	Crouch (Drop down from thin platforms)	Dive (Submerge below projectile layers)
J or Left-Click	Midas Strike (Melee punch to freeze monsters)	DISABLED (Midas flashes blue, unable to attack)
E or Right-Click	Spawn Golden Brick (Turns bread into a structural block)	Eat Bread (Stands still to consume and heal +25% HP)


📱 Responsive Touch Interface

For mobile browsers, a dynamic overlay updates in real-time. When isInWater changes to true, the browser event hooks replace the J Button style with a grayed-out padlock icon and morph the asset on the E Button from a solid brick into an animated green leaf.

---

🎬 4. Visual Storyboard Breakdown

This opening cinematic plays directly inside the browser viewport upon selecting "Play Game":

* Panel 1: The Throne Room of Phrygia: A close-up shot of King Midas' royal throne. The ground around it is covered in heavy, glittering solid gold treasure chests and armor. Midas sits slouched, his face buried in his hands. A low, ominous wind hums through the columns.
* Panel 2: The Statue of Marigold: The camera cuts to a wide tracking shot, revealing a life-sized gold statue of a young girl standing mid-laugh. Midas walks into the frame, trembling. He gently touches her cheek; his hand hits cold, unyielding solid metal with a high-pitched, crystalline chime.
* Panel 3: The Hunger and the Bread: A split-screen focus. On the left side, Midas' stomach growls violently. On the right, Midas snatches a loaf of fresh bread from a banquet table. The instant his fingertips pinch the dough, a bright flash of gold lightning erupts. The loaf transforms into a sharp, heavy geometric Golden Brick, slipping through his fingers and smashing through the wooden table with a splintering crash.
* Panel 4: The Divine Vision: A warm, shimmering purple mist rolls through the shattered palace windows, parting to reveal the glowing silhouette of Dionysus floating lazily. Dionysus lifts a silver chalice, pointing a vine-covered staff toward the mountains: "The River Pactolus holds your cure, Midas! Wash away your greed before your starved flesh turns to dust."
* Panel 5: The Leap to Salvation: Midas stands at the balcony with his heavy golden daughter slung securely over his back, bound by fine silk tapestries. He leaps off the balcony edge, plunging downward toward the trails. The UI Hunger Gauge instantly flashes onto the screen, ticking down from 100%. [ PRESS ANY KEY TO BEGIN THE RUN ]

---

👾 5. The Mythological Bestiary (Enemies)

The same monsters appear across both dry land and water zones, but their tactical behaviors change completely depending on Midas' active curse status:

⚔️ Short-Range (Melee) Monsters

* The Satyr Scrapper: Half-man, half-goat beasts that patrol platforms.
  * On Land: Midas can strike them to turn them into solid Golden Blocks to climb cliffs or block traps.
  * In Water: Midas cannot attack. The Satyr relentlessly charges and tackles Midas, cutting a massive chunk out of his remaining HP bar.
* The Phrygian Boar: Heavy, fast boars that charge horizontally across the ground.
  * On Land: Freezing them mid-charge creates a Heavy Ramming Stone that Midas can push into cracked walls.
  * In Water: Midas must timed-jump completely over them as they splash furiously through the currents.

🏹 Long-Range (Ranged) Monsters

* The Harpy Scavenger: Flying bird-women that hover in the sky and drop rocks.
  * On Land: Midas must bait their dive, turning them into a Floating Golden Platform mid-air to cross chasms.
  * In Water: Midas is completely defenseless. The Harpy snipes from above; Midas must dive under the water surface to dodge projectiles.
* The Gorgon Initiate: Stationary snake-haired cultists standing on distant high ledges, firing petrification beams.
  * On Land: Striking them turns them into a Golden Mirror Statue that blocks or reflects subsequent projectile traps.
  * In Water: Midas cannot approach them. He must utilize stealth tall bushes along the riverbanks to break their line of sight entirely.

---

📺 6. The HUD User Interface (UI)

The responsive web interface overlay tracks status updates without cluttering native screen areas:

[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥🟥] (⚡)                                            [🍷][🍷][🍇] 002,450
     HUNGER GAUGE        EMBLEM                                             WINE SLOTS    SCORE
                                                                            
                                                                            
                                       ( MIDAS )
                                    
                                       
                                 [🌊 STEALTH ACTIVE]
                                    PROMPT LOG


🚨 Top-Left: Survival Status

* The Hunger Gauge (HP/Energy): A long health bar stylized like an ancient Greek mosaic tile row. It is a vibrant Elysian Teal when full and fades to an Underworld Crimson as it ticks down. Below 20%, the borders of the entire screen pulse with a heavy red vignette.
* The Power Indicator Emblem: A circular seal next to the gauge.
  * Land Phase: Displays a glowing Olympic Gold Hand symbol (Touch is active).
  * Water Phase: Displays a greyed-out hand covered by a washing Blue Current wave animation (Touch is cleansed).

🍇 Top-Right: Performance Tracking

* Dionysus’ Flasks Slot: Three empty bottle outlines. When you discover a hidden wine bottle, an icon fills in with a bright Amethyst Purple liquid.
* The Treasury Counter (Score): A standard numeric counter with a small gold coin symbol next to it, tracking acquired points.

💬 Bottom-Center: Contextual Action Prompts

Dynamic text pops up right under Midas when absolutely necessary:

* During starvation crisis: "⚠️ STARVING - FIND WATER OR WINE!"
* When entering the stream: "🌊 CURSE CLEANSED - STEALTH ACTIVE"

---

🗺️ 7. Level Design & Progression Roadmap

🎓 Level 0: Tutorial – The Rose Garden of Phrygia

* The Vibe: A beautiful, melancholy palace garden filled with statues of birds and servants that Midas has accidentally turned to gold. Can be skipped entirely from the main menu.
* The Layout: Midas' HP bar begins ticking down. The player turns a patrolling palace guard into a gold statue to use as a platform to climb a high ledge. The player is prompted to press Eat on dry land to generate a Golden Brick to solve a weight puzzle, then step into a shallow fountain pool to safely eat a loaf of bread and recover health. A Dionysus wine bottle is placed out in the open to teach the healing mechanic.

🏛️ Stage 1: The Crumbling Foothills (Phase 1 Focus)

* The Vibe: Craggy Greek mountain paths leading away from the palace, filled with ruins, steep vertical drops, and roaming monsters.
* The Layout: Multiple harpies must be frozen mid-air to bridge a massive gorge. To activate a crude stone elevator, the player can choose to lure a boar onto a weight-basket or manually spawn several heavy Golden Bread Bricks onto it. A wine bottle is hidden at the bottom of a dangerous spike pit.

🌲 Stage 2: The Tributary Groves (Phase 2 Split-Focus)

* The Vibe: A dense, overgrown forest canopy where the first shallow stream from the River Pactolus snakes through the mud.
* The Layout: The first half is a dry land sprint. The second half drops Midas into knee-deep water, wiping his powers. The gameplay shifts to sneaking past Satyrs in tall grass and diving under water to dodge Harpy rocks. Players must take advantage of the safe river zones to stand still and consume multiple bread rations to completely refill their health.

🌊 Stage 3: The Golden Canyons of Pactolus (The Finale)

* The Vibe: A massive, roaring canyon where the main River Pactolus flows. The environment is a chaotic mix of raging rapids, collapsing bridges, and elite mythological monsters.
* The Layout: The level switches rapidly between land and water. The player must freeze a Gorgon to block a projectile trap, immediately drop into a fast-moving current to sweep past a group of boars, and sprint toward the final waterfall where Marigold's statue awaits, using their remaining bread blocks to bridge quick vertical drops.

---

🏁 8. The Narrative Resolutions

🏆 Standard Ending (Complete the Game)

Midas executes a final, desperate leap over a wave of monsters, grabbing Marigold’s golden hand mid-air as they both plummet into the deep, roaring waters of the River Pactolus. The heavy, cold gold washes away in brilliant shimmering veins, permanently turning the river sands gold. Marigold gasps for air, her stone skin turning back into warm, living flesh as Midas pulls her safely to the riverbank. They embrace under the sun, finally free of the golden curse.

🍇 The Secret Ending: The Vineyard of Phrygia

(Triggered only if the player discovers and collects every single hidden Dionysus Wine Bottle across Stages 1, 2, and 3)

Midas and Marigold plunge into the river, breaking the curse. As they catch their breath on the riverbank, a warm, gentle breeze sweeps through the canyon, carrying the rich scent of crushed grapes. Dionysus appears, lounging on a mossy rock, holding the empty wine bottles you recovered.

The god smiles warmly:

"You have learned the true worth of gold, Midas. But more importantly, you rescued my finest stolen vintages from the monsters of the wilds. A king who values his family and fine wine deserves a true reward."

Dionysus waves his hand. Across the riverbank, a breathtaking, sun-drenched valley instantly blooms. Lush green vines heavy with sweet, violet grapes twist around beautiful stone arches. A modest, peaceful farmhouse sits at the center.

"The crown of Phrygia brought you nothing but misery," Dionysus declares. "Leave your palace behind. This valley is yours. Your hands will never touch gold again—only soil, sweet fruit, and the warmth of a peaceful life."

The game cuts to a quiet epilogue scene: Midas, dressed in simple linen robes, happily harvesting grapes in the rows while Marigold laughs nearby under the warm Greek sun. The curse is gone, replaced by a joyful, simple life in his own private vineyard.





