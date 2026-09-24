import { motion } from 'framer-motion'
import { memo, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { drawCard } from '../store/cardMoves.ts'
import { endDrawFlight, startDrawFlight, useDrawFlightStore, type DrawFlight as Flight } from '../store/drawFlightStore.ts'
import { useUiStore } from '../store/uiStore.ts'
import { AnyCard } from './dnd/AnyCard.tsx'
import styles from './PlayFlight.module.css'

const DRAW_DURATION_S = 0.35

/**
 * Draw the top Hero Deck card into the hand, flying it in from the deck
 * (clicking the Hero Deck, or the Space shortcut).
 */
export function drawToHand() {
  const deck = document.querySelector('[data-deck="hero"]')?.getBoundingClientRect()
  useUiStore.getState().setCardZone('hand') // show the hand so the card has somewhere to land
  const cardId = drawCard()
  if (!cardId || !deck || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  startDrawFlight({ cardId, from: { x: deck.x + deck.width / 2, y: deck.y + deck.height / 2 } })
}

/**
 * Drawn cards slide out of the Hero Deck into their slot in the hand, fading
 * in as they go: the reverse of Play Cards' flight to the discard.
 */
export function DrawFlightLayer() {
  const flights = useDrawFlightStore((s) => s.flights)
  if (flights.length === 0) return null
  return createPortal(
    <div className={styles.layer} aria-hidden>
      {flights.map((f) => (
        <DrawFlightCard key={f.cardId} flight={f} />
      ))}
    </div>,
    document.body,
  )
}

// Memoized so drawing another card doesn't re-render (and restart) cards already in flight
const DrawFlightCard = memo(function DrawFlightCard({ flight }: { flight: Flight }) {
  const [to, setTo] = useState<{ x: number; y: number } | null>(null)

  // Measure the card's real (hidden) hand slot once the hand fan has re-laid out
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const slot = document.querySelector(`#card-zone-panel [data-card-id="${flight.cardId}"]`)
      if (!slot) return endDrawFlight(flight.cardId)
      const r = slot.getBoundingClientRect()
      setTo({ x: r.x + r.width / 2, y: r.y + r.height / 2 })
    })
    return () => cancelAnimationFrame(frame)
  }, [flight.cardId])

  if (!to) return null
  return (
    <motion.div
      className={styles.card}
      style={{ left: flight.from.x, top: flight.from.y }}
      initial={{ x: 0, y: 0, scale: 0.85, opacity: 0 }}
      animate={{ x: to.x - flight.from.x, y: to.y - flight.from.y, scale: 1, opacity: [0, 1, 1] }}
      transition={{
        duration: DRAW_DURATION_S,
        ease: [0.3, 0, 0.2, 1],
        // Fades in over the first half, then settles in solid
        opacity: { duration: DRAW_DURATION_S, times: [0, 0.5, 1] },
      }}
      onAnimationComplete={() => endDrawFlight(flight.cardId)}
    >
      <AnyCard cardId={flight.cardId} zone="hand" />
    </motion.div>
  )
})
