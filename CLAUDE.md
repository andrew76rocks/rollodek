# RolloDek — Card-Driven Solo/Duet TTRPG Prototype

A digital, high-polish playtest prototype of a card-driven tabletop RPG. Desktop-only web app. No backend, no auth, no database — this is a front-end prototype for design iteration, not a shipping product.

## What this game is

A GM-less card-driven RPG for solo or two-player play. An "Adventure Deck" stands in for the GM, revealing Scenes and prompts as the player commits cards to choices. Story and imagination come first — dice are reserved strictly for things the player has no agency over (DC generation, encounter-branch rolls), never for anything the player actually chooses.

## Locked mechanics (do not redesign these — implement as specified)

**Resolution**: On-stat = Base Stat + card value. Off-stat = card value alone. Multiple cards can be committed to one check (summed, no cap). Tableau cards activate once per turn each (tap), can stack with hand cards.

**DC formula**: Easy = 2d6 − 5, Medium = 2d6 + 0, Dangerous = 2d6 + 5, floored at 1. Snake eyes (roll of 2) = automatic remarkable success. Boxcars (roll of 12) = automatic harsh complication. The DC itself is always hidden from the player; only the tier (Easy/Medium/Dangerous) is shown. Order matters: the player commits cards first (knowing only the tier), *then* the 2d6 is rolled to generate the DC — the roll never happens before the commitment.

**Outcomes**: Success / Fail / Fail-with-paid-cost (pay a wound to flip a fail into "success, but—"). The paid-cost flip only works on Easy checks. Medium and Dangerous carry real, unbuyable risk.

**Turn structure** (four phases, strict order):
1. Advance — new Scene's locations revealed
2. Setup — hand redraws to 5, tableau untaps, gear/spell swaps happen here
3. Explore — flip locations, resolve Encounters, combat nests here
4. Conclude — objectives tallied, hand discarded down to 7 (if over), before the next Advance

**Hand**: 5-card hand, refills at Setup (not immediately after playing). Hand cap 7 — discard down to 7 at Conclude if over.

**Starting hero deck**: 20 cards — 12 single-stat action, 3 single-stat memory, 3 crossover, 2 wild. No starting gear/spells; those are earned during play. Each hero also has one starting item/vehicle/companion tied to backstory, occupying the Hero's Party tableau slot from turn one.

**Deck cycling**: standard deckbuilder — discard pile reshuffles into a new draw pile when the draw pile empties. Newly found gear/spells always enter the discard pile first (never straight to hand/tableau) — this is deliberate, it prevents same-turn find-and-equip power spikes.

**Tableau**: three categories, each with its own capped slot pool — Equipment (body-part slots: head, torso, hands, feet), Spells (starts at 1 ongoing slot, scales with milestones), Hero's Party (companions/allies). Persistence is the point: tableau cards stay in play and can trigger synergy bonuses when on-stat.

**Wounds**: attach to the hero card, not the deck. HP threshold reached = Hero Death.

**Combat**: its own subsystem, strict alternating rounds (hero, enemy), nests inside a location's Encounter. Threat cards need only HP and a Danger tier (which doubles as defense). Hero attacks with any card, freely chosen. Enemy attacks are telegraphed with a specific stat; hero defends via normal on-stat/off-stat rules. Besides reducing a Threat to 0 HP, the hero can also stun it or escape the fight.

**Session end**: Mission Success (final Scene reached, 3+ of 5 objectives done), Mission Failure (final Scene, fewer than 3), Hero Death (wounds hit threshold first).

Full design history and the current playtest content set (hero "Kessa Vantree," the "Signal in the Rot" mission, full 20-card deck, encounter/item/spell pools) live in the linked claude.ai Project — ask Andrew ("Drew") if you need the source docs pulled in as JSON.

## Open questions — do not treat as settled

Healing mechanic for wounds, curse cards / a "trash" effect, two-player mode specifics, wild/crossover deck-building ratio, a dynamic "Fame" track (deferred to post-prototype), combat stun/escape specifics (the options exist, but cost, whether a check is required, and what a stunned Threat can still do are being settled through playtesting), Kessa's final 20-card starting deck (not written yet — `src/data/starter-deck.json` is a placeholder, and the Starting Deck table in `hero-class.md` is by stat while the locked composition is by type, so reconcile when the list lands). If a task touches one of these, ask rather than deciding.

## Tech stack

