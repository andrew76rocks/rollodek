import { RecycleIcon } from '@phosphor-icons/react'
import { useGameConfig } from '../config/gameConfig.ts'
import { shuffleDiscardIntoDeck } from '../store/cardMoves.ts'
import { startShuffleFlight } from './ShuffleFlight.tsx'
import styles from './DiscardPile.module.css'

interface DiscardPileProps {
  tone: 'adventure' | 'hero'
  count: number
}

/** Reshuffle the discard into the Hero Deck, with ghost cards arcing across to show it happening */
export function shuffleWithFlight() {
  const discard = document.querySelector('[data-discard="hero"]')?.getBoundingClientRect()
  const deck = document.querySelector('[data-deck="hero"]')?.getBoundingClientRect()
  const moved = shuffleDiscardIntoDeck()
  if (!moved || !discard || !deck || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const center = (r: DOMRect) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 })
  startShuffleFlight(moved, center(discard), center(deck))
}

export function DiscardPile({ tone, count }: DiscardPileProps) {
  // Reshuffling at will is a debugMode sandbox tool; in play the discard only
  // cycles back in when the draw pile runs out (docs/rules.md §3)
  const debugMode = useGameConfig((c) => c.debugMode)
  return (
    <div className={styles.pile} data-tone={tone} data-discard={tone} style={{ gridArea: tone === 'adventure' ? 'adiscard' : 'hdiscard' }}>
      {/* Figma shows the reshuffle icon only on the hero discard (adventure's is hidden) */}
      {tone === 'hero' && !debugMode && (
        <span className={styles.shuffle} title="Reshuffles into the Hero Deck when the draw pile runs out">
          <RecycleIcon size={32} aria-hidden />
        </span>
      )}
      {tone === 'hero' && debugMode && (
        <button
          type="button"
          className={styles.shuffle}
          disabled={count === 0}
          onClick={shuffleWithFlight}
          aria-label={count === 0 ? 'Shuffle into Hero Deck (discard is empty)' : `Shuffle ${count} discarded card${count === 1 ? '' : 's'} into the Hero Deck`}
          title="Shuffle into Hero Deck"
        >
          <RecycleIcon size={32} aria-hidden />
        </button>
      )}
      <div className={styles.labelGroup}>
        <span className={styles.label}>{tone === 'adventure' ? 'Adventure Discard' : 'Hero Discard'}</span>
        <span className={styles.count}>{count}</span>
      </div>
    </div>
  )
}
