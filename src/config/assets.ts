/** Public URLs for Figma-exported artwork (see public/assets/). */
const UI = '/assets/ui'
const HEROES = '/assets/heroes'

export const uiAssets = {
  woodGrain: '/assets/textures/wood-grain.png',
  hexagon: `${UI}/hexagon-bg.svg`,
  deckDivider: `${UI}/deck-divider.svg`,
  adventureDeckArt: `${UI}/adventure-deck-art.svg`,
  heroDeckArt: `${UI}/hero-deck-art.svg`,
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

// Portrait art is per-hero; only Kessa exists so far.
export const heroAssets = {
  portraitFull: `${HEROES}/portrait-full.svg`,
  portraitMini: `${HEROES}/portrait-mini.svg`,
  traitBackstory: `${HEROES}/trait-backstory.svg`,
  traitClass: `${HEROES}/trait-class.svg`,
} as const
