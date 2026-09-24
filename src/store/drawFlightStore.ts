import { create } from 'zustand'

/** A card drawn from the Hero Deck, on its way into the hand. `from` is the deck's center. */
export interface DrawFlight {
  cardId: string
  from: { x: number; y: number }
}

/**
 * Cards currently sliding from the Hero Deck into the hand. The real card is
 * already in the hand (hidden) while its clone flies in. Not persisted: a
 * reload mid-flight just shows the card in place.
 */
export const useDrawFlightStore = create<{ flights: DrawFlight[] }>(() => ({ flights: [] }))

export function startDrawFlight(flight: DrawFlight) {
  useDrawFlightStore.setState((s) => ({ flights: [...s.flights, flight] }))
}

export function endDrawFlight(cardId: string) {
  useDrawFlightStore.setState((s) => ({ flights: s.flights.filter((f) => f.cardId !== cardId) }))
}
