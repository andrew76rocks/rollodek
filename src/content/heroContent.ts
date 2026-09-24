import backstoryMd from './hero-backstory.md?raw'
import classMd from './hero-class.md?raw'
import { field, firstQuote, parseFrontmatter, section, splitTitle } from './markdown.ts'

/**
 * Hero docs from src/content (one hero for now). Each yields the full drawer
 * doc plus a hover summary built from the doc itself — card face and trait
 * names/flavor only, no stats (the rail already shows those).
 */
export interface HeroDocSummary {
  kicker: string
  title: string
  subtitle?: string
  flavor: string
  traits: { label: string; name: string; text: string }[]
}

export interface HeroDoc {
  drawerTitle: string
  markdown: string
  summary: HeroDocSummary
}

function loadBackstory(): HeroDoc {
  const { data, body: raw } = parseFrontmatter(backstoryMd)
  const { title, body } = splitTitle(raw, `${data.hero ?? 'Hero'}: Backstory`)
  return {
    drawerTitle: title,
    markdown: body,
    summary: {
      kicker: 'Backstory',
      title: data.title || field(section(body, 'Card Face'), 'Title'),
      flavor: firstQuote(section(body, 'Card Face')),
      traits: [
        { label: 'Strength', name: data.strength ?? '', text: field(section(body, 'Strength'), 'Flavor') },
        { label: 'Weakness', name: data.weakness ?? '', text: field(section(body, 'Weakness'), 'Flavor') },
      ].filter((t) => t.name),
    },
  }
}

function loadClass(): HeroDoc {
  const { data, body: raw } = parseFrontmatter(classMd)
  const { title, body } = splitTitle(raw, `${data.hero ?? 'Hero'}: Class`)
  const face = section(body, 'Card Face')
  const abilityName = body.match(/^## Class Ability:\s*(.+)$/m)?.[1].trim() ?? ''
  return {
    drawerTitle: title,
    markdown: body,
    summary: {
      kicker: 'Class',
      title: data.class || field(face, 'Class'),
      subtitle: field(face, 'Role'),
      flavor: firstQuote(face),
      traits: abilityName
        ? [{ label: 'Class ability', name: abilityName, text: field(section(body, 'Class Ability'), 'Flavor') }]
        : [],
    },
  }
}

export const heroBackstory = loadBackstory()
export const heroClass = loadClass()
