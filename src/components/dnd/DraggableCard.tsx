import { useDraggable } from '@dnd-kit/core'
import type { CSSProperties, ReactNode, Ref } from 'react'
import { cardDragId, type CardDragData } from './dragTypes.ts'
import styles from './DraggableCard.module.css'

interface DraggableCardProps {
  cardId: string
  from: CardDragData['from']
  className?: string
  style?: CSSProperties
  /** Extra ref for callers that also measure the node (e.g. the hand's fan) */
  nodeRef?: Ref<HTMLDivElement>
  children: ReactNode
}

/** Wraps a card so it can be picked up. While dragging, the original dims in place. */
export function DraggableCard({ cardId, from, className, style, nodeRef, children }: DraggableCardProps) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: cardDragId(from, cardId),
    data: { cardId, from } satisfies CardDragData,
  })

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    if (typeof nodeRef === 'function') nodeRef(node)
    else if (nodeRef) (nodeRef as { current: HTMLDivElement | null }).current = node
  }

  return (
    <div
      ref={setRefs}
      className={[styles.draggable, className].filter(Boolean).join(' ')}
      style={style}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}
