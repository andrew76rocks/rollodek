import { useEffect, useRef, useState } from 'react'
import { uiAssets } from '../../config/assets.ts'
import { logEvent } from '../../store/eventLogStore.ts'
import { MaskIcon } from '../MaskIcon.tsx'
import { registerRollAllDice } from './diceCommands.ts'
import { DicePair } from './DicePair.tsx'
import { rollD6, ROLL_SECONDS, type DieState, type DieValue } from './diceConfig.ts'
import styles from './DiceControls.module.css'

const DIE_COUNT = 2
const DIE_NAMES = ['blue', 'violet'] as const

/**
 * Footer dice cluster: shuffle (roll both), the two dice, and a readout of
 * their faces. Owns the dice state so all three stay in sync.
 */
export function DiceControls() {
  // What each die is rolling toward (drives the 3D animation)
  const [dice, setDice] = useState<DieState[]>(() => Array.from({ length: DIE_COUNT }, () => ({ value: 3, rollId: 0 })))
  // What each die currently shows; catches up when the roll lands, so the
  // readout never spoils a result mid-tumble
  const [landed, setLanded] = useState<DieValue[]>(() => Array(DIE_COUNT).fill(3))

  const rollingUntil = useRef<number[]>(Array(DIE_COUNT).fill(0))
  const landTimers = useRef<number[]>([])
  useEffect(() => () => landTimers.current.forEach(clearTimeout), [])

  /** Roll the given dice; any die already mid-roll is left alone. */
  const roll = (indices: number[]) => {
    const now = performance.now()
    const idle = indices.filter((i) => now >= rollingUntil.current[i])
    if (idle.length === 0) return

    const results = new Map(idle.map((i) => [i, rollD6()]))
    idle.forEach((i) => (rollingUntil.current[i] = now + ROLL_SECONDS * 1000))
    setDice((prev) => prev.map((d, i) => (results.has(i) ? { value: results.get(i)!, rollId: d.rollId + 1 } : d)))

    const timer = window.setTimeout(() => {
      setLanded((prev) => prev.map((v, i) => results.get(i) ?? v))
      logRoll(results)
    }, ROLL_SECONDS * 1000)
    landTimers.current.push(timer)
  }

  // The R shortcut rolls both, same as the shuffle button (latest roll() each render)
  useEffect(() => {
    registerRollAllDice(() => roll([0, 1]))
    return () => registerRollAllDice(null)
  })

  return (
    <>
      <button
        type="button"
        className={styles.shuffle}
        aria-label="Roll both dice"
        onClick={() => roll([0, 1])}
      >
        <MaskIcon src={uiAssets.icons.shuffle} size={32} />
      </button>
      <DicePair dice={dice} landed={landed} onRoll={(i) => roll([i])} />
      <output className={styles.readout} aria-live="polite" aria-label={`Dice showing ${landed.join(' and ')}`}>
        {landed.join(' / ')}
      </output>
    </>
  )
}

/** Logged when the dice land, so the record matches what the player sees. */
function logRoll(results: Map<number, DieValue>) {
  const rolled = [...results].sort(([a], [b]) => a - b)
  const data = Object.fromEntries(rolled.map(([i, v]) => [DIE_NAMES[i], v]))
  const message =
    rolled.length === 1
      ? `Rolled the ${DIE_NAMES[rolled[0][0]]} die: ${rolled[0][1]}`
      : `Rolled both dice: ${rolled.map(([, v]) => v).join(' and ')}`
  logEvent('dice.roll', message, data)
}
