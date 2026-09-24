import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Centered confirmation for destructive actions. Cancel is focused first; Esc / scrim cancel. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const bodyId = useId()
  const cancel = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  const t = reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.scrim}
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={t}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            className={styles.dialog}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={t}
          >
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <div id={bodyId} className={styles.body}>
              {children}
            </div>
            <div className={styles.actions}>
              <button ref={cancel} type="button" className={styles.cancel} onClick={onCancel}>
                {cancelLabel}
              </button>
              <button type="button" className={styles.confirm} onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
