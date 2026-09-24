import { useState } from 'react'
import { heroAssets, uiAssets } from '../config/assets.ts'
import hero from '../data/hero.json'
import { useUiStore } from '../store/uiStore.ts'
import { DiceControls } from './dice/DiceControls.tsx'
import { heroBackstory, heroClass } from '../content/heroContent.ts'
import { HeroTraitButton } from './hero/HeroTraitButton.tsx'
import { HpBadge } from './HpBadge.tsx'
import { MaskIcon } from './MaskIcon.tsx'
import styles from './BottomBar.module.css'

type TabId = 'hand' | 'party' | 'items' | 'spells'

const { icons } = uiAssets

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'hand', label: "Player's Hand", icon: icons.hand },
  { id: 'party', label: 'Party', icon: icons.party },
  { id: 'items', label: 'Items', icon: icons.items },
  { id: 'spells', label: 'Spells', icon: icons.spells },
]

// Placeholder until game state exists: every zone is empty, so no badges show.
const TAB_COUNTS: Record<TabId, number> = { hand: 0, party: 0, items: 0, spells: 0 }

export function BottomBar() {
  const [active, setActive] = useState<TabId>('hand')
  const layoutMode = useUiStore((s) => s.layoutMode)

  return (
    <footer className={styles.bar}>
      {layoutMode === 'default' ? (
        <div className={styles.heroInfo}>
          <div className={styles.heroInfoTrack}>
            <h2 className={styles.heroName}>{hero.name}</h2>
            <HeroTraitButton drawer="heroBackstory" doc={heroBackstory} icon={heroAssets.traitBackstory} />
            <HeroTraitButton drawer="heroClass" doc={heroClass} icon={heroAssets.traitClass} />
          </div>
        </div>
      ) : (
        <div className={styles.heroMini}>
          <span className={styles.avatar}>
            <img className={styles.innerRing} src={uiAssets.avatarInnerRing} alt="" />
            <img className={styles.outerRing} src={uiAssets.avatarOuterRing} alt="" />
            <img className={styles.profile} src={heroAssets.portraitMini} alt={hero.name} />
          </span>
          <img className={styles.miniConnector} src={uiAssets.levelConnectorMini} alt="" />
          <HpBadge />
        </div>
      )}

      <nav className={styles.tabs} aria-label="Hero zones">
        {TABS.map(({ id, label, icon }) => {
          const count = TAB_COUNTS[id]
          return (
            <button
              key={id}
              type="button"
              className={styles.tab}
              aria-pressed={active === id}
              onClick={() => setActive(id)}
            >
              <MaskIcon src={icon} size={20} />
              {label}
              {/* Badge only when the zone has something in it (styling TBD) */}
              {count > 0 && <span className={styles.count}>{count}</span>}
            </button>
          )
        })}
      </nav>

      <div className={styles.dice}>
        <DiceControls />
      </div>
    </footer>
  )
}
