import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import rawDefaults from '../data/game-config.json'

/**
 * Every tunable game-balance number. Defaults live in src/data/game-config.json;
 * the Settings drawer layers playtest overrides on top. Only changed fields are
 * saved (localStorage), so editing the JSON still reaches everything untouched.
 * UI and game logic read the *effective* config via useGameConfig / getGameConfig.
 */
export type DcTier = 'easy' | 'medium' | 'dangerous'
export const DC_TIERS: DcTier[] = ['easy', 'medium', 'dangerous']

/** Hero stats in display order (top → bottom on the rail) */
export const HERO_STATS = ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'] as const
export type HeroStat = (typeof HERO_STATS)[number]

export interface GameConfig {
  handSize: number
  handCap: number
  tableauSlots: {
    equipment: { head: number; torso: number; hands: number; feet: number }
    spells: number
    heroParty: number
  }
  tableauActivationsPerCard: number
  dc: {
    easyOffset: number
    mediumOffset: number
    dangerousOffset: number
    floor: number
    snakeEyesRoll: number
    boxcarsRoll: number
    /** Tiers where a wound can flip a Fail into "success, but—" */
    paidCostTiers: DcTier[]
  }
  heroHpThreshold: number
  /** Base stat per ability; on-stat checks add this to the card value */
  heroStats: Record<HeroStat, number>
  startingDeckSize: number
  startingDeckComposition: {
    action: number
    memory: number
    crossover: number
    wild: number
  }
  objectivesToWin: number
  objectivesTotal: number
  /** Playtest only: reveals the hidden DC number on screen */
  debugMode: boolean
}

export const defaultGameConfig = rawDefaults as GameConfig

type Overrides = Record<string, unknown>

interface GameConfigState {
  /** Only the fields changed from the JSON defaults (what gets saved) */
  overrides: Overrides
  /** Effective config: defaults + overrides */
  config: GameConfig
  setConfig: (config: GameConfig) => void
  reset: () => void
}

export const useGameConfigStore = create<GameConfigState>()(
  persist(
    (set) => ({
      overrides: {},
      config: defaultGameConfig,
      setConfig: (config) => {
        // Store just the differences, so untouched fields keep following the JSON
        const overrides = diffFrom(defaultGameConfig, config)
        set({ overrides, config: deepMerge(defaultGameConfig, overrides) })
      },
      reset: () => set({ overrides: {}, config: defaultGameConfig }),
    }),
    {
      name: 'rollodek-game-config',
      version: 2,
      partialize: (s) => ({ overrides: s.overrides }),
      // v1 saved a full copy of the config; keep only what differs from today's defaults
      migrate: (persisted, version) => {
        const old = persisted as { config?: GameConfig; overrides?: Overrides }
        return { overrides: version < 2 && old.config ? diffFrom(defaultGameConfig, old.config) : (old.overrides ?? {}) }
      },
      merge: (persisted, current) => {
        // Re-diff on load: drops overrides that now equal the (possibly updated) defaults
        const config = deepMerge(defaultGameConfig, (persisted as { overrides?: Overrides })?.overrides ?? {})
        return { ...current, overrides: diffFrom(defaultGameConfig, config), config }
      },
      // Persist the cleaned-up overrides straight away (merge alone only fixes memory).
      // Deferred: localStorage rehydrates synchronously, before the store const exists.
      onRehydrateStorage: () => (state) => {
        if (state) queueMicrotask(() => useGameConfigStore.setState({ overrides: state.overrides }))
      },
    },
  ),
)

/** Effective config in React: `const handSize = useGameConfig((c) => c.handSize)` */
export const useGameConfig = <T,>(select: (c: GameConfig) => T) => useGameConfigStore((s) => select(s.config))

/** Effective config outside React (game logic) */
export const getGameConfig = () => useGameConfigStore.getState().config

// ── path helpers (the settings form addresses fields by dotted path) ──

export function getAt(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj)
}

export function setAt<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.')
  const source = obj as Record<string, unknown>
  return { ...source, [head]: rest.length ? setAt(source[head], rest.join('.'), value) : value } as T
}

/** Leaves of `next` that differ from `base` (arrays compared whole). */
function diffFrom(base: unknown, next: unknown): Overrides {
  const out: Overrides = {}
  for (const [k, v] of Object.entries(next as Overrides)) {
    const b = (base as Overrides)[k]
    const isObject = typeof v === 'object' && v !== null && !Array.isArray(v)
    if (isObject) {
      const sub = diffFrom(b, v)
      if (Object.keys(sub).length) out[k] = sub
    } else if (JSON.stringify(v) !== JSON.stringify(b)) {
      out[k] = v
    }
  }
  return out
}

/** Defaults with overrides applied; unknown keys (removed from the JSON) are ignored. */
function deepMerge<T>(base: T, over: unknown): T {
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return (over ?? base) as T
  const out = { ...(base as Record<string, unknown>) }
  for (const [k, v] of Object.entries((over as Record<string, unknown>) ?? {})) {
    if (k in out) out[k] = deepMerge(out[k], v)
  }
  return out as T
}
