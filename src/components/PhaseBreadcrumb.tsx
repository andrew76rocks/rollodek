import { CaretRightIcon } from '@phosphor-icons/react'
import { useId, useState } from 'react'
import { PHASE_LABELS, PHASES, type Phase } from '../store/gameStore.ts'
import styles from './PhaseBreadcrumb.module.css'

/**
 * The phase name in the top bar. Hovering it shows where the Scene is in its
 * four phases: "Advance › Setup › Explore › Conclude", with the current one
 * highlighted, the finished ones lavender and the ones still to come dimmed.
 */
export function PhaseBreadcrumb({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const current = PHASES.indexOf(phase)

  return (
    <span
      className={styles.anchor}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {PHASE_LABELS[phase]}
      {open && (
        <span id={id} role="tooltip" className={styles.popover}>
          {PHASES.map((p, i) => (
            <span key={p} className={styles.step}>
              {i > 0 && <CaretRightIcon size={12} weight="bold" className={styles.sep} aria-hidden />}
              <span data-state={i < current ? 'done' : i === current ? 'current' : 'upcoming'} aria-current={i === current ? 'step' : undefined}>
                {PHASE_LABELS[p]}
              </span>
            </span>
          ))}
        </span>
      )}
    </span>
  )
}
