import type { GameConfig } from '../../config/gameConfig.ts'

/*
 * "Save to…" via the File System Access API (Chromium browsers). Opens the
 * native save dialog so the config can be written straight over
 * src/data/game-config.json. Elsewhere, fall back to a plain download.
 */

// Minimal typings: this API isn't in TypeScript's standard DOM lib
interface SaveFilePickerOptions {
  id?: string
  suggestedName?: string
  startIn?: FileSystemHandle | 'documents' | 'downloads' | 'desktop'
  types?: { description: string; accept: Record<string, string[]> }[]
}
type ShowSaveFilePicker = (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>

const picker = (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker

export const canSaveToFile = typeof picker === 'function'

export const configToJson = (c: GameConfig) => `${JSON.stringify(c, null, 2)}\n`

// The picker reopens in this file's folder next time (also remembered across
// sessions via the picker `id`), so after the first save it lands in src/data
let lastHandle: FileSystemFileHandle | undefined

/** Returns the saved file's name, or null if the user cancelled. */
export async function saveConfigToFile(config: GameConfig): Promise<string | null> {
  if (!picker) throw new Error('Save-to-file is not supported in this browser')
  try {
    const handle = await picker({
      id: 'rollodek-game-config',
      suggestedName: 'game-config.json',
      startIn: lastHandle,
      types: [{ description: 'JSON config', accept: { 'application/json': ['.json'] } }],
    })
    const writable = await handle.createWritable()
    await writable.write(configToJson(config))
    await writable.close()
    lastHandle = handle
    return handle.name
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null // cancelled
    throw err
  }
}

export function downloadConfig(config: GameConfig) {
  const url = URL.createObjectURL(new Blob([configToJson(config)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'game-config.json'
  a.click()
  URL.revokeObjectURL(url)
}
