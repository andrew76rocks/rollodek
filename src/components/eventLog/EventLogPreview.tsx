import { EVENT_TYPES } from '../../events/eventTypes.ts'
import { formatEventAgo, formatSeq } from '../../events/formatEventTime.ts'
import { useNow } from '../../hooks/useNow.ts'
import { useEventLog } from '../../store/eventLogStore.ts'
import styles from './EventLogPreview.module.css'

const PREVIEW_COUNT = 10

/** Hover popover under the log icon: the 10 most recent events, read-only. */
export function EventLogPreview({ id }: { id: string }) {
  const events = useEventLog((s) => s.events)
  const now = useNow(15_000)
  const recent = events.slice(-PREVIEW_COUNT).reverse()

  return (
    <div id={id} role="tooltip" className={styles.popover}>
      <div className={styles.header}>
        <span className={styles.title}>Recent Events</span>
        <span className={styles.hint}>Click for full log</span>
      </div>
      {recent.length === 0 ? (
        <p className={styles.empty}>No events yet — roll the dice to start the record.</p>
      ) : (
        <ol className={styles.list}>
          {recent.map((e) => {
            const { icon: TypeIcon, label } = EVENT_TYPES[e.type]
            return (
              <li key={e.seq} className={styles.row}>
                <span className={styles.seq}>{formatSeq(e.seq)}</span>
                <TypeIcon size={16} weight="fill" className={styles.icon} aria-label={label} />
                <span className={styles.message}>{e.message}</span>
                <span className={styles.ago}>{formatEventAgo(e.at, now)}</span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
