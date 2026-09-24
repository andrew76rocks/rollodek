/**
 * Releasing a drag can also fire a click on the card underneath. Cards that
 * act on click (tableau tap) ask this whether a drag just ended, and ignore it.
 */
let lastDragEnd = 0

export const markDragEnded = () => {
  lastDragEnd = performance.now()
}

export const dragJustEnded = () => performance.now() - lastDragEnd < 250
