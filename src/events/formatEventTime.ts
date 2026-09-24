const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })
const dayFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

const startOfDay = (ms: number) => new Date(ms).setHours(0, 0, 0, 0)
const DAY = 86_400_000

/** "Today, 10:42:15 AM" · "Yesterday, 4:03:09 PM" · "Sep 21, 4:03:09 PM" */
export function formatEventTime(at: number, now = Date.now()) {
  const days = Math.round((startOfDay(now) - startOfDay(at)) / DAY)
  const day = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : dayFmt.format(at)
  return `${day}, ${timeFmt.format(at)}`
}

/** "just now" · "5m ago" · "3h ago" · then falls back to the date */
export function formatEventAgo(at: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - at) / 1000))
  if (s < 45) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return dayFmt.format(at)
}

/** Zero-padded sequence label, e.g. #007 */
export const formatSeq = (seq: number) => `#${String(seq).padStart(3, '0')}`
