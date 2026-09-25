import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import type { CardZone } from '../store/uiStore.ts'
import { AnyCard } from './dnd/AnyCard.tsx'
import styles from './PlayFlight.module.css'

/** One played card on its way to the Hero Discard: where it starts (card center) and where it lands. */
export interface Flight {
  cardId: string
  zone: CardZone
  /** Stacking order, so cards keep their overlap while flying (defaults to flight order) */
  layer?: number
  from: { x: number; y: number }
  to: { x: number; y: number }
}

/** Each card follows the one before it by this much */
export const FLIGHT_STAGGER_S = 0.1
export const FLIGHT_DURATION_S = 0.5
const START_TILT = -11.18 // matches the Play Area tilt, so the card lifts straight out of the strip

/**
 * Played cards pull out of the Play Area one after another and slide into the
 * Hero Discard, shrinking a little and fading as they land. Rendered in a
 * portal so they can fly over the whole table.
 */
export function PlayFlight({ flights, onDone }: { flights: Flight[]; onDone: () => void }) {
  return createPortal(
    <div className={styles.layer} aria-hidden>
      {flights.map((f, i) => (
        <motion.div
          key={f.cardId}
          className={styles.card}
          style={{ left: f.from.x, top: f.from.y, zIndex: f.layer ?? i }}
          initial={{ x: 0, y: 0, rotate: START_TILT, scale: 1, opacity: 1 }}
          animate={{
            x: f.to.x - f.from.x,
            y: f.to.y - f.from.y,
            rotate: 0,
            scale: [1, 1.04, 0.8],
            opacity: [1, 1, 0],
          }}
          transition={{
            delay: i * FLIGHT_STAGGER_S,
            duration: FLIGHT_DURATION_S,
            ease: [0.45, 0, 0.2, 1],
            // Stays solid most of the way, then fades into the pile
            opacity: { delay: i * FLIGHT_STAGGER_S, duration: FLIGHT_DURATION_S, times: [0, 0.55, 1] },
          }}
          onAnimationComplete={i === flights.length - 1 ? onDone : undefined}
        >
          <AnyCard cardId={f.cardId} zone={f.zone} />
        </motion.div>
      ))}
    </div>,
    document.body,
  )
}
