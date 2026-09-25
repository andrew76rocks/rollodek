import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { simplex3 } from './noise.ts'
import styles from './AmbientFirelight.module.css'

/**
 * Firelight: warm light cast up over the wood, as if a fire burned just off
 * the table's front edge. Meant to be felt more than seen.
 *
 * It has texture rather than being a smooth glow: moving noise breaks the
 * light into uneven, mottled patches that drift upward like heat off a fire
 * and keep reshaping, while the whole light flickers underneath.
 *
 * Drawn on a small canvas (1/SCALE of the screen) that the browser stretches
 * to fill the table. The stretch softens it into light rather than pixels,
 * and keeps the per-frame work to a few thousand samples. Only pixels the
 * fire can actually reach are computed. Capped at 30fps; the browser pauses
 * it in a hidden tab. Reduced motion draws one still frame, so the warmth
 * and texture stay but nothing moves.
 */

/**
 * On/off switch. Off, nothing mounts at all (no canvas, no animation loop),
 * so it costs nothing; every setting below stays as tuned, ready to switch
 * back on and keep adjusting.
 */
const FIRELIGHT_ENABLED = false

const SCALE = 8 // one canvas pixel per 8 CSS px
const FRAME_MS = 1000 / 30
const PEAK = 0.24 // strongest the light gets; texture keeps the average well below
const FIRE: [number, number, number] = [184, 148, 78] // Ember Gold

const CELL = 220 // CSS px per noise cell: the size of the light's patches
const RISE = 0.16 // cells per second the texture drifts upward
const CHURN = 0.22 // how quickly the patches reshape as they rise
const TEXTURE_FLOOR = 0.35 // the dimmest a patch gets, relative to the fire's full light

// Where the light comes from, in table fractions: below the front edge,
// left a little stronger so it reads as one fire rather than two lamps
const SOURCES = [
  { x: 0.18, y: 1.08, rx: 0.58, ry: 0.66, strength: 1 },
  { x: 0.84, y: 1.1, rx: 0.5, ry: 0.58, strength: 0.8 },
]

const smoothstep = (k: number) => k * k * (3 - 2 * k)

export function AmbientFirelight() {
  // A separate component, so switching off never skips a hook mid-render
  return FIRELIGHT_ENABLED ? <FirelightCanvas /> : null
}

function FirelightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 1
    let image = ctx.createImageData(1, 1)
    let falloff = new Float32Array(0)
    let lit = new Int32Array(0) // only the pixels the fire reaches

    // Light footprint depends only on size, so it's worked out once per resize
    const resize = () => {
      width = Math.max(1, Math.ceil(canvas.clientWidth / SCALE))
      const height = Math.max(1, Math.ceil(canvas.clientHeight / SCALE))
      canvas.width = width
      canvas.height = height
      image = ctx.createImageData(width, height)
      falloff = new Float32Array(width * height)
      const reached: number[] = []
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x
          let f = 0
          for (const s of SOURCES) {
            const k = 1 - ((x / width - s.x) / s.rx) ** 2 - ((y / height - s.y) / s.ry) ** 2
            if (k > 0) f += s.strength * smoothstep(Math.min(k, 1))
          }
          falloff[i] = Math.min(f, 1)
          if (falloff[i] > 0.003) reached.push(i)
          // The colour never changes, only how much of it shows
          image.data[i * 4] = FIRE[0]
          image.data[i * 4 + 1] = FIRE[1]
          image.data[i * 4 + 2] = FIRE[2]
        }
      }
      lit = Int32Array.from(reached)
    }

    const draw = (t: number) => {
      // The whole fire flickers: a slow swell plus a quicker waver
      const flicker = Math.min(1, Math.max(0.55, 0.82 + 0.12 * simplex3(t * 0.9, 11.3, 4.7) + 0.08 * simplex3(t * 3.1, 2.9, 8.1)))
      const rise = t * RISE
      const churn = t * CHURN
      const data = image.data
      for (let n = 0; n < lit.length; n++) {
        const i = lit[n]
        const x = ((i % width) * SCALE) / CELL
        const y = (Math.floor(i / width) * SCALE) / CELL + rise
        // Two octaves: broad patches, with finer breakup inside them
        const noise = simplex3(x, y, churn) + 0.5 * simplex3(x * 2.1, y * 2.1, churn * 1.7)
        const patch = Math.min(1, Math.max(0, noise / 1.5 / 2 + 0.5))
        const texture = TEXTURE_FLOOR + (1 - TEXTURE_FLOOR) * patch
        data[i * 4 + 3] = falloff[i] * texture * flicker * PEAK * 255
      }
      ctx.putImageData(image, 0, 0)
    }

    let frame = 0
    let last = 0
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (now - last < FRAME_MS) return
      last = now
      draw(now / 1000)
    }

    const redraw = () => {
      resize()
      draw(reduceMotion ? 0 : performance.now() / 1000)
    }
    redraw()
    if (!reduceMotion) frame = requestAnimationFrame(loop)

    const observer = new ResizeObserver(redraw)
    observer.observe(canvas)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} className={styles.firelight} aria-hidden />
}
