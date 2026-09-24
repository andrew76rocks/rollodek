import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardZone } from './uiStore.ts'

/** A card committed to the Play Area, and the zone it came from (so it can go back). */
export interface StagedCard {
  cardId: string
  from: CardZone
}

interface PlayAreaState {
  staged: StagedCard[]
}

/** Cards staged in the Play Area. Saved under `rollodek-`, so New Game clears it. */
export const usePlayAreaStore = create<PlayAreaState>()(
  persist(() => ({ staged: [] as StagedCard[] }), { name: 'rollodek-play-area', version: 1 }),
)
