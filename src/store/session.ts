import { getGameConfig } from '../config/gameConfig.ts'
import { getAdventureCard, getScene, missions, printedId, type ChallengeOutcome } from '../data/adventureDeck.ts'
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

/**
 * A card is complete once its back has been read (revealed) and every
 * Challenge on it resolved, pass or fail. Story-only cards complete on reveal.
 */
export function cardComplete(cardId: string): boolean {
  const { revealed, resolved } = useGameStore.getState()
  if (!revealed.includes(cardId)) return false
  return getAdventureCard(cardId).back.every((b, i) => b.type !== 'challenge' || resolved.includes(challengeKey(cardId, i)))
}

/** The Scene's cards in play order: card-ID order (A, B, C), not panorama order (rules.md §7) */
export function playOrder(sceneNumber: number): string[] {
  return [...(getScene(sceneNumber)?.cards ?? [])].sort()
}

/** The card the player is on: the first in play order that's neither complete nor skipped */
export function currentCardId(sceneNumber: number): string | undefined {
  const { skipped } = useGameStore.getState()
  return playOrder(sceneNumber).find((id) => !skipped.includes(id) && !cardComplete(id))
}

/**
 * When the current card is optional, the card after it can be flipped too:
 * moving on is how an optional card gets skipped.
 */
function cardAfterOptional(sceneNumber: number): string | undefined {
  const current = currentCardId(sceneNumber)
  if (!current || !getAdventureCard(current).optional) return undefined
  const { skipped } = useGameStore.getState()
  const order = playOrder(sceneNumber)
  return order.slice(order.indexOf(current) + 1).find((id) => !skipped.includes(id) && !cardComplete(id))
}

/** Explore, in order: the current card can be flipped, or the next one if the current card is optional */
export function canFlip(cardId: string): boolean {
  const { phase, scene, revealed, ended } = useGameStore.getState()
  if (ended || phase !== 'explore' || revealed.includes(cardId)) return false
  return currentCardId(scene) === cardId || cardAfterOptional(scene) === cardId
}

/**
 * Moving on past an optional card: it turns back face down and stays that way
 * for the Scene. Covers skipping it unread and moving on after reading it
 * (a story-only optional card, or one whose Challenge wasn't attempted).
 */
function passOptionalCards(sceneNumber: number, before: string) {
  const { revealed, resolved, skipped } = useGameStore.getState()
  const order = playOrder(sceneNumber)
  const passed = order.slice(0, order.indexOf(before)).filter((id) => {
    const card = getAdventureCard(id)
    const attempted = card.back.some((b, i) => b.type === 'challenge' && resolved.includes(challengeKey(id, i)))
    return card.optional && !attempted && !skipped.includes(id)
  })
  if (!passed.length) return
  useGameStore.setState({
    skipped: [...skipped, ...passed],
    revealed: revealed.filter((id) => !passed.includes(id)),
  })
  passed.forEach((id) => logEvent('scene.explore', `Moved past ${printedId(getAdventureCard(id))}`, { cardId: id }))
}

/** Flip an Adventure card to its back (Explore, in play order). Moving past an optional card turns it back face down. */
export function revealCard(cardId: string) {
  const { revealed, scene } = useGameStore.getState()
  if (revealed.includes(cardId) || !canFlip(cardId)) return
  passOptionalCards(scene, cardId)
  useGameStore.setState((s) => ({ revealed: [...s.revealed, cardId] }))
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
