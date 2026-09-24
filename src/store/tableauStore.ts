import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { HERO_COMPANION_ID, type TableauZone } from '../data/tableauCards.ts'

/**
 * Cards in play in each tableau zone (card ids), plus which are tapped
 * (activated this turn). New games start with the hero's companion already in
 * the Hero's Party slot, untapped; Items and Spells are earned during play.
 * Saved under the `rollodek-` prefix, so New Game resets it.
 */
type TableauState = Record<TableauZone, string[]> & {
  /** Tapped (activated) card ids; untapped cards are ready to activate */
  tapped: string[]
}

export const INITIAL_TABLEAU: TableauState = { party: [HERO_COMPANION_ID], items: [], spells: [], tapped: [] }

export const useTableauStore = create<TableauState>()(
  persist(() => ({ ...INITIAL_TABLEAU }), { name: 'rollodek-tableau', version: 1 }),
)
