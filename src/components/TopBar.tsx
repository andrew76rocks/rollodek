import { useId, useState } from 'react'
import { uiAssets } from '../config/assets.ts'
import { useGameStore } from '../store/gameStore.ts'
import { useUiStore } from '../store/uiStore.ts'
import { EventLogPreview } from './eventLog/EventLogPreview.tsx'
import { OverflowMenu } from './menu/OverflowMenu.tsx'
import { MaskIcon } from './MaskIcon.tsx'
import styles from './TopBar.module.css'

const { icons } = uiAssets

export function TopBar() {
  const turn = useGameStore((s) => s.turn)
  const scene = useGameStore((s) => s.scene)
  const openDrawer = useUiStore((s) => s.openDrawer)
  const setOpenDrawer = useUiStore((s) => s.setOpenDrawer)
  const logOpen = openDrawer === 'eventLog'
  const [previewing, setPreviewing] = useState(false)
  const previewId = useId()
  const showPreview = previewing && !logOpen

  return (
    <header className={styles.bar}>
      <h1 className={styles.logo}>RolloDek</h1>

      <button className={styles.search} type="button">
        <MaskIcon src={icons.search} size={20} />
        <span>Search Dungeon (F)</span>
      </button>

      <div className={styles.actions}>
        <span className={styles.turn}>
          <MaskIcon src={icons.hourglass} size={20} />
          Turn {turn}
          <span className={styles.sep}>|</span>
          Scene {scene}
        </span>
        {/* Event log: hover previews the last 10 events, click opens the full drawer */}
        <span
          className={styles.logAnchor}
          onPointerEnter={() => setPreviewing(true)}
          onPointerLeave={() => setPreviewing(false)}
        >
          <button
            type="button"
            aria-label="Event log"
            aria-haspopup="dialog"
            aria-expanded={logOpen}
            aria-describedby={showPreview ? previewId : undefined}
            className={styles.iconBtn}
            onClick={() => {
              setPreviewing(false)
              setOpenDrawer('eventLog')
            }}
            onFocus={(e) => e.currentTarget.matches(':focus-visible') && setPreviewing(true)}
            onBlur={() => setPreviewing(false)}
          >
            <MaskIcon src={icons.menu} size={24} />
          </button>
          {showPreview && <EventLogPreview id={previewId} />}
        </span>
        <button
          type="button"
          aria-label="How to play"
          aria-haspopup="dialog"
          aria-expanded={openDrawer === 'help'}
          className={styles.iconBtn}
          onClick={() => setOpenDrawer('help')}
        >
          <MaskIcon src={icons.question} size={24} />
        </button>
        <button
          type="button"
          aria-label="Settings"
          aria-haspopup="dialog"
          aria-expanded={openDrawer === 'settings'}
          className={styles.iconBtn}
          onClick={() => setOpenDrawer('settings')}
        >
          <MaskIcon src={icons.gear} size={24} />
        </button>
        <OverflowMenu buttonClassName={styles.iconBtn} />
      </div>
    </header>
  )
}
