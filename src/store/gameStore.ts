import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** The four turn phases, in their locked order (docs/rules.md §5). */
export const PHASES = ['advance', 'setup', 'explore', 'conclude'] as const
export type Phase = (typeof PHASES)[number]

export const PHASE_LABELS: Record<Phase, string> = {
  advance: 'Advance',
  setup: 'Setup',
  explore: 'Explore',
  conclude: 'Conclude',
}

/** How the session ended, once it has */
export type SessionEnd = 'success' | 'failure' | 'death'

/** Objective state; objectives not listed are still open */
export type ObjectiveState = 'done' | 'closed'

/**
 * Game session progress. One Scene = one turn (locked, rules.md §5), so a
 * single counter tracks both; combat rounds nest inside a Scene separately.
 * New Game clears this store's saved state (`rollodek-` prefix), so a new
 * session starts from these values: no mission chosen yet, Scene 1, Advance.
 */
export const INITIAL_GAME_STATE = {
  missionId: null as string | null,
  scene: 1,
  phase: 'advance' as Phase,
  /** Wounds on the hero card; reaching heroHpThreshold = Hero Death */
  wounds: 0,
  objectives: {} as Record<number, ObjectiveState>,
  /** Adventure cards flipped to their back this session */
  revealed: [] as string[],
  /** Challenges already resolved, as "AD-1B#1" (card id # block index) */
  resolved: [] as string[],
  ended: null as SessionEnd | null,
}

export type GameState = typeof INITIAL_GAME_STATE

export const useGameStore = create<GameState>()(
  persist(() => ({ ...INITIAL_GAME_STATE }), {
    name: 'rollodek-game',
    version: 2,
    // v1 kept separate turn and scene counters; the turn number becomes the Scene
    migrate: (persisted, version) => {
      const old = persisted as Partial<GameState> & { turn?: number }
      if (version < 2) return { ...INITIAL_GAME_STATE, phase: old.phase ?? 'advance', scene: old.turn ?? 1 }
      return old as GameState
    },
  }),
)

export const challengeKey = (cardId: string, blockIndex: number) => `${cardId}#${blockIndex}`
