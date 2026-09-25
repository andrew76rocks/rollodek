import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useGameConfig } from '../../config/gameConfig.ts'
import { missions } from '../../data/adventureDeck.ts'
import { useGameStore } from '../../store/gameStore.ts'
import { useIntroStore } from '../../store/introStore.ts'
import { startNewGame } from '../../store/newGame.ts'
import { chooseMission, currentMission } from '../../store/session.ts'
import styles from '../dialog/ConfirmDialog.module.css'

/**
 * Session bookends: choosing a mission at the start (docs/rules.md §10) and
 * the result at the end (Mission Success / Failure, Hero Death). Both block
 * the table until acted on.
 */
export function SessionScreens() {
  const missionId = useGameStore((s) => s.missionId)
  const ended = useGameStore((s) => s.ended)
  // The mission picker waits for the opening logo to finish
  const introDone = useIntroStore((s) => s.stage === 'done')
  return (
    <>
      <Screen open={!missionId && introDone} title="Choose a mission">
        {(focusRef) => <MissionChoice focusRef={focusRef} />}
      </Screen>
      <Screen open={Boolean(ended)} title={ended ? END_TITLES[ended] : ''}>
        {(focusRef) => <SessionEnd focusRef={focusRef} />}
      </Screen>
    </>
  )
}

const END_TITLES = { success: 'Mission Success', failure: 'Mission Failure', death: 'Hero Death' }

type FocusRef = React.RefObject<HTMLButtonElement | null>

function MissionChoice({ focusRef }: { focusRef: FocusRef }) {
  // TODO(drew): the Mission card layout is an open question (rules.md §11); this is a plain list
  return (
    <>
      {missions.map((mission, i) => (
        <div key={mission.id}>
          <p>
            <strong>{mission.name}</strong>
          </p>
          <p>{mission.premise}</p>
          <p>
            <em>Goal:</em> {mission.goal}
          </p>
          <div className={styles.actions}>
            <button ref={i === 0 ? focusRef : undefined} type="button" className={styles.confirm} onClick={() => chooseMission(mission.id)}>
              Start {mission.name}
            </button>
          </div>
        </div>
      ))}
    </>
  )
}

function SessionEnd({ focusRef }: { focusRef: FocusRef }) {
  const objectives = useGameStore((s) => s.objectives)
  const wounds = useGameStore((s) => s.wounds)
  const threshold = useGameConfig((c) => c.heroHpThreshold)
  const mission = currentMission()
  return (
    <>
      <p>
        Wounds: {wounds} of {threshold}
      </p>
      <ul>
        {mission?.objectives.map((o) => (
          <li key={o.id}>
            {o.text}: {objectives[o.id] === 'done' ? 'done' : objectives[o.id] === 'closed' ? 'closed' : 'not done'}
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <button ref={focusRef} type="button" className={styles.confirm} onClick={startNewGame}>
          New Game
        </button>
      </div>
    </>
  )
}

function Screen({ open, title, children }: { open: boolean; title: string; children: (focusRef: FocusRef) => ReactNode }) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const focusRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open) requestAnimationFrame(() => focusRef.current?.focus())
  }, [open])
  const t = reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={styles.dialog}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={t}
          >
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <div className={styles.body}>{children(focusRef)}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
