import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { FLIGHT_DURATION_S, FLIGHT_STAGGER_S } from '../PlayFlight.tsx'
import { AdventureFace } from './AdventureFace.tsx'
import styles from '../PlayFlight.module.css'

/**
 * Clearing a finished Scene: its location cards fly into the Adventure
 * Discard one after another, the same way played hero cards fly into the
 * Hero Discard (same stagger, timing, and fade into the pile). Each card
 * keeps the face it was showing. The discard is only updated once the last
 * card lands, as with Play Cards.
 */
interface SceneFlight {
  cardId: string
  face: 'front' | 'back'
  /** Center and scale of the card on the table (Scene cards can be drawn below full size) */
  from: { x: number; y: number; scale: number }
  to: { x: number; y: number }
}

const useSceneFlightStore = create<{ flights: SceneFlight[]; onDone: (() => void) | null }>(() => ({
  flights: [],
  onDone: null,
}))

/** True while a Scene's cards are in the air (the table hides the originals meanwhile) */
export const useSceneClearing = () => useSceneFlightStore((s) => s.flights.length > 0)
export const isSceneClearing = () => useSceneFlightStore.getState().flights.length > 0

/**
 * Fly these table cards into the Adventure Discard, then call `done` (which
 * commits the move). With reduced motion, or nothing on screen, `done` runs at once.
 */
export function flySceneToDiscard(cardIds: string[], done: () => void) {
  const target = document.querySelector('[data-discard="adventure"]')?.getBoundingClientRect()
  const cardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size')) || 250
  // Last card first: the Scene's first card is the last to leave
  const flights = [...cardIds].reverse().flatMap((cardId): SceneFlight[] => {
    const el = document.querySelector<HTMLElement>(`main button[data-preview-card="${cardId}"]`)
    if (!el || !target) return []
    const r = el.getBoundingClientRect()
    return [
      {
        cardId,
        face: el.dataset.previewFace === 'back' ? 'back' : 'front',
        from: { x: r.x + r.width / 2, y: r.y + r.height / 2, scale: r.width / cardSize },
        to: { x: target.x + target.width / 2, y: target.y + target.height / 2 },
      },
    ]
  })
  if (!flights.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return done()
  useSceneFlightStore.setState({ flights, onDone: done })
}

function land() {
  const { onDone } = useSceneFlightStore.getState()
  useSceneFlightStore.setState({ flights: [], onDone: null })
  onDone?.()
}

export function SceneDiscardLayer() {
  const flights = useSceneFlightStore((s) => s.flights)
  if (!flights.length) return null
  return createPortal(
    <div className={styles.layer} aria-hidden>
      {flights.map((f, i) => (
        <motion.div
          key={f.cardId}
          className={styles.card}
          style={{ left: f.from.x, top: f.from.y, zIndex: i }}
          initial={{ x: 0, y: 0, scale: f.from.scale, opacity: 1 }}
          animate={{
            x: f.to.x - f.from.x,
            y: f.to.y - f.from.y,
            scale: [f.from.scale, f.from.scale * 1.04, 0.8],
            opacity: [1, 1, 0],
          }}
          transition={{
            delay: i * FLIGHT_STAGGER_S,
            duration: FLIGHT_DURATION_S,
            ease: [0.45, 0, 0.2, 1],
            // Stays solid most of the way, then fades into the pile
            opacity: { delay: i * FLIGHT_STAGGER_S, duration: FLIGHT_DURATION_S, times: [0, 0.55, 1] },
          }}
          onAnimationComplete={i === flights.length - 1 ? land : undefined}
        >
          <AdventureFace cardId={f.cardId} face={f.face} />
        </motion.div>
      ))}
    </div>,
    document.body,
  )
}
