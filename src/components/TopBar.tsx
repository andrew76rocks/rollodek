import { useId, useState } from 'react'
import { uiAssets } from '../config/assets.ts'
import { PHASE_LABELS, PHASES, useGameStore } from '../store/gameStore.ts'
import { nextPhase, phaseBlocker } from '../store/turnFlow.ts'
import { useGameConfig } from '../config/gameConfig.ts'
import { useHeroDeckStore } from '../store/heroDeckStore.ts'
import { currentMission } from '../store/session.ts'
import { CaretRightIcon } from '@phosphor-icons/react'
import { useUiStore } from '../store/uiStore.ts'
import { EventLogPreview } from './eventLog/EventLogPreview.tsx'
import { OverflowMenu } from './menu/OverflowMenu.tsx'
import { MaskIcon } from './MaskIcon.tsx'
import styles from './TopBar.module.css'

const { icons } = uiAssets

export function TopBar() {
  const scene = useGameStore((s) => s.scene)
  const phase = useGameStore((s) => s.phase)
  const missionId = useGameStore((s) => s.missionId)
  const objectives = useGameStore((s) => s.objectives)
  const objectivesTotal = useGameConfig((c) => c.objectivesTotal)
  const done = Object.values(objectives).filter((o) => o === 'done').length
  const mission = missionId ? currentMission() : undefined
  // Re-evaluated on every render that could change it (phase, hand size, session state)
  useHeroDeckStore((s) => s.hand.length)
  useGameStore((s) => s.ended)
  const blocker = phaseBlocker()
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
        <h1 className={styles.logo}>
          <img src={uiAssets.logo} alt="RolloDek" width={151} height={27} />
        </h1>
        <span className={styles.brandDivider} aria-hidden />
        {/* TODO(drew): Mission card layout is an open question (rules.md §11); this is a placeholder readout */}
        <span className={styles.scene} title={mission?.goal}>
          {mission ? `${mission.name} · ${done}/${objectivesTotal} objectives` : 'No mission chosen'}
        </span>
      </div>

      <button
        className={styles.search}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={openDrawer === 'adventureCard'}
        onClick={() => setOpenDrawer('adventureCard')}
      >
        <MaskIcon src={icons.search} size={20} />
        <span>Find Card (F)</span>
      </button>

      <div className={styles.actions}>
        {/* The turn clock: turn, phase, progress through the four phases, and the one control that moves it */}
        <div className={styles.turnPill} role="group" aria-label={`Scene ${scene}, ${PHASE_LABELS[phase]} phase`}>
          <MaskIcon src={icons.hourglass} size={18} />
          <span className={styles.turnText}>
            Scene {scene}
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
          <button
            type="button"
            className={styles.nextPhase}
            onClick={nextPhase}
            disabled={Boolean(blocker)}
            aria-label={blocker ? `Next phase (${blocker})` : 'Next phase'}
            title={blocker ?? 'Next phase'}
          >
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
