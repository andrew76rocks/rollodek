/** Public URLs for Figma-exported artwork (see public/assets/). */
const UI = '/assets/ui'
const HEROES = '/assets/heroes'
const CARDS = '/assets/cards'

export const uiAssets = {
  logo: '/assets/brand/rollodek-logo.svg',
  woodGrain: '/assets/textures/wood-grain.png',
  hexagon: `${UI}/hexagon-bg.svg`,
  deckDivider: `${UI}/deck-divider.svg`,
  adventureDeckArt: `${UI}/adventure-deck-art.svg`,
  heroDeckArt: `${UI}/hero-deck-art.svg`,
  cardHighlightBar: `${UI}/card-highlight-bar.svg`,
  railLineConnectors: `${UI}/rail-line-connectors.svg`,
  levelConnectorMini: `${UI}/level-connector-mini.svg`,
  avatarInnerRing: `${UI}/avatar-inner-ring.svg`,
  avatarOuterRing: `${UI}/avatar-outer-ring.svg`,
  die1: `${UI}/die-1.svg`,
  die2: `${UI}/die-2.svg`,
  icons: {
    search: `${UI}/icon-search.svg`,
    hourglass: `${UI}/icon-hourglass.svg`,
    gear: `${UI}/icon-gear.svg`,
    question: `${UI}/icon-question.svg`,
    menu: `${UI}/icon-menu.svg`,
    shuffle: `${UI}/icon-shuffle.svg`,
    hand: `${UI}/icon-hand.svg`,
    party: `${UI}/icon-party.svg`,
    items: `${UI}/icon-items.svg`,
    spells: `${UI}/icon-spells.svg`,
  },
} as const

export const cardAssets = {
  valueHex: `${CARDS}/value-hex.svg`,
  statDot: `${CARDS}/stat-dot.svg`,
  /** Figma 126:267 "Value Hex 3": small dark hex behind a stat name (not the hero card's value hex) */
  statHex: `${CARDS}/stat-hex.svg`,
  outcomeSuccess: `${CARDS}/outcome-success.svg`,
  outcomeFail: `${CARDS}/outcome-fail.svg`,
} as const

/**
 * Adventure Deck card faces (Figma 126:260 front / 126:267 back). Every card
 * shares one front illustration for now; per-card Scene art comes later.
 */
export const adventureAssets = {
  cardFront: `${CARDS}/ancient-ruin.jpg`,
} as const

/**
 * Hero Deck card art (Figma 127:444 "Card Art"). Every card shares one
 * illustration for now; starter-deck.json has no per-card art field yet.
 */
export const heroCardAssets = {
  art: `${CARDS}/swift-strike.jpg`,
} as const

// Portrait art is per-hero; only Kessa exists so far.
export const heroAssets = {
  portraitFull: `${HEROES}/portrait-full.svg`,
  portraitMini: `${HEROES}/portrait-mini.svg`,
  traitBackstory: `${HEROES}/trait-backstory.svg`,
  traitClass: `${HEROES}/trait-class.svg`,
} as const
