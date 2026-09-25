import { SwordIcon } from '@phosphor-icons/react'
import { cardAssets } from '../../config/assets.ts'
import type { AdventureCard, CardBlock, ChallengeBlock } from '../../data/adventureDeck.ts'
import { printedId } from '../../data/adventureDeck.ts'
import { getEncounter } from '../../data/encounters.ts'
import { TIER_LABELS } from '../settings/settingsSchema.ts'
import styles from './AdventureCardBack.module.css'

/**
 * Figma node 126:267 "Adventure Card Back": the card's own face, not a
 * summary of it. Everything a player needs to resolve the card is printed
 * here — type line, title, description, and each Challenge's stats, tier and
 * outcomes. The DC is never part of it (docs/rules.md §4).
 *
 * Rendered at the card's own size on the table and in the Find Card drawer,
 * so there is one card back, not two.
 */

/** The type line's second half: what kind of card this is */
function typeLabel(card: AdventureCard): string {
  const challenge = card.back.find((b): b is ChallengeBlock => b.type === 'challenge')
  const kind = !challenge ? 'Story' : challenge.combat ? 'Combat' : 'Challenge'
  const tags = [card.milestone && 'Milestone', card.final && 'Final'].filter(Boolean)
  return [kind, ...tags].join(' · ')
}

export function AdventureCardBack({ card }: { card: AdventureCard }) {
  // Figma puts the card's opening text in the header; anything after the first
  // Challenge (AD-3B's closing line) keeps its authored place further down.
  const firstBlock = card.back.findIndex((b) => b.type !== 'text')
  const leadEnd = firstBlock === -1 ? card.back.length : firstBlock
  const lead = card.back.slice(0, leadEnd) as { type: 'text'; text: string }[]
  const rest = card.back.slice(leadEnd)

  return (
    <div className={styles.back} data-story={rest.length === 0 || undefined}>
      <div className={styles.head}>
        <p className={styles.type}>
          {printedId(card)}: {typeLabel(card)}
        </p>
        <div className={styles.titleRow}>
          <p className={styles.title}>{card.title}</p>
        </div>
        {lead.map((block, i) => (
          <p key={i} className={styles.desc}>
            {block.text}
          </p>
        ))}
      </div>
      {rest.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: CardBlock }) {
  switch (block.type) {
    case 'text':
      return <p className={styles.desc}>{block.text}</p>
    case 'pointer':
      return (
        <p className={styles.desc}>
          Add {block.cardId}
          {block.text ? `: ${block.text}` : ''}
        </p>
      )
    case 'branchRoll':
      return (
        <div className={styles.panel}>
          <p className={styles.outcomeText}>{block.prompt}</p>
          {block.outcomes.map((o) => (
            <p key={o.min} className={styles.outcomeText}>
              <strong>
                {o.min}
                {o.max !== o.min ? `–${o.max}` : ''}
              </strong>
              : {o.text}
            </p>
          ))}
        </div>
      )
    case 'challenge':
      return <Challenge block={block} />
  }
}

/** The parchment outcomes panel, with the stat / tier hexes straddling its top edge */
function Challenge({ block }: { block: ChallengeBlock }) {
  const encounter = block.combat ? getEncounter(block.combat.encounterId) : undefined

  return (
    <div className={styles.panel}>
      <div className={styles.hexRow}>
        {block.stats && (
          <span className={styles.stats}>
            {block.stats.map((stat, i) => (
              <span key={stat} className={styles.stats}>
                {i > 0 && <span className={styles.slash}>/</span>}
                <span className={styles.hex}>
                  <img src={cardAssets.statHex} alt="" />
                  <span>{stat}</span>
                </span>
              </span>
            ))}
          </span>
        )}
        <span className={styles.tier}>{TIER_LABELS[block.tier]}</span>
      </div>
      {encounter && (
        <p className={styles.enemy}>
          <SwordIcon size={13} weight="bold" aria-hidden /> {encounter.name} · HP {encounter.hp} · attacks {encounter.attackStat}
        </p>
      )}
      <div className={styles.row}>
        <img className={styles.icon} src={cardAssets.outcomeSuccess} alt="Success" />
        <p className={styles.outcomeText}>{block.success.text}</p>
      </div>
      <div className={styles.row}>
        <img className={styles.icon} src={cardAssets.outcomeFail} alt="Fail" />
        <p className={styles.outcomeText}>{block.fail.text}</p>
      </div>
    </div>
  )
}
