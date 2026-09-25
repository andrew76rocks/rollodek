import { getGameConfig } from '../config/gameConfig.ts'
import { getAdventureCard, missions, printedId } from '../data/adventureDeck.ts'
import { logEvent } from './eventLogStore.ts'
import { useGameStore, type ObjectiveState, type SessionEnd } from './gameStore.ts'

/**
 * Session-level state outside the turn clock: choosing the mission, turning
 * Adventure cards over, wounds, objectives, and ending the session
 * (docs/rules.md §7, §10).
 *
 * The prototype does not adjudicate any of this. The rules live in the card
 * text, docs/rules.md and the Help section; the player applies them and tells
 * the app what happened. Nothing here decides an outcome on the player's behalf.
 */

export const currentMission = () => missions.find((m) => m.id === useGameStore.getState().missionId)

/** Mission is chosen at the start of a session */
export function chooseMission(id: string) {
  const mission = missions.find((m) => m.id === id)
  if (!mission) return
  useGameStore.setState({ missionId: id })
  logEvent('mission', `Mission chosen: ${mission.name}. ${mission.goal}`, { missionId: id })
}

/**
 * Turn an Adventure card over, either way. Any card, any time: play order and
 * the optional-card rule are printed on the cards, not enforced by the table.
 */
export function toggleCard(cardId: string) {
  const { revealed } = useGameStore.getState()
  const faceUp = revealed.includes(cardId)
  useGameStore.setState({
    revealed: faceUp ? revealed.filter((id) => id !== cardId) : [...revealed, cardId],
  })
  const card = getAdventureCard(cardId)
  logEvent('scene.explore', `${faceUp ? 'Turned back' : 'Turned over'} ${printedId(card)}: ${card.title}`, { cardId })
}

/**
 * Wounds attach to the hero card; reaching the HP threshold is Hero Death.
 * Wounds are entered by hand, so they come back off by hand too — lowering
 * them below the threshold takes back an accidental death.
 */
export function adjustWounds(delta: number) {
  const { wounds: before, ended } = useGameStore.getState()
  const threshold = getGameConfig().heroHpThreshold
  const wounds = Math.max(0, Math.min(threshold, before + delta))
  if (wounds === before) return
  useGameStore.setState({ wounds })
  logEvent('wound', `${delta > 0 ? 'Took' : 'Healed'} ${Math.abs(wounds - before)} wound${Math.abs(wounds - before) === 1 ? '' : 's'} (now ${wounds} of ${threshold})`, { wounds })
  if (wounds >= threshold) endSession('death')
  else if (ended === 'death') {
    useGameStore.setState({ ended: null })
    logEvent('mission', 'Hero Death taken back (wounds lowered)', { wounds })
  }
}

/** Mark an objective done or closed, or clear it back to open */
export function setObjective(id: number, state: ObjectiveState | null) {
  const objectives = { ...useGameStore.getState().objectives }
  if (state) objectives[id] = state
  else delete objectives[id]
  useGameStore.setState({ objectives })
  const text = currentMission()?.objectives.find((o) => o.id === id)?.text ?? `Objective ${id}`
  logEvent('mission', `Objective ${id} marked ${state ?? 'open'}: ${text}`, { objective: id, state })
}

export const objectivesDone = () => Object.values(useGameStore.getState().objectives).filter((s) => s === 'done').length

/** Tally at the end of the final Scene: Mission Success or Failure */
export function tallyMission() {
  const done = objectivesDone()
  const { objectivesToWin, objectivesTotal } = getGameConfig()
  endSession(done >= objectivesToWin ? 'success' : 'failure')
  logEvent('mission', `Objectives tallied: ${done} of ${objectivesTotal}`, { done })
}

function endSession(ended: SessionEnd) {
  if (useGameStore.getState().ended) return
  useGameStore.setState({ ended })
  const label = { success: 'Mission Success', failure: 'Mission Failure', death: 'Hero Death' }[ended]
  logEvent('mission', label, { ended })
}
