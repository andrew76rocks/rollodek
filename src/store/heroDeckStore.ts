import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getGameConfig } from '../config/gameConfig.ts'
import { starterDeck } from '../data/heroCard.ts'

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface HeroDeckState {
  /** Face-down draw pile, card ids */
  deck: string[]
  /** Cards currently in the player's hand, card ids */
  hand: string[]
  /** Discard pile, card ids */
  discard: string[]
}

/** Shuffles the starting deck and draws the opening hand — this session's Turn 1, Scene 1 deal. */
function initialDeal(): HeroDeckState {
  const shuffled = shuffle(starterDeck.map((card) => card.id))
  const { handSize } = getGameConfig()
  return { hand: shuffled.slice(0, handSize), deck: shuffled.slice(handSize), discard: [] }
}

export const useHeroDeckStore = create<HeroDeckState>()(
  persist(() => initialDeal(), { name: 'rollodek-hero-deck', version: 1 }),
)

// `persist` only writes to storage on a `set()` call, never for the creator's
// initial return value — without this, the opening deal would never actually
// land in localStorage and every reload would silently redraw a new hand.
useHeroDeckStore.setState(useHeroDeckStore.getState())
