import { useDraggable } from '@dnd-kit/core'
import type { CSSProperties, KeyboardEvent, ReactNode, Ref } from 'react'
import { dragJustEnded } from './dragClickGuard.ts'
import { cardDragId, type CardDragData } from './dragTypes.ts'
import styles from './DraggableCard.module.css'

interface DraggableCardProps {
  cardId: string
  from: CardDragData['from']
  className?: string
  style?: CSSProperties
  /** Extra ref for callers that also measure the node (e.g. the hand's fan) */
  nodeRef?: Ref<HTMLDivElement>
  /** Click / Enter action (a drag release never counts as a click) */
  onActivate?: () => void
  children: ReactNode
}

/** Wraps a card so it can be picked up. While dragging, the original dims in place. */
export function DraggableCard({ cardId, from, className, style, nodeRef, onActivate, children }: DraggableCardProps) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: cardDragId(from, cardId),
    data: { cardId, from } satisfies CardDragData,
  })

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    if (typeof nodeRef === 'function') nodeRef(node)
    else if (nodeRef) (nodeRef as { current: HTMLDivElement | null }).current = node
  }

  const activate = onActivate && (() => !dragJustEnded() && onActivate())
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Enter only: Space is reserved for zooming the card under the pointer
    if (activate && e.key === 'Enter') {
      e.preventDefault()
      activate()
    }
  }

  return (
    <div
      ref={setRefs}
      className={[styles.draggable, className].filter(Boolean).join(' ')}
      style={style}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...listeners}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}
