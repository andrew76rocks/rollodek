# How to Play RolloDek

## What You Need
- Your hero deck ({{startingDeckSize}} cards to start)
- The Adventure Deck, which stands in for a GM
- Your hero card, to track wounds
- Two six-sided dice

## Setup
1. Choose a mission. It tells you the goal and the {{objectivesTotal}} objectives you're working toward.
2. Choose your hero. They come with fixed stats, an HP threshold, and a {{startingDeckSize}}-card starting deck.
3. Shuffle your hero deck. You draw your first hand at the first Setup.
4. Your hero starts with one Item, Vehicle, or Companion tied to their backstory, already in their Hero's Party slot.

## Your Hero Deck
- Every card shows one value.
- **Action** and **memory** cards tag one stat. **Crossover** cards tag two, and count as on-stat if the challenge matches either one. **Wild** cards count as on-stat for any challenge.
- New gear and spells you find go into your discard pile first, never straight to your hand or tableau. You'll see them again when the discard is shuffled back in.
- When your draw pile runs out, shuffle your discard pile to make a new one.

## The Turn
One Scene is one turn. Each Scene runs through four phases, in order:
1. **Advance**: the new Scene's location cards are laid out, art side up.
2. **Setup**: your hand redraws to {{handSize}}, your tableau untaps, and this is when you swap gear or spells.
3. **Explore**: flip location cards one at a time and resolve what's on the back. Combat happens here too.
4. **Conclude**: objectives are tallied. If your hand is over {{handCap}} cards, discard down to {{handCap}} (your choice) before the next Scene.

Cards you play don't come back until the next Setup.

## Resolving a Check
- The location card tells you the stat being tested and the difficulty tier: Easy, Medium, or Dangerous. The actual target number stays hidden.
- Commit any number of cards from your hand or untapped tableau, including none at all.
  - **On-stat**: your hero's Base Stat + the card's value.
  - **Off-stat**: just the card's value.
  - Your Base Stat counts once per check, however many cards you commit. With no cards, you roll on your Base Stat alone.
- Once your cards are committed, roll 2d6 to generate the hidden target for that tier. You commit knowing only the tier, never the number.
  - Rolling snake eyes ({{snakeEyesRoll}}) is always a remarkable success, no matter your total.
  - Rolling boxcars ({{boxcarsRoll}}) is always a harsh complication, no matter your total.
- Outcome is Success or Fail. On {{paidCostTiers}} checks only, you can take 1 wound to turn a Fail into "success, but." {{unpaidCostTiers}} checks carry real risk with no buy-out.

## Combat
- Starts when a location puts you up against a hostile Encounter: the enemy.
- Rounds alternate: you attack, then the enemy attacks.
- You can attack with any card, using any stat, your choice.
- When the enemy attacks, it calls out the stat you're defending with, resolved the same on-stat/off-stat way as any check.
- An enemy goes down at 0 HP. You can also stun it or escape instead of finishing the fight. Escaping earns no reward, and a stunned enemy goes back into the Adventure Deck and may show up again.

## Wounds & Death
- Wounds attach to your hero card, not your deck.
- If wounds reach your hero's HP threshold ({{heroHpThreshold}}), your hero dies and the mission ends.

## Ending the Mission
- **Mission Success**: you reach the final Scene having completed {{objectivesToWin}} or more of the mission's {{objectivesTotal}} objectives.
- **Mission Failure**: you reach the final Scene having completed fewer than {{objectivesToWin}}.
- **Hero Death**: wounds hit your HP threshold before either of the above.
