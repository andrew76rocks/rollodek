import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { uiAssets } from '../config/assets.ts'
import styles from './ShuffleFlight.module.css'

type Point = { x: number; y: number }

/** One reshuffle in progress: how many ghost cards to send, from the discard's center to the deck's */
interface Shuffle {
  id: number
  ghosts: number
  from: Point
  to: Point
}

/** Up to this many ghost cards fly per reshuffle, however big the discard is */
const MAX_GHOSTS = 6
const GHOST_STAGGER_S = 0.06
const GHOST_DURATION_S = 0.45
/** Bezier control-point lift; the arc itself peaks at half this, clearing the top of the hand */
const ARC_HEIGHT = 320

const useShuffleFlightStore = create<{ shuffles: Shuffle[] }>(() => ({ shuffles: [] }))
let nextId = 0

/** Send ghost card-backs arcing from the Hero Discard into the Hero Deck (call alongside the actual reshuffle). */
export function startShuffleFlight(cards: number, from: Point, to: Point) {
  const shuffle = { id: nextId++, ghosts: Math.min(cards, MAX_GHOSTS), from, to }
  useShuffleFlightStore.setState((s) => ({ shuffles: [...s.shuffles, shuffle] }))
}

function endShuffleFlight(id: number) {
  useShuffleFlightStore.setState((s) => ({ shuffles: s.shuffles.filter((f) => f.id !== id) }))
  // The deck "catches" the cards: a quick bump
  document.querySelector('[data-deck="hero"]')?.animate([{ scale: 1 }, { scale: 1.05 }, { scale: 1 }], {
    duration: 260,
    easing: 'ease-out',
  })
}

export function ShuffleFlightLayer() {
  const shuffles = useShuffleFlightStore((s) => s.shuffles)
  if (shuffles.length === 0) return null
  return createPortal(
    <div className={styles.layer} aria-hidden>
      {shuffles.map((s) =>
        Array.from({ length: s.ghosts }, (_, i) => (
          <Ghost
            key={`${s.id}-${i}`}
            from={s.from}
            to={s.to}
            delay={i * GHOST_STAGGER_S}
            onDone={i === s.ghosts - 1 ? () => endShuffleFlight(s.id) : undefined}
          />
        )),
      )}
    </div>,
    document.body,
  )
}

/** A face-down card that flies along a quadratic arc, spinning a little and shrinking into the deck */
function Ghost({ from, to, delay, onDone }: { from: Point; to: Point; delay: number; onDone?: () => void }) {
  const t = useMotionValue(0)
  // Control point: midway between the piles, lifted by ARC_HEIGHT
  const cx = (from.x + to.x) / 2
  const cy = Math.min(from.y, to.y) - ARC_HEIGHT
  const bezier = (a: number, c: number, b: number) => (p: number) => (1 - p) ** 2 * a + 2 * (1 - p) * p * c + p ** 2 * b
  const left = useTransform(t, bezier(from.x, cx, to.x))
  const top = useTransform(t, bezier(from.y, cy, to.y))
  const rotate = useTransform(t, [0, 1], [8, -360 + 8]) // one quick flip-spin on the way
  const scale = useTransform(t, [0, 0.5, 1], [0.7, 0.5, 0.9])
  const opacity = useTransform(t, [0, 0.12, 0.85, 1], [0, 0.9, 0.9, 0])

  useEffect(() => {
    const controls = animate(t, 1, { delay, duration: GHOST_DURATION_S, ease: [0.45, 0, 0.25, 1], onComplete: onDone })
    return () => controls.stop()
    // Runs once per ghost: each flies its own fixed path
  }, [])

  return (
    <motion.div className={styles.ghost} style={{ left, top, rotate, scale, opacity }}>
      <img src={uiAssets.heroDeckArt} alt="" />
    </motion.div>
  )
}
