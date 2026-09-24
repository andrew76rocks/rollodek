# Design decisions

A dated log of rule and design decisions, newest first, one line each. Any change to [rules.md](rules.md) adds a line here in the same change.

- 2026-09-24: Location cards resolve in card-ID order within a Scene; each must be complete before the next flips. Optional cards are skipped by moving on to the next card; a skipped card turns back face down.
- 2026-09-24: Drawing a card at will (clicking the Hero Deck, Space) is a sandbox tool, available only in debugMode. Normal play draws at Setup.
- 2026-09-24: One Scene = one turn [locked]. The game tracks a single Scene/turn counter. Combat rounds are separate and nest inside a Scene.
- 2026-09-24: HP threshold and base stats stay in game-config.json (heroHpThreshold, heroStats) for now; the hero card displays them.
- 2026-09-24: rules.md became the single source of truth for game rules.
- 2026-09-24: Threat cards merged into Encounters. A hostile Encounter is the combat enemy. No separate Threat type.
- 2026-09-24: Encounters can carry a Companion tag. Only tagged cards can join the Hero's Party.
- 2026-09-24: Adventure Deck card format: art-only front with ID (AD-3A), parentheses for optional cards, all content on the back, standard Challenge block (fields pending review).
- 2026-09-24: Mission is chosen at the start of a session.
- 2026-09-24: "Scene" is a structure word (one Scene = one turn), not a deck name. The deck is the Adventure Deck.
- 2026-09-24: Reverted the two-number card (separate off-stat value) to the single card value used in simulation.
- 2026-09-24: Restored the Tech-Adept / Forest-Marked Kessa to match the Signal in the Rot mission. The Wayfinder / Lantern Keeper version is archived.
