import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { getHeroCard } from '../../data/heroCard.ts'
import { useHeroDeckStore } from '../../store/heroDeckStore.ts'
import { HeroCard } from './HeroCard.tsx'
import styles from './Hand.module.css'

/** Figma's fan overlap at hand size 4 — the ceiling; tighter only when the row won't otherwise fit. */
const MAX_OVERLAP = 42

/** Figma node 56:3402 "Hero Hand" — the player's drawn hero cards, fanned in a row.
 * The table grid's hand column is narrower than Figma's demo frame, so the fan
 * overlap tightens (beyond Figma's 42px) whenever needed to keep the whole hand on-screen. */
export function Hand() {
  const hand = useHeroDeckStore((s) => s.hand)
  const containerRef = useRef<HTMLDivElement>(null)
  const firstCardRef = useRef<HTMLDivElement>(null)
  const [overlap, setOverlap] = useState(MAX_OVERLAP)

  useLayoutEffect(() => {
    const container = containerRef.current
    const card = firstCardRef.current
    if (!container || !card || hand.length < 2) return

    const recompute = () => {
      const available = container.clientWidth
      const cardWidth = card.getBoundingClientRect().width
      const step = (available - cardWidth) / (hand.length - 1)
      setOverlap(Math.max(MAX_OVERLAP, cardWidth - step))
    }

    recompute()
    const observer = new ResizeObserver(recompute)
    observer.observe(container)
    return () => observer.disconnect()
  }, [hand.length])

  return (
    <div className={styles.hand} ref={containerRef} style={{ '--card-overlap': `${overlap}px` } as CSSProperties}>
      {hand.map((id, i) => (
        <div key={id} className={styles.slot} ref={i === 0 ? firstCardRef : undefined}>
          <HeroCard card={getHeroCard(id)} />
        </div>
      ))}
    </div>
  )
}
