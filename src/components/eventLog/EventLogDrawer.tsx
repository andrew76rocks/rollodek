import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EVENT_TYPES, type GameEvent } from '../../events/eventTypes.ts'
import { formatEventTime, formatSeq } from '../../events/formatEventTime.ts'
import { useEventLog } from '../../store/eventLogStore.ts'
import { useUiStore } from '../../store/uiStore.ts'
import { SideDrawer } from '../drawer/SideDrawer.tsx'
import styles from './EventLogDrawer.module.css'

/** Full event log: searchable, newest first, in the shared side drawer. */
export function EventLogDrawer() {
  const open = useUiStore((s) => s.openDrawer === 'eventLog')
  const setOpenDrawer = useUiStore((s) => s.setOpenDrawer)
  const close = useCallback(() => setOpenDrawer(null), [setOpenDrawer])

  return (
    <SideDrawer open={open} onClose={close} title="Event Log">
      <EventLogContents />
    </SideDrawer>
  )
}

function EventLogContents() {
  const events = useEventLog((s) => s.events)
  const [query, setQuery] = useState('')
  const search = useRef<HTMLInputElement>(null)
  useEffect(() => search.current?.focus(), [])

  const newestFirst = useMemo(() => [...events].reverse(), [events])
  const shown = useMemo(() => newestFirst.filter((e) => matches(e, query)), [newestFirst, query])

  return (
    <>
      <div className={styles.searchRow}>
        <label className={styles.search}>
          <MagnifyingGlassIcon size={18} aria-hidden />
          <input
            ref={search}
            type="search"
            placeholder="Search events, types, or #number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search events"
          />
        </label>
        <p className={styles.count} aria-live="polite">
          {query ? `${shown.length} of ${events.length} events` : `${events.length} events`}
        </p>
      </div>

      <div className={styles.scroller}>
        {shown.length === 0 ? (
          <p className={styles.empty}>
            {events.length === 0 ? 'No events yet — roll the dice to start the record.' : 'No events match your search.'}
          </p>
        ) : (
          <ol className={styles.list}>
            {shown.map((e) => (
              <EventRow key={e.seq} event={e} />
            ))}
          </ol>
        )}
      </div>
    </>
  )
}

function EventRow({ event }: { event: GameEvent }) {
  const { icon: TypeIcon, label } = EVENT_TYPES[event.type]
  return (
    <li className={styles.row}>
      <span className={styles.seq}>{formatSeq(event.seq)}</span>
      <span className={styles.iconWrap}>
        <TypeIcon size={18} weight="fill" aria-hidden />
      </span>
      <div className={styles.body}>
        <p className={styles.message}>{event.message}</p>
        <p className={styles.meta}>
          <time dateTime={new Date(event.at).toISOString()}>{formatEventTime(event.at)}</time>
          <span aria-hidden> · </span>
          {label}
        </p>
      </div>
    </li>
  )
}

/** Case-insensitive match on message, type label, or sequence ("12", "#012"). */
function matches(e: GameEvent, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const seqQuery = q.replace(/^#/, '')
  if (/^\d+$/.test(seqQuery) && e.seq === Number(seqQuery)) return true
  return (
    e.message.toLowerCase().includes(q) ||
    EVENT_TYPES[e.type].label.toLowerCase().includes(q) ||
    formatSeq(e.seq).includes(q)
  )
}
