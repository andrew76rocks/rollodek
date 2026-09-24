import { useId, useState } from 'react'
import { uiAssets } from '../config/assets.ts'
import { PHASE_LABELS, PHASES, useGameStore } from '../store/gameStore.ts'
import { nextPhase } from '../store/turnFlow.ts'
import { CaretRightIcon } from '@phosphor-icons/react'
import { useUiStore } from '../store/uiStore.ts'
import { EventLogPreview } from './eventLog/EventLogPreview.tsx'
import { OverflowMenu } from './menu/OverflowMenu.tsx'
import { MaskIcon } from './MaskIcon.tsx'
import styles from './TopBar.module.css'

const { icons } = uiAssets

export function TopBar() {
  const turn = useGameStore((s) => s.turn)
  const scene = useGameStore((s) => s.scene)
  const phase = useGameStore((s) => s.phase)
  const openDrawer = useUiStore((s) => s.openDrawer)
  const setOpenDrawer = useUiStore((s) => s.setOpenDrawer)
  const logOpen = openDrawer === 'eventLog'
  const [previewing, setPreviewing] = useState(false)
  const previewId = useId()
  const showPreview = previewing && !logOpen

  return (
    <header className={styles.bar}>
      {/* Story context: where you are in the mission */}
      <div className={styles.brand}>
        <h1 className={styles.logo}>RolloDek</h1>
        <span className={styles.brandDivider} aria-hidden />
        <span className={styles.scene}>Scene {scene}</span>
      </div>

      <button className={styles.search} type="button">
        <MaskIcon src={icons.search} size={20} />
        <span>Search Dungeon (F)</span>
      </button>

      <div className={styles.actions}>
        {/* The turn clock: turn, phase, progress through the four phases, and the one control that moves it */}
        <div className={styles.turnPill} role="group" aria-label={`Turn ${turn}, ${PHASE_LABELS[phase]} phase`}>
          <MaskIcon src={icons.hourglass} size={18} />
          <span className={styles.turnText}>
            Turn {turn}
            <span className={styles.dot} aria-hidden>
              ·
            </span>
            <span className={styles.phase}>{PHASE_LABELS[phase]}</span>
          </span>
          <span className={styles.pips} aria-hidden>
            {PHASES.map((p, i) => (
              <span
                key={p}
                className={styles.pip}
                data-state={i < PHASES.indexOf(phase) ? 'done' : p === phase ? 'current' : undefined}
                title={PHASE_LABELS[p]}
              />
            ))}
          </span>
          {/* Icon-only; the label is for screen readers and the hover tooltip */}
          <button type="button" className={styles.nextPhase} onClick={nextPhase} aria-label="Next phase" title="Next phase">
            <CaretRightIcon size={12} weight="bold" aria-hidden />
          </button>
        </div>
        <span className={styles.toolsDivider} aria-hidden />
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
