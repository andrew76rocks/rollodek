/** Small helpers for the hand-authored docs in src/content. */

/** Splits a leading `---` block of `key: value` lines from the markdown body. */
export function parseFrontmatter(markdown: string): { data: Record<string, string>; body: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { data: {}, body: markdown }
  const data: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { data, body: markdown.slice(match[0].length) }
}

/** Uses the doc's leading "# Title" as a title and returns the rest as body. */
export function splitTitle(markdown: string, fallback: string) {
  const match = markdown.trimStart().match(/^#\s+(.+)\n/)
  return match
    ? { title: match[1].trim(), body: markdown.trimStart().slice(match[0].length) }
    : { title: fallback, body: markdown }
}

/** Text of the `## …` section whose heading starts with `prefix` (up to the next `## `). */
export function section(body: string, prefix: string) {
  const lines = body.split('\n')
  const start = lines.findIndex((l) => l.startsWith(`## ${prefix}`))
  if (start < 0) return ''
  const end = lines.findIndex((l, i) => i > start && l.startsWith('## '))
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n')
}

/** Value after a bold label, e.g. field(text, 'Role') for "**Role:** Scout". */
export function field(text: string, label: string) {
  return text.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`))?.[1].trim() ?? ''
}

/** First blockquote line ("> …"). */
export function firstQuote(text: string) {
  return text.match(/^>\s*(.+)$/m)?.[1].trim() ?? ''
}
