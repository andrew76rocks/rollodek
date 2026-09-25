import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { findAdventureCard } from '../../data/adventureDeck.ts'
import { useUiStore } from '../../store/uiStore.ts'
import { SideDrawer } from '../drawer/SideDrawer.tsx'
import { AdventureCardBack } from './AdventureCardBack.tsx'
import styles from './AdventureCardDrawer.module.css'

/**
 * Find Card: look up any Adventure Deck card by ID (e.g. AD-2B, or (AD-1A)),
 * including cards not in the current Scene. It shows the same card back the
 * table shows — reading a card the player has flipped happens on the card
 * itself, and resolving its Challenge happens from the card on the table.
 */
export function AdventureCardDrawer() {
  const open = useUiStore((s) => s.openDrawer === 'adventureCard')
  const viewedCard = useUiStore((s) => s.viewedCard)
  const close = useCallback(() => useUiStore.getState().setOpenDrawer(null), [])
  const card = viewedCard ? findAdventureCard(viewedCard) : undefined

  return (
    <SideDrawer open={open} onClose={close} title="Find Card" width={520}>
      <div className={styles.body}>
        <FindForm autoFocus={!card} />
        {card ? (
          <div className={styles.cardSlot}>
            <AdventureCardBack card={card} />
          </div>
        ) : (
          <p className={styles.hint}>Type a card ID from the Adventure Deck, like AD-2B.</p>
        )}
      </div>
    </SideDrawer>
  )
}

function FindForm({ autoFocus }: { autoFocus: boolean }) {
  const [query, setQuery] = useState('')
  const [missing, setMissing] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (autoFocus) input.current?.focus()
  }, [autoFocus])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const card = findAdventureCard(query)
    setMissing(!card)
    if (card) useUiStore.getState().viewCard(card.id)
  }

  return (
    <form className={styles.find} onSubmit={submit} role="search">
      <input
        ref={input}
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Card ID, e.g. AD-2B"
        aria-label="Card ID"
        aria-invalid={missing || undefined}
      />
      <button type="submit" className={styles.findButton}>
        Find
      </button>
      {missing && <p className={styles.missing}>No card with that ID.</p>}
    </form>
  )
}
