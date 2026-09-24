import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameEvent, GameEventType } from '../events/eventTypes.ts'

/** Oldest events are dropped past this so localStorage stays small. */
const MAX_STORED_EVENTS = 500

interface EventLogState {
  /** Oldest first (append order); the UI reverses for display */
  events: GameEvent[]
  lastSeq: number
  log: (type: GameEventType, message: string, data?: Record<string, unknown>) => void
}

export const useEventLog = create<EventLogState>()(
  persist(
    (set) => ({
      events: [],
      lastSeq: 0,
      log: (type, message, data) =>
        set((s) => {
          const event: GameEvent = { seq: s.lastSeq + 1, at: Date.now(), type, message, data }
          return { lastSeq: event.seq, events: [...s.events, event].slice(-MAX_STORED_EVENTS) }
        }),
    }),
    { name: 'rollodek-events', version: 1 },
  ),
)

/** Log from anywhere (outside React too): `logEvent('dice.roll', 'Rolled a 4')` */
export const logEvent = (...args: Parameters<EventLogState['log']>) => useEventLog.getState().log(...args)
