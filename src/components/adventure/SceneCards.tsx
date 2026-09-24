import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { getAdventureCard, getScene, printedId } from '../../data/adventureDeck.ts'
import { useGameStore } from '../../store/gameStore.ts'
import { useCheckStore } from '../../store/checkStore.ts'
import { canFlip, cardComplete, currentCardId, returnToCard, revealCard } from '../../store/session.ts'
import { useUiStore } from '../../store/uiStore.ts'
import { panoramaUrl } from './panorama.ts'
import styles from './SceneCards.module.css'

/**
 * The current Scene's location cards (one Scene = one turn), laid out at
 * Advance art side up. Fronts show only the art and the ID; each card is one
 * slice of a shared panorama. In Explore, cards are resolved in card-ID order:
 * only the current card flips (opening its back in the card drawer). When an
 * optional card comes up, flipping the next card instead skips it, and it
 * turns back face down if it had been flipped. A skipped optional card can be
 * revisited any time during that Scene's Explore.
 *
 * TODO(drew): placeholder panorama (generated SVG) until Scene art exists.
 */
/** current: where you are · done: complete · skipped: optional, passed · open: clickable (the card after an optional one) · locked: later in order */
type CardState = 'current' | 'done' | 'skipped' | 'open' | 'locked'

export function SceneCards() {
  const sceneNumber = useGameStore((s) => s.scene)
  const phase = useGameStore((s) => s.phase)
  const revealed = useGameStore((s) => s.revealed)
  const skipped = useGameStore((s) => s.skipped)
  useGameStore((s) => s.resolved) // completion depends on it
  const missionId = useGameStore((s) => s.missionId)
  const reduceMotion = useReducedMotion()
  const checkActive = useCheckStore((s) => Boolean(s.check))
  const scene = getScene(sceneNumber)
  if (!scene || !missionId) return <div className={styles.scene} />

  const count = scene.cards.length
  const current = currentCardId(sceneNumber)
  const open = (cardId: string) => {
    if (!revealed.includes(cardId)) {
      // No flipping mid-check: finish the check in progress first
      if (checkActive || !canFlip(cardId)) return
      revealCard(cardId)
    } else if (!checkActive) {
      returnToCard(cardId)
    }
    useUiStore.getState().viewCard(cardId)
    useUiStore.getState().setOpenDrawer('adventureCard')
  }

  return (
    <div
      className={styles.scene}
      aria-label={`Scene ${scene.scene}: ${scene.title}`}
      style={{ '--panorama': panoramaUrl(scene.scene) } as CSSProperties}
    >
      {scene.cards.map((id, i) => {
        const card = getAdventureCard(id)
        const isRevealed = revealed.includes(id)
        const isSkipped = skipped.includes(id)
        const done = cardComplete(id)
        const flippable = canFlip(id)
        const hasChallenge = card.back.some((b) => b.type === 'challenge')
        const explore = phase === 'explore'
        /**
         * One visual state per card. Only the current card (by play order) is
         * marked, face up or face down; a card you merely *can* click (a skipped
         * optional, or the card after an optional one) never gets the marker.
         */
        const state: CardState =
          explore && id === current
            ? 'current'
            : done
              ? 'done'
              : isSkipped
                ? 'skipped'
                : flippable
                  ? 'open'
                  : 'locked'
        // Why a face-down card won't flip yet (shown on hover)
        const lockedNote = !explore
          ? 'Flip in the Explore phase'
          : current
            ? `Finish ${printedId(getAdventureCard(current))} first`
            : undefined
        const slice = { '--slice-count': count, '--slice-index': i } as CSSProperties
        return (
          <div key={id} className={styles.slot} data-state={state}>
            {state === 'current' && (
              <span className={styles.marker}>{isRevealed ? 'In progress' : 'Up next'}</span>
            )}
            {state === 'skipped' && explore && <span className={styles.revisit}>Revisit</span>}
            <button
              type="button"
              className={styles.card}
              onClick={() => open(id)}
              aria-disabled={(!isRevealed && !flippable) || undefined}
              aria-label={
                isRevealed
                  ? `${printedId(card)} ${card.title}: read card`
                  : `${printedId(card)}: face down${
                      state === 'current' ? ', up next' : state === 'skipped' ? ', skipped (flip to revisit)' : flippable ? ', flip' : lockedNote ? ` (${lockedNote})` : ''
                    }`
              }
            >
              <motion.span
                className={styles.flipper}
                initial={false}
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.3, 0, 0.2, 1] }}
              >
                <span className={styles.front} style={slice}>
                  <span className={styles.id}>{printedId(card)}</span>
                  {state === 'locked' && lockedNote && <span className={styles.lockedNote}>{lockedNote}</span>}
                </span>
                <span className={styles.back}>
                  <span className={styles.backId}>{printedId(card)}</span>
                  <span className={styles.backTitle}>{card.title}</span>
                  <span className={styles.backHint}>{done ? (hasChallenge ? '✓ Resolved' : '✓ Read') : 'Read card'}</span>
                </span>
              </motion.span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
