import { useEffect, useState } from 'react'

/** Current time that re-renders every `intervalMs` while `active` (for "5m ago" labels). */
export function useNow(intervalMs: number, active = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, active])
  return now
}
