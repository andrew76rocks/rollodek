import type { DcTier, GameConfig, HeroStat } from '../config/gameConfig.ts'
import type { HeroCardData } from '../data/heroCard.ts'

/**
 * Check resolution, straight from docs/rules.md §4. Pure functions: no state,
 * no UI. The DC math and multi-card math here must not change without Drew
 * (they were tuned together in simulation).
 */

/** Wild cards are always on-stat; crossover cards if either stat matches */
export function isOnStat(card: HeroCardData, stat: HeroStat): boolean {
  if (card.type === 'wild') return true
  if (card.type === 'crossover') return (card.stats ?? []).includes(stat)
  return card.stat === stat
}

/**
 * Check total. On-stat card: Base Stat + value. Off-stat card: value only.
 * Base Stat is added once per check, not once per card. Zero cards: Base Stat alone.
 *
 * TODO(drew): rules.md reads as "no Base Stat when every committed card is
 * off-stat" (so one off-stat card can total less than committing nothing).
 * Implemented literally; confirm that's intended.
 */
export function checkTotal(cards: HeroCardData[], stat: HeroStat, baseStat: number): number {
  const values = cards.reduce((sum, card) => sum + card.value, 0)
  const addsBase = cards.length === 0 || cards.some((card) => isOnStat(card, stat))
  return values + (addsBase ? baseStat : 0)
}

const TIER_OFFSET: Record<DcTier, (c: GameConfig) => number> = {
  easy: (c) => c.dc.easyOffset,
  medium: (c) => c.dc.mediumOffset,
  dangerous: (c) => c.dc.dangerousOffset,
}

/** Hidden DC from the raw 2d6 roll: 2d6 + tier offset, floored */
export function dcFor(raw: number, tier: DcTier, c: GameConfig): number {
  return Math.max(c.dc.floor, raw + TIER_OFFSET[tier](c))
}

/** remarkable = snake eyes, complication = boxcars (both checked on the raw 2d6, before the offset) */
export type CheckResult = 'remarkable' | 'success' | 'fail' | 'complication'

export function resolveCheck(total: number, raw: number, tier: DcTier, c: GameConfig): { result: CheckResult; dc: number } {
  const dc = dcFor(raw, tier, c)
  if (raw === c.dc.snakeEyesRoll) return { result: 'remarkable', dc }
  if (raw === c.dc.boxcarsRoll) return { result: 'complication', dc }
  return { result: total >= dc ? 'success' : 'fail', dc }
}

/**
 * The paid-cost flip (1 wound turns a Fail into "success, but") only exists on
 * paidCostTiers. Nothing else may turn a Medium or Dangerous fail into a success.
 * TODO(drew): whether boxcars' harsh complication can be flipped on an Easy check
 * isn't stated; it's treated as not flippable.
 */
export function canPayCost(result: CheckResult, tier: DcTier, c: GameConfig): boolean {
  return result === 'fail' && c.dc.paidCostTiers.includes(tier)
}
