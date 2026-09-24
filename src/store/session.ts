import { getGameConfig } from '../config/gameConfig.ts'
import { getAdventureCard, missions, printedId, type ChallengeOutcome } from '../data/adventureDeck.ts'
import { logEvent } from './eventLogStore.ts'
import { challengeKey, useGameStore, type SessionEnd } from './gameStore.ts'

/**
 * Session-level rules outside the turn clock: choosing the mission, revealing
 * Adventure cards, wounds and Hero Death, objectives, and ending the session
 * (docs/rules.md §7, §10).
 */

export const currentMission = () => missions.find((m) => m.id === useGameStore.getState().missionId)

/** Mission is chosen at the start of a session */
export function chooseMission(id: string) {
  const mission = missions.find((m) => m.id === id)
  if (!mission) return
  useGameStore.setState({ missionId: id })
  logEvent('mission', `Mission chosen: ${mission.name}. ${mission.goal}`, { missionId: id })
}

/** Flip an Adventure card to its back (Explore) */
export function revealCard(cardId: string) {
  const { revealed } = useGameStore.getState()
  if (revealed.includes(cardId)) return
  useGameStore.setState({ revealed: [...revealed, cardId] })
  logEvent('scene.explore', `Explored ${printedId(getAdventureCard(cardId))}: ${getAdventureCard(cardId).title}`, { cardId })
}

/** Wounds attach to the hero card; reaching the HP threshold is Hero Death */
export function addWounds(count: number, reason: string) {
  if (count <= 0) return
  const wounds = useGameStore.getState().wounds + count
  useGameStore.setState({ wounds })
  logEvent('wound', `Took ${count} wound${count === 1 ? '' : 's'} (${reason})`, { wounds })
  if (wounds >= getGameConfig().heroHpThreshold) endSession('death')
}

/**
 * Apply a resolved Challenge outcome: objectives, closed objectives, wounds.
 * TODO(drew): card rewards are text only for now: "draw 1 Item" (new gear goes to the
 * discard first) and milestone rewards (+1 HP threshold, draw 1 Spell/Ability) aren't automated.
 */
export function applyOutcome(cardId: string, blockIndex: number, outcome: ChallengeOutcome, label: string) {
  const { objectives, resolved } = useGameStore.getState()
  const next = { ...objectives }
  if (outcome.objective && !next[outcome.objective]) next[outcome.objective] = 'done'
  if (outcome.closesObjective && !next[outcome.closesObjective]) next[outcome.closesObjective] = 'closed'
  useGameStore.setState({ objectives: next, resolved: [...resolved, challengeKey(cardId, blockIndex)] })

  const card = getAdventureCard(cardId)
  logEvent('check.resolve', `${printedId(card)} ${card.title}: ${label}. ${outcome.text}`, { cardId, label })
  if (outcome.objective) logEvent('mission', `Objective ${outcome.objective} complete`, { objective: outcome.objective })
  if (outcome.closesObjective) logEvent('mission', `Objective ${outcome.closesObjective} closed`, { objective: outcome.closesObjective })
  if (outcome.wounds) addWounds(outcome.wounds, `${printedId(card)} ${label.toLowerCase()}`)
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
