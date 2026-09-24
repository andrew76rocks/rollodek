# RolloDek Rules (single source of truth)

This file is the one place the game rules live. If code, content, CLAUDE.md, how-to-play.md, or any older doc disagrees with this file, this file wins.

- **Numbers** live only in `src/data/game-config.json`. This file refers to them as `{{tokens}}` (same system as `how-to-play.md`, filled by `src/content/ruleTokens.ts`). Never type a tunable number into this file.
- **Changing a rule** means: ask Drew, update this file, add a line to `docs/decisions.md`, then change code and content in the same change.
- **Anything under "Open questions"** is not decided. Don't build around a guess.
- Status tags: **[locked]** tested or simulated, don't change without Drew. **[proposed]** agreed in direction, details pending Drew's review.

---

## 1. What the game is [locked]

A card-driven tabletop RPG for solo or two-player play, with no live GM. The **Adventure Deck** stands in for the GM. Sessions run 30 to 60 minutes and can chain into a series.

Pillars: story first, striking art as a core mechanic, accessibility (learn once, play forever).

Design principles:
1. **Anti-additive.** New ideas must fit inside an existing card type, deck, or phase before becoming a new system.
2. **Never fully walled.** A bad draw weakens options, it never blocks an action.
3. **Every choice has real impact.**
4. **Real-world action economy.** Mechanics map to what's happening in the story.
5. **Minimal math.** Single-step addition or subtraction only.
6. **Minimal resources.** New content lives in existing decks and cards.

**Dice rule:** dice are only for things the player has no agency over (DC generation and encounter-branch rolls). Never for anything the player chooses.

---

## 2. The hero [locked]

A player picks a pre-made hero and plays with three identity cards plus one starting asset.

| Card | Holds |
|---|---|
| **Hero card** | Six base stats (STR, DEX, CON, INT, WIS, CHA), each 0 to 3 (0 is usable). Proficiencies, personality trait, profession, **HP threshold**. Wounds attach here. |
| **Class card** | How the hero operates. Names the two **specialty stats**. Swappable. |
| **Backstory card** | One **strength** and one **flaw** from the same story beat. |
| **Starting asset** | One item, vehicle, or companion tied to the backstory. A companion sits in the Hero's Party slot from turn one. |

Class and backstory cards do **not** hold HP, hand size, or leveling tables. HP lives on the hero card. Hand size is a global rule. Progression lives on Adventure Deck milestone cards (see 9).

---

## 3. The hero deck [locked]

- Starting deck: **{{startingDeckSize}} cards** = {{deckActionCount}} single-stat action, {{deckMemoryCount}} single-stat memory, {{deckCrossoverCount}} crossover, {{deckWildCount}} wild.
- About 70% of the deck leans into the hero's two specialty stats.
- **No gear or spells in the starting deck.** Those are earned during play.
- **Each card has one value**, printed once on the card face.

| Card type | Stat tag | Value |
|---|---|---|
| Action | one stat | Low 2, Mid 4, High 6 |
| Memory | one stat | set per card |
| Crossover | two stats | slightly below a Mid action |
| Wild | any stat | slightly below a crossover |

- **Wild** cards are on-stat for any challenge. **Crossover** cards are on-stat if the challenge matches either tagged stat.
- **Cycling:** when the draw pile is empty, shuffle the discard pile to make a new draw pile.
- **New gear and spells** always go into the discard pile first, never straight to hand or tableau. This prevents find-and-use-it-the-same-turn spikes.

---

## 4. Resolving a check [locked]

1. The challenge shows its **stat** and **tier** (Easy, Medium, Dangerous). The DC number is never shown.
2. The player commits **zero or more** cards from hand and untapped tableau.
   - **On-stat card:** Base Stat + card value.
   - **Off-stat card:** card value only.
   - Base Stat is added **once per check**, not once per card.
   - **Zero cards** is always allowed (Base Stat alone), unless a card says the check auto-fails.
   - Multiple cards sum with no cap. Each tableau card can activate {{tableauActivationsPerCard}} time(s) per turn.
3. **After** cards are committed, roll 2d6 to make the hidden DC:
   - Easy = 2d6 {{dcEasyOffset}}
   - Medium = 2d6 {{dcMediumOffset}}
   - Dangerous = 2d6 {{dcDangerousOffset}}
   - Floored at {{dcFloor}}.
4. Special rolls check the raw 2d6 before the offset:
   - **{{snakeEyesRoll}} (snake eyes):** automatic remarkable success, whatever the total.
   - **{{boxcarsRoll}} (boxcars):** automatic harsh complication, whatever the total.
5. **Outcome:** Success (total meets or beats the DC), Fail, or **Fail with paid cost**. On {{paidCostTiers}} checks only, the player can take 1 wound to turn a Fail into "success, but." {{unpaidCostTiers}} checks carry real, unbuyable risk. **No card, ability, or item may turn a Medium or Dangerous fail into a success** unless Drew signs off and the numbers are re-simulated.

> The DC offsets and the multi-card rule were tuned together in simulation. Changing either one, or adding anything that buys out Medium or Dangerous risk, needs re-simulation first.

---

## 5. Turn structure [locked]

A **Scene** is a group of 2 to 3 location cards. One Scene = one full turn. "Scene" is a structure word, not a deck name.

