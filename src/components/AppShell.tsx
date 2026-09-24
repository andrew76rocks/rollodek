import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.ts'
import { useHeroDeckStore } from '../store/heroDeckStore.ts'
import { useUiStore } from '../store/uiStore.ts'
import { BottomBar } from './BottomBar.tsx'
import { DeckPile } from './DeckPile.tsx'
import { BoardDnd } from './dnd/BoardDnd.tsx'
import { EventLogDrawer } from './eventLog/EventLogDrawer.tsx'
import { CardZoneView } from './hand/CardZoneView.tsx'
import { HelpDrawer } from './help/HelpDrawer.tsx'
import { RulesDrawer } from './help/RulesDrawer.tsx'
import { AdventureCardDrawer } from './adventure/AdventureCardDrawer.tsx'
import { SceneCards } from './adventure/SceneCards.tsx'
import { SessionScreens } from './session/SessionScreens.tsx'
import { HeroDocDrawers } from './hero/HeroDocDrawers.tsx'
import { SettingsDrawer } from './settings/SettingsDrawer.tsx'
import { DiscardPile } from './DiscardPile.tsx'
import { DrawFlightLayer } from './DrawFlight.tsx'
import { ShuffleFlightLayer } from './ShuffleFlight.tsx'
import { HeroRail } from './HeroRail.tsx'
import { PlayArea } from './PlayArea.tsx'
import { TopBar } from './TopBar.tsx'
import styles from './AppShell.module.css'

/**
 * Table layout from Figma frames 56:3277 (default) and 62:3623 (maximized).
 * Pure layout — card rows stay empty until game state lands.
 */
export function AppShell() {
  const layoutMode = useUiStore((s) => s.layoutMode)
  const heroDiscardCount = useHeroDeckStore((s) => s.discard.length)
  useKeyboardShortcuts()

  return (
    <div className={styles.shell} data-layout={layoutMode}>
      <TopBar />
      <BoardDnd>
        <main className={styles.table}>
          {layoutMode === 'default' && <HeroRail />}

          <DeckPile tone="adventure" label={['Adventure', 'Deck']} />
          <SceneCards />
          <DiscardPile tone="adventure" count={0} />

          <PlayArea />

          <DeckPile tone="hero" label={['Hero', 'Deck']} />
          <CardZoneView />
          <DiscardPile tone="hero" count={heroDiscardCount} />

          <BottomBar />
        </main>
      </BoardDnd>
      <DrawFlightLayer />
      <ShuffleFlightLayer />
      <EventLogDrawer />
      <HelpDrawer />
      <RulesDrawer />
      <AdventureCardDrawer />
      <SessionScreens />
      <HeroDocDrawers />
      <SettingsDrawer />
    </div>
  )
}
