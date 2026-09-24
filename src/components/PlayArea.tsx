import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { uiAssets } from '../config/assets.ts'
import { useGameConfig } from '../config/gameConfig.ts'
import { playStagedCards } from '../store/cardMoves.ts'
import { commitAndRoll, useCheckStore } from '../store/checkStore.ts'
import { CheckHeader, CheckStatus } from './CheckPanel.tsx'
import { usePlayAreaStore } from '../store/playAreaStore.ts'
import { AnyCard } from './dnd/AnyCard.tsx'
import { PlayFlight, type Flight } from './PlayFlight.tsx'
import { PlayCardsButton } from './PlayCardsButton.tsx'
import { DraggableCard } from './dnd/DraggableCard.tsx'
import { PLAY_AREA_DROP_ID, type CardDragData } from './dnd/dragTypes.ts'
import styles from './PlayArea.module.css'

let playCardsShortcut: (() => void) | null = null

/** Enter shortcut: commit to the active check, or (debugMode) play whatever is staged */
export function playStagedFromShortcut() {
  playCardsShortcut?.()
}

/** Figma 62:3626: played cards sit 181px apart, compressing only if they'd run out of room. */
const CARD_SPACING = 181
const TILTED_CARD_BOX = 293.73 // a 250px card rotated 11.18° fits in this square

/**
 * Staging strip where committed cards sit before resolving. Cards dragged here
 * from the hand or tableau drop in tilted, showing only their tops; drag one
 * back down to return it.
 */
export function PlayArea() {
  const staged = usePlayAreaStore((s) => s.staged)
  const { setNodeRef, isOver } = useDroppable({ id: PLAY_AREA_DROP_ID })
  const { active } = useDndContext()
  const from = (active?.data.current as CardDragData | undefined)?.from
  // Only hand cards can be played here; tableau cards are tapped instead
  const receiving = from === 'hand'

  // Keep the fan between the label and the Play Cards button
  const row = useRef<HTMLDivElement>(null)
  const [spacing, setSpacing] = useState(CARD_SPACING)
  useLayoutEffect(() => {
    const el = row.current
    if (!el || staged.length < 2) return
    const fit = () => setSpacing(Math.min(CARD_SPACING, (el.clientWidth - TILTED_CARD_BOX) / (staged.length - 1)))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [staged.length])

  // Play Cards: the staged cards fly to the Hero Discard first, then the move is committed
  const reduceMotion = useReducedMotion()
  const [flights, setFlights] = useState<Flight[] | null>(null)
  const play = () => {
    const target = document.querySelector('[data-discard="hero"]')?.getBoundingClientRect()
    const cards = row.current?.querySelectorAll<HTMLElement>('[data-staged-card]')
    if (reduceMotion || !target || !cards) return playStagedCards()
    const to = { x: target.x + target.width / 2, y: target.y + target.height / 2 }
    setFlights(
      staged.map(({ cardId, from: zone }, i) => {
        const r = cards[i].getBoundingClientRect() // rotated about its center, so the box center is the card center
        return { cardId, zone, from: { x: r.x + r.width / 2, y: r.y + r.height / 2 }, to }
      }),
    )
  }
  // During a check the button commits: zero or more hand cards, then the roll.
  // Outside a check, playing cards is a debugMode sandbox tool (rules.md §4: cards are played into checks).
  const check = useCheckStore((s) => s.check)
  const debugMode = useGameConfig((c) => c.debugMode)
  const committing = check?.step === 'committing'
  const commit = () => {
    commitAndRoll(staged.filter((c) => c.from === 'hand').map((c) => c.cardId))
    if (staged.length) play()
  }
  const buttonReady = !flights && (committing || (!check && debugMode && staged.length > 0))
  const onButton = committing ? commit : play

  // The Enter shortcut does what the button does (ignored while a play is in flight)
  useEffect(() => {
    playCardsShortcut = () => {
      if (buttonReady) onButton()
    }
    return () => {
      playCardsShortcut = null
    }
  })

  const land = () => {
    playStagedCards()
    setFlights(null)
  }

  return (
    <section
      ref={setNodeRef}
      className={styles.area}
      data-drop-ready={receiving || undefined}
      data-drop-over={(receiving && isOver) || undefined}
    >
      {check ? <CheckHeader check={check} /> : <h2 className={styles.label}>Play Area</h2>}
      {check && check.step !== 'committing' && (
        <div className={styles.checkStatus}>
          <CheckStatus check={check} />
        </div>
      )}
      {committing && staged.length === 0 && (
        <div className={styles.checkStatus}>
          <CheckStatus check={check} />
        </div>
      )}

      <div ref={row} className={styles.staged} data-playing={flights ? true : undefined} style={{ '--staged-overlap': `${TILTED_CARD_BOX - spacing}px` } as CSSProperties}>
        {staged.map(({ cardId, from: zone }) => (
          <DraggableCard key={cardId} cardId={cardId} from="play" className={styles.stagedSlot}>
            <div className={styles.tilt} data-staged-card>
              <AnyCard cardId={cardId} zone={zone} />
              {/* Figma "Card Highlight Bar": shading where the card tucks into the strip */}
              <span className={styles.highlightBar}>
                <img src={uiAssets.cardHighlightBar} alt="" />
              </span>
            </div>
          </DraggableCard>
        ))}
      </div>

      <PlayCardsButton
        count={flights ? 0 : staged.length}
        onPlay={onButton}
        label={check ? 'Commit' : 'Play Cards'}
        ready={buttonReady}
        disabledReason={check ? 'rolling' : debugMode ? 'no cards in the Play Area' : 'cards are played into a check'}
      />
      {flights && <PlayFlight flights={flights} onDone={land} />}
    </section>
  )
}
