import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { KeyboardEvent, ReactNode, Ref } from 'react'
import type { CardZone } from '../../store/uiStore.ts'
import { dragJustEnded } from './dragClickGuard.ts'
import { cardDragId, type CardDragData } from './dragTypes.ts'
import styles from './DraggableCard.module.css'

interface SortableCardProps {
  cardId: string
  zone: CardZone
  className?: string
  /** Extra ref for callers that also measure the node (e.g. the hand's fan) */
  nodeRef?: Ref<HTMLDivElement>
  /** Click / Enter / Space action (tableau cards: tap or untap) */
  onActivate?: () => void
  /** Toggle state for onActivate, announced to screen readers */
  pressed?: boolean
  /** Hidden while its drawn clone flies in from the Hero Deck */
  arriving?: boolean
  children: ReactNode
}

/**
 * A card in a tab view: drag left/right to reorder it within the zone, or up
 * to the Play Area to play it. While dragging, its faded ghost slides into the
 * slot it will land in.
 */
export function SortableCard({ cardId, zone, className, nodeRef, onActivate, pressed, arriving, children }: SortableCardProps) {
  const { setNodeRef, listeners, attributes, isDragging, transform, transition } = useSortable({
    id: cardDragId(zone, cardId),
    data: { cardId, from: zone } satisfies CardDragData,
  })

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    if (typeof nodeRef === 'function') nodeRef(node)
    else if (nodeRef) (nodeRef as { current: HTMLDivElement | null }).current = node
  }

  const activate = onActivate && (() => !dragJustEnded() && onActivate())
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (activate && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      activate()
    }
  }

  return (
    <div
      ref={setRefs}
      className={[styles.draggable, className].filter(Boolean).join(' ')}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-card-id={cardId}
      data-dragging={isDragging || undefined}
      data-arriving={arriving || undefined}
      {...attributes}
      {...listeners}
      aria-pressed={onActivate ? Boolean(pressed) : undefined}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}
