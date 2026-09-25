import { CheckCircleIcon, CircleIcon, ProhibitIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useGameConfig } from '../../config/gameConfig.ts'
import { useGameStore, type ObjectiveState } from '../../store/gameStore.ts'
import { currentMission, setObjective } from '../../store/session.ts'
import styles from './ObjectivesMenu.module.css'

/**
 * The mission readout in the top bar, and the objective list behind it.
 * Nothing marks an objective on the player's behalf — the cards say which
 * outcome completes or closes which objective, and the player records it here.
 */
const NEXT: Record<'open' | ObjectiveState, ObjectiveState | null> = {
  open: 'done',
  done: 'closed',
  closed: null,
}

const ICONS = {
  open: CircleIcon,
  done: CheckCircleIcon,
  closed: ProhibitIcon,
}

export function ObjectivesMenu({ className }: { className: string }) {
  const [open, setOpen] = useState(false)
  const missionId = useGameStore((s) => s.missionId)
  const objectives = useGameStore((s) => s.objectives)
  const objectivesTotal = useGameConfig((c) => c.objectivesTotal)
  const mission = missionId ? currentMission() : undefined
  const done = Object.values(objectives).filter((o) => o === 'done').length
  const menuId = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const firstItem = useRef<HTMLButtonElement>(null)

  // Close on click elsewhere
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  if (!mission) return <span className={className}>No mission chosen</span>

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role=menuitem]')]
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape') {
      setOpen(false)
      trigger.current?.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={root} className={styles.anchor}>
      <button
        ref={trigger}
        type="button"
        className={`${className} ${styles.trigger}`}
        title={mission.goal}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          setOpen(!open)
          if (!open && e.detail === 0) requestAnimationFrame(() => firstItem.current?.focus()) // detail 0 = keyboard
        }}
      >
        {mission.name} · {done}/{objectivesTotal}
        {/* The count reads as a bare fraction without it; the tab shows only the number */}
        <span className={styles.srOnly}> objectives</span>
      </button>

      {open && (
        <div id={menuId} role="menu" aria-label="Objectives" className={styles.menu} onKeyDown={onMenuKey}>
          <p className={styles.hint}>Click to cycle: open → done → closed</p>
          {mission.objectives.map((objective, i) => {
            // Objectives not in the record are still open
            const state: 'open' | ObjectiveState = objectives[objective.id] ?? 'open'
            const Icon = ICONS[state]
            return (
              <button
                key={objective.id}
                ref={i === 0 ? firstItem : undefined}
                type="button"
                role="menuitem"
                className={styles.item}
                data-state={state}
                onClick={() => setObjective(objective.id, NEXT[state])}
              >
                <Icon size={18} weight={state === 'open' ? 'regular' : 'fill'} aria-hidden />
                <span className={styles.text}>{objective.text}</span>
                <span className={styles.card}>{objective.card}</span>
                <span className={styles.srOnly}>{state}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
