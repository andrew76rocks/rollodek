import { useId, useRef, useState } from 'react'
import type { HeroDoc } from '../../content/heroContent.ts'
import { useUiStore, type DrawerId } from '../../store/uiStore.ts'
import { TraitHoverCard } from './TraitHoverCard.tsx'
import styles from './HeroTraitButton.module.css'

interface HeroTraitButtonProps {
  drawer: DrawerId
  doc: HeroDoc
  icon: string
}

/** Trait badge beside the hero name: hover previews the card, click opens it in full. */
export function HeroTraitButton({ drawer, doc, icon }: HeroTraitButtonProps) {
  const openDrawer = useUiStore((s) => s.openDrawer)
  const setOpenDrawer = useUiStore((s) => s.setOpenDrawer)
  const button = useRef<HTMLButtonElement>(null)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const cardId = useId()

  const show = () => button.current && setAnchor(button.current.getBoundingClientRect())
  const hide = () => setAnchor(null)
  const previewing = anchor !== null && openDrawer === null

  return (
    <>
      <button
        ref={button}
        type="button"
        className={styles.trait}
        aria-label={`${doc.summary.kicker}: ${doc.summary.title}`}
        aria-haspopup="dialog"
        aria-expanded={openDrawer === drawer}
        aria-describedby={previewing ? cardId : undefined}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && show()}
        onBlur={hide}
        onClick={() => {
          hide()
          setOpenDrawer(drawer)
        }}
      >
        <img src={icon} alt="" />
      </button>
      {previewing && <TraitHoverCard id={cardId} summary={doc.summary} anchor={anchor} />}
    </>
  )
}
