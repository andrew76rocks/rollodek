import { getTableauCard, type TableauZone } from '../../data/tableauCards.ts'
import { toggleTap } from '../../store/cardMoves.ts'
import { useTableauStore } from '../../store/tableauStore.ts'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { cardDragId, zoneListId } from '../dnd/dragTypes.ts'
import { SortableCard } from '../dnd/SortableCard.tsx'
import { TableauCard } from './TableauCard.tsx'
import styles from './TableauView.module.css'

/** Gap between in-play cards when they fit; they overlap (negative gap) only when they don't. */
const CARD_GAP = 16

const EMPTY_TEXT: Record<TableauZone, string> = {
  party: 'No party members added.',
  items: 'No items added.',
  spells: 'No spells added.',
}

/**
 * Cards in play in one tableau zone, side by side; a short note when empty.
 * Click (or Enter / Space) taps a card to activate it (turns 90° clockwise), and again
 * to untap it. Drag left/right to reorder.
 */
export function TableauView({ zone }: { zone: TableauZone }) {
  const ids = useTableauStore((s) => s[zone])
  const tapped = useTableauStore((s) => s.tapped)

  // Fit the row to its column: normal gaps when there's room, overlap when not
  const row = useRef<HTMLDivElement>(null)
  const [gap, setGap] = useState(CARD_GAP)
  useLayoutEffect(() => {
    const el = row.current
    const card = el?.firstElementChild
    if (!el || !card || ids.length < 2) return
    const fit = () => {
      const cardWidth = card.getBoundingClientRect().width
      setGap(Math.min(CARD_GAP, (el.clientWidth - cardWidth * ids.length) / (ids.length - 1)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ids.length])

  if (ids.length === 0) return <p className={styles.empty}>{EMPTY_TEXT[zone]}</p>

  return (
    <div ref={row} className={styles.row} style={{ '--card-gap': `${gap}px` } as CSSProperties}>
      <SortableContext id={zoneListId(zone)} items={ids.map((id) => cardDragId(zone, id))} strategy={horizontalListSortingStrategy}>
        {ids.map((id) => (
          <SortableCard
            key={id}
            cardId={id}
            zone={zone}
            className={styles.slot}
            onActivate={() => toggleTap(id)}
            pressed={tapped.includes(id)}
          >
            <div className={styles.tap} data-tapped={tapped.includes(id) || undefined}>
              <TableauCard card={getTableauCard(id)} />
            </div>
          </SortableCard>
        ))}
      </SortableContext>
    </div>
  )
}
