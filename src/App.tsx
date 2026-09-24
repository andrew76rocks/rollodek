import { useEffect } from 'react'
import { AppShell } from './components/AppShell.tsx'
import { logEvent } from './store/eventLogStore.ts'
import { consumeNewGameFlag } from './store/newGame.ts'

// Module-level guard: StrictMode runs mount effects twice in dev
let sessionLogged = false

export default function App() {
  useEffect(() => {
    if (sessionLogged) return
    sessionLogged = true
    logEvent('session.open', consumeNewGameFlag() ? 'Started a new game' : 'Opened the game table')
  }, [])

  return <AppShell />
}
