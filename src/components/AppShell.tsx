import type { CSSProperties } from 'react'
import { getScene, sceneRows } from '../data/adventureDeck.ts'
import { useGameStore } from '../store/gameStore.ts'
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
import { Intro } from './intro/Intro.tsx'
import { SceneDiscardLayer } from './adventure/SceneDiscard.tsx'
import { SceneDealLayer } from './adventure/SceneDeal.tsx'
import { useIntroStore } from '../store/introStore.ts'
import { CardPreview } from './CardPreview.tsx'
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

  const introStage = useIntroStore((s) => s.stage)
  const adventureDiscardCount = useGameStore((s) => s.adventureDiscard.length)
  // One or two rows of Scene cards: two rows grow the Scene band and bottom-align the board
  const sceneRowCount = useGameStore((s) => {
    const scene = getScene(s.scene)
    return s.missionId && scene ? sceneRows(scene).length : 1
  })

  return (
    <div
      className={styles.shell}
      data-layout={layoutMode}
      data-intro={introStage}
      data-scene-rows={sceneRowCount}
      style={{ '--scene-rows': sceneRowCount } as CSSProperties}
    >
      <TopBar />
      <BoardDnd>
        <main className={styles.table}>
          {layoutMode === 'default' && <HeroRail />}

          <DeckPile tone="adventure" label={['Adventure', 'Deck']} />
          <SceneCards />
          <DiscardPile tone="adventure" count={adventureDiscardCount} />

          <PlayArea />

          <DeckPile tone="hero" label={['Hero', 'Deck']} />
          <CardZoneView />
          <DiscardPile tone="hero" count={heroDiscardCount} />

          <BottomBar />
        </main>
      </BoardDnd>
      <Intro />
      <DrawFlightLayer />
      <SceneDiscardLayer />
      <SceneDealLayer />
      <CardPreview />
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
