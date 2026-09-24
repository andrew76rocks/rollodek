import Markdown, { type Components } from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import styles from './MarkdownDoc.module.css'

// Docs render under a drawer title (h2), so their headings step down a level
const components: Components = {
  h1: ({ node: _node, ...props }) => <h3 {...props} />,
  h2: ({ node: _node, ...props }) => <h3 {...props} />,
  h3: ({ node: _node, ...props }) => <h4 {...props} />,
}

/**
 * Markdown in the RolloDek prose style (help, hero docs). Supports GFM tables,
 * and single line breaks are kept (the docs are authored line by line).
 */
export function MarkdownDoc({ children }: { children: string }) {
  return (
    <article className={styles.prose}>
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {children}
      </Markdown>
    </article>
  )
}
