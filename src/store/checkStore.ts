import { create } from 'zustand'
import { getGameConfig, type DcTier, type HeroStat } from '../config/gameConfig.ts'
import { getAdventureCard, printedId, type ChallengeBlock } from '../data/adventureDeck.ts'
import { getHeroCard } from '../data/heroCard.ts'
import { rollAllDice } from '../components/dice/diceCommands.ts'
import { canPayCost, checkTotal, resolveCheck, type CheckResult } from '../rules/check.ts'
import { logEvent } from './eventLogStore.ts'
import { challengeKey, useGameStore } from './gameStore.ts'
import { applyOutcome, addWounds, currentCardId } from './session.ts'

/**
 * The one check in progress (docs/rules.md §4). Order is fixed:
 * 1. start: the challenge's stat and tier are shown, never the DC
 * 2. commit: zero or more hand cards from the Play Area
 * 3. roll: 2d6 on the dice, only after committing, makes the hidden DC
 * 4. outcome: success / fail, plus the paid-cost flip on paidCostTiers only
 * Not persisted: reloading mid-check drops it (committed cards are already spent).
 */
export interface ActiveCheck {
  cardId: string
  blockIndex: number
  /** The challenge offers one or two stats; the player picks which one they're using */
  stats: HeroStat[]
  stat: HeroStat
  tier: DcTier
  step: 'committing' | 'rolling' | 'result'
  committed: string[]
  total?: number
  raw?: number
  dc?: number
  result?: CheckResult
}

export const useCheckStore = create<{ check: ActiveCheck | null }>(() => ({ check: null }))

const patch = (p: Partial<ActiveCheck>) =>
  useCheckStore.setState((s) => (s.check ? { check: { ...s.check, ...p } } : s))

export function challengeBlock(cardId: string, blockIndex: number): ChallengeBlock {
  return getAdventureCard(cardId).back[blockIndex] as ChallengeBlock
}

/** Can this challenge be attempted right now? (Explore phase, revealed, not yet resolved, nothing else in progress) */
export function canAttempt(cardId: string, blockIndex: number): boolean {
  const { phase, revealed, resolved, ended, scene } = useGameStore.getState()
  return (
    !ended &&
    phase === 'explore' &&
    getAdventureCard(cardId).scene === scene &&
    revealed.includes(cardId) &&
    currentCardId(scene) === cardId && // in play order: the card you're on
    !resolved.includes(challengeKey(cardId, blockIndex)) &&
    !useCheckStore.getState().check
  )
}

export function startCheck(cardId: string, blockIndex: number) {
  const block = challengeBlock(cardId, blockIndex)
  if (!block.stats?.length || !canAttempt(cardId, blockIndex)) return
  useCheckStore.setState({
    check: { cardId, blockIndex, stats: block.stats, stat: block.stats[0], tier: block.tier, step: 'committing', committed: [] },
  })
  const card = getAdventureCard(cardId)
  logEvent('check.resolve', `Check started: ${printedId(card)} ${card.title} (${block.stats.join(' or ')}, ${block.tier})`, {
    cardId,
  })
}

export function chooseCheckStat(stat: HeroStat) {
  if (useCheckStore.getState().check?.step === 'committing') patch({ stat })
}

/**
 * Commit the staged hand cards (possibly none), then roll. The caller moves the
 * committed cards to the discard pile. Snake eyes / boxcars are read off the
 * raw roll before the offset; the DC stays hidden unless debugMode is on.
 */
export async function commitAndRoll(handCardIds: string[]) {
  const check = useCheckStore.getState().check
  if (!check || check.step !== 'committing') return
  const config = getGameConfig()
  // TODO(drew): hero, class, backstory, companion and item abilities aren't applied yet
  // (e.g. Scrap-Drone Pigeon's +1 on on-stat DEX/INT checks, Forest-Marked's boxcars wound on Dangerous)
  const total = checkTotal(handCardIds.map(getHeroCard), check.stat, config.heroStats[check.stat])
  patch({ step: 'rolling', committed: handCardIds, total })

  const faces = (await rollAllDice()) ?? [rollFallback(), rollFallback()]
  const raw = faces[0] + faces[1]
  const { result, dc } = resolveCheck(total, raw, check.tier, getGameConfig())
  patch({ step: 'result', raw, dc, result })
}

const rollFallback = () => 1 + Math.floor(Math.random() * 6)

/** Close the check with its outcome. `payCost` = take 1 wound to flip a fail into "success, but". */
export function finishCheck(payCost = false) {
  const check = useCheckStore.getState().check
  if (!check || check.step !== 'result' || !check.result) return
  const block = challengeBlock(check.cardId, check.blockIndex)
  const config = getGameConfig()
  useCheckStore.setState({ check: null })

  if (payCost && canPayCost(check.result, check.tier, config)) {
    applyOutcome(check.cardId, check.blockIndex, block.successBut ?? block.success, 'Success, but (paid 1 wound)')
    addWounds(1, 'paid cost')
    return
  }
  if (check.result === 'success' || check.result === 'remarkable') {
    // TODO(drew): what a remarkable success adds beyond a normal success isn't specified
    applyOutcome(check.cardId, check.blockIndex, block.success, check.result === 'remarkable' ? 'Remarkable success' : 'Success')
    return
  }
  // TODO(drew): boxcars' "harsh complication" is resolved as the card's Fail; nothing extra is specified
  applyOutcome(check.cardId, check.blockIndex, block.fail, check.result === 'complication' ? 'Harsh complication' : 'Fail')
}

/** Back out before committing anything (nothing is spent) */
export function cancelCheck() {
  if (useCheckStore.getState().check?.step === 'committing') useCheckStore.setState({ check: null })
}

/**
 * Combat, minimally. TODO(drew): damage per successful hit, escape cost, and
 * whether a stun needs a check are open questions (rules.md §11), so combat is
 * recorded by hand: the player says how the fight ended.
 */
export function recordCombat(cardId: string, blockIndex: number, end: 'defeated' | 'stunned' | 'escaped') {
  const block = challengeBlock(cardId, blockIndex)
  const won = end === 'defeated' || (end === 'stunned' && block.combat?.successOnStun)
  const label = { defeated: 'Enemy defeated', stunned: 'Enemy stunned', escaped: 'Escaped' }[end]
  applyOutcome(cardId, blockIndex, won ? block.success : block.fail, label)
}
