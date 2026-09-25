import { getGameConfig } from '../config/gameConfig.ts'
import { dealSceneCards } from '../components/adventure/SceneDeal.tsx'
import { flySceneToDiscard, isSceneClearing } from '../components/adventure/SceneDiscard.tsx'
import { getScene } from '../data/adventureDeck.ts'
import { drawToHand } from '../components/DrawFlight.tsx'
import { logEvent } from './eventLogStore.ts'
import { PHASE_LABELS, PHASES, useGameStore, type Phase } from './gameStore.ts'
import { useHeroDeckStore } from './heroDeckStore.ts'
import { chooseMission, currentMission, objectivesDone, tallyMission } from './session.ts'
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

/** How long Scene 1's laid-out cards show before the opening Advance moves on to Setup */
const OPENING_ADVANCE_MS = 900
/** Extra beat after the opening hand has landed, before moving on to Explore */
const OPENING_SETUP_SETTLE_MS = 500

/**
 * Start the chosen mission. The opening runs itself up to Explore, since the
 * first Advance and Setup hold no choices for the player (no gear or spells
 * to swap yet, nothing tapped): Scene 1's location cards are laid out as the
 * mission dialog closes, then Setup deals the opening hand, then the game
 * moves to Explore, where the player takes over. Later Scenes step as normal.
 */
export function startMission(id: string) {
  dealSceneCards(getScene(1)?.cards ?? []) // Scene 1 slides out of the Adventure Deck as the mission starts
  chooseMission(id)
  logEvent('phase.change', 'Scene 1 · Advance (locations laid out)', { scene: 1, phase: 'advance' })
  const stillOpening = (phase: Phase) => {
    const s = useGameStore.getState()
    return s.missionId === id && s.scene === 1 && s.phase === phase
  }
  setTimeout(() => {
    if (!stillOpening('advance')) return
    nextPhase() // → Setup: deals the opening hand, one card every DRAW_STAGGER_MS
    const dealMs = getGameConfig().handSize * DRAW_STAGGER_MS + OPENING_SETUP_SETTLE_MS
    setTimeout(() => stillOpening('setup') && nextPhase(), dealMs) // → Explore
  }, OPENING_ADVANCE_MS)
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
  if (phaseBlocker() || isSceneClearing()) return
  const { scene, phase } = useGameStore.getState()
  const i = PHASES.indexOf(phase)
  const wrapping = i === PHASES.length - 1

  // The final Scene's Conclude ends the session instead of revealing another Scene
  if (wrapping && scene >= (currentMission()?.finalScene ?? Infinity)) {
    logEvent('turn.end', `Scene ${scene} ended`, { scene })
    tallyMission()
    return
  }

  // Leaving a Scene: its location cards go to the Adventure Discard (flying
  // there first), and only then is the next Scene revealed
  if (wrapping) {
    const cards = getScene(scene)?.cards ?? []
    flySceneToDiscard(cards, () => {
      useGameStore.setState((s) => ({
        adventureDiscard: [...s.adventureDiscard, ...cards.filter((id) => !s.adventureDiscard.includes(id))],
        revealed: s.revealed.filter((id) => !cards.includes(id)),
      }))
      if (cards.length) {
        logEvent('scene.explore', `Scene ${scene}'s ${cards.length} location card${cards.length === 1 ? '' : 's'} went to the Adventure Discard`, { cards })
      }
      enterPhase(scene, i)
    })
    return
  }
  enterPhase(scene, i)
}

/** Move on from phase index `i` of Scene `scene` and run the new phase's rules */
function enterPhase(scene: number, i: number) {
  const wrapping = i === PHASES.length - 1
  const next = PHASES[(i + 1) % PHASES.length]
  const nextScene = wrapping ? scene + 1 : scene

  if (wrapping) logEvent('turn.end', `Scene ${scene} ended`, { scene })
  // A new Scene's cards slide out of the Adventure Deck into place (Advance)
  if (wrapping) dealSceneCards(getScene(nextScene)?.cards ?? [])
  useGameStore.setState({ phase: next, scene: nextScene })
  if (wrapping) logEvent('turn.start', `Scene ${nextScene} began`, { scene: nextScene })

  const effect = ON_ENTER[next]?.()
  logEvent('phase.change', `Scene ${nextScene} · ${PHASE_LABELS[next]}${effect ? ` (${effect})` : ''}`, {
    scene: nextScene,
    phase: next,
  })
}
