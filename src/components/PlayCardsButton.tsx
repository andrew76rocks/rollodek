import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import styles from './PlayCardsButton.module.css'

interface PlayCardsButtonProps {
  count: number
  /** Button text; "Play Cards" by default, "Commit" during a check */
  label?: string
  /** Whether it can be pressed; defaults to "cards are staged" */
  ready?: boolean
  /** Screen-reader hint while not ready */
  disabledReason?: string
  /** Short visible note under the button (why it can't be pressed right now) */
  hint?: string
  onPlay: () => void
}

/** One soft ring grows out of the halo and fades, like a slow sonar ping */
const RIPPLE_SECONDS = 3

/**
 * "Play Cards" with a count badge. While cards are staged it pulses: the halo
 * behind it breathes gently and a faint ring ripples outward, signalling the
 * Play Area is armed. Disabled (nothing staged) the halo is hidden entirely.
 */
export function PlayCardsButton({ count, onPlay, label = 'Play Cards', ready: readyProp, disabledReason, hint }: PlayCardsButtonProps) {
  const reduceMotion = useReducedMotion()
  const ready = readyProp ?? count > 0
  const animate = ready && !reduceMotion

  return (
    <div className={styles.wrap} data-ready={ready || undefined}>
      {/* Halo: the Figma "Play Cards Button Shadow" shape, breathing while ready */}
      <motion.span
        className={styles.halo}
        aria-hidden
        initial={false}
        animate={
          !ready ? { scale: 0.92, opacity: 0 } : animate ? { scale: [1, 1.025, 1], opacity: [0.7, 1, 0.7] } : { scale: 1, opacity: 1 }
        }
        transition={animate ? { duration: RIPPLE_SECONDS, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      />
      {animate && (
        <motion.span
          className={styles.ripple}
          aria-hidden
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 1.15], opacity: [0.3, 0] }}
          transition={{ duration: RIPPLE_SECONDS, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      <button
        type="button"
        className={styles.button}
        disabled={!ready}
        onClick={onPlay}
        aria-label={ready ? `${label} (${count} card${count === 1 ? '' : 's'})` : `${label} (${disabledReason ?? 'no cards in the Play Area'})`}
      >
        {label}
        <AnimatePresence initial={false}>
          {ready && count > 0 && (
            // One badge while cards are staged (fades in/out as a whole)…
            <motion.span
              key="badge"
              className={styles.badge}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {/* …and only the number re-mounts on change, so it pops without a second badge appearing */}
              <motion.span
                key={count}
                initial={reduceMotion ? false : { scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 18 }}
              >
                {count}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
