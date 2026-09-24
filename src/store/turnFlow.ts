import { logEvent } from './eventLogStore.ts'
import { PHASE_LABELS, PHASES, useGameStore, type Phase } from './gameStore.ts'
import { useTableauStore } from './tableauStore.ts'

/**
 * Stepping through a turn: Advance → Setup → Explore → Conclude → (next turn)
 * Advance. Each phase's rules run when that phase begins. Only the phase flow
 * and the Setup untap exist so far; the other phase rules (redraw to hand
 * size, discard to hand cap, revealing locations) come later.
 */
const ON_ENTER: Partial<Record<Phase, () => string | void>> = {
  // Locked rule: the tableau untaps at Setup
  setup: () => {
    const count = useTableauStore.getState().tapped.length
    useTableauStore.setState({ tapped: [] })
    return count ? `untapped ${count} tableau card${count === 1 ? '' : 's'}` : undefined
  },
}

export function nextPhase() {
  const { turn, phase } = useGameStore.getState()
  const i = PHASES.indexOf(phase)
  const wrapping = i === PHASES.length - 1
  const next = PHASES[(i + 1) % PHASES.length]
  const nextTurn = wrapping ? turn + 1 : turn

  if (wrapping) logEvent('turn.end', `Turn ${turn} ended`, { turn })
  useGameStore.setState({ phase: next, turn: nextTurn })
  if (wrapping) logEvent('turn.start', `Turn ${nextTurn} began`, { turn: nextTurn })

  const effect = ON_ENTER[next]?.()
  logEvent(
    'phase.change',
    `Turn ${nextTurn} · ${PHASE_LABELS[next]}${effect ? ` (${effect})` : ''}`,
    { turn: nextTurn, phase: next },
  )
}
