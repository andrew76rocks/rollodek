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
  /** Keyed by objective id; ids not present are still open */
  objectives: {} as Partial<Record<number, ObjectiveState>>,
  /** Adventure cards currently face up; the player flips them freely */
  revealed: [] as string[],
  /**
   * Past Scenes' location cards, oldest first. They never go back into the
   * Adventure Deck (unlike the Hero Discard); kept so the player can look back.
   */
  adventureDiscard: [] as string[],
  ended: null as SessionEnd | null,
}

export type GameState = typeof INITIAL_GAME_STATE

export const useGameStore = create<GameState>()(
  persist(() => ({ ...INITIAL_GAME_STATE }), {
    name: 'rollodek-game',
    version: 3,
    migrate: (persisted, version) => {
      const old = persisted as Partial<GameState> & { turn?: number; skipped?: string[]; resolved?: string[] }
      // v1 kept separate turn and scene counters; the turn number becomes the Scene
      if (version < 2) return { ...INITIAL_GAME_STATE, phase: old.phase ?? 'advance', scene: old.turn ?? 1 }
      // v2 tracked skipped cards and resolved challenges for the check system, which is gone;
      // a skipped card is simply one that is face down again
      if (version < 3) {
        const { skipped: _skipped, resolved: _resolved, ...rest } = old
        return { ...INITIAL_GAME_STATE, ...rest }
      }
      return old as GameState
    },
  }),
)
