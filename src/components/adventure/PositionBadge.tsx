import { cardPosition, printedId, type AdventureCard } from '../../data/adventureDeck.ts'
import styles from './PositionBadge.module.css'

const DOT = 6.5 // dot diameter
const STEP = 9 // dot pitch, both ways

/**
 * Figma "Card Position Badge": the card's ID plus a tiny map of its Scene's
 * layout (one dot per card, rows as laid out on the table) with this card's
 * dot filled, so a player can put the Scene back together from the cards.
 */
export function PositionBadge({ card }: { card: AdventureCard }) {
  const position = cardPosition(card.id)
  return (
    <span className={styles.badge}>
      {printedId(card)}
      {position && <LayoutDots {...position} />}
    </span>
  )
}

function LayoutDots({ rows, row, col }: { rows: number[]; row: number; col: number }) {
  const widest = Math.max(...rows)
  const width = (widest - 1) * STEP + DOT
  const height = (rows.length - 1) * STEP + DOT
  const place = rows.length === 1 ? 'in a single row' : `in the ${row === 0 ? 'top' : 'bottom'} row`
  return (
    <svg
      className={styles.dots}
      width={width + 1}
      height={height + 1}
      viewBox={`-0.5 -0.5 ${width + 1} ${height + 1}`}
      role="img"
      aria-label={`Position ${col + 1} of ${rows[row]} ${place}`}
    >
      {rows.flatMap((count, r) => {
        const offset = ((widest - count) * STEP) / 2 // each row centered
        return Array.from({ length: count }, (_, c) => {
          const filled = r === row && c === col
          return (
            <circle
              key={`${r}-${c}`}
              cx={offset + c * STEP + DOT / 2}
              cy={r * STEP + DOT / 2}
              r={filled ? DOT / 2 : DOT / 2 - 0.6}
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.2}
            />
          )
        })
      })}
    </svg>
  )
}
