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
  value: number
  text: string
}

export const starterDeck = rawStarterDeck as HeroCardData[]

const starterDeckById = new Map(starterDeck.map((card) => [card.id, card]))

export function getHeroCard(id: string): HeroCardData {
  const card = starterDeckById.get(id)
  if (!card) throw new Error(`Unknown hero card id: ${id}`)
  return card
}
