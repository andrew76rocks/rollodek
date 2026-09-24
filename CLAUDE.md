# RolloDek — Card-Driven Solo/Duet TTRPG Prototype

A digital, high-polish playtest prototype of a card-driven tabletop RPG. Desktop-only web app. No backend, no auth, no database — this is a front-end prototype for design iteration, not a shipping product.

## What this game is

A GM-less card-driven RPG for solo or two-player play. An "Adventure Deck" stands in for the GM, revealing Scenes and prompts as the player commits cards to choices. Story and imagination come first — dice are reserved strictly for things the player has no agency over (DC generation, encounter-branch rolls), never for anything the player actually chooses.

## Game rules

Game rules live in [`docs/rules.md`](docs/rules.md). Read it before any gameplay change. It wins over everything else in the repo, including this file, `how-to-play.md`, the hero docs, and the JSON data. Numbers live only in `src/data/game-config.json`. To change a rule: stop and ask Drew, then update `rules.md` and add a line to [`docs/decisions.md`](docs/decisions.md) in the same change as the code. Never restate rules in this file. Anything under "Open questions" in `rules.md` is undecided: leave a `TODO(drew):` instead of guessing.

Replaced content is archived in `src/content/_archive/`, never deleted.

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
docs/
  rules.md            (source of truth for game rules)
  decisions.md        (dated decision log, newest first)
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
    encounter-pool.json
    item-pool.json
    spell-pool.json
```

## Working conventions

- This is a prototype. Prioritize getting mechanics playable and feel right over production hardening.
- Every game-balance number (hand size, tier offsets, slot caps, deck composition) should be a named config value, not a magic number in a component — Andrew will be tuning these by playtesting.
- Read game config only through `useGameConfig(...)` (React) or `getGameConfig()` (logic) from `src/config/gameConfig.ts`. These return the *effective* config: `game-config.json` defaults plus any Settings-drawer overrides. Never import `game-config.json` directly and never retype a config value, or Settings changes silently won't apply (this already happened once with hero HP).
- **Card titles: 18 characters max, including spaces** (`CARD_TITLE_MAX_CHARS` in `src/data/heroCard.ts`). A title must fit on one line of the card; the card hard-caps it to one line, and dev builds warn in the console about any card over the limit. Shorten the title rather than relying on the ellipsis.
- **Card rules text never restates the card face.** The stat type (e.g. `INT/WIS`, `Any`), the card value, and the card type are already printed on the card; rules text should only add what those don't (effects, flavor). Dev builds warn about text mentioning on-stat, off-stat, or "any challenge".
- Rule numbers in content (e.g. `src/content/how-to-play.md`) are `{{tokens}}` filled from the live config — add new ones to `src/content/ruleTokens.ts` rather than writing the number into the text.
- When adding a new config value: add it to `game-config.json`, the `GameConfig` type, and the Settings schema (`src/components/settings/settingsSchema.ts`), and wire it to whatever displays or uses it in the same change.
- Don't invent new subsystems or mechanics beyond what's specified above without flagging it first — stay anti-additive, the design already has open questions parked deliberately.
- Ask before assuming an open question (see above) is resolved.
