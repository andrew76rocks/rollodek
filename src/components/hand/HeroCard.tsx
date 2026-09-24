import { cardAssets } from '../../config/assets.ts'
import type { HeroCardData } from '../../data/heroCard.ts'
import styles from './HeroCard.module.css'

interface HeroCardProps {
  card: HeroCardData
}

/** "STR · Action", "DEX/INT · Crossover", "Wild" — wild cards carry no stat. */
function typeLabel(card: HeroCardData): string {
  switch (card.type) {
    case 'action':
      return `${card.stat} · Action`
    case 'memory':
      return `${card.stat} · Memory`
    case 'crossover':
      return `${(card.stats ?? []).join('/')} · Crossover`
    case 'wild':
      return 'Wild'
  }
}

/** Figma node 95:68 "Hero Card" — a single face-up card from the hero deck. */
export function HeroCard({ card }: HeroCardProps) {
  const hasStat = card.type !== 'wild'

  return (
    <div className={styles.card}>
      <div className={styles.inset} />
      <div className={styles.titleRow}>
        <p className={styles.title}>{card.name}</p>
      </div>
      <div className={styles.art}>
        <span>Hero art</span>
      </div>
      <div className={styles.typeLine}>
        {hasStat && <span className={styles.statDot} style={{ backgroundImage: `url(${cardAssets.statDot})` }} />}
        <span className={styles.type}>{typeLabel(card)}</span>
        {/* Off-stat = card value alone (no Base Stat bonus); wild cards are always on-stat, so it doesn't apply */}
        {hasStat && <span className={styles.offstat}>Off-stat {card.value}</span>}
      </div>
      <div className={styles.rules}>
        <p>{card.text}</p>
      </div>
      <div className={styles.valueBadge} style={{ backgroundImage: `url(${cardAssets.valueHex})` }}>
        <span>+{card.value}</span>
      </div>
    </div>
  )
}
