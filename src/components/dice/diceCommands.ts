/**
 * Lets code outside the dice cluster (keyboard shortcuts) roll the dice. The
 * mounted DiceControls registers its roll-both handler here.
 */
let rollAll: (() => void) | null = null

export function registerRollAllDice(handler: (() => void) | null) {
  rollAll = handler
}

export function rollAllDice() {
  rollAll?.()
}
