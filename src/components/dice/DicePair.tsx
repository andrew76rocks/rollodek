import { lazy, Suspense, useRef, type PointerEvent } from 'react'
import { uiAssets } from '../../config/assets.ts'
import { hoverLiftPx, HOVER_LIFT_MAX_PX, type DieHover, type DieState, type DieValue } from './diceConfig.ts'
import styles from './DicePair.module.css'

// three.js is heavy; load it after first paint and show the Figma die art meanwhile
const DiceCanvas = lazy(() => import('./DiceCanvas.tsx'))

const DICE = [
  { key: 'blue', label: 'blue die' },
  { key: 'violet', label: 'violet die' },
] as const

/**
 * The footer's pair of dice. Each die sits under a real button, so clicking
 * (or Enter/Space) rolls it. State lives in DiceControls.
 */
interface DicePairProps {
  dice: DieState[]
  landed: DieValue[]
  onRoll: (index: number) => void
}

export function DicePair({ dice, landed, onRoll }: DicePairProps) {
  // Hover is read every frame by the canvas, so it lives in refs (no re-renders)
  const hover = [useRef<DieHover>({ active: false, liftPx: 0 }), useRef<DieHover>({ active: false, liftPx: 0 })]

  const trackPointer = (i: number) => (e: PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const aboveCenter = rect.top + rect.height / 2 - e.clientY
    hover[i].current = { active: true, liftPx: hoverLiftPx(aboveCenter) }
  }

  const fallback = (
    <>
      <img src={uiAssets.die1} alt="" />
      <img src={uiAssets.die2} alt="" />
    </>
  )

  return (
    <div className={styles.pair}>
      <Suspense fallback={fallback}>
        <DiceCanvas dice={dice} hover={hover} />
      </Suspense>
      {DICE.map(({ key, label }, i) => (
        <button
          key={key}
          type="button"
          className={styles.dieButton}
          data-slot={i}
          aria-label={`Roll ${label}, showing ${landed[i]}`}
          onClick={() => onRoll(i)}
          onPointerEnter={trackPointer(i)}
          onPointerMove={trackPointer(i)}
          onPointerLeave={() => (hover[i].current = { active: false, liftPx: 0 })}
          // Keyboard focus gets the full lift so Tab users see which die is ready
          onFocus={() => (hover[i].current = { active: true, liftPx: HOVER_LIFT_MAX_PX })}
          onBlur={() => (hover[i].current = { active: false, liftPx: 0 })}
        />
      ))}
    </div>
  )
}
