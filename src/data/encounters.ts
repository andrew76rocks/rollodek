import type { DcTier, HeroStat } from '../config/gameConfig.ts'
import rawEncounters from './encounter-pool.json'

/**
 * Encounters: monsters and NPCs in one card type (docs/rules.md §8). A hostile
 * Encounter is the combat enemy (there is no separate Threat type).
 */
export type Disposition = 'hostile' | 'neutral' | 'friendly'

export interface EncounterData {
  id: string
  name: string
  disposition: Disposition
  /** False for authored bosses a location names directly; they're never drawn at random */
  inRandomPool: boolean
  /** Only Companion-tagged Encounters can join the Hero's Party.
   * TODO(drew): how a tagged Encounter joins (check, choice, or reward) is an open question. */
  companion?: boolean
  text: string
  // Hostile only
  hp?: number
  /** Danger tier, which is also its defense */
  tier?: DcTier
  attackStat?: HeroStat
  onDefeat?: string
  onEscape?: string
  onStun?: string
}

export const encounters = rawEncounters as EncounterData[]

const byId = new Map(encounters.map((e) => [e.id, e]))

export function getEncounter(id: string): EncounterData {
  const encounter = byId.get(id)
  if (!encounter) throw new Error(`Unknown encounter id: ${id}`)
  return encounter
}

/** What a location can roll from; authored bosses are excluded */
export const randomEncounterPool = encounters.filter((e) => e.inRandomPool)
