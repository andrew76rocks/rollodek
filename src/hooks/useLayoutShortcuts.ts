import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useUiStore, type LayoutMode } from '../store/uiStore.ts'

/**
 * Shift+1 → default layout, Shift+2 → maximized layout.
 * Matches physical keys (event.code), since Shift+digit types a
 * layout-dependent symbol ("!", "@", "\"", …).
 */
const LAYOUT_SHORTCUTS: Record<string, LayoutMode> = {
  Digit1: 'default',
  Digit2: 'maximized',
}

export function useLayoutShortcuts() {
  const setLayoutMode = useUiStore((s) => s.setLayoutMode)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      const mode = LAYOUT_SHORTCUTS[e.code]
      if (!mode || isTypingTarget(e.target)) return
      e.preventDefault()
      if (mode === useUiStore.getState().layoutMode) return
      animateLayoutChange(() => setLayoutMode(mode))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setLayoutMode])
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
