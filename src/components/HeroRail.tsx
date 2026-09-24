import type { CSSProperties } from 'react'
import { heroAssets, uiAssets } from '../config/assets.ts'
import { HERO_STATS as STAT_ORDER, useGameConfig } from '../config/gameConfig.ts'
import hero from '../data/hero.json'
import { HpBadge } from './HpBadge.tsx'
import styles from './HeroRail.module.css'


/** Default-layout character column: stat hexes, portrait, HP, joined by the level connector line. */
export function HeroRail() {
  const stats = useGameConfig((c) => c.heroStats)
  return (
    <aside className={styles.rail}>
      <ol className={styles.stats}>
        {STAT_ORDER.map((stat, i) => (
          // Build order runs bottom-up: CHA first, STR last
          <li key={stat} className={styles.stat} style={{ '--build-step': STAT_ORDER.length - 1 - i } as CSSProperties}>
            <img className={styles.hex} src={uiAssets.hexagon} alt="" />
            <span className={styles.statValue}>{stats[stat]}</span>
            <span className={styles.statLabel}>{stat}</span>
          </li>
        ))}
      </ol>
      <img className={styles.portrait} src={heroAssets.portraitFull} alt={hero.name} />
      <HpBadge />
      <img className={styles.lineConnectors} src={uiAssets.railLineConnectors} alt="" />
    </aside>
  )
}

