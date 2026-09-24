import { uiAssets } from '../config/assets.ts'
import styles from './DeckPile.module.css'

interface DeckPileProps {
  tone: 'adventure' | 'hero'
  /** Two-line label, e.g. ['Adventure', 'Deck'] */
  label: [string, string]
}

const ART = { adventure: uiAssets.adventureDeckArt, hero: uiAssets.heroDeckArt }

/** Face-down draw pile. */
export function DeckPile({ tone, label }: DeckPileProps) {
  return (
    <div className={styles.pile} data-tone={tone} style={{ gridArea: tone === 'adventure' ? 'adeck' : 'hdeck' }}>
      <img className={styles.art} src={ART[tone]} alt="" />
      <div className={styles.inner}>
        <span className={styles.label}>
          {label[0]}
          <br />
          {label[1]}
        </span>
        <img src={uiAssets.deckDivider} alt="" />
      </div>
    </div>
  )
}
