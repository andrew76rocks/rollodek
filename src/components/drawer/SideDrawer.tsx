import { XIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, type ReactNode } from 'react'
import styles from './SideDrawer.module.css'

interface SideDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  /** Panel width in px (capped to the viewport) */
  width?: number
  /** Everything under the header; mount-only, so children can focus on open */
  children: ReactNode
}

/**
 * Right-side drawer shared by the event log and help: slides in over a scrim,
 * closes on Esc / X / scrim click. The trigger restores its own focus.
 */
export function SideDrawer({ open, onClose, title, width = 460, children }: SideDrawerProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'tween' as const, ease: [0.22, 1, 0.36, 1] as const, duration: 0.28 }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className={styles.scrim}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          />
          <motion.aside
            key="drawer"
            className={styles.drawer}
            style={{ width: `min(${width}px, 100dvw)` }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={transition}
          >
            <header className={styles.header}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              <button type="button" className={styles.close} aria-label={`Close ${title}`} onClick={onClose}>
                <XIcon size={22} weight="bold" />
              </button>
            </header>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
