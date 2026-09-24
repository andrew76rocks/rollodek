import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Presentation-only preferences. Game state gets its own store later. */
export type LayoutMode = 'default' | 'maximized'

/** Which view the card area under the play area shows (the tab bar) */
export type CardZone = 'hand' | 'party' | 'items' | 'spells'
/** Tab order in the bottom bar (the ←/→ shortcuts step through this) */
export const CARD_ZONES: CardZone[] = ['hand', 'party', 'items', 'spells']

/** Side drawers; only one can be open at a time */
export type DrawerId = 'eventLog' | 'help' | 'settings' | 'heroBackstory' | 'heroClass'

interface UiState {
  layoutMode: LayoutMode
  setLayoutMode: (mode: LayoutMode) => void
  /** Card area view; not persisted, always starts on the Player's Hand */
  cardZone: CardZone
  setCardZone: (zone: CardZone) => void
  /** Open side drawer, if any; not persisted, always starts closed */
  openDrawer: DrawerId | null
  setOpenDrawer: (drawer: DrawerId | null) => void
}

// Not state: just where focus goes back to when the open drawer closes
let drawerTrigger: HTMLElement | null = null

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      layoutMode: 'default',
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      cardZone: 'hand',
      setCardZone: (cardZone) => set({ cardZone }),
      openDrawer: null,
      setOpenDrawer: (openDrawer) =>
        set((s) => {
          // Remember what opened the drawer (clicked / Enter'd button) and hand
          // focus back to it on close, whichever trigger it was
          if (openDrawer && !s.openDrawer) drawerTrigger = document.activeElement as HTMLElement | null
          if (!openDrawer && s.openDrawer) {
            const trigger = drawerTrigger
            drawerTrigger = null
            queueMicrotask(() => trigger?.focus({ preventScroll: true }))
          }
          return { openDrawer }
        }),
    }),
    {
      name: 'rollodek-ui',
      version: 1,
      partialize: (s) => ({ layoutMode: s.layoutMode }),
      // v0 called maximized mode "simple"
      migrate: (persisted, version) => {
        const state = persisted as { layoutMode?: string }
        if (version < 1 && state.layoutMode === 'simple') state.layoutMode = 'maximized'
        return state as UiState
      },
    },
  ),
)
