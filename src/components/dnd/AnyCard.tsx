import { getHeroCard } from '../../data/heroCard.ts'
import { getTableauCard } from '../../data/tableauCards.ts'
import type { CardZone } from '../../store/uiStore.ts'
import { HeroCard } from '../hand/HeroCard.tsx'
import { TableauCard } from '../hand/TableauCard.tsx'

/** Renders a card by id: hand cards are Hero Cards, everything else a tableau card. */
export function AnyCard({ cardId, zone }: { cardId: string; zone: CardZone }) {
  return zone === 'hand' ? <HeroCard card={getHeroCard(cardId)} /> : <TableauCard card={getTableauCard(cardId)} />
}
