import { useState } from 'react'
import { DC_TIERS, useGameConfig, type DcTier } from '../../config/gameConfig.ts'
import { TIER_LABELS } from '../settings/settingsSchema.ts'
import styles from './DiceTotal.module.css'

/**
 * Clicking steps through: the faces alone ("3 / 3") → Easy → Medium →
 * Dangerous → back to the faces
 */
type Mode = 'faces' | DcTier
const CYCLE: Mode[] = ['faces', ...DC_TIERS]

const signed = (n: number) => (n < 0 ? `−${Math.abs(n)}` : `+${n}`)

/** Chip shorthand; the offset itself lives in the rules (and the coin's total) */
const TIER_TAGS: Record<DcTier, string> = { easy: 'EASY', medium: 'MED', dangerous: 'DNGR' }

/**
 * The dice readout. By default just the faces, "3 / 3" (dice serve other
 * rolls too). Clicking it swaps in a small shield showing a difficulty tier
 * (EASY / MED / DNGR) over the DC for this roll: the dice total plus that
 * tier's offset from the live config, with the DC floor. Each click moves to
 * the next tier; one more after DNGR returns to "3 / 3".
 */
export function DiceTotal({ faces }: { faces: number[] }) {
  const dc = useGameConfig((c) => c.dc)
  const [step, setStep] = useState(0)
  const mode = CYCLE[step]
  const nextMode = CYCLE[(step + 1) % CYCLE.length]
  const advance = () => setStep((s) => (s + 1) % CYCLE.length)

  if (mode === 'faces') {
    return (
      <output className={styles.total} aria-live="polite">
        <button
          type="button"
          className={styles.plain}
          onClick={advance}
          aria-label={`Dice showing ${faces.join(' and ')}. Work out the DC for a difficulty tier`}
          title="Click to work out the DC (Easy, Medium, Dangerous)"
        >
          {faces.join(' / ')}
        </button>
      </output>
    )
  }

  const tier = mode
  const offset = dc[`${tier}Offset`]
  const total = Math.max(dc.floor, faces.reduce((a, b) => a + b, 0) + offset)
  const nextLabel = nextMode === 'faces' ? null : TIER_LABELS[nextMode]

  return (
    <output className={styles.total} aria-live="polite">
      {/* The shield is the button: the tier tag over the DC total; click for the next tier */}
      <button
        type="button"
        className={styles.shield}
        onClick={advance}
        aria-label={`Dice showing ${faces.join(' and ')}, ${TIER_LABELS[tier]} (${signed(offset)}): DC ${total}. ${nextLabel ? `Switch to ${nextLabel}` : 'Back to the dice faces'}`}
        title={nextLabel ? `Click for ${nextLabel}` : 'Click to go back to the dice faces'}
      >
        <svg className={styles.outline} viewBox="0 0 36 40" aria-hidden>
          <path d="M5 1.5 H31 A3.5 3.5 0 0 1 34.5 5 V18 C34.5 28 27 35 18 38.5 C9 35 1.5 28 1.5 18 V5 A3.5 3.5 0 0 1 5 1.5 Z" />
        </svg>
        <span className={styles.tag}>{TIER_TAGS[tier]}</span>
        <span className={styles.value}>{total}</span>
      </button>
    </output>
  )
}
