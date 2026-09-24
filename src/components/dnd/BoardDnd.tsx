import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, type ReactNode } from 'react'
import { moveToPlayArea, reorderZone, returnFromPlayArea } from '../../store/cardMoves.ts'
import { usePlayAreaStore } from '../../store/playAreaStore.ts'
import type { CardZone } from '../../store/uiStore.ts'
import { AnyCard } from './AnyCard.tsx'
import { markDragEnded } from './dragClickGuard.ts'
import { CARD_ZONE_DROP_ID, PLAY_AREA_DROP_ID, zoneListId, type CardDragData } from './dragTypes.ts'
import styles from './BoardDnd.module.css'

/**
 * Which target a dragged card is over. Hand cards overlap, so plain pointer
 * hit-testing can hit several at once; instead:
 *  - over the Play Area → play it (hand cards only; tableau cards are
 *    tapped instead, so they only reorder)
 *  - over the card area → the nearest card in its own zone (reorder), or the
 *    area itself (a played card returning)
 *  - anywhere else → no target, so the card stays put
 */
const boardCollision: CollisionDetection = (args) => {
  const from = (args.active.data.current as CardDragData).from
  const hits = pointerWithin(args)
  const hit = (id: string) => hits.find((c) => c.id === id)

  if (from === 'play') return hit(CARD_ZONE_DROP_ID) ? [hit(CARD_ZONE_DROP_ID)!] : []
  if (from === 'hand' && hit(PLAY_AREA_DROP_ID)) return [hit(PLAY_AREA_DROP_ID)!]
  if (!hit(CARD_ZONE_DROP_ID)) return []

  const sameZone = args.droppableContainers.filter(
    (c) => c.data.current?.sortable?.containerId === zoneListId(from),
  )
  return closestCenter({ ...args, droppableContainers: sameZone })
}

/**
 * Drag-and-drop for the table: hand / tableau cards → Play Area and back, and
 * left/right reordering within each tab view. Anything dropped outside a
 * valid target simply stays where it was.
 */
export function BoardDnd({ children }: { children: ReactNode }) {
  // A drag starts after 6px of movement, so hover and clicks on cards still work
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [dragging, setDragging] = useState<{ cardId: string; zone: CardZone } | null>(null)

  const onDragStart = ({ active }: DragStartEvent) => {
    const { cardId, from } = active.data.current as CardDragData
    // A played card renders as whatever kind of card it was before it was played
    const zone = from === 'play' ? usePlayAreaStore.getState().staged.find((c) => c.cardId === cardId)?.from : from
    if (zone) setDragging({ cardId, zone })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null)
    markDragEnded()
    const { cardId, from } = active.data.current as CardDragData
    if (!over) return
    if (over.id === PLAY_AREA_DROP_ID && from === 'hand') moveToPlayArea(from, cardId)
    else if (over.id === CARD_ZONE_DROP_ID && from === 'play') returnFromPlayArea(cardId)
    else if (from !== 'play') {
      // Dropped on another card in the same tab view: reorder
      const target = over.data.current as CardDragData | undefined
      if (target && target.from === from && target.cardId !== cardId) reorderZone(from, cardId, target.cardId)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollision}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setDragging(null)
        markDragEnded()
      }}
    >
      {children}
      {/* No drop animation: the card lands in its new home, which animates itself */}
      <DragOverlay dropAnimation={null} zIndex={1000}>
        {dragging && (
          <div className={styles.frame}>
            <div className={styles.overlay}>
              <AnyCard cardId={dragging.cardId} zone={dragging.zone} />
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