1. **Advance.** The next Scene's location cards are laid out, art side up.
2. **Setup.** Hand redraws to {{handSize}}. Tableau untaps. Gear and spell swaps happen now, and only now.
3. **Explore.** Flip location cards and resolve what's on the back. Combat nests here.
4. **Conclude.** Tally objectives. If the hand is over {{handCap}}, discard down to {{handCap}} (player's choice) **before** the next Scene is revealed.

Played cards do **not** refill until the next Setup.

---

## 6. Hand and tableau [locked]

- **Hand:** starts at {{handSize}}, capped at {{handCap}} at Conclude.
- Action, memory, and cantrip cards are played from hand, then discarded.
- **Tableau** holds three categories, each with its own capped slots:
  - **Equipment:** head, torso, hands, feet.
  - **Spells:** start at 1 ongoing slot, grows with milestones.
  - **Hero's Party:** companions.
- Tableau cards stay in play and can trigger synergy bonuses when on-stat.
- A card with both an instant and an ongoing effect can be used either way, the player's choice each time.
- **Discard** (reshuffles back in later) is different from **trash** (gone for good, not designed yet).
- Search or fetch is never a general action. It only happens when a specific card says so.

---

## 7. The Adventure Deck [locked, card format proposed]

The Adventure Deck holds a mission's location cards, milestone cards, and extra numbered cards that locations can pull in.

**Card IDs [locked]:** `AD-` + Scene number + letter, e.g. `AD-3A`, `AD-3B`. Parentheses mark an **optional** card the player may skip: `(AD-3B)`. Players can find any card by ID (search in the app, or by sorting the physical deck).

**Front [locked]:** art and the card ID only. Each Scene's cards share one wide panorama, and each card shows its own slice, so laying them side by side shows the full scene. Nothing else goes on the front. The art order does not have to match the play order.

**Back [locked]:** everything else. It's an open space for authors: story, instructions, paths, pointers to other cards ("add AD-29A"), rewards, and one or more Challenges.

**Challenge block [proposed]:** every Challenge on a back uses the same small block so players and the app read it the same way:
- **Stat:** one or two stats ("DEX or INT"), or **Combat** plus the Encounter it names
- **Tier:** Easy, Medium, or Dangerous
- **Success:** what happens (objectives, rewards)
- **Fail:** what happens
- **Wound icon on Easy blocks only**, as a reminder that the paid-cost flip is available

Never printed on any card: the DC number.

**Encounter-branch rolls [locked]:** when a card asks for a visible 2d6 roll to pick between outcomes, it goes in its own clearly different box, so it's never confused with the silent DC roll. 2d6 is a bell curve, so authors design the split on purpose.

**Tier is authored [locked]:** the designer prints the tier on each Challenge. Scenes closer to the finale should generally use higher tiers.

**Not every location has a Challenge.** Some are story only.

---

## 8. Content pools [locked]

Pools add variety. They never replace direct authoring. A location can name one specific card, or roll from a pool.

- **Encounters:** monsters and NPCs in one card type. Each is flagged **hostile**, **neutral**, or **friendly**.
  - A **hostile** Encounter is the enemy in combat. It carries HP, a danger tier (which is also its defense), an attack stat, and what happens on defeat, escape, or stun. There is **no separate Threat card type** (merged Sept 24, 2026).
  - Neutral and friendly Encounters resolve through normal checks or pure choices.
  - An Encounter card can carry a **Companion** tag. Only tagged cards can join the Hero's Party. Untagged NPCs stay in their encounter.
  - Bosses are hostile Encounters that a location names directly.
- **Items:** loot, gear, artifacts, relics. Tiers: common, functional, rare.
- **Spells / Abilities:** their own pool. Cantrips are always-playable low spells drawn to hand. Bigger spells take a tableau spell slot.

---

## 9. Combat [locked]

- Nests inside a location's encounter. Strict alternating rounds, hero then enemy, until an end condition.
- **Hero attacks** with any card from hand or tableau, any stat, the player's choice. It resolves like any check against 2d6 + the enemy's tier offset. Success deals damage.
- **Enemy attacks** call out a stat. The hero defends with the normal on-stat / off-stat rule.
- **End:** enemy at 0 HP (defeated), hero escapes (high cost, no reward), or enemy stunned (no reward, the card goes back into the Adventure Deck and may show up again).

---

## 10. Wounds, progression, and ending [locked]

- **Wounds** attach to the hero card. Reaching the HP threshold ({{heroHpThreshold}}) = Hero Death.
- **No XP.** Progression comes from **milestone cards** in the Adventure Deck. The reward is printed on the milestone card and is always one of: a new hero deck card, +HP threshold, or an upgraded action tier.
- **Mission:** chosen at the start of the session. States one clear goal and {{objectivesTotal}} objectives. Each Scene should offer about 2 objective chances. A consequence can close off an objective.
- **Session end:**
  - **Mission Success:** reach the final Scene with {{objectivesToWin}}+ of {{objectivesTotal}} objectives done.
  - **Mission Failure:** reach the final Scene with fewer than {{objectivesToWin}}.
  - **Hero Death:** wounds hit the HP threshold first.

---

## 11. Open questions (not decided, ask Drew)

- Healing wounds
- Curse cards and a "trash" effect
- Two-player mode
- Wild/crossover ratio as a deck-building choice
- Dynamic "Fame" track (post-prototype module)
- Combat details: damage per successful attack, cost of escape, whether stun needs a check
- Challenge block fields (section 7): direction agreed, exact fields pending review
- Mission card layout (art front plus objectives back, all on one side, or card plus tracker)
- How a Companion-tagged Encounter joins the party (check, choice, or reward)
- Kessa's **Forest-Marked** strength ("see a location's tier before committing cards"): the tier is always visible before commitment, so this needs rewording, maybe as "peek at a wild or corrupted location's back before choosing to enter." It also needs a place for the "wild / corrupted" tag, which can't go on the art-only front.
- Spell tableau cap and cantrip cost
