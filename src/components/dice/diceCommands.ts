/**
 * Lets code outside the dice cluster (keyboard shortcuts, the check flow) roll
 * the dice. The mounted DiceControls registers its roll-both handler here.
 */
type RollAll = () => Promise<number[]> | null

let rollAll: RollAll | null = null

export function registerRollAllDice(handler: RollAll | null) {
  rollAll = handler
}

/** Roll both dice; resolves with their faces once they land (null if they're already rolling) */
export function rollAllDice(): Promise<number[]> | null {
  return rollAll?.() ?? null
}
