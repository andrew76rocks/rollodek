import type { DcTier, HeroStat } from '../config/gameConfig.ts'
import rawDeck from './adventure-deck.json'
import rawMission from './mission.json'
import rawScenes from './scenes.json'

/**
 * Adventure Deck (docs/rules.md §7). Front: art + ID only. Back: an ordered
 * list of blocks. The DC number is never part of the data.
 */

/** What a Challenge outcome does, beyond its text */
export interface ChallengeOutcome {
  text: string
  /** Objective number (1-based) completed by this outcome */
  objective?: number
  /** Objective number this outcome closes off for the session */
  closesObjective?: number
  /** Wounds taken */
  wounds?: number
}

/**
 * TODO(drew): the Challenge block's exact fields are pending review (rules.md §7/§11).
 * `stats` (one or two) for a check, or `combat` naming the Encounter.
 */
export interface ChallengeBlock {
  type: 'challenge'
  stats?: HeroStat[]
  combat?: { encounterId: string; /** Stunning the enemy also counts as success */ successOnStun?: boolean }
  tier: DcTier
  success: ChallengeOutcome
  /** Paid-cost flip ("success, but"): only offered on paid-cost tiers */
  successBut?: ChallengeOutcome
  fail: ChallengeOutcome
}

export interface TextBlock {
  type: 'text'
  text: string
}

/** A visible 2d6 roll between outcomes; never confused with the hidden DC roll */
export interface BranchRollBlock {
  type: 'branchRoll'
  prompt: string
  outcomes: { min: number; max: number; text: string }[]
}

/** "Add AD-xx": pulls another numbered card in */
export interface PointerBlock {
  type: 'pointer'
  cardId: string
  text?: string
}

export type CardBlock = TextBlock | ChallengeBlock | BranchRollBlock | PointerBlock

export interface AdventureCard {
  /** "AD-" + Scene number + letter */
  id: string
  scene: number
  /** Optional cards show their ID in parentheses: (AD-1A) */
  optional?: boolean
  milestone?: boolean
  final?: boolean
  /** Shown on the back only */
  title: string
  back: CardBlock[]
}

export interface SceneData {
  scene: number
  title: string
  /** Card ids, laid out left → right, top row first (table order, not play order) */
  cards: string[]
  /**
   * Optional: how many cards sit in each row, top to bottom, e.g. [2, 3].
   * Must add up to the card count. Omitted: the default for that count
   * (SCENE_ROW_DEFAULTS). Scenes hold 1 to 6 cards.
   */
  rows?: number[]
}

/** Default arrangement per card count: one row up to 3, then two rows (top, bottom) */
export const SCENE_ROW_DEFAULTS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [2, 3],
  6: [3, 3],
}

/** A Scene's cards grouped into rows, top row first */
export function sceneRows(scene: SceneData): string[][] {
  const counts = scene.rows ?? SCENE_ROW_DEFAULTS[scene.cards.length] ?? [scene.cards.length]
  if (import.meta.env.DEV && counts.reduce((a, b) => a + b, 0) !== scene.cards.length) {
    console.warn(`[scenes] Scene ${scene.scene}: rows ${JSON.stringify(counts)} don't add up to ${scene.cards.length} cards`)
  }
  let start = 0
  return counts.map((n) => scene.cards.slice(start, (start += n)))
}

export interface MissionData {
  id: string
  name: string
  goal: string
  premise: string
  finalScene: number
  objectives: { id: number; text: string; card: string }[]
}

export const adventureDeck = rawDeck as AdventureCard[]
export const scenes = rawScenes as SceneData[]

/** Missions a session can pick from (just one so far) */
export const missions: MissionData[] = [rawMission as MissionData]

const cardsById = new Map(adventureDeck.map((c) => [c.id.toUpperCase(), c]))

/** Find a card by ID, forgiving case, spaces and parentheses: "ad-2b", "(AD-1A)" */
export function findAdventureCard(query: string): AdventureCard | undefined {
  const id = query.trim().toUpperCase().replace(/[()\s]/g, '')
  return cardsById.get(id) ?? cardsById.get(id.startsWith('AD-') ? id : `AD-${id}`)
}

export function getAdventureCard(id: string): AdventureCard {
  const card = findAdventureCard(id)
  if (!card) throw new Error(`Unknown Adventure Deck card: ${id}`)
  return card
}

/** How an ID is printed: parentheses mark an optional card */
export const printedId = (card: AdventureCard) => (card.optional ? `(${card.id})` : card.id)

export function getScene(n: number): SceneData | undefined {
  return scenes.find((s) => s.scene === n)
}

/** Where a card sits in its Scene's layout: the row sizes, and its row and column */
export function cardPosition(cardId: string): { rows: number[]; row: number; col: number } | undefined {
  const scene = scenes.find((s) => s.cards.includes(cardId))
  if (!scene) return undefined
  const grouped = sceneRows(scene)
  const row = grouped.findIndex((r) => r.includes(cardId))
  return { rows: grouped.map((r) => r.length), row, col: grouped[row].indexOf(cardId) }
}
