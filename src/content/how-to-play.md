# How to Play RolloDek

## What You Need
- Your hero deck ({{startingDeckSize}} cards to start)
- The Adventure Deck, which stands in for a GM
- Your hero card, to track wounds
- Two six-sided dice

## Setup
1. Choose your hero. They come with fixed stats, an HP threshold, and a {{startingDeckSize}}-card starting deck.
2. Shuffle your hero deck and draw a hand of {{handSize}}.
3. Your hero starts with one Item, Vehicle, or Companion tied to their backstory, already in their Hero's Party slot.
4. The Adventure Deck reveals the first Scene's locations.

## The Turn
Each Scene runs through four phases, in order:
1. **Advance** — the new Scene's locations are revealed.
2. **Setup** — your hand redraws to {{handSize}}, your tableau untaps, and this is when you swap gear or spells.
3. **Explore** — flip locations one at a time and resolve what's there. Combat happens here too.
4. **Conclude** — objectives are tallied. If your hand is over {{handCap}} cards, discard down to {{handCap}}.

## Resolving a Check
- The Adventure Deck tells you the stat being tested and the difficulty tier: Easy, Medium, or Dangerous. The actual target number stays hidden.
- Commit one or more cards from your hand or untapped tableau to the check.
  - **On-stat**: your hero's Base Stat + the card's on-stat number (in the hexagon).
  - **Off-stat**: just the card's off-stat number.
- Once your cards are committed, roll 2d6 to generate the hidden target for that tier. You commit knowing only the tier, never the number.
  - Rolling snake eyes ({{snakeEyesRoll}}) is always a remarkable success, no matter your total.
  - Rolling boxcars ({{boxcarsRoll}}) is always a harsh complication, no matter your total.
- Outcome is Success, Fail, or — on {{paidCostTiers}} checks only — you can pay a wound to turn a Fail into a win. {{unpaidCostTiers}} checks carry real risk with no buy-out.

## Combat
- Starts when a location or event reveals a Threat.
- Rounds alternate: you attack, then the Threat attacks.
- You can attack with any card, using any stat, your choice.
- When the Threat attacks, it calls out the stat you're defending with, resolved the same on-stat/off-stat way as any check.
- A Threat goes down at 0 HP. You can also try to stun it or escape instead of finishing the fight.

## Wounds & Death
- Wounds attach to your hero card, not your deck.
- If wounds reach your hero's HP threshold, your hero dies and the mission ends.

## Ending the Mission
- **Mission Success** — you reach the final Scene having completed {{objectivesToWin}} or more of the mission's {{objectivesTotal}} objectives.
- **Mission Failure** — you reach the final Scene having completed fewer than {{objectivesToWin}}.
- **Hero Death** — wounds hit your HP threshold before either of the above.
