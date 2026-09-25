import { XIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { getAdventureCard, printedId } from '../data/adventureDeck.ts'
import { getHeroCard } from '../data/heroCard.ts'
import { useGameStore } from '../store/gameStore.ts'
import { useHeroDeckStore } from '../store/heroDeckStore.ts'
import { AdventureFace } from './adventure/AdventureFace.tsx'
import { AnyCard } from './dnd/AnyCard.tsx'
import styles from './DiscardPreview.module.css'

export type DiscardTone = 'adventure' | 'hero'

const useDiscardPreviewStore = create<{ tone: DiscardTone | null }>(() => ({ tone: null }))

/** Open the discard pile's contents as a grid (the eye button on the pile) */
export function openDiscardPreview(tone: DiscardTone) {
  useDiscardPreviewStore.setState({ tone })
}

const close = () => useDiscardPreviewStore.setState({ tone: null })

const TITLES: Record<DiscardTone, string> = { adventure: 'Adventure Discard', hero: 'Hero Discard' }

/**
 * Everything sitting in a discard pile, laid out as a scrollable grid over the
 * table. Read-only: it's for checking what has already been spent or resolved.
 *
 * Cards keep the pile's own order (oldest first). Adventure cards show their
 * back, since every front carries the same illustration — the back is what
 * tells one location from another.
 */
export function DiscardPreview() {
  const tone = useDiscardPreviewStore((s) => s.tone)
  const heroDiscard = useHeroDeckStore((s) => s.discard)
  const adventureDiscard = useGameStore((s) => s.adventureDiscard)
  const reduceMotion = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!tone) return
    opener.current = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.repeat) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener.current?.focus({ preventScroll: true })
    }
  }, [tone])

  const cards = tone === 'hero' ? heroDiscard : tone === 'adventure' ? adventureDiscard : []
  const t = reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <AnimatePresence>
      {tone && (
        <motion.div className={styles.scrim} onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${TITLES[tone]}: ${cards.length} card${cards.length === 1 ? '' : 's'}`}
            ref={panel}
            tabIndex={-1}
            className={styles.panel}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={t}
          >
            <header className={styles.head}>
              <h2 className={styles.title}>{TITLES[tone]}</h2>
              <span className={styles.count}>
                {cards.length} card{cards.length === 1 ? '' : 's'}
              </span>
              <button type="button" className={styles.close} onClick={close} aria-label="Close">
                <XIcon size={20} weight="bold" aria-hidden />
              </button>
            </header>

            {cards.length === 0 ? (
              <p className={styles.empty}>Nothing in this pile yet.</p>
            ) : (
              <ul className={styles.grid}>
                {cards.map((cardId, i) => (
                  <li key={`${cardId}-${i}`} className={styles.cell} aria-label={cardLabel(tone, cardId)}>
                    <div className={styles.scale}>
                      {tone === 'hero' ? <AnyCard cardId={cardId} zone="hand" /> : <AdventureFace cardId={cardId} face="back" />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** The scaled-down card art is decorative here; name each card for screen readers */
function cardLabel(tone: DiscardTone, cardId: string): string {
  if (tone === 'hero') return getHeroCard(cardId).name
  const card = getAdventureCard(cardId)
  return `${printedId(card)} ${card.title}`
}
