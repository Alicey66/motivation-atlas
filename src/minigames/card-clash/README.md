# Card Clash

## Mechanic

Finish with more points than the bot. You go first. Click, tap, or focus a
legal card and press Enter or Space. Numbers add their value. Undo cancels
the opponent's latest uncanceled number's original points; an existing Double
bonus remains. Double adds your latest uncanceled number's value once more.
Reveal publicly shows one random opposing hand card without taking it; both sides can read its name and effect in Public information. Defense blocks
the next opposing action, not numbers. Shuffle removes itself and exchanges
both remaining hands.

No cards are drawn. Unplayable choices are disabled; pass only when no legal
card exists. When neither side can act, compare scores; ties draw.

**Randomized Mode** applies only on **New Game**. ON deals five cards each,
at least three numbers, from 29 unique cards: two copies of 1–12 and one
of each action. Nineteen cards stay unused. OFF uses a separate ten-card
scenario: each side gets 1, 5, 11, Undo, Double. The bot follows the same
deterministic policy in both modes. Its hand stays hidden except public
reveals; fixed starting composition is public.

## Dynamic

During playtesting, Fixed Mode produced a more predictable strategic experience. Since both players had the same starting hand, including two action cards, they could anticipate the types of moves available to each other. This made the game more structured, with decisions shaped by a relatively stable set of options.

In Randomized Mode, uncertainty increased beyond the values of the number cards to include the distribution of action cards. Because players could not see the opponent's hand, they had to make decisions without knowing which special abilities the opponent might still hold. This uncertainty made it harder to predict the opponent's strategy and encouraged more adaptive decision-making.

## Aesthetic

Fixed Mode felt more systematic and predictable because both players started with the same known card composition. Randomized Mode created a stronger sense of uncertainty and suspense: players had to consider not only the opponent's score, but also the possibility that the opponent was holding an unexpected action card. This made the randomized version feel more varied and engaging, increasing its replayability by creating different strategic situations across games.

## Sources

The Competition note describes adversarial play with "clear feedback about who is winning,"
(Hunicke et al. 2004, p. 3). Visible scores support comparison; playtesting
must establish what emerges.

Original code and text created with Codex; no borrowed assets. Codex suggested
unique IDs for tracking transfers and cancellations; kept.
