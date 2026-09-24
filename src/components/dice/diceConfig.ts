/**
 * Footer dice roll feel. Kept out of DiceCanvas so DicePair can read it
 * without pulling three.js into the main bundle.
 */
export const ROLL_SECONDS = 0.9 // hop + tumble + settle
export const ROLL_TURNS = 2 // extra full tumbles on the way to the new face
export const ROLL_HOP = 0.3 // world units the die lifts at the top of the hop

// Hover "magnet": the die stills and lifts toward the cursor (vertical only)
export const HOVER_LIFT_MIN_PX = 3 // lift even when the cursor is at/below center
export const HOVER_LIFT_MAX_PX = 6 // never rises more than this
export const HOVER_PULL = 0.5 // share of the cursor's height above center the die follows
export const HOVER_EASE = 12 // how quickly it settles into / out of hover (higher = snappier)

/** Live hover input for one die; written on pointer events, read every frame. */
export interface DieHover {
  active: boolean
  liftPx: number
}

export function hoverLiftPx(cursorAboveCenterPx: number) {
  return Math.min(Math.max(cursorAboveCenterPx * HOVER_PULL, HOVER_LIFT_MIN_PX), HOVER_LIFT_MAX_PX)
}

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

export const rollD6 = (): DieValue => (Math.floor(Math.random() * 6) + 1) as DieValue

/** Each die's current face and a counter that bumps on every roll. */
export interface DieState {
  value: DieValue
  rollId: number
}
