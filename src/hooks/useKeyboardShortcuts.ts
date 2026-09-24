import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { rollAllDice } from '../components/dice/diceCommands.ts'
import { shuffleWithFlight } from '../components/DiscardPile.tsx'
import { drawToHand } from '../components/DrawFlight.tsx'
import { playStagedFromShortcut } from '../components/PlayArea.tsx'
import { CARD_ZONES, useUiStore, type LayoutMode } from '../store/uiStore.ts'

/**
 * Table-wide keyboard shortcuts:
 *   1        toggle the default / maximized layout
 *   Space    draw a card from the Hero Deck into the hand
 *   Enter    play the cards staged in the Play Area
 *   R        roll both dice
 *   Shift+R  reshuffle the Hero Discard back into the Hero Deck
 *   ← / →    previous / next tab in the bottom bar (wraps around)
 *
 * They stay out of the way while typing in a field, while a drawer, dialog or
 * menu is open, and when a modifier is held (Ctrl/Cmd/Alt always; Shift except
 * for Shift+R).
 */
const OTHER_LAYOUT: Record<LayoutMode, LayoutMode> = { default: 'maximized', maximized: 'default' }

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      if (isTypingTarget(e.target) || somethingModalIsOpen()) return

      if (e.shiftKey) {
        if (e.code === 'KeyR') {
          e.preventDefault()
          shuffleWithFlight()
        }
        return
      }

      // The physical !/1 key or numpad 1 (any keyboard layout), or whatever key types "1"
      if (e.code === 'Digit1' || e.code === 'Numpad1' || e.key === '1') {
        e.preventDefault()
        const mode = OTHER_LAYOUT[useUiStore.getState().layoutMode]
        animateLayoutChange(() => useUiStore.getState().setLayoutMode(mode))
      } else if (e.code === 'Space') {
        // A keyboard-focused button keeps Space (to press it); otherwise Space draws
        if (isKeyboardFocusedControl(e.target)) return
        e.preventDefault()
        drawToHand()
      } else if (e.key === 'Enter') {
        // Likewise a keyboard-focused button keeps Enter
        if (isKeyboardFocusedControl(e.target)) return
        e.preventDefault()
        playStagedFromShortcut()
      } else if (e.code === 'KeyR') {
        e.preventDefault()
        rollAllDice()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const { cardZone, setCardZone } = useUiStore.getState()
        const step = e.key === 'ArrowRight' ? 1 : -1
        const next = CARD_ZONES[(CARD_ZONES.indexOf(cardZone) + step + CARD_ZONES.length) % CARD_ZONES.length]
        setCardZone(next)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

/**
 * Runs the update inside a View Transition so named elements (decks, discards,
 * portrait, HP badge…) morph between layouts. flushSync makes React commit
 * inside the callback so the browser snapshots the finished layout.
 * Falls back to an instant switch without API support or with reduced motion.
 */
function animateLayoutChange(update: () => void) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduceMotion) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** Drawers and dialogs are aria-modal; the ⋮ menu is a role=menu popup */
function somethingModalIsOpen() {
  return document.querySelector('[aria-modal="true"], [role="menu"]') !== null
}

/**
 * A button/tab/card the player has tabbed to (focus ring showing). One that
 * merely kept focus after a mouse click doesn't count, so Space still draws.
 */
function isKeyboardFocusedControl(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    target.matches('button, [role="button"], [role="tab"], a[href], [tabindex]:not([tabindex="-1"])') &&
    target.matches(':focus-visible')
  )
}
