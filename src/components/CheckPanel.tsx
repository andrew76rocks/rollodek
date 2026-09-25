import { useGameConfig } from '../config/gameConfig.ts'
import { getAdventureCard, printedId } from '../data/adventureDeck.ts'
import { canPayCost } from '../rules/check.ts'
import { cancelCheck, chooseCheckStat, finishCheck, type ActiveCheck } from '../store/checkStore.ts'
import { TIER_LABELS } from './settings/settingsSchema.ts'
import styles from './CheckPanel.module.css'

const RESULT_LABELS = {
  remarkable: 'Remarkable success (snake eyes)',
  success: 'Success',
  fail: 'Fail',
  complication: 'Harsh complication (boxcars)',
}

/** Left side of the Play Area during a check: which card, stat (pick one if two), and tier. Never the DC. */
export function CheckHeader({ check }: { check: ActiveCheck }) {
  const card = getAdventureCard(check.cardId)
  return (
    <div className={styles.header}>
      <span className={styles.kicker}>
        Check · {printedId(card)} {card.title}
      </span>
      <span className={styles.row}>
        {check.stats.map((stat) => (
          <button
            key={stat}
            type="button"
            className={styles.stat}
            aria-pressed={check.stat === stat}
            disabled={check.step !== 'committing' || check.stats.length === 1}
            onClick={() => chooseCheckStat(stat)}
          >
            {stat}
          </button>
        ))}
        <span className={styles.tier}>{TIER_LABELS[check.tier]}</span>
      </span>
      {check.step === 'committing' && (
        <button type="button" className={styles.cancel} onClick={cancelCheck}>
          Cancel check
        </button>
      )}
    </div>
  )
}

/** The middle of the Play Area during a check: what to do, the roll, and the outcome */
export function CheckStatus({ check }: { check: ActiveCheck }) {
  const config = useGameConfig((c) => c)

  if (check.step === 'committing') {
    return (
      <p className={styles.prompt}>
        Drag cards here to commit them, or commit none (Base Stat alone). Then press Commit to roll.
        {/* TODO(drew): committing tableau cards (they'd tap) needs their check values or abilities; not wired yet */}
      </p>
    )
  }
  if (check.step === 'rolling') return <p className={styles.prompt}>Rolling 2d6 for the hidden DC…</p>

  const flip = check.result ? canPayCost(check.result, check.tier, config) : false
  const won = check.result === 'success' || check.result === 'remarkable'
  return (
    <div className={styles.result} role="status">
      <p className={styles.outcome} data-won={won || undefined}>
        {check.result && RESULT_LABELS[check.result]}
      </p>
      <p className={styles.detail}>
        Your total: {check.total} ({check.stat})
        {/* Playtest only: the DC is otherwise never shown */}
        {config.debugMode && ` · DC ${check.dc} (rolled ${check.raw})`}
      </p>
      <div className={styles.actions}>
        {flip && (
          <button type="button" className={styles.primary} onClick={() => finishCheck(true)}>
            Take 1 wound: success, but…
          </button>
        )}
        <button type="button" className={flip ? styles.secondary : styles.primary} onClick={() => finishCheck(false)}>
          {won ? 'Continue' : flip ? 'Accept the fail' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
