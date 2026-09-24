import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { getAdventureCard, getScene, printedId } from '../../data/adventureDeck.ts'
import { challengeKey, useGameStore } from '../../store/gameStore.ts'
import { revealCard } from '../../store/session.ts'
import { useUiStore } from '../../store/uiStore.ts'
import { panoramaUrl } from './panorama.ts'
import styles from './SceneCards.module.css'

/**
 * The current Scene's location cards (one Scene = one turn), laid out at
 * Advance art side up. Fronts show only the art and the ID; each card is one
 * slice of a shared panorama. In Explore, clicking a card flips it and opens
 * its back in the card drawer.
 *
 * TODO(drew): placeholder panorama (generated SVG) until Scene art exists.
 */
export function SceneCards() {
  const sceneNumber = useGameStore((s) => s.scene)
  const phase = useGameStore((s) => s.phase)
  const revealed = useGameStore((s) => s.revealed)
  const resolved = useGameStore((s) => s.resolved)
  const missionId = useGameStore((s) => s.missionId)
  const reduceMotion = useReducedMotion()
  const scene = getScene(sceneNumber)
  if (!scene || !missionId) return <div className={styles.scene} />

  const count = scene.cards.length
  const open = (cardId: string, isRevealed: boolean) => {
    if (!isRevealed) {
      if (phase !== 'explore') return
      revealCard(cardId)
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
        const challenges = card.back.flatMap((b, bi) => (b.type === 'challenge' ? [bi] : []))
        const done = challenges.length > 0 && challenges.every((bi) => resolved.includes(challengeKey(id, bi)))
        const canFlip = isRevealed || phase === 'explore'
        const slice = { '--slice-count': count, '--slice-index': i } as CSSProperties
        return (
          <button
            key={id}
            type="button"
            className={styles.card}
            onClick={() => open(id, isRevealed)}
            aria-disabled={!canFlip || undefined}
            aria-label={isRevealed ? `${printedId(card)} ${card.title}: read card` : `${printedId(card)}: face down${canFlip ? ', flip' : ' (flip in Explore)'}`}
            title={canFlip ? undefined : 'Flip location cards in the Explore phase'}
          >
            <motion.span
              className={styles.flipper}
              initial={false}
              animate={{ rotateY: isRevealed ? 180 : 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.3, 0, 0.2, 1] }}
            >
              <span className={styles.front} style={slice}>
                <span className={styles.id}>{printedId(card)}</span>
                {/* Outside Explore, say why clicking does nothing (shown on hover) */}
                {!canFlip && <span className={styles.lockedNote}>Flip in the Explore phase</span>}
              </span>
              <span className={styles.back}>
                <span className={styles.backId}>{printedId(card)}</span>
                <span className={styles.backTitle}>{card.title}</span>
                <span className={styles.backHint}>{done ? 'Resolved' : challenges.length ? 'Read card' : 'Story'}</span>
              </span>
            </motion.span>
          </button>
        )
      })}
    </div>
  )
}
