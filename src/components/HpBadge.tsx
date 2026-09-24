import { useGameConfig } from '../config/gameConfig.ts'
import styles from './HpBadge.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Hero HP out of the threshold from the game config (game-config.json +
 * Settings overrides). No wounds system yet, so current = max.
 */
export function HpBadge() {
  const max = useGameConfig((c) => c.heroHpThreshold)
  const current = max

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
