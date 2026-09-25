import { Particles, ParticlesProvider, useParticlesProvider } from '@tsparticles/react'
import type { ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { useReducedMotion } from 'framer-motion'
import styles from './AmbientDust.module.css'

/**
 * Dust motes drifting through lantern light, over the wood and under
 * everything on the table. Purely atmospheric: no interaction, nothing reads
 * or reacts to it.
 *
 * Kept deliberately faint and slow — it should be felt more than seen. Every
 * knob is below so it can be tuned by eye.
 *
 * tsparticles v4 dropped the `motion` option that honoured prefers-reduced-motion,
 * so that's handled here instead: reduced motion renders no particles at all.
 */

// Ember Gold and Mist Lavender, the two deck tones the discard piles light up
// in, so the table's accents and its atmosphere share one palette. Hex rather
// than tokens because the canvas can't read CSS custom properties.
const DUST_COLORS = ['#b8944e', '#a89abf']

const DUST: ISourceOptions = {
  fullScreen: { enable: false }, // contained in the table shell, not a fixed page overlay
  background: { color: 'transparent' },
  detectRetina: true,
  fpsLimit: 30, // slow drift is sub-pixel per frame; 30fps looks the same and halves the cost
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  particles: {
    // ~62 motes on a 1700×1010 table; density keeps it even as the window resizes
    number: { value: 62, density: { enable: true, width: 1700, height: 1010 } },
    paint: { fill: { enable: true, color: { value: DUST_COLORS } } },
    shape: { type: 'circle' },
    size: { value: { min: 0.6, max: 2.2 } },
    // Each mote breathes slowly in and out, never quite in step with its neighbours.
    // Higher than a warm-white mote would need: under `screen` a mote lightens the
    // wood by roughly its colour's brightness, and gold/lavender average ~0.61
    // against ivory's ~0.98. This range keeps the mean mote as bright as the old
    // ivory/parchment/gold mix, while the brightest still stays under its peak.
    opacity: {
      value: { min: 0.05, max: 0.42 },
      animation: { enable: true, speed: 0.25, sync: false, startValue: 'random' },
    },
    // Rising on warm air, each mote on its own slight angle (straight: false
    // spreads headings ±45° off vertical). Speed stays in a narrow band at the
    // slow end so no mote reads as noticeably faster than the rest.
    //
    // No `drift`: in v4 it isn't a constant sway but an acceleration, added to
    // horizontal velocity every frame with no cap (the move plugin's maxSpeed
    // clamp only covers gravity) and doubled on retina. Long-lived motes kept
    // speeding up sideways until they shot off the edge.
    move: {
      enable: true,
      direction: 'top',
      speed: { min: 0.08, max: 0.16 },
      straight: false,
      outModes: { default: 'out' },
    },
  },
}

export function AmbientDust() {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return null
  return (
    <ParticlesProvider init={loadSlim}>
      <DustLayer />
    </ParticlesProvider>
  )
}

function DustLayer() {
  const { loaded } = useParticlesProvider()
  if (!loaded) return null
  return <Particles id="ambient-dust" className={styles.dust} options={DUST} />
}
