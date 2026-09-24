import { useCallback, useEffect, useRef } from 'react'
import { useUiStore, type DrawerId } from '../../store/uiStore.ts'
import { MarkdownDoc } from '../markdown/MarkdownDoc.tsx'
import { SideDrawer } from './SideDrawer.tsx'
import styles from './DocDrawer.module.css'

interface DocDrawerProps {
  id: DrawerId
  title: string
  /** Markdown body (without its title) */
  markdown: string
  width?: number
}

/** A markdown document in the shared side drawer (help, hero backstory/class). */
export function DocDrawer({ id, title, markdown, width = 520 }: DocDrawerProps) {
  const open = useUiStore((s) => s.openDrawer === id)
  const setOpenDrawer = useUiStore((s) => s.setOpenDrawer)
  const close = useCallback(() => setOpenDrawer(null), [setOpenDrawer])

  return (
    <SideDrawer open={open} onClose={close} title={title} width={width}>
      <DocBody markdown={markdown} />
    </SideDrawer>
  )
}

function DocBody({ markdown }: { markdown: string }) {
  const scroller = useRef<HTMLDivElement>(null)
  // Focus the article so arrow / page keys scroll it straight away
  useEffect(() => scroller.current?.focus({ preventScroll: true }), [])
  return (
    <div ref={scroller} className={styles.scroller} tabIndex={-1}>
      <MarkdownDoc>{markdown}</MarkdownDoc>
    </div>
  )
}
