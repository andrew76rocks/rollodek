import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { getHeroCard } from '../../data/heroCard.ts'
import { useDrawFlightStore } from '../../store/drawFlightStore.ts'
import { useHeroDeckStore } from '../../store/heroDeckStore.ts'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { cardDragId, zoneListId } from '../dnd/dragTypes.ts'
import { dragJustEnded } from '../dnd/dragClickGuard.ts'
import { SortableCard } from '../dnd/SortableCard.tsx'
import { HeroCard } from './HeroCard.tsx'
import styles from './Hand.module.css'

/** Figma's fan overlap at hand size 4 — the ceiling; tighter only when the row won't otherwise fit. */
const MAX_OVERLAP = 42

/** Figma node 56:3402 "Hero Hand" — the player's drawn hero cards, fanned in a row.
 * The table grid's hand column is narrower than Figma's demo frame, so the fan
 * overlap tightens (beyond Figma's 42px) whenever needed to keep the whole hand on-screen. */
export function Hand() {
  const hand = useHeroDeckStore((s) => s.hand)
  const flights = useDrawFlightStore((s) => s.flights)
  const containerRef = useRef<HTMLDivElement>(null)
  const firstCardRef = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState<{ available: number; cardWidth: number } | null>(null)

  // Track the space the fan has; the overlap itself is derived during render so a
  // hand-size change re-lays out the fan in a single commit (which the slide below relies on)
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => {
      const cardWidth = firstCardRef.current?.getBoundingClientRect().width
      if (cardWidth) setRoom({ available: container.clientWidth, cardWidth })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [hand.length > 0]) // re-attach once there's a card to measure

  const overlap =
    room && hand.length > 1
      ? Math.max(MAX_OVERLAP, room.cardWidth - (room.available - room.cardWidth) / (hand.length - 1))
      : MAX_OVERLAP

  useSlideOnHandChange(containerRef, hand)

  return (
    <div className={styles.hand} ref={containerRef} style={{ '--card-overlap': `${overlap}px` } as CSSProperties}>
      {/* Same wording style as the tableau tabs' empty notes */}
      {hand.length === 0 && <p className={styles.empty}>No cards in hand.</p>}
      <SortableContext id={zoneListId('hand')} items={hand.map((id) => cardDragId('hand', id))} strategy={horizontalListSortingStrategy}>
        {hand.map((id, i) => (
          <SortableCard
            key={id}
            cardId={id}
            zone="hand"
            className={styles.slot}
            nodeRef={i === 0 ? firstCardRef : undefined}
            arriving={flights.some((f) => f.cardId === id)}
          >
            <HeroCard card={getHeroCard(id)} />
          </SortableCard>
        ))}
      </SortableContext>
    </div>
  )
}

/** How long the other cards take to slide into their new places when the hand grows or shrinks */
const SLIDE_MS = 320

/**
 * FLIP: when a card joins or leaves the hand, the cards already there glide to
 * their new spots instead of jumping. Positions are snapshotted the moment the
 * hand changes (before React re-renders), then each card animates from where it
 * was drawn to where it now sits. Reorders and drag-outs are left alone (dnd-kit
 * animates those itself).
 */
function useSlideOnHandChange(containerRef: RefObject<HTMLDivElement | null>, hand: string[]) {
  const before = useRef<Map<string, number> | null>(null)

  useEffect(
    () =>
      useHeroDeckStore.subscribe((next, prev) => {
        if (next.hand.length === prev.hand.length || !containerRef.current) return
        // A card dragged out of the hand: dnd-kit already slides the rest into place
        if (next.hand.length < prev.hand.length && dragJustEnded()) return
        const positions = new Map<string, number>()
        containerRef.current.querySelectorAll<HTMLElement>('[data-card-id]').forEach((el) => {
          positions.set(el.dataset.cardId!, el.getBoundingClientRect().left) // includes any slide in progress
        })
        before.current = positions
      }),
    [containerRef],
  )

  useLayoutEffect(() => {
    const positions = before.current
    before.current = null
    if (!positions || !containerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    containerRef.current.querySelectorAll<HTMLElement>('[data-card-id]').forEach((el) => {
      const was = positions.get(el.dataset.cardId!)
      if (was === undefined) return // newly arrived: its own fly-in handles it
      el.getAnimations().forEach((a) => a.id === 'hand-slide' && a.cancel())
      const dx = was - el.getBoundingClientRect().left
      if (Math.abs(dx) < 0.5) return
      el.animate([{ translate: `${dx}px 0` }, { translate: '0 0' }], {
        id: 'hand-slide',
        duration: SLIDE_MS,
        easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      })
    })
  }, [hand, containerRef])
}