- **Framework**: React + TypeScript + Vite
- **Drag and drop**: dnd-kit
- **Animation / card flips**: Framer Motion — 3D flip via CSS `rotateY` + `perspective`
- **3D dice**: `@3d-dice/dice-box` (Three.js + Cannon.js under the hood — real physics-simulated rolls, not a canned animation)
- **Ambient 3D / particles / shaders**: React Three Fiber + drei for anything truly 3D (dice tray, optional shader surfaces); tsparticles for simple ambient background particles that don't need to interact with the 3D scene
- **State**: Zustand
- **Config**: two top-level config files that both UI and game logic read from — every tunable should live here, not hardcoded in components:
  - `game-config.json` — mechanics knobs: hand size, hand cap, tableau slot caps, tableau activations per card, DC tier offsets/floor/snake-eyes/boxcars, which DC tiers allow the paid-cost fail flip, hero HP threshold, starting deck size/composition, objectives to win/total, and a `debugMode` flag (reveals the hidden DC number on screen — playtest-only, strip before any real build)
  - `app-config.json` — branding/app-level: app name, tagline, which hero/mission data file is currently active (so swapping playtest content doesn't mean touching code), default theme (light/dark)
- **Persistence**: Zustand `persist` middleware → localStorage. No cookies, no backend, no auth.
- **Game data**: plain JSON files (cards, scenes, missions, encounter/item/spell pools), imported at build time
- **Responsive**: desktop-only. CSS Grid/Flexbox, `dvh`/`dvw` units, `ResizeObserver` on the R3F canvas container. No touch/mobile support needed.

### Architecture pattern
Keep the table, hand, tableau, and drag-drop as regular DOM/React — fast, accessible, easy to style. Layer an R3F canvas behind/around the DOM for the dice, particles, and any shader effects. Don't try to do the whole UI in WebGL, and don't try to fake real dice physics in CSS.

## Design tokens

**Icons**: Phosphor Icons. Full raw asset package staged locally at `public/icons/phosphor-icons/` — `Fonts`, `PNGs`, `SVGs`, `SVGs Flat`, `LICENSE`. Use `SVGs` directly for inline/component use. Also install `@phosphor-icons/react` for standard typed React icon components (`size`/`weight`/`color` props) — use it for normal UI icons, and pull from the local `SVGs` folder for anything needing hand-picked styling or inline embedding outside a component.

**Fonts**: three-tier hierarchy, all Google Fonts — self-host as woff2 in `/public/fonts` rather than linking Google's CDN, so the prototype has no external font dependency.
- Cinzel Decorative — hero/title moments only (game logo, title screen, Mission/Scene title cards). Ornate, used sparingly, not for regular UI headings.
- Cinzel — regular headings (panel titles, card names, section labels).
- Source Serif 4 — body copy and card description text.

This is a prototype, not a shipping product — font-weight/page-performance budgeting isn't a real concern. Don't hesitate to add more display faces later for special treatments.

**Color palette** — RolloDek, 9 tones:

| Token | Name | Hex | Use |
|---|---|---|---|
| `--dungeon-ink` | Dungeon Ink | `#1E1A2E` | Deep background & core dark UI text |
| `--dusk-violet` | Dusk Violet | `#6B5B8D` | Primary adventure brand tone |
| `--mist-lavender` | Mist Lavender | `#A89ABF` | Soft narrative overlay & accents |
| `--faded-parchment` | Faded Parchment | `#E8E0D4` | Warm background & card surface |
| `--storm-slate` | Storm Slate | `#5A6878` | Secondary body text & borders |
| `--potion-blue` | Potion Blue | `#7BA3C4` | Muted water sky, blue links & utility |
| `--driftwood` | Driftwood | `#9B7E6B` | Warm wood-brown, grounding & texture |
| `--ember-gold` | Ember Gold | `#B8944E` | Warm gold, rewards & legendaries |
| `--ivory-mist` | Ivory Mist | `#FAFAF7` | Lightest background & highlight white |

**Images**: sourced from Figma, not generated. Bitmaps (PNG/WebP) for full-color art; SVG for single-color/vector art, styled with `currentColor` so they tint with the palette like the icons do. Suggested structure: `/assets/cards`, `/assets/textures` (icons live at `public/icons/phosphor-icons/`, see above).

### Reference images (not shipped assets)
`design-reference/` at the project root holds UI mockups and reference art for you to look at while building — not runtime assets, don't import or load these from code. Currently: card-front examples and full-table mockups (light/dark mode). Treat these as the visual target for layout, spacing, and mood, not literal assets to wire in.

### Design source (Figma)
The live source file — use the Figma MCP connection to inspect actual layers, components, spacing, and exported artwork rather than working from the flat reference images alone when precision matters:
- Adventure Deck RPG file: https://www.figma.com/design/kBYg0xwm4O8MJakk9do1Ma/Adventure-Deck-RPG?node-id=56-3277&m=dev
- Same file, second frame: https://www.figma.com/design/kBYg0xwm4O8MJakk9do1Ma/Adventure-Deck-RPG?node-id=62-3623&m=dev

### Help section content
`src/content/how-to-play.md` is the approved player-facing setup/playthrough text — build the in-app Help section from this file's content directly, don't rewrite or re-derive it from the locked mechanics above. If it ever needs updating, that happens in this file, not by regenerating it from scratch.

### Actual project folder structure (as staged so far)
```
CLAUDE.md
design-reference/
  adventure-card-front.png
  hero-card-front.png
  rollodek-full-table-light-default.png
  rollodek-full-table-dark-mode.png
public/
  fonts/
  icons/
    phosphor-icons/
      Fonts/
      PNGs/
      SVGs/
      SVGs Flat/
      LICENSE
src/
  content/
    how-to-play.md
  data/
    app-config.json
    game-config.json
    hero.json
    starter-deck.json
    mission.json
    scenes.json
    threats.json
    encounter-pool.json
    item-pool.json
    spell-pool.json
```

## Working conventions

- This is a prototype. Prioritize getting mechanics playable and feel right over production hardening.
- Every game-balance number (hand size, tier offsets, slot caps, deck composition) should be a named config value, not a magic number in a component — Andrew will be tuning these by playtesting.
- Read game config only through `useGameConfig(...)` (React) or `getGameConfig()` (logic) from `src/config/gameConfig.ts`. These return the *effective* config: `game-config.json` defaults plus any Settings-drawer overrides. Never import `game-config.json` directly and never retype a config value, or Settings changes silently won't apply (this already happened once with hero HP).
- Rule numbers in content (e.g. `src/content/how-to-play.md`) are `{{tokens}}` filled from the live config — add new ones to `src/content/ruleTokens.ts` rather than writing the number into the text.
- When adding a new config value: add it to `game-config.json`, the `GameConfig` type, and the Settings schema (`src/components/settings/settingsSchema.ts`), and wire it to whatever displays or uses it in the same change.
- Don't invent new subsystems or mechanics beyond what's specified above without flagging it first — stay anti-additive, the design already has open questions parked deliberately.
- Ask before assuming an open question (see above) is resolved.
