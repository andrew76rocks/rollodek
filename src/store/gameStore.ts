import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Game session progress. Grows as mechanics land (hand, deck, tableau,
 * wounds…). Every new game starts at Turn 1, Scene 1: New Game clears this
 * store's saved state (it's under the `rollodek-` prefix), so it comes back
 * at these initial values.
 */
export const INITIAL_GAME_STATE = { turn: 1, scene: 1 }

interface GameState {
  turn: number
  scene: number
}

export const useGameStore = create<GameState>()(
  persist(() => ({ ...INITIAL_GAME_STATE }), { name: 'rollodek-game', version: 1 }),
)
