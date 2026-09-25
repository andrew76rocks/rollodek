import { XIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, type CSSProperties } from 'react'
import { create } from 'zustand'
import { adventureAssets } from '../config/assets.ts'
import { getAdventureCard, printedId } from '../data/adventureDeck.ts'
import type { CardZone } from '../store/uiStore.ts'
import { AdventureCardBack } from './adventure/AdventureCardBack.tsx'
import { AnyCard } from './dnd/AnyCard.tsx'
import styles from './CardPreview.module.css'

/** Zoom for the preview, relative to the card's normal size */
const PREVIEW_SCALE = 1.5

/** A hero or tableau card by zone, or an Adventure card showing one face (a face-down card previews its front only) */
type PreviewedCard = { cardId: string; zone: CardZone } | { cardId: string; zone: 'adventure'; face: 'front' | 'back' }

const usePreviewStore = create<{ card: PreviewedCard | null }>(() => ({ card: null }))

/** Show a card enlarged in a modal (e.g. clicking a card in the Play Area) */
export function previewCard(card: PreviewedCard) {
  usePreviewStore.setState({ card })
}

const closePreview = () => usePreviewStore.setState({ card: null })

/**
 * Cards opt into previewing by carrying these data attributes on their root
 * element; `previewAt` finds one under a screen point.
 */
export const previewAttrs = (cardId: string, zone: CardZone | 'adventure', face?: 'front' | 'back') => ({
  'data-preview-card': cardId,
  'data-preview-zone': zone,
  'data-preview-face': face,
})

// Where the pointer last was, so Z can preview whatever it's over (no focus or Tab involved)
let pointer: { x: number; y: number } | null = null
if (typeof window !== 'undefined') {
  const track = (e: PointerEvent) => (pointer = { x: e.clientX, y: e.clientY })
  window.addEventListener('pointermove', track, { passive: true })
  window.addEventListener('pointerdown', track, { passive: true, capture: true })
}

/** Space / Z shortcut: close an open preview, or preview the card under the pointer (if any) */
export function togglePreviewUnderPointer() {
  if (usePreviewStore.getState().card) return closePreview()
  if (!pointer) return
  const el = document.elementFromPoint(pointer.x, pointer.y)?.closest<HTMLElement>('[data-preview-card]')
  if (!el) return
  const { previewCard: cardId, previewZone: zone, previewFace: face } = el.dataset
  if (!cardId || !zone) return
  previewCard(
    zone === 'adventure'
      ? { cardId, zone: 'adventure', face: face === 'back' ? 'back' : 'front' }
      : { cardId, zone: zone as CardZone },
  )
}

/**
 * A card at 150% over a dimmed table. Close with the × button, Esc, or a click
 * anywhere outside the card; focus goes back to whatever opened it.
 */
export function CardPreview() {
  const card = usePreviewStore((s) => s.card)
  const reduceMotion = useReducedMotion()
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!card) return
    opener.current = document.activeElement as HTMLElement | null
    closeButton.current?.focus()
    // Esc, Space or Z closes (Space/Z toggle; the table's shortcuts are paused while this is open)
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === 'Escape' || e.code === 'Space' || e.code === 'KeyZ') {
        e.preventDefault()
        closePreview()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener.current?.focus({ preventScroll: true })
    }
  }, [card])

  const t = reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className={styles.scrim}
          onClick={closePreview}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={t}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Card preview"
            className={styles.frame}
            style={{ '--preview-scale': PREVIEW_SCALE } as CSSProperties}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={t}
          >
            <div className={styles.zoom}>
              <PreviewFace card={card} />
            </div>
            <button ref={closeButton} type="button" className={styles.close} onClick={closePreview} aria-label="Close preview">
              <XIcon size={18} weight="bold" aria-hidden />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PreviewFace({ card }: { card: PreviewedCard }) {
  if (card.zone !== 'adventure') return <AnyCard cardId={card.cardId} zone={card.zone} />
  const adventure = getAdventureCard(card.cardId)
  if (card.face === 'back') return <AdventureCardBack card={adventure} />
  return (
    <div className={styles.adventureFront}>
      <img src={adventureAssets.cardFront} alt="" />
      <span className={styles.adventureId}>{printedId(adventure)}</span>
    </div>
  )
}
