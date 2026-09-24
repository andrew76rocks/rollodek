import { useMemo } from 'react'
import { useGameConfig } from '../../config/gameConfig.ts'
import { heroBackstory, heroClass } from '../../content/heroContent.ts'
import { fillTokens, ruleTokens } from '../../content/ruleTokens.ts'
import { DocDrawer } from '../drawer/DocDrawer.tsx'

/** Full backstory and class cards (opened from the trait badges); {{tokens}} filled from live config. */
export function HeroDocDrawers() {
  const config = useGameConfig((c) => c)
  const tokens = useMemo(() => ruleTokens(config), [config])
  return (
    <>
      <DocDrawer
        id="heroBackstory"
        title={heroBackstory.drawerTitle}
        markdown={fillTokens(heroBackstory.markdown, tokens)}
        width={560}
      />
      <DocDrawer id="heroClass" title={heroClass.drawerTitle} markdown={fillTokens(heroClass.markdown, tokens)} width={560} />
    </>
  )
}
