import {
  CardsIcon,
  DiceFiveIcon,
  FastForwardIcon,
  FlagBannerIcon,
  GearSixIcon,
  HandDepositIcon,
  HeartBreakIcon,
  HourglassHighIcon,
  HourglassLowIcon,
  LightningIcon,
  MapTrifoldIcon,
  SealCheckIcon,
  ShuffleIcon,
  SignInIcon,
  type Icon,
} from '@phosphor-icons/react'

/**
 * Every kind of game event the log understands. Only some are emitted today
 * (dice, session); the rest are ready for when their mechanics land.
 */
export type GameEventType =
  | 'session.open'
  | 'dice.roll'
  | 'card.draw'
  | 'card.play'
  | 'card.activate'
  | 'deck.shuffle'
  | 'scene.explore'
  | 'turn.start'
  | 'turn.end'
  | 'settings.change'
  | 'phase.change'
  | 'mission'
  | 'check.resolve'
  | 'wound'

export const EVENT_TYPES: Record<GameEventType, { label: string; icon: Icon }> = {
  'session.open': { label: 'Session', icon: SignInIcon },
  'dice.roll': { label: 'Dice', icon: DiceFiveIcon },
  'card.draw': { label: 'Card drawn', icon: HandDepositIcon },
  'card.play': { label: 'Card played', icon: CardsIcon },
  'card.activate': { label: 'Card activated', icon: LightningIcon },
  'deck.shuffle': { label: 'Deck shuffled', icon: ShuffleIcon },
  'scene.explore': { label: 'Exploration', icon: MapTrifoldIcon },
  'turn.start': { label: 'Turn start', icon: HourglassHighIcon },
  'turn.end': { label: 'Turn end', icon: HourglassLowIcon },
  'settings.change': { label: 'Settings', icon: GearSixIcon },
  'phase.change': { label: 'Phase', icon: FastForwardIcon },
  mission: { label: 'Mission', icon: FlagBannerIcon },
  'check.resolve': { label: 'Check', icon: SealCheckIcon },
  wound: { label: 'Wound', icon: HeartBreakIcon },
}

export interface GameEvent {
  /** 1-based, strictly increasing for the life of the saved log */
  seq: number
  /** Epoch ms */
  at: number
  type: GameEventType
  message: string
  /** Structured details for later use (replays, filters); not shown directly */
  data?: Record<string, unknown>
}
