import { useMemo } from 'react'
import rulesMd from '../../../docs/rules.md?raw'
import { useGameConfig } from '../../config/gameConfig.ts'
import { splitTitle } from '../../content/markdown.ts'
import { fillTokens, ruleTokens } from '../../content/ruleTokens.ts'
import { DocDrawer } from '../drawer/DocDrawer.tsx'

/**
 * Designer view of docs/rules.md (the rules source of truth) with {{tokens}}
 * filled from the live config, through the same path as the Help drawer.
 * Debug-only: opened from the ⋮ menu when debugMode is on.
 */
const { title, body } = splitTitle(rulesMd, 'Rules')

export function RulesDrawer() {
  const config = useGameConfig((c) => c)
  const markdown = useMemo(() => fillTokens(body, ruleTokens(config)), [config])
  return <DocDrawer id="rules" title={title} markdown={markdown} width={640} />
}
