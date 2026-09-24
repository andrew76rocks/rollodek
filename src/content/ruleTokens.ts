import { DC_TIERS, type GameConfig } from '../config/gameConfig.ts'
import { TIER_LABELS } from '../components/settings/settingsSchema.ts'

/**
 * Values the rules docs (docs/rules.md, how-to-play.md, hero docs) can reference
 * as {{token}}, computed from the live game config — so the rules text always
 * matches the numbers the game is using.
 */
export function ruleTokens(c: GameConfig): Record<string, string> {
  const paid = DC_TIERS.filter((t) => c.dc.paidCostTiers.includes(t)).map((t) => TIER_LABELS[t])
  const unpaid = DC_TIERS.filter((t) => !c.dc.paidCostTiers.includes(t)).map((t) => TIER_LABELS[t])
  return {
    handSize: String(c.handSize),
    handCap: String(c.handCap),
    startingDeckSize: String(c.startingDeckSize),
    heroHpThreshold: String(c.heroHpThreshold),
    snakeEyesRoll: String(c.dc.snakeEyesRoll),
    boxcarsRoll: String(c.dc.boxcarsRoll),
    objectivesToWin: String(c.objectivesToWin),
    objectivesTotal: String(c.objectivesTotal),
    tableauActivationsPerCard: String(c.tableauActivationsPerCard),
    deckActionCount: String(c.startingDeckComposition.action),
    deckMemoryCount: String(c.startingDeckComposition.memory),
    deckCrossoverCount: String(c.startingDeckComposition.crossover),
    deckWildCount: String(c.startingDeckComposition.wild),
    /** Signed, to follow "2d6": "− 5" · "+ 0" · "+ 5" */
    dcEasyOffset: signed(c.dc.easyOffset),
    dcMediumOffset: signed(c.dc.mediumOffset),
    dcDangerousOffset: signed(c.dc.dangerousOffset),
    dcFloor: String(c.dc.floor),
    /** "Easy" · "Easy or Medium" · "Easy, Medium, or Dangerous" */
    paidCostTiers: joinList(paid, 'or') || 'no',
    /** The tiers with no buy-out: "Medium and Dangerous" */
    unpaidCostTiers: joinList(unpaid, 'and') || 'No',
  }
}

function signed(n: number) {
  return n < 0 ? `− ${Math.abs(n)}` : `+ ${n}`
}

function joinList(items: string[], word: 'and' | 'or') {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} ${word} ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, ${word} ${items.at(-1)}`
}

/**
 * Replace {{token}}s; unknown ones stay visible (and warn) so typos get noticed.
 * Inline `code` is left alone, so docs can talk about the token syntax itself.
 */
export function fillTokens(text: string, tokens: Record<string, string>) {
  return text
    .split(/(`[^`\n]*`)/)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
            if (name in tokens) return tokens[name]
            console.warn(`[rules] Unknown rule token {{${name}}}`)
            return match
          }),
    )
    .join('')
}
