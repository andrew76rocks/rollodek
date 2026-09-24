import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** The four turn phases, in their locked order (CLAUDE.md "Turn structure"). */
export const PHASES = ['advance', 'setup', 'explore', 'conclude'] as const
export type Phase = (typeof PHASES)[number]

export const PHASE_LABELS: Record<Phase, string> = {
  advance: 'Advance',
  setup: 'Setup',
  explore: 'Explore',
  conclude: 'Conclude',
}

/**
 * Game session progress. Grows as mechanics land (hand, deck, tableau,
 * wounds…). Every new game starts at Turn 1, Scene 1, in the Advance phase:
 * New Game clears this store's saved state (it's under the `rollodek-`
 * prefix), so it comes back at these initial values.
 */
export const INITIAL_GAME_STATE = { turn: 1, scene: 1, phase: 'advance' as Phase }

interface GameState {
  turn: number
  scene: number
  phase: Phase
}

export const useGameStore = create<GameState>()(
  persist(() => ({ ...INITIAL_GAME_STATE }), { name: 'rollodek-game', version: 1 }),
)
