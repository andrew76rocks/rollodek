import { warnCardAuthoring } from './heroCard.ts'
import hero from './hero.json'
import itemPool from './item-pool.json'
import spellPool from './spell-pool.json'

/**
 * Cards that live in the tableau (in play until the player removes or
 * replaces them): the hero's party, equipment ("Items"), and ongoing spells.
 */
export type TableauZone = 'party' | 'items' | 'spells'

export interface TableauCardData {
  id: string
  zone: TableauZone
  name: string
  /** Shown on the type line, e.g. "Companion", "Gear · Hands" */
  typeLabel: string
  text: string
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** The hero's starting companion: in the Hero's Party slot from turn one (locked rule). */
export const HERO_COMPANION_ID = 'hero-companion'

const allTableauCards: TableauCardData[] = [
  { id: HERO_COMPANION_ID, zone: 'party', name: hero.companionName, typeLabel: 'Companion', text: hero.companionText },
  ...itemPool.map((item) => ({
    id: `item-${slug(item.name)}`,
    zone: 'items' as const,
    name: item.name,
    typeLabel: item.slot ? `Gear · ${capitalize(item.slot)}` : 'Gear',
    text: item.text,
  })),
  ...spellPool.map((spell) => ({
    id: `spell-${slug(spell.name)}`,
    zone: 'spells' as const,
    name: spell.name,
    typeLabel: spell.kind ? `Spell · ${spell.kind}` : 'Spell',
    text: spell.text,
  })),
]

for (const card of allTableauCards) warnCardAuthoring(card.name, card.text, card.id)

const byId = new Map(allTableauCards.map((card) => [card.id, card]))

export function getTableauCard(id: string): TableauCardData {
  const card = byId.get(id)
  if (!card) throw new Error(`Unknown tableau card id: ${id}`)
  return card
}
