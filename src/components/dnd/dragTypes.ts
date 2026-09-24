import type { CardZone } from '../../store/uiStore.ts'

/** What a draggable card carries: its id and where it's being dragged from. */
export interface CardDragData {
  cardId: string
  from: CardZone | 'play'
}

export const PLAY_AREA_DROP_ID = 'play-area'
export const CARD_ZONE_DROP_ID = 'card-zone'

/** Sortable ids: one list per zone, one item per card */
export const zoneListId = (zone: CardZone) => `zone-${zone}`
export const cardDragId = (from: CardDragData['from'], cardId: string) => `${from}:${cardId}`
