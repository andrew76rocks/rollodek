import { RoundedBox } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import {
  CanvasTexture,
  Euler,
  MeshStandardMaterial,
  Quaternion,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from 'three'
import {
  HOVER_EASE,
  ROLL_HOP,
  ROLL_SECONDS,
  ROLL_TURNS,
  type DieHover,
  type DieState,
  type DieValue,
} from './diceConfig.ts'
import styles from './DicePair.module.css'

/*
 * One transparent canvas holding both footer dice. Orthographic camera so the
 * dice read like the flat Figma art. Colors come from the CSS palette tokens.
 */

const FACE_OFFSET = 0.501 // just above the cube surface so pips don't z-fight
const PIP_RADIUS = 0.085
const PIP_SPREAD = 0.26

// Pip layouts on a face, in face-local (u, v) units. Opposite faces sum to 7.
const PIPS: Record<DieValue, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, 1], [1, -1]],
  3: [[-1, 1], [0, 0], [1, -1]],
  4: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
  5: [[-1, 1], [1, 1], [0, 0], [-1, -1], [1, -1]],
  6: [[-1, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [1, -1]],
}

// Where each value sits on the cube (die-local), and the rotation that turns
// that face to point up (+y) — i.e. what "rolled a N" looks like.
const FACES: {
  value: DieValue
  normal: [number, number, number]
  rotation: [number, number, number]
  faceUp: [number, number, number]
}[] = [
  { value: 3, normal: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0], faceUp: [0, 0, 0] },
  { value: 4, normal: [0, -1, 0], rotation: [Math.PI / 2, 0, 0], faceUp: [Math.PI, 0, 0] },
  { value: 5, normal: [1, 0, 0], rotation: [0, Math.PI / 2, 0], faceUp: [0, 0, Math.PI / 2] },
  { value: 2, normal: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0], faceUp: [0, 0, -Math.PI / 2] },
  { value: 6, normal: [0, 0, 1], rotation: [0, 0, 0], faceUp: [-Math.PI / 2, 0, 0] },
  { value: 1, normal: [0, 0, -1], rotation: [0, Math.PI, 0], faceUp: [Math.PI / 2, 0, 0] },
]

const FACE_UP = Object.fromEntries(
  FACES.map(({ value, faceUp }) => [value, new Quaternion().setFromEuler(new Euler(...faceUp))]),
) as Record<DieValue, Quaternion>

// Resting pose: roughly the 3/4 view of the Figma die art
const REST_TILT_X = 0.62
const REST_TURN_Y = -Math.PI / 4

// Lighting balance: lower SIDE_FILL / higher TOP_KEY = more contrast between top and sides
const SIDE_FILL = 1
const TOP_KEY = 3

const IDLE_BOB = 0.035 // world units of float
const IDLE_SPEED = 1.6 // radians per second

// Contact shadow: a soft ellipse on the "table" under each die. The camera
// faces the dice head-on, so a real ground plane would be edge-on and invisible.
const SHADOW_Y = -0.82 // just below the die's lowest corner at rest
const SHADOW_SIZE: [number, number] = [1.15, 0.3] // ellipse width, height (world units)
const SHADOW_OPACITY = 0.34 // at rest; fainter as the die floats up

// Hover highlight: the held die lights up from within and glows
const HOVER_BODY_GLOW = 0.5 // self-illumination in the die's own color (lifts the shaded sides)
const HOVER_PIP_GLOW = 0.7 // pips brighten to full white on every face
const HOVER_HALO_OPACITY = 0.2 // soft colored halo behind the die
const HALO_SIZE = 1.75 // halo diameter (world units); keep within --die-overscan
const HALO_CORE = 0.42 // share of the halo radius that stays solid before fading
const HOVER_SHADOW_FADE = 0.5 // contact shadow keeps this share of its strength while held

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** Radial falloff texture (solid core → transparent edge), for shadows and halos. `color` is a #rrggbb token. */
function makeRadialTexture(color: string, core = 0) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, color)
  g.addColorStop(core, color)
  // Fade to the same color at zero alpha; 'transparent' is transparent *black*
  // and would darken the edge into a murky ring
  g.addColorStop(1, `${color.slice(0, 7)}00`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(canvas)
}

