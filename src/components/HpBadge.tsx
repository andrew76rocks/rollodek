import { MinusIcon, PlusIcon } from '@phosphor-icons/react'
import { useGameConfig } from '../config/gameConfig.ts'
import { useGameStore } from '../store/gameStore.ts'
import { adjustWounds } from '../store/session.ts'
import styles from './HpBadge.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Hero HP: the threshold from the game config (game-config.json + Settings
 * overrides) minus the wounds on the hero card. Zero is Hero Death.
 *
 * Wounds are recorded by hand — nothing on the table deals them — so the
 * badge carries the two controls that put them on and take them off.
 */
export function HpBadge() {
  const max = useGameConfig((c) => c.heroHpThreshold)
  const wounds = useGameStore((s) => s.wounds)
  const current = Math.max(0, max - wounds)

  return (
    <div className={styles.badge} aria-label={`HP ${current} of ${max}`}>
      <button
        type="button"
        className={styles.step}
        onClick={() => adjustWounds(1)}
        disabled={wounds >= max}
        aria-label="Take a wound"
        title="Take a wound"
      >
        <MinusIcon size={12} weight="bold" aria-hidden />
      </button>
      <span className={styles.label}>HP</span>
      <span className={styles.values}>
        <span>{pad(current)}</span>
        <span className={styles.max}>/{pad(max)}</span>
      </span>
      <button
        type="button"
        className={styles.step}
        onClick={() => adjustWounds(-1)}
        disabled={wounds <= 0}
        aria-label="Heal a wound"
        title="Heal a wound"
      >
        <PlusIcon size={12} weight="bold" aria-hidden />
      </button>
    </div>
  )
}
