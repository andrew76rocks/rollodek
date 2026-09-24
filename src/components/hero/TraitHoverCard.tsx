import { createPortal } from 'react-dom'
import type { HeroDocSummary } from '../../content/heroContent.ts'
import styles from './TraitHoverCard.module.css'

interface TraitHoverCardProps {
  id: string
  summary: HeroDocSummary
  /** Viewport rect of the trigger icon; the card opens above it */
  anchor: DOMRect
}

/**
 * Card-face summary shown on hover. Portaled to <body> because the hero name
 * bar clips its contents (for its slide-in mask).
 */
export function TraitHoverCard({ id, summary, anchor }: TraitHoverCardProps) {
  const style = {
    left: anchor.left + anchor.width / 2,
    bottom: window.innerHeight - anchor.top + 14,
  }
  return createPortal(
    <div id={id} role="tooltip" className={styles.card} style={style}>
      <p className={styles.kicker}>{summary.kicker}</p>
      <p className={styles.title}>{summary.title}</p>
      {summary.subtitle && <p className={styles.subtitle}>{summary.subtitle}</p>}
      {summary.flavor && <blockquote className={styles.flavor}>{summary.flavor}</blockquote>}
      {summary.traits.length > 0 && (
        <dl className={styles.traits}>
          {summary.traits.map((t) => (
            <div key={t.label} className={styles.trait}>
              <dt>
                <span className={styles.traitLabel}>{t.label}</span> {t.name}
              </dt>
              {t.text && <dd>{t.text}</dd>}
            </div>
          ))}
        </dl>
      )}
      <p className={styles.hint}>Click for the full card</p>
    </div>,
    document.body,
  )
}
