import { motion, useReducedMotion } from 'framer-motion'
import { adventureAssets } from '../../config/assets.ts'
import { getAdventureCard, getScene, printedId, sceneRows } from '../../data/adventureDeck.ts'
import { useGameStore } from '../../store/gameStore.ts'
import { toggleCard } from '../../store/session.ts'
import { AdventureCardBack } from './AdventureCardBack.tsx'
import { PositionBadge } from './PositionBadge.tsx'
import { useDealingIds } from './SceneDeal.tsx'
import { useSceneClearing } from './SceneDiscard.tsx'
import { previewAttrs } from '../CardPreview.tsx'
import styles from './SceneCards.module.css'

/**
 * The current Scene's location cards (one Scene = one turn). Fronts are the
 * Adventure Deck illustration plus the card's ID (Figma 126:260); backs carry
 * the card's own content (Figma 126:267).
 *
 * Clicking a card turns it over, either way, any time. Play order, the
 * optional-card rule and when a Challenge may be attempted are all printed on
 * the cards and written up in Help — the table doesn't enforce them, and
 * resolving a Challenge happens away from the screen.
 *
 * TODO(drew): every card shares one front illustration until per-Scene art exists.
 */
export function SceneCards() {
  const sceneNumber = useGameStore((s) => s.scene)
  const revealed = useGameStore((s) => s.revealed)
  const missionId = useGameStore((s) => s.missionId)
  const reduceMotion = useReducedMotion()
  // While the finished Scene's cards fly to the Adventure Discard, only their copies show
  const clearing = useSceneClearing()
  // New Scene cards sliding in from the Adventure Deck: their slots wait, hidden
  const dealing = useDealingIds().split(',')
  const scene = getScene(sceneNumber)
  if (!scene || !missionId) return <div className={styles.scene} />

  const rows = sceneRows(scene)

  return (
    <div
      className={styles.scene}
      aria-label={`Scene ${scene.scene}: ${scene.title}`}
      data-rows={rows.length}
      style={clearing ? { visibility: 'hidden' } : undefined}
    >
      {rows.map((row, r) => (
        <div key={r} className={styles.row}>
          {row.map((id) => {
            const card = getAdventureCard(id)
            const isRevealed = revealed.includes(id)
            return (
              <div key={id} className={styles.slot} style={dealing.includes(id) ? { visibility: 'hidden' } : undefined}>
                <button
                  type="button"
                  className={styles.card}
                  onClick={() => toggleCard(id)}
                  aria-pressed={isRevealed}
                  {...previewAttrs(id, 'adventure', isRevealed ? 'back' : 'front')}
                  aria-label={
                    isRevealed
                      ? `${printedId(card)} ${card.title}: turn face down`
                      : `${printedId(card)}: face down, turn over`
                  }
                >
                  <motion.span
                    className={styles.flipper}
                    initial={false}
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.3, 0, 0.2, 1] }}
                  >
                    <span className={styles.front}>
                      <img className={styles.art} src={adventureAssets.cardFront} alt="" />
                      <PositionBadge card={card} />
                    </span>
                    {/* Always mounted: unmounting on flip-down blanks the face
                      * mid-rotation, while it's still turned towards the player.
                      * backface-visibility keeps it hidden until the card turns. */}
                    <span className={styles.back}>
                      <AdventureCardBack card={card} />
                    </span>
                  </motion.span>
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
