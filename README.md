# RolloDek

A card-driven, GM-less tabletop RPG for solo or duet play. An **Adventure Deck** stands in for the Game Master, revealing Scenes and prompts while you commit cards from your hero deck to overcome them. Story comes first. Dice only decide what the player has no control over, such as the hidden difficulty of a check.

This repo is a **desktop web prototype** for playtesting and design iteration, not a shipping product. There's no backend or accounts, and everything saves in your browser.

> **Status:** early prototype. A full mission is playable: mission choice, Scenes and turn phases, Adventure Deck cards, checks with the hidden DC, wounds, and objectives. Combat rounds and card abilities are still recorded by hand.

The game rules live in [`docs/rules.md`](docs/rules.md), the single source of truth. Rule decisions are logged in [`docs/decisions.md`](docs/decisions.md).

## Getting started

Requires **Node.js 20.19+ or 22.12+**.

```bash
npm install
npm run dev
```

Then open the local address Vite prints (usually http://localhost:5173). The app targets desktop browsers; Chrome or Edge is recommended.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run typecheck` | Type-check only |
| `npm run preview` | Serve the production build locally |

## Playing with the prototype

| Control | Action |
|---|---|
| **›** next to the phase | Next phase (Advance → Setup → Explore → Conclude) |
| Click a location card (Explore) | Flip it and read its back; attempt its challenge from there |
| **Enter** | Commit the cards in the Play Area to the current check (none is fine) |
| **F** | Find Card: look up an Adventure Deck card by ID, e.g. AD-2B |
| **1** | Toggle between the default and maximized table layouts |
| **R** | Roll both dice |
| **←** / **→** | Previous / next tab (Hand, Party, Items, Spells) |
| Click a die | Roll it |
| Click the shuffle icon | Roll both dice |
| Hover / click the event log icon | Preview recent events / open the full, searchable log |
| **?** icon | How to Play |
| Gear icon | Settings (tune the rules) |
| **⋮** → New Game | Reset everything and choose a mission again |
| Book / shield icons by the hero name | Hero backstory and class cards |

With **debugMode** on (Settings → Playtest), the hidden DC shows after each roll, and these sandbox tools unlock: click the Hero Deck or press **Space** to draw, the recycle button or **Shift + R** to reshuffle the discard, Play Cards outside a check, and **⋮ → Designer Rules** (rules.md with live numbers).

## Tuning the rules

Every game-balance number (hand size, hand cap, DC offsets, slot caps, hero HP and stats, and so on) lives in [`src/data/game-config.json`](src/data/game-config.json).

- **During play:** change values in the **Settings** drawer. They apply immediately and are saved in your browser.
- **To make them the new defaults:** use **Save to…** in Settings and save over `src/data/game-config.json` (Chrome/Edge). Other browsers get a download instead.

In code, always read config through `useGameConfig()` / `getGameConfig()` from `src/config/gameConfig.ts`, never by importing the JSON directly, or Settings changes won't apply.

## Content

Player-facing text is plain Markdown in [`src/content/`](src/content/):

- `how-to-play.md`: the Help drawer
- `hero-backstory.md`, `hero-class.md`: the hero's cards

Rule numbers in content are written as `{{tokens}}` (e.g. `{{handSize}}`) and filled from the live config, so the text always matches the current rules. Available tokens are in [`src/content/ruleTokens.ts`](src/content/ruleTokens.ts).

Game data (hero, starter deck, mission, scenes, Adventure Deck cards, item/spell/encounter pools) lives as JSON in [`src/data/`](src/data/).

## Tech

React + TypeScript + Vite · Zustand (state, persisted to localStorage) · Framer Motion · React Three Fiber / three.js (dice) · react-markdown. Design tokens (the 9-tone palette and Cinzel / Source Serif 4 type) are in [`src/styles/tokens.css`](src/styles/tokens.css); the visual source is the *Adventure Deck RPG* Figma file.

For the locked game mechanics, open design questions, and working conventions, see [`CLAUDE.md`](CLAUDE.md).

> The full Phosphor icon package (`public/icons/phosphor-icons/`) is intentionally not committed (155 MB). The app uses `@phosphor-icons/react`. Download the package from [phosphoricons.com](https://phosphoricons.com) if you need the raw assets.
