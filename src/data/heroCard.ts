import type { HeroStat } from '../config/gameConfig.ts'
import rawStarterDeck from './starter-deck.json'

export type HeroCardType = 'action' | 'memory' | 'crossover' | 'wild'
export type HeroCardTier = 'Low' | 'Mid' | 'High'

export interface HeroCardData {
  id: string
  type: HeroCardType
  name: string
  /** Single-stat cards (action, memory) */
  stat?: HeroStat
  /** Two-stat cards (crossover) */
  stats?: HeroStat[]
  tier?: HeroCardTier
  /** Printed on-stat number (the hexagon): added to the hero's Base Stat on an on-stat check */
  onStat: number
  /** Printed off-stat number: used alone on an off-stat check */
  offStat: number
  text: string
}

export const starterDeck = rawStarterDeck as HeroCardData[]

/**
 * Authoring rule: a card title must fit on one line of the card (Cinzel Bold
 * 18px in a 218px title area). Measured worst case is 19 characters, so the
 * limit is 18 including spaces. The card also hard-caps the title to one line.
 */
export const CARD_TITLE_MAX_CHARS = 18

/**
 * Authoring rule: rules text never restates what the card already shows
 * (stat type, on/off-stat numbers, card type). E.g. a crossover's "INT/WIS"
 * label already says it's on-stat for INT or WIS; the text shouldn't repeat it.
 */
const RESTATES_CARD_FACE = /\b(on-stat|off-stat|any challenge)\b/i

if (import.meta.env.DEV) {
  for (const card of starterDeck) {
    if (RESTATES_CARD_FACE.test(card.text)) {
      console.warn(`[cards] "${card.name}" (${card.id}) rules text restates the card face: "${card.text}"`)
    }
    if (card.name.length > CARD_TITLE_MAX_CHARS) {
      console.warn(
        `[cards] "${card.name}" (${card.id}) is ${card.name.length} characters; ` +
          `titles must be ${CARD_TITLE_MAX_CHARS} or fewer to fit on one line.`,
      )
    }
  }
}

const starterDeckById = new Map(starterDeck.map((card) => [card.id, card]))

export function getHeroCard(id: string): HeroCardData {
  const card = starterDeckById.get(id)
  if (!card) throw new Error(`Unknown hero card id: ${id}`)
  return card
}
