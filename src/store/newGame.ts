/**
 * "New Game": wipe every piece of RolloDek's saved state (event log, Settings
 * overrides, preferences, game progress) and reload, so the app comes back
 * exactly as a first-time visitor sees it: Turn 1, Scene 1, defaults everywhere.
 *
 * All persisted stores use the `rollodek-` key prefix — keep new ones on it.
 */
const STORAGE_PREFIX = 'rollodek-'
const NEW_GAME_FLAG = 'rollodek-new-game'

export function startNewGame() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key))
  // Survives the reload so the fresh log can open with "Started a new game"
  sessionStorage.setItem(NEW_GAME_FLAG, '1')
  window.location.reload()
}

/** True once, on the first load after startNewGame(). */
export function consumeNewGameFlag() {
  const isNew = sessionStorage.getItem(NEW_GAME_FLAG) === '1'
  sessionStorage.removeItem(NEW_GAME_FLAG)
  return isNew
}
