import { motion } from 'framer-motion'
import { memo, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { DRAW_DURATION_S } from '../DrawFlight.tsx'
import { AdventureFace } from './AdventureFace.tsx'
import styles from '../PlayFlight.module.css'

/**
 * Laying out a new Scene: its location cards slide out of the Adventure Deck
 * into their places, fading in as they go, the same way drawn hero cards slide
 * into the hand (same duration and fade), one card after another. Each card's
 * real slot stays hidden until its copy arrives.
 */
const DEAL_STAGGER_S = 0.09 // matches the hand's draw stagger

interface Deal {
  cardId: string
  index: number
  from: { x: number; y: number }
}

const useSceneDealStore = create<{ deals: Deal[] }>(() => ({ deals: [] }))

/** Scene cards still on their way in, as "AD-2A,AD-2B" (a string, so the selector result is stable) */
export const useDealingIds = () => useSceneDealStore((s) => s.deals.map((d) => d.cardId).join(','))

/**
 * Deal a Scene's cards from the Adventure Deck. Call it in the same tick as the
 * state change that puts them on the table, so they never show before their copies.
 */
export function dealSceneCards(cardIds: string[]) {
  const deck = document.querySelector('[data-deck="adventure"]')?.getBoundingClientRect()
  if (!deck || !cardIds.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const from = { x: deck.x + deck.width / 2, y: deck.y + deck.height / 2 }
  // In Scene order: the first card arrives first (leaving runs the other way, last card first)
  useSceneDealStore.setState({ deals: cardIds.map((cardId, index) => ({ cardId, index, from })) })
}

function landed(cardId: string) {
  useSceneDealStore.setState((s) => ({ deals: s.deals.filter((d) => d.cardId !== cardId) }))
}

export function SceneDealLayer() {
  const deals = useSceneDealStore((s) => s.deals)
  if (!deals.length) return null
  return createPortal(
    <div className={styles.layer} aria-hidden>
      {deals.map((d) => (
        <DealCard key={d.cardId} deal={d} />
      ))}
    </div>,
    document.body,
  )
}

// Memoized so a card landing doesn't re-render (and restart) the others in flight
const DealCard = memo(function DealCard({ deal }: { deal: Deal }) {
  const [to, setTo] = useState<{ x: number; y: number; scale: number } | null>(null)

  // Measure the card's real (hidden) slot once the Scene has laid out
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const slot = document.querySelector(`main button[data-preview-card="${deal.cardId}"]`)
      if (!slot) return landed(deal.cardId)
      const r = slot.getBoundingClientRect()
      const cardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size')) || 250
      setTo({ x: r.x + r.width / 2, y: r.y + r.height / 2, scale: r.width / cardSize })
    })
    return () => cancelAnimationFrame(frame)
  }, [deal.cardId])

  if (!to) return null
  return (
    <motion.div
      className={styles.card}
      style={{ left: deal.from.x, top: deal.from.y, zIndex: deal.index }}
      initial={{ x: 0, y: 0, scale: 0.85 * to.scale, opacity: 0 }}
      animate={{ x: to.x - deal.from.x, y: to.y - deal.from.y, scale: to.scale, opacity: [0, 1, 1] }}
      transition={{
        delay: deal.index * DEAL_STAGGER_S,
        duration: DRAW_DURATION_S,
        ease: [0.3, 0, 0.2, 1],
        // Fades in over the first half, then settles in solid (as a drawn hero card does)
        opacity: { delay: deal.index * DEAL_STAGGER_S, duration: DRAW_DURATION_S, times: [0, 0.5, 1] },
      }}
      onAnimationComplete={() => landed(deal.cardId)}
    >
      <AdventureFace cardId={deal.cardId} face="front" />
    </motion.div>
  )
})
