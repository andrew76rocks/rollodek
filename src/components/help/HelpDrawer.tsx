import { useMemo } from 'react'
import { useGameConfig } from '../../config/gameConfig.ts'
import howToPlay from '../../content/how-to-play.md?raw'
import { splitTitle } from '../../content/markdown.ts'
import { fillTokens, ruleTokens } from '../../content/ruleTokens.ts'
import { DocDrawer } from '../drawer/DocDrawer.tsx'

/**
 * "How to Play" from src/content/how-to-play.md. The doc's "# Title" becomes
 * the drawer title, and {{tokens}} are filled from the live game config.
 */
const { title, body } = splitTitle(howToPlay, 'How to Play')

export function HelpDrawer() {
  const config = useGameConfig((c) => c)
  const markdown = useMemo(() => fillTokens(body, ruleTokens(config)), [config])
  return <DocDrawer id="help" title={title} markdown={markdown} />
}
