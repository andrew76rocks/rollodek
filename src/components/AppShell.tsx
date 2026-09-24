import { useLayoutShortcuts } from '../hooks/useLayoutShortcuts.ts'
import { useUiStore } from '../store/uiStore.ts'
import { BottomBar } from './BottomBar.tsx'
import { DeckPile } from './DeckPile.tsx'
import { EventLogDrawer } from './eventLog/EventLogDrawer.tsx'
import { HelpDrawer } from './help/HelpDrawer.tsx'
import { HeroDocDrawers } from './hero/HeroDocDrawers.tsx'
import { SettingsDrawer } from './settings/SettingsDrawer.tsx'
import { DiscardPile } from './DiscardPile.tsx'
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
  useLayoutShortcuts()

  return (
    <div className={styles.shell} data-layout={layoutMode}>
      <TopBar />
      <main className={styles.table}>
        {layoutMode === 'default' && <HeroRail />}

        <DeckPile tone="adventure" label={['Adventure', 'Deck']} />
        <div className={styles.scene} />
        <DiscardPile tone="adventure" count={0} />

        <PlayArea />

        <DeckPile tone="hero" label={['Hero', 'Deck']} />
        <div className={styles.hand} />
        <DiscardPile tone="hero" count={0} />

        <BottomBar />
      </main>
      <EventLogDrawer />
      <HelpDrawer />
      <HeroDocDrawers />
      <SettingsDrawer />
    </div>
  )
}
