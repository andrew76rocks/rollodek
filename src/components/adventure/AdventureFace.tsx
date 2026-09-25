import { adventureAssets } from '../../config/assets.ts'
import { getAdventureCard } from '../../data/adventureDeck.ts'
import { AdventureCardBack } from './AdventureCardBack.tsx'
import { PositionBadge } from './PositionBadge.tsx'
import styles from './AdventureFace.module.css'

/** One face of an Adventure location card at card size: the art front, or the content back */
export function AdventureFace({ cardId, face }: { cardId: string; face: 'front' | 'back' }) {
  const card = getAdventureCard(cardId)
  if (face === 'back') return <AdventureCardBack card={card} />
  return (
    <div className={styles.front}>
      <img src={adventureAssets.cardFront} alt="" />
      <PositionBadge card={card} />
    </div>
  )
}
