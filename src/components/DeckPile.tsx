import type { ReactNode } from 'react'
import { uiAssets } from '../config/assets.ts'
import { useHeroDeckStore } from '../store/heroDeckStore.ts'
import { drawToHand } from './DrawFlight.tsx'
import styles from './DeckPile.module.css'

interface DeckPileProps {
  tone: 'adventure' | 'hero'
  /** Two-line label, e.g. ['Adventure', 'Deck'] */
  label: [string, string]
}

const ART = { adventure: uiAssets.adventureDeckArt, hero: uiAssets.heroDeckArt }

/**
 * Face-down draw pile, shown as a stack whose top card lifts off on hover.
 * The Hero Deck is clickable (draws into the hand); the Adventure Deck has the
 * hover but no click yet, until its draw is wired up.
 */
export function DeckPile({ tone, label }: DeckPileProps) {
  const face = (
    <>
      <img className={styles.art} src={ART[tone]} alt="" />
      <div className={styles.inner}>
        <span className={styles.label}>
          {label[0]}
          <br />
          {label[1]}
        </span>
        <img src={uiAssets.deckDivider} alt="" />
      </div>
    </>
  )

  if (tone === 'hero') return <HeroDeckButton face={face} />
  return (
    <div className={styles.stack} data-tone={tone} style={{ gridArea: 'adeck' }}>
      <DeckStack face={face} tone={tone} cardBeneath />
    </div>
  )
}

/** The top card, plus (optionally) the next card beneath it that shows once the top one lifts */
function DeckStack({ face, tone, cardBeneath }: { face: ReactNode; tone: DeckPileProps['tone']; cardBeneath: boolean }) {
  return (
    <>
      {cardBeneath && (
        <span className={`${styles.pile} ${styles.beneath}`} data-tone={tone} aria-hidden>
          {face}
        </span>
      )}
      <span className={`${styles.pile} ${styles.top}`} data-tone={tone}>
        {face}
      </span>
    </>
  )
}

function HeroDeckButton({ face }: { face: ReactNode }) {
  const deckCount = useHeroDeckStore((s) => s.deck.length)
  const discardCount = useHeroDeckStore((s) => s.discard.length)
  // An empty draw pile still draws if the discard can reshuffle into it
  const canDraw = deckCount + discardCount > 0
  // A second card shows underneath on hover only if one would actually be left behind
  const cardBeneath = deckCount > 1 || (deckCount === 0 && discardCount > 1)


  return (
    <button
      type="button"
      className={styles.stack}
      data-tone="hero"
      data-deck="hero"
      style={{ gridArea: 'hdeck' }}
      disabled={!canDraw}
      onClick={drawToHand}
      aria-label={
        deckCount > 0
          ? `Hero Deck: draw a card (${deckCount} left)`
          : canDraw
            ? 'Hero Deck is empty: reshuffle the discard and draw a card'
            : 'Hero Deck and discard are empty'
      }
    >
      <DeckStack face={face} tone="hero" cardBeneath={cardBeneath} />
    </button>
  )
}
