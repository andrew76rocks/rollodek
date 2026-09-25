import { useEffect, useRef } from 'react'
import { finishIntro, revealTable, useIntroStore } from '../../store/introStore.ts'
import './rollodek-logo.js'
import type { RolloDekLogoElement } from './rollodek-logo.d.ts'
import styles from './Intro.module.css'

/** How long the logo fades and zooms out while the table zooms in (matches the CSS) */
const REVEAL_MS = 1100

/**
 * Opening sequence for a new game: only the wood table shows, under a dark
 * vignette that slowly drifts (a Ken Burns lens), while the animated RolloDek
 * logo (Claude Design's <rollodek-logo>) plays front and center. When it
 * finishes, the logo fades and zooms out as the table's pieces zoom into view.
 * Any click or key skips straight to the reveal.
 */
export function Intro() {
  const stage = useIntroStore((s) => s.stage)
  const logo = useRef<RolloDekLogoElement>(null)

  // The logo's own "finished" event starts the reveal
  useEffect(() => {
    const el = logo.current
    if (!el) return
    el.addEventListener('rollodek-finished', revealTable)
    return () => el.removeEventListener('rollodek-finished', revealTable)
  }, [])

  // Skip on any key or click; swallow it so it doesn't also act on the table
  useEffect(() => {
    if (stage !== 'logo') return
    const skip = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      revealTable()
    }
    window.addEventListener('keydown', skip, { capture: true })
    window.addEventListener('pointerdown', skip, { capture: true })
    return () => {
      window.removeEventListener('keydown', skip, { capture: true })
      window.removeEventListener('pointerdown', skip, { capture: true })
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'reveal') return
    logo.current?.pause()
    const timer = window.setTimeout(finishIntro, REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [stage])

  if (stage === 'done') return null
  return (
    <div className={styles.layer} data-intro-layer data-stage={stage} role="dialog" aria-modal="true" aria-label="RolloDek">
      <div className={styles.vignette} aria-hidden />
      <div className={styles.logoWrap}>
        <rollodek-logo ref={logo} color="#FAFAF7" className={styles.logo} />
      </div>
      <p className={styles.skip} aria-hidden>
        Click or press any key to skip
      </p>
    </div>
  )
}