interface DieProps {
  state: DieState
  hover: RefObject<DieHover>
  pxToWorld: number
  color: string
  shadowTexture: CanvasTexture
  haloTexture: CanvasTexture
  pipColor: string
  x: number
  phase: number
  animate: boolean
}

function Die({ state, hover, pxToWorld, color, shadowTexture, haloTexture, pipColor, x, phase, animate }: DieProps) {
  const tumble = useRef<Group>(null) // rest pose + idle sway + roll tumble + hop
  const face = useRef<Group>(null) // which value is up
  const shadow = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  // Shared per die so hover can brighten body and all 21 pips in one place
  const bodyMaterial = useMemo(
    () => new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, emissive: color, emissiveIntensity: 0 }),
    [color],
  )
  const pipMaterial = useMemo(
    () => new MeshStandardMaterial({ color: pipColor, roughness: 0.6, emissive: pipColor, emissiveIntensity: 0 }),
    [pipColor],
  )
  const invalidate = useThree((s) => s.invalidate)

  const roll = useRef<{ start: number | null; from: Quaternion; to: Quaternion }>({
    start: null,
    from: new Quaternion(),
    to: FACE_UP[state.value],
  })
  const seenRollId = useRef(state.rollId)
  // Smoothed hover: 0 = floating freely, 1 = held still; lift in world units
  const held = useRef(0)
  const lift = useRef(0)
  // Initial face only: passed as a stable object so re-renders don't snap the
  // die to a new value before the roll animation reads where it's starting from
  const initialFace = useRef(FACE_UP[state.value].clone()).current

  // Without motion, just snap to the new face
  useEffect(() => {
    if (animate || !face.current) return
    face.current.quaternion.copy(FACE_UP[state.value])
    invalidate()
  }, [animate, state.value, invalidate])

  useFrame(({ clock }, delta) => {
    const g = tumble.current
    const f = face.current
    if (!g || !f || !animate) return
    const t = clock.getElapsedTime()

    // A new rollId starts a roll from wherever the die currently is
    if (state.rollId !== seenRollId.current) {
      seenRollId.current = state.rollId
      roll.current = { start: t, from: f.quaternion.clone(), to: FACE_UP[state.value] }
    }

    let spin = 0
    let hop = 0
    const r = roll.current
    if (r.start !== null) {
      const p = Math.min((t - r.start) / ROLL_SECONDS, 1)
      const e = easeOutCubic(p)
      // Blend toward the new face; extra full turns end back at zero so it lands exactly
      f.quaternion.slerpQuaternions(r.from, r.to, e)
      spin = e * Math.PI * 2 * ROLL_TURNS
      hop = Math.sin(p * Math.PI) * ROLL_HOP
      if (p === 1) r.start = null
    }

    // Hover magnet: ease the idle float out and lift toward the cursor (y only)
    const h = hover.current
    const k = 1 - Math.exp(-delta * HOVER_EASE)
    held.current += ((h.active ? 1 : 0) - held.current) * k
    lift.current += (h.liftPx * pxToWorld - lift.current) * k
    const free = 1 - held.current

    const bob = Math.sin(t * IDLE_SPEED + phase) // -1 (low) … 1 (high)
    const sway = Math.sin(t * IDLE_SPEED * 0.5 + phase) * 0.06
    g.position.y = bob * IDLE_BOB * free + lift.current + hop
    g.rotation.set(REST_TILT_X + spin, REST_TURN_Y + spin + sway * free, 0)

    // Die rises → shadow spreads and fades; dips → tightens and darkens
    // Highlight: glow in with the same smoothed hover value as the lift
    bodyMaterial.emissiveIntensity = held.current * HOVER_BODY_GLOW
    pipMaterial.emissiveIntensity = held.current * HOVER_PIP_GLOW
    const hl = halo.current
    if (hl) {
      hl.position.y = g.position.y
      ;(hl.material as MeshBasicMaterial).opacity = held.current * HOVER_HALO_OPACITY
    }

    const s = shadow.current
    if (s) {
      // Height above the table: float (0–1, fades while held) + hover lift (~1 at 6px) + hop (up to 2)
      const height = Math.min(((bob + 1) / 2) * free + ((lift.current + hop) / ROLL_HOP) * 2, 2)
      const spread = 0.94 + height * 0.1
      s.scale.set(SHADOW_SIZE[0] * spread, SHADOW_SIZE[1] * spread, 1)
      const hoverFade = 1 - held.current * (1 - HOVER_SHADOW_FADE)
      ;(s.material as MeshBasicMaterial).opacity = SHADOW_OPACITY * Math.max(1.15 - height * 0.35, 0.3) * hoverFade
    }
  })

  return (
    <group position={[x, 0, 0]}>
      {/* Behind the die (z) so it never draws over it */}
      <mesh ref={shadow} position={[0, SHADOW_Y, -2]} scale={[SHADOW_SIZE[0], SHADOW_SIZE[1], 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTexture} transparent opacity={SHADOW_OPACITY} depthWrite={false} />
      </mesh>
      {/* Hover halo: soft glow in the die's color, between shadow and die. Normal
          (not additive) blending, so it composites reliably on the transparent canvas */}
      <mesh ref={halo} position={[0, 0, -1]} scale={[HALO_SIZE, HALO_SIZE, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={haloTexture}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <group ref={tumble} rotation={[REST_TILT_X, REST_TURN_Y, 0]}>
        <group ref={face} quaternion={initialFace}>
          <RoundedBox args={[1, 1, 1]} radius={0.14} smoothness={4} material={bodyMaterial} />
          {FACES.map(({ value, normal, rotation }) => (
            <group
              key={value}
              position={[normal[0] * FACE_OFFSET, normal[1] * FACE_OFFSET, normal[2] * FACE_OFFSET]}
              rotation={rotation}
            >
              {PIPS[value].map(([u, v], i) => (
                // Lit material, so side-face pips dim with their face and the top value stands out
                <mesh key={i} position={[u * PIP_SPREAD, v * PIP_SPREAD, 0]} material={pipMaterial}>
                  <circleGeometry args={[PIP_RADIUS, 24]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}

export default function DiceCanvas({ dice, hover }: { dice: DieState[]; hover: RefObject<DieHover>[] }) {
  const colors = useMemo(
    () => ({ blue: cssVar('--potion-blue'), violet: cssVar('--dusk-violet'), pip: cssVar('--ivory-mist') }),
    [],
  )
  const shadowTexture = useMemo(() => makeRadialTexture(cssVar('--dungeon-ink')), [])
  const haloTextures = useMemo(
    () => ({ blue: makeRadialTexture(colors.blue, HALO_CORE), violet: makeRadialTexture(colors.violet, HALO_CORE) }),
    [colors],
  )
  const animate = useMemo(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // Die centers sit (die size + gap) / 2 px either side of the canvas center
  const { x, zoom } = useMemo(() => {
    const size = parseFloat(cssVar('--die-size'))
    const gap = parseFloat(cssVar('--die-gap'))
    const zoom = size * 0.68 // px per world unit: a tilted unit cube fills the die slot
    return { x: (size + gap) / 2 / zoom, zoom }
  }, [])

  const common = { shadowTexture, pipColor: colors.pip, animate, pxToWorld: 1 / zoom }

  return (
    // Clicks go to the DOM buttons in DicePair; the canvas ignores pointer events
    <div className={styles.canvasArea} aria-hidden>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        flat // no filmic tone mapping: keeps the palette colors true, like the flat Figma art
        frameloop={animate ? 'always' : 'demand'}
        // R3F's wrapper sets pointer-events: auto inline; the overscan would then
        // swallow clicks meant for the shuffle button beside it
        style={{ pointerEvents: 'none' }}
      >
        {/* Low fill + strong near-overhead key: the top face (the rolled value)
            stays bright while the side faces fall into shade */}
        <ambientLight intensity={SIDE_FILL} />
        <directionalLight position={[-0.6, 6, 1.2]} intensity={TOP_KEY} />
        <Die state={dice[0]} hover={hover[0]} color={colors.blue} haloTexture={haloTextures.blue} x={-x} phase={0} {...common} />
        <Die state={dice[1]} hover={hover[1]} color={colors.violet} haloTexture={haloTextures.violet} x={x} phase={Math.PI / 2} {...common} />
      </Canvas>
    </div>
  )
}
