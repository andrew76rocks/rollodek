import { uiAssets } from '../config/assets.ts'
import { MaskIcon } from './MaskIcon.tsx'
import styles from './DiscardPile.module.css'

interface DiscardPileProps {
  tone: 'adventure' | 'hero'
  count: number
}

export function DiscardPile({ tone, count }: DiscardPileProps) {
  return (
    <div className={styles.pile} data-tone={tone} style={{ gridArea: tone === 'adventure' ? 'adiscard' : 'hdiscard' }}>
      {/* Figma shows the reshuffle icon only on the hero discard (adventure's is hidden) */}
      {tone === 'hero' && <MaskIcon src={uiAssets.icons.shuffle} size={32} />}
      <div className={styles.labelGroup}>
        <span className={styles.label}>{tone === 'adventure' ? 'Adventure Discard' : 'Hero Discard'}</span>
        <span className={styles.count}>{count}</span>
      </div>
    </div>
  )
}
