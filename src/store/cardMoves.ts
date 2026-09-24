import { getHeroCard } from '../data/heroCard.ts'
import { getTableauCard } from '../data/tableauCards.ts'
import { logEvent } from './eventLogStore.ts'
import { useHeroDeckStore } from './heroDeckStore.ts'
import { usePlayAreaStore } from './playAreaStore.ts'
import { useTableauStore } from './tableauStore.ts'
import type { CardZone } from './uiStore.ts'

/**
 * Moving cards between the hand / tableau zones and the Play Area. Each move
 * takes the card out of one place and puts it in the other, so a card is
 * never in two places at once.
 */

function removeFromZone(zone: CardZone, cardId: string) {
  if (zone === 'hand') useHeroDeckStore.setState((s) => ({ hand: s.hand.filter((id) => id !== cardId) }))
  else useTableauStore.setState((s) => ({ [zone]: s[zone].filter((id) => id !== cardId) }))
}

function addToZone(zone: CardZone, cardId: string) {
  if (zone === 'hand') useHeroDeckStore.setState((s) => ({ hand: [...s.hand, cardId] }))
  else useTableauStore.setState((s) => ({ [zone]: [...s[zone], cardId] }))
}

/** Reorder a card within its zone: move `cardId` to where `overCardId` is. */
export function reorderZone(zone: CardZone, cardId: string, overCardId: string) {
  const move = (ids: string[]) => {
    const from = ids.indexOf(cardId)
    const to = ids.indexOf(overCardId)
    if (from < 0 || to < 0 || from === to) return ids
    const next = [...ids]
    next.splice(to, 0, ...next.splice(from, 1))
    return next
  }
  if (zone === 'hand') useHeroDeckStore.setState((s) => ({ hand: move(s.hand) }))
  else useTableauStore.setState((s) => ({ [zone]: move(s[zone]) }))
}

/** Hand / tableau → Play Area */
export function moveToPlayArea(from: CardZone, cardId: string) {
  if (usePlayAreaStore.getState().staged.some((c) => c.cardId === cardId)) return
  removeFromZone(from, cardId)
  usePlayAreaStore.setState((s) => ({ staged: [...s.staged, { cardId, from }] }))
}

/** Play Area → back to the zone the card came from */
export function returnFromPlayArea(cardId: string) {
  const card = usePlayAreaStore.getState().staged.find((c) => c.cardId === cardId)
  if (!card) return
  usePlayAreaStore.setState((s) => ({ staged: s.staged.filter((c) => c.cardId !== cardId) }))
  addToZone(card.from, cardId)
}

/**
 * "Play Cards": resolve everything staged in the Play Area. Hand cards are
 * spent: they go to the Hero Discard. (Only hand cards can be staged now;
 * the tableau branch just returns any older saved tableau card to its zone.)
 */
export function playStagedCards() {
  const { staged } = usePlayAreaStore.getState()
  if (staged.length === 0) return

  const fromHand = staged.filter((c) => c.from === 'hand').map((c) => c.cardId)
  usePlayAreaStore.setState({ staged: [] })
  useHeroDeckStore.setState((s) => ({ discard: [...s.discard, ...fromHand] }))
  staged.filter((c) => c.from !== 'hand').forEach((c) => addToZone(c.from, c.cardId))

  const names = staged.map((c) => (c.from === 'hand' ? getHeroCard(c.cardId) : getTableauCard(c.cardId)).name)
  logEvent('card.play', `Played ${names.join(', ')}`, { cards: staged })
}

/**
 * Tableau cards are activated by tapping (not played to the Play Area):
 * tap to activate, untap to make it ready again. Setup will untap everything
 * automatically once the turn structure exists.
 */
export function toggleTap(cardId: string) {
  const tapped = useTableauStore.getState().tapped.includes(cardId)
  useTableauStore.setState((s) => ({
    tapped: tapped ? s.tapped.filter((id) => id !== cardId) : [...s.tapped, cardId],
  }))
  if (!tapped) logEvent('card.activate', `Activated ${getTableauCard(cardId).name}`, { cardId })
}
