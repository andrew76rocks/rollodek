import { getGameConfig } from '../config/gameConfig.ts'
import { drawToHand } from '../components/DrawFlight.tsx'
import { logEvent } from './eventLogStore.ts'
import { PHASE_LABELS, PHASES, useGameStore, type Phase } from './gameStore.ts'
import { useHeroDeckStore } from './heroDeckStore.ts'
import { currentMission, objectivesDone, tallyMission } from './session.ts'
import { useTableauStore } from './tableauStore.ts'

/**
 * Stepping through a Scene (one Scene = one turn, docs/rules.md §5):
 * Advance → Setup → Explore → Conclude → next Scene's Advance. Each phase's
 * rules run when that phase begins.
 */
const DRAW_STAGGER_MS = 90

const ON_ENTER: Partial<Record<Phase, () => string | void>> = {
  // Setup: tableau untaps, hand redraws to hand size
  setup: () => {
    const untapped = useTableauStore.getState().tapped.length
    useTableauStore.setState({ tapped: [] })
    const { deck, discard, hand } = useHeroDeckStore.getState()
    const toDraw = Math.max(0, Math.min(getGameConfig().handSize - hand.length, deck.length + discard.length))
    for (let i = 0; i < toDraw; i++) setTimeout(drawToHand, i * DRAW_STAGGER_MS)
    const parts = [
      untapped && `untapped ${untapped} tableau card${untapped === 1 ? '' : 's'}`,
      toDraw && `drew ${toDraw}`,
    ].filter(Boolean)
    return parts.join(', ') || undefined
  },
  // Conclude: objectives tallied (the hand cap is enforced before leaving Conclude)
  conclude: () => `${objectivesDone()} of ${getGameConfig().objectivesTotal} objectives done`,
}

/** Why the phase can't advance right now, if it can't */
export function phaseBlocker(): string | null {
  const { phase, ended, missionId } = useGameStore.getState()
  if (ended) return 'The session has ended'
  if (!missionId) return 'Choose a mission first'
  const { handCap } = getGameConfig()
  if (phase === 'conclude' && useHeroDeckStore.getState().hand.length > handCap) {
    return `Discard down to ${handCap} cards first (click cards in your hand)`
  }
  return null
}

export function nextPhase() {
  if (phaseBlocker()) return
  const { scene, phase } = useGameStore.getState()
  const i = PHASES.indexOf(phase)
  const wrapping = i === PHASES.length - 1

  // The final Scene's Conclude ends the session instead of revealing another Scene
  if (wrapping && scene >= (currentMission()?.finalScene ?? Infinity)) {
    logEvent('turn.end', `Scene ${scene} ended`, { scene })
    tallyMission()
    return
  }

  const next = PHASES[(i + 1) % PHASES.length]
  const nextScene = wrapping ? scene + 1 : scene

  if (wrapping) logEvent('turn.end', `Scene ${scene} ended`, { scene })
  useGameStore.setState({ phase: next, scene: nextScene })
  if (wrapping) logEvent('turn.start', `Scene ${nextScene} began`, { scene: nextScene })

  const effect = ON_ENTER[next]?.()
  logEvent('phase.change', `Scene ${nextScene} · ${PHASE_LABELS[next]}${effect ? ` (${effect})` : ''}`, {
    scene: nextScene,
    phase: next,
  })
}
