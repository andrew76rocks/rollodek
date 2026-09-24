import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useUiStore } from '../../store/uiStore.ts'
import { CARD_ZONE_DROP_ID, type CardDragData } from '../dnd/dragTypes.ts'
import { Hand } from './Hand.tsx'
import { TableauView } from './TableauView.tsx'
import styles from './CardZoneView.module.css'

/**
 * The card area under the play area: whichever zone the tab bar has selected.
 * Also the drop target for dragging a played card back out of the Play Area.
 */
export function CardZoneView() {
  const zone = useUiStore((s) => s.cardZone)
  const { setNodeRef, isOver } = useDroppable({ id: CARD_ZONE_DROP_ID })
  const { active } = useDndContext()
  const receiving = (active?.data.current as CardDragData | undefined)?.from === 'play'

  return (
    <div
      ref={setNodeRef}
      id="card-zone-panel"
      role="tabpanel"
      aria-labelledby={`card-zone-tab-${zone}`}
      className={styles.zone}
      data-drop-ready={receiving || undefined}
      data-drop-over={(receiving && isOver) || undefined}
    >
      <div key={zone} className={styles.view}>
        {zone === 'hand' ? <Hand /> : <TableauView zone={zone} />}
      </div>
    </div>
  )
}
