import { cardAssets, heroCardAssets } from '../../config/assets.ts'
import type { TableauCardData } from '../../data/tableauCards.ts'
import { previewAttrs } from '../CardPreview.tsx'
import styles from './HeroCard.module.css'

/**
 * A card in play in the tableau (companion, gear, ongoing spell). Same frame
 * as the Hero Card (Figma 95:68), without the stat/number cluster.
 */
export function TableauCard({ card }: { card: TableauCardData }) {
  return (
    <div className={styles.card} data-numbers="none" {...previewAttrs(card.id, card.zone)}>
      <div className={styles.inset} />
      <p className={styles.title}>{card.name}</p>
      <div className={styles.art}>
        <img src={heroCardAssets.art} alt="" />
      </div>
      <div className={styles.typeLine}>
        <span className={styles.statDot} style={{ backgroundImage: `url(${cardAssets.statDot})` }} />
        <span className={styles.cardType}>{card.typeLabel}</span>
      </div>
      <div className={styles.rules}>
        <p>{card.text}</p>
      </div>
    </div>
  )
}
