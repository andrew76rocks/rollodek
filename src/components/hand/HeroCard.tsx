import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { cardAssets, heroCardAssets } from '../../config/assets.ts'
import type { HeroCardData } from '../../data/heroCard.ts'
import { previewAttrs } from '../CardPreview.tsx'
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
 * bottom-right cluster of stat type · value hexagon. One value per card
 * (docs/rules.md §3). TODO(drew): Figma 95:68 still shows a separate
 * off-stat number; update the frame to the single value.
 */
export function HeroCard({ card }: HeroCardProps) {
  // The numbers cluster overlays the rules area; measure it so the rules text
  // can wrap around a same-sized gap instead of running underneath it
  const cardRef = useRef<HTMLDivElement>(null)
  const numbersRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const numbers = numbersRef.current
    if (numbers) cardRef.current?.style.setProperty('--numbers-width', `${numbers.offsetWidth}px`)
  }, [card])

  return (
    <div ref={cardRef} className={styles.card} style={{ '--numbers-width': '112px' } as CSSProperties} {...previewAttrs(card.id, 'hand')}>
      <div className={styles.inset} />
      <p className={styles.title}>{card.name}</p>
      <div className={styles.art}>
        <img src={heroCardAssets.art} alt="" />
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
        <span className={styles.value} aria-label={`Value ${card.value}`}>
          <img src={cardAssets.valueHex} alt="" />
          <span>{card.value}</span>
        </span>
      </div>
    </div>
  )
}
