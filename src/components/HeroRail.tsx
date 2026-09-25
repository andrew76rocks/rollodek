import type { CSSProperties } from 'react'
import { heroAssets, uiAssets } from '../config/assets.ts'
import { HERO_STATS as STAT_ORDER, useGameConfig, type HeroStat } from '../config/gameConfig.ts'
import { getHeroCard, isOnStat } from '../data/heroCard.ts'
import hero from '../data/hero.json'
import { usePlayAreaStore } from '../store/playAreaStore.ts'
import { useUiStore } from '../store/uiStore.ts'
import { HpBadge } from './HpBadge.tsx'
import styles from './HeroRail.module.css'

/**
 * Default-layout character column: stat hexes, portrait, HP, joined by the level connector line.
 *
 * Each stat hex doubles as a playtest calculator. Click one to light it: it
 * then shows its base value plus every Play Area card that counts for that
 * stat (see isOnStat), updating as cards come and go. Only one lights at a
 * time. It adjudicates nothing — it just saves the player doing the sum.
 */
export function HeroRail() {
  const stats = useGameConfig((c) => c.heroStats)
  const activeStat = useUiStore((s) => s.activeStat)
  const toggleActiveStat = useUiStore((s) => s.toggleActiveStat)
  const staged = usePlayAreaStore((s) => s.staged)

  // Base + the value of each staged hand card that counts for this stat
  const tally = (stat: HeroStat) =>
    staged
      .filter((c) => c.from === 'hand')
      .map((c) => getHeroCard(c.cardId))
      .filter((card) => isOnStat(card, stat))
      .reduce((sum, card) => sum + card.value, stats[stat])

  return (
    <aside className={styles.rail}>
      <ol className={styles.stats}>
        {STAT_ORDER.map((stat, i) => {
          const active = activeStat === stat
          const value = active ? tally(stat) : stats[stat]
          return (
            // Build order runs bottom-up: CHA first, STR last
            <li key={stat} className={styles.stat} style={{ '--build-step': STAT_ORDER.length - 1 - i } as CSSProperties}>
              <button
                type="button"
                className={styles.statButton}
                data-active={active || undefined}
                aria-pressed={active}
                onClick={() => toggleActiveStat(stat)}
                aria-label={
                  active
                    ? `${stat} ${value}: base ${stats[stat]} plus matching Play Area cards. Click to stop tallying`
                    : `${stat} ${stats[stat]}. Click to tally with matching Play Area cards`
                }
              >
                <img className={styles.hex} src={active ? uiAssets.hexagonFilled : uiAssets.hexagon} alt="" />
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{stat}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <img className={styles.portrait} src={heroAssets.portraitFull} alt={hero.name} />
      <HpBadge />
      <img className={styles.lineConnectors} src={uiAssets.railLineConnectors} alt="" />
    </aside>
  )
}

