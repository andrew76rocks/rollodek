import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { uiAssets } from '../config/assets.ts'
import { playStagedCards } from '../store/cardMoves.ts'
import { usePlayAreaStore } from '../store/playAreaStore.ts'
import { AnyCard } from './dnd/AnyCard.tsx'
import { PlayCardsButton } from './PlayCardsButton.tsx'
import { DraggableCard } from './dnd/DraggableCard.tsx'
import { PLAY_AREA_DROP_ID, type CardDragData } from './dnd/dragTypes.ts'
import styles from './PlayArea.module.css'

/** Figma 62:3626: played cards sit 181px apart, compressing only if they'd run out of room. */
const CARD_SPACING = 181
const TILTED_CARD_BOX = 293.73 // a 250px card rotated 11.18° fits in this square

/**
 * Staging strip where committed cards sit before resolving. Cards dragged here
 * from the hand or tableau drop in tilted, showing only their tops; drag one
 * back down to return it.
 */
export function PlayArea() {
  const staged = usePlayAreaStore((s) => s.staged)
  const { setNodeRef, isOver } = useDroppable({ id: PLAY_AREA_DROP_ID })
  const { active } = useDndContext()
  const from = (active?.data.current as CardDragData | undefined)?.from
  // Only hand cards can be played here; tableau cards are tapped instead
  const receiving = from === 'hand'

  // Keep the fan between the label and the Play Cards button
  const row = useRef<HTMLDivElement>(null)
  const [spacing, setSpacing] = useState(CARD_SPACING)
  useLayoutEffect(() => {
    const el = row.current
    if (!el || staged.length < 2) return
    const fit = () => setSpacing(Math.min(CARD_SPACING, (el.clientWidth - TILTED_CARD_BOX) / (staged.length - 1)))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [staged.length])

  return (
    <section
      ref={setNodeRef}
      className={styles.area}
      data-drop-ready={receiving || undefined}
      data-drop-over={(receiving && isOver) || undefined}
    >
      <h2 className={styles.label}>Play Area</h2>

      <div ref={row} className={styles.staged} style={{ '--staged-overlap': `${TILTED_CARD_BOX - spacing}px` } as CSSProperties}>
        {staged.map(({ cardId, from: zone }) => (
          <DraggableCard key={cardId} cardId={cardId} from="play" className={styles.stagedSlot}>
            <div className={styles.tilt}>
              <AnyCard cardId={cardId} zone={zone} />
              {/* Figma "Card Highlight Bar": shading where the card tucks into the strip */}
              <span className={styles.highlightBar}>
                <img src={uiAssets.cardHighlightBar} alt="" />
              </span>
            </div>
          </DraggableCard>
        ))}
      </div>

      <PlayCardsButton count={staged.length} onPlay={playStagedCards} />
    </section>
  )
}
