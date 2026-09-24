import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { cardAssets } from '../../config/assets.ts'
import type { HeroCardData } from '../../data/heroCard.ts'
import styles from './HeroCard.module.css'

interface HeroCardProps {
  card: HeroCardData
}

const CARD_TYPE_LABELS: Record<HeroCardData['type'], string> = {
  action: 'Action',
  memory: 'Memory',
  crossover: 'Crossover',
  wild: 'Wild',
}

/** Which stat the card is on-stat for: "WIS", "INT/WIS" (crossover), or "Any" (wild). */
function statTypeLabel(card: HeroCardData): string {
  if (card.type === 'wild') return 'Any'
  if (card.type === 'crossover') return (card.stats ?? []).join('/')
  return card.stat ?? ''
}

/**
 * Figma node 95:68 "Hero Card": title, art, card type, rules, and a
 * bottom-right cluster of stat type · off-stat number · on-stat hexagon.
 */
export function HeroCard({ card }: HeroCardProps) {
  // Wild cards are on-stat for any challenge, so an off-stat number never applies
  const showOffStat = card.type !== 'wild'

  // The numbers cluster overlays the rules area; measure it so the rules text
  // can wrap around a same-sized gap instead of running underneath it
  const cardRef = useRef<HTMLDivElement>(null)
  const numbersRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const numbers = numbersRef.current
    if (numbers) cardRef.current?.style.setProperty('--numbers-width', `${numbers.offsetWidth}px`)
  }, [card])

  return (
    <div ref={cardRef} className={styles.card} style={{ '--numbers-width': '112px' } as CSSProperties}>
      <div className={styles.inset} />
      <p className={styles.title}>{card.name}</p>
      <div className={styles.art}>
        <span>Hero art</span>
      </div>
      <div className={styles.typeLine}>
        <span className={styles.statDot} style={{ backgroundImage: `url(${cardAssets.statDot})` }} />
        <span className={styles.cardType}>{CARD_TYPE_LABELS[card.type]}</span>
      </div>
      <div className={styles.rules}>
        <p>{card.text}</p>
      </div>
      <div ref={numbersRef} className={styles.numbers}>
        <span className={styles.statType}>{statTypeLabel(card)}</span>
        {showOffStat && (
          <span className={styles.offStat} aria-label={`Off-stat ${card.offStat}`}>
            {card.offStat}
          </span>
        )}
        <span className={styles.onStat} aria-label={`On-stat +${card.onStat}`}>
          <img src={cardAssets.valueHex} alt="" />
          <span>+{card.onStat}</span>
        </span>
      </div>
    </div>
  )
}
