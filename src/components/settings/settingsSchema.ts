import { HERO_STATS, type DcTier, type GameConfig, type HeroStat } from '../../config/gameConfig.ts'
import mission from '../../data/mission.json'
import starterDeck from '../../data/starter-deck.json'

// Content the rules must agree with: settings can't create cards or objectives
const DECK_COUNTS = starterDeck.reduce<Record<string, number>>((n, card) => ({ ...n, [card.type]: (n[card.type] ?? 0) + 1 }), {})
const MISSION_OBJECTIVES = mission.objectives.length

/** One editable setting, addressed by its dotted path in GameConfig. */
export type SettingField =
  | { kind: 'int'; path: string; label: string; help?: string; min: number; max: number }
  | { kind: 'toggle'; path: string; label: string; help?: string }
  | { kind: 'tiers'; path: string; label: string; help?: string }

export interface SettingsSection {
  id: string
  title: string
  description?: string
  fields: SettingField[]
}

const STAT_NAMES: Record<HeroStat, string> = {
  STR: 'Strength',
  CON: 'Constitution',
  DEX: 'Dexterity',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
}

// Rail order; base stat is added to the card value on on-stat checks
const HERO_STAT_FIELDS: SettingField[] = HERO_STATS.map((stat) => ({
  kind: 'int',
  path: `heroStats.${stat}`,
  label: `${STAT_NAMES[stat]} (${stat})`,
  min: 0,
  max: 10,
}))

// Top → bottom: the big picture first, then fine tuning. Hero-specific
// sections (Hero, Starting Deck) sit together, then global rules.
export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'mission',
    title: 'Mission',
    fields: [
      { kind: 'int', path: 'objectivesToWin', label: 'Objectives to win', min: 0, max: 10 },
      { kind: 'int', path: 'objectivesTotal', label: 'Objectives total', min: 1, max: 10 },
    ],
  },
  {
    id: 'hero',
    title: 'Hero',
    description: 'Base stats are added to the card value on on-stat checks (off-stat uses the card value alone).',
    fields: [
      { kind: 'int', path: 'heroHpThreshold', label: 'HP threshold', help: 'Wounds at this count = Hero Death.', min: 1, max: 20 },
      ...HERO_STAT_FIELDS,
    ],
  },
  {
    id: 'deck',
    title: 'Starting Deck',
    fields: [
      { kind: 'int', path: 'startingDeckSize', label: 'Deck size', min: 5, max: 60 },
      { kind: 'int', path: 'startingDeckComposition.action', label: 'Single-stat action', min: 0, max: 60 },
      { kind: 'int', path: 'startingDeckComposition.memory', label: 'Single-stat memory', min: 0, max: 60 },
      { kind: 'int', path: 'startingDeckComposition.crossover', label: 'Crossover', min: 0, max: 60 },
      { kind: 'int', path: 'startingDeckComposition.wild', label: 'Wild', min: 0, max: 60 },
    ],
  },
  {
    id: 'hand',
    title: 'Hand',
    fields: [
      { kind: 'int', path: 'handSize', label: 'Hand size', help: 'Cards you redraw up to at Setup.', min: 1, max: 12 },
      { kind: 'int', path: 'handCap', label: 'Hand cap', help: 'Discard down to this at Conclude.', min: 1, max: 15 },
    ],
  },
  {
    id: 'tableau',
    title: 'Tableau',
    description: 'Slot caps per category. Tableau cards persist between turns.',
    fields: [
      { kind: 'int', path: 'tableauSlots.equipment.head', label: 'Equipment — head', min: 0, max: 4 },
      { kind: 'int', path: 'tableauSlots.equipment.torso', label: 'Equipment — torso', min: 0, max: 4 },
      { kind: 'int', path: 'tableauSlots.equipment.hands', label: 'Equipment — hands', min: 0, max: 4 },
      { kind: 'int', path: 'tableauSlots.equipment.feet', label: 'Equipment — feet', min: 0, max: 4 },
      { kind: 'int', path: 'tableauSlots.spells', label: 'Spell slots', help: 'Starting ongoing slots; scales with milestones.', min: 0, max: 6 },
      { kind: 'int', path: 'tableauSlots.heroParty', label: "Hero's Party slots", min: 0, max: 6 },
      { kind: 'int', path: 'tableauActivationsPerCard', label: 'Activations per card, per turn', help: 'How often each tableau card can tap.', min: 1, max: 5 },
    ],
  },
  {
    id: 'dc',
    title: 'Checks & DC',
    description: 'DC = 2d6 + tier offset, rolled after cards are committed. Only the tier is shown to the player.',
    fields: [
      { kind: 'int', path: 'dc.easyOffset', label: 'Easy offset', min: -12, max: 12 },
      { kind: 'int', path: 'dc.mediumOffset', label: 'Medium offset', min: -12, max: 12 },
      { kind: 'int', path: 'dc.dangerousOffset', label: 'Dangerous offset', min: -12, max: 12 },
      { kind: 'int', path: 'dc.floor', label: 'DC floor', help: 'The DC never goes below this.', min: 0, max: 10 },
      { kind: 'int', path: 'dc.snakeEyesRoll', label: 'Remarkable-success roll', help: 'Natural 2d6 result that always succeeds (snake eyes).', min: 2, max: 12 },
      { kind: 'int', path: 'dc.boxcarsRoll', label: 'Harsh-complication roll', help: 'Natural 2d6 result that always complicates (boxcars).', min: 2, max: 12 },
      { kind: 'tiers', path: 'dc.paidCostTiers', label: 'Paid-cost flip allowed on', help: 'Tiers where paying a wound turns a Fail into "success, but—".' },
    ],
  },
  {
    id: 'playtest',
    title: 'Playtest',
    fields: [
      { kind: 'toggle', path: 'debugMode', label: 'Debug mode', help: 'Reveals the hidden DC number on screen. Playtest only — strip before any real build.' },
    ],
  },
]

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  SETTINGS_SECTIONS.flatMap((s) => s.fields.map((f) => [f.path, f.label])),
)

