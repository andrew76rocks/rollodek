import { useGameConfig } from '../config/gameConfig.ts'
import { useGameStore } from '../store/gameStore.ts'
import styles from './HpBadge.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Hero HP: the threshold from the game config (game-config.json + Settings
 * overrides) minus the wounds on the hero card. Zero is Hero Death.
 */
export function HpBadge() {
  const max = useGameConfig((c) => c.heroHpThreshold)
  const wounds = useGameStore((s) => s.wounds)
  const current = Math.max(0, max - wounds)

  return (
    <div className={styles.badge} aria-label={`HP ${current} of ${max}`}>
      <span className={styles.label}>HP</span>
      <span className={styles.values}>
        <span>{pad(current)}</span>
        <span className={styles.max}>/{pad(max)}</span>
      </span>
    </div>
  )
}
