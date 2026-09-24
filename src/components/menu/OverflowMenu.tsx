import { DotsThreeVerticalIcon, PlusIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { startNewGame } from '../../store/newGame.ts'
import { ConfirmDialog } from '../dialog/ConfirmDialog.tsx'
import styles from './OverflowMenu.module.css'

/** ⋮ menu at the far right of the top bar for rare, session-level actions. */
export function OverflowMenu({ buttonClassName }: { buttonClassName: string }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuId = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const firstItem = useRef<HTMLButtonElement>(null)

  // Close on click elsewhere
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  const openMenu = (focusFirst: boolean) => {
    setOpen(true)
    if (focusFirst) requestAnimationFrame(() => firstItem.current?.focus())
  }

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role=menuitem]'))]
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape') {
      setOpen(false)
      trigger.current?.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={root} className={styles.anchor}>
      <button
        ref={trigger}
        type="button"
        className={buttonClassName}
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => (open ? setOpen(false) : openMenu(e.detail === 0))} // detail 0 = keyboard
      >
        <DotsThreeVerticalIcon size={24} weight="bold" />
      </button>

      {open && (
        <div id={menuId} role="menu" aria-label="More" className={styles.menu} onKeyDown={onMenuKey}>
          <button
            ref={firstItem}
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => {
              setOpen(false)
              setConfirming(true)
            }}
          >
            <PlusIcon size={18} weight="bold" aria-hidden />
            New Game
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Start a new game?"
        confirmLabel="Continue"
        onConfirm={startNewGame}
        onCancel={() => {
          setConfirming(false)
          trigger.current?.focus()
        }}
      >
        <p>All current game session data will be lost:</p>
        <ul>
          <li>the event log</li>
          <li>dice and game progress</li>
          <li>tuned Settings (back to the defaults in game-config.json)</li>
          <li>layout and display preferences</li>
        </ul>
      </ConfirmDialog>
    </div>
  )
}
