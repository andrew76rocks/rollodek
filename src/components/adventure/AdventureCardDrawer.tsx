import { DiceFiveIcon, HeartBreakIcon, SwordIcon } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useGameConfig } from '../../config/gameConfig.ts'
import { TIER_LABELS } from '../settings/settingsSchema.ts'
import { findAdventureCard, printedId, type AdventureCard, type ChallengeBlock } from '../../data/adventureDeck.ts'
import { getEncounter } from '../../data/encounters.ts'
import { canAttempt, recordCombat, startCheck, useCheckStore } from '../../store/checkStore.ts'
import { challengeKey, useGameStore } from '../../store/gameStore.ts'
import { useUiStore } from '../../store/uiStore.ts'
import { SideDrawer } from '../drawer/SideDrawer.tsx'
import styles from './AdventureCardDrawer.module.css'

/**
 * Adventure card reader: "Find Card" by ID (e.g. AD-2B, or (AD-1A)), and the
 * back of any card clicked on the table. Challenges on the current Scene's
 * cards can be attempted from here during Explore. The DC is never shown.
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
        {card ? <CardBack card={card} /> : <p className={styles.hint}>Type a card ID from the Adventure Deck, like AD-2B.</p>}
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

function CardBack({ card }: { card: AdventureCard }) {
  // Subscribe so actions re-evaluate as the session moves
  useGameStore((s) => s.phase)
  useGameStore((s) => s.revealed)
  const resolved = useGameStore((s) => s.resolved)
  useCheckStore((s) => s.check)

  return (
    <article className={styles.card} aria-label={`${printedId(card)} ${card.title}`}>
      <header className={styles.cardHead}>
        <span className={styles.cardId}>{printedId(card)}</span>
        <h3 className={styles.cardTitle}>{card.title}</h3>
        {card.milestone && <span className={styles.tag}>Milestone</span>}
        {card.final && <span className={styles.tag}>Final</span>}
      </header>
      {card.back.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <p key={i} className={styles.text}>
                {block.text}
              </p>
            )
          case 'pointer':
            return (
              <p key={i} className={styles.pointer}>
                Add{' '}
                <button type="button" className={styles.link} onClick={() => useUiStore.getState().viewCard(block.cardId)}>
                  {block.cardId}
                </button>
                {block.text ? `: ${block.text}` : ''}
              </p>
            )
          case 'branchRoll':
            return (
              <div key={i} className={styles.branch}>
                <p className={styles.blockLabel}>
                  <DiceFiveIcon size={16} weight="bold" aria-hidden /> Roll 2d6 (visible)
                </p>
                <p className={styles.text}>{block.prompt}</p>
                <ul>
                  {block.outcomes.map((o) => (
                    <li key={o.min}>
                      <strong>
                        {o.min}
                        {o.max !== o.min ? `–${o.max}` : ''}
                      </strong>
                      : {o.text}
                    </li>
                  ))}
                </ul>
              </div>
            )
          case 'challenge':
            return (
              <Challenge key={i} cardId={card.id} blockIndex={i} block={block} resolved={resolved.includes(challengeKey(card.id, i))} />
            )
        }
      })}
    </article>
  )
}

function Challenge({ cardId, blockIndex, block, resolved }: { cardId: string; blockIndex: number; block: ChallengeBlock; resolved: boolean }) {
  const paidCostTiers = useGameConfig((c) => c.dc.paidCostTiers)
  const encounter = block.combat ? getEncounter(block.combat.encounterId) : undefined
  const available = canAttempt(cardId, blockIndex)

  return (
    <section className={styles.challenge} aria-label="Challenge">
      <p className={styles.blockLabel}>
        {encounter ? (
          <>
            <SwordIcon size={16} weight="bold" aria-hidden /> Combat vs {encounter.name}
          </>
        ) : (
          <>Challenge: {block.stats?.join(' or ')}</>
        )}
        <span className={styles.tier}>{TIER_LABELS[block.tier]}</span>
        {/* The paid-cost flip is available on this tier */}
        {paidCostTiers.includes(block.tier) && (
          <HeartBreakIcon size={16} weight="fill" className={styles.wound} aria-label="Wound flip available" />
        )}
      </p>
      {encounter && (
        <p className={styles.encounter}>
          {encounter.text} HP {encounter.hp} · attacks with {encounter.attackStat}.
        </p>
      )}
      <p className={styles.outcome}>
        <strong>Success:</strong> {block.success.text}
      </p>
      <p className={styles.outcome}>
        <strong>Fail:</strong> {block.fail.text}
      </p>

      {resolved ? (
        <p className={styles.resolved}>Resolved</p>
      ) : encounter ? (
        available && (
          <div className={styles.actions}>
            {/* TODO(drew): combat damage per hit, escape cost, and whether a stun needs a check are open (rules.md §11) */}
            <p className={styles.note}>Combat rounds aren't built yet. Play it out at the table, then record how it ended:</p>
            <button type="button" className={styles.action} onClick={() => recordCombat(cardId, blockIndex, 'defeated')}>
              Defeated
            </button>
            <button type="button" className={styles.action} onClick={() => recordCombat(cardId, blockIndex, 'stunned')}>
              Stunned
            </button>
            <button type="button" className={styles.action} onClick={() => recordCombat(cardId, blockIndex, 'escaped')}>
              Escaped
            </button>
          </div>
        )
      ) : (
        available && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                startCheck(cardId, blockIndex)
                useUiStore.getState().setOpenDrawer(null)
              }}
            >
              Attempt check
            </button>
          </div>
        )
      )}
    </section>
  )
}
