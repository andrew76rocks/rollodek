import { heroAssets, uiAssets } from '../config/assets.ts'
import hero from '../data/hero.json'
import { useHeroDeckStore } from '../store/heroDeckStore.ts'
import { useTableauStore } from '../store/tableauStore.ts'
import { useUiStore, type CardZone } from '../store/uiStore.ts'
import { DiceControls } from './dice/DiceControls.tsx'
import { heroBackstory, heroClass } from '../content/heroContent.ts'
import { HeroTraitButton } from './hero/HeroTraitButton.tsx'
import { HpBadge } from './HpBadge.tsx'
import { MaskIcon } from './MaskIcon.tsx'
import styles from './BottomBar.module.css'


const { icons } = uiAssets

const TABS: { id: CardZone; label: string; icon: string }[] = [
  { id: 'hand', label: "Player's Hand", icon: icons.hand },
  { id: 'party', label: 'Party', icon: icons.party },
  { id: 'items', label: 'Items', icon: icons.items },
  { id: 'spells', label: 'Spells', icon: icons.spells },
]


export function BottomBar() {
  const active = useUiStore((s) => s.cardZone)
  const setActive = useUiStore((s) => s.setCardZone)
  // Badge counts: cards in hand, and cards in play in each tableau zone
  const counts: Record<CardZone, number> = {
    hand: useHeroDeckStore((s) => s.hand.length),
    party: useTableauStore((s) => s.party.length),
    items: useTableauStore((s) => s.items.length),
    spells: useTableauStore((s) => s.spells.length),
  }
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

      <nav className={styles.tabs} aria-label="Hero zones" role="tablist">
        {TABS.map(({ id, label, icon }) => {
          const count = counts[id]
          return (
            <button
              key={id}
              id={`card-zone-tab-${id}`}
              type="button"
              role="tab"
              className={styles.tab}
              aria-selected={active === id}
              aria-controls="card-zone-panel"
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
