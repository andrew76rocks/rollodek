import { create } from 'zustand'
import { useGameStore } from './gameStore.ts'

/**
 * The opening logo sequence plays at the start of every new game: whenever the
 * app loads with no mission chosen yet (a first visit, or after New Game).
 * Reloading mid-game skips it. Not persisted.
 */
export type IntroStage = 'logo' | 'reveal' | 'done'

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useIntroStore = create<{ stage: IntroStage }>(() => ({
  stage: !useGameStore.getState().missionId && !reduceMotion ? 'logo' : 'done',
}))

/** Logo finished (or skipped): fade it out while the table zooms into view */
export function revealTable() {
  if (useIntroStore.getState().stage === 'logo') useIntroStore.setState({ stage: 'reveal' })
}

export function finishIntro() {
  useIntroStore.setState({ stage: 'done' })
}