export const TIER_LABELS: Record<DcTier, string> = { easy: 'Easy', medium: 'Medium', dangerous: 'Dangerous' }

/** Combinations that are legal to enter but probably not what you meant. */
export function configWarnings(c: GameConfig): Partial<Record<string, string>> {
  const w: Partial<Record<string, string>> = {}
  if (c.handCap < c.handSize) w.hand = `Hand cap (${c.handCap}) is below hand size (${c.handSize}): Conclude would discard cards you just drew.`
  const comp = c.startingDeckComposition
  const sum = comp.action + comp.memory + comp.crossover + comp.wild
  const deckIssues: string[] = []
  if (sum !== c.startingDeckSize) deckIssues.push(`Composition adds up to ${sum}, but deck size is ${c.startingDeckSize}.`)
  const contentMismatch = (Object.keys(comp) as (keyof typeof comp)[])
    .filter((type) => comp[type] !== (DECK_COUNTS[type] ?? 0))
    .map((type) => `${type} ${comp[type]} vs ${DECK_COUNTS[type] ?? 0}`)
  if (contentMismatch.length || c.startingDeckSize !== starterDeck.length)
    deckIssues.push(
      `starter-deck.json has ${starterDeck.length} cards${contentMismatch.length ? ` (${contentMismatch.join(', ')})` : ''}; ` +
        'changing these numbers doesn\'t add or remove cards.',
    )
  if (deckIssues.length) w.deck = deckIssues.join(' ')
  const missionIssues: string[] = []
  if (c.objectivesToWin > c.objectivesTotal)
    missionIssues.push(`Needing ${c.objectivesToWin} of ${c.objectivesTotal} objectives makes Mission Success impossible.`)
  if (c.objectivesTotal !== MISSION_OBJECTIVES)
    missionIssues.push(`mission.json defines ${MISSION_OBJECTIVES} objectives, not ${c.objectivesTotal}.`)
  if (missionIssues.length) w.mission = missionIssues.join(' ')
  if (c.dc.snakeEyesRoll === c.dc.boxcarsRoll) w.dc = 'Remarkable-success and harsh-complication rolls are the same number.'
  return w
}

/** DC range per tier given the current offsets and floor (2d6 → 2–12). */
export function dcRange(c: GameConfig, offset: number) {
  return [Math.max(2 + offset, c.dc.floor), Math.max(12 + offset, c.dc.floor)] as const
}
