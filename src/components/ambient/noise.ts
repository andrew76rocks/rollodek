/**
 * 3D simplex noise (Stefan Gustavson's public-domain algorithm), for the
 * firelight's moving texture. Smooth, organic, and cheap enough to sample a
 * few thousand times a frame. Returns roughly -1 … 1.
 *
 * The permutation is seeded, so the pattern is the same on every load.
 */

// Small seeded PRNG (mulberry32), only used to shuffle the permutation once
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
]

const perm = new Uint8Array(512)
const permMod12 = new Uint8Array(512)
{
  const random = mulberry32(0x5eed)
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const swap = p[i]
    p[i] = p[j]
    p[j] = swap
  }
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
    permMod12[i] = perm[i] % 12
  }
}

const F3 = 1 / 3
const G3 = 1 / 6

function corner(gi: number, x: number, y: number, z: number): number {
  let t = 0.6 - x * x - y * y - z * z
  if (t < 0) return 0
  t *= t
  const g = GRAD3[gi]
  return t * t * (g[0] * x + g[1] * y + g[2] * z)
}

export function simplex3(xin: number, yin: number, zin: number): number {
  // Skew into the simplex grid to find which cell we're in
  const s = (xin + yin + zin) * F3
  const i = Math.floor(xin + s)
  const j = Math.floor(yin + s)
  const k = Math.floor(zin + s)
  const t = (i + j + k) * G3
  const x0 = xin - (i - t)
  const y0 = yin - (j - t)
  const z0 = zin - (k - t)

  // Which of the six tetrahedra the point falls in
  let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number
  if (x0 >= y0) {
    if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0]
    else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1]
    else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1]
  } else {
    if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1]
    else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1]
    else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0]
  }

  const ii = i & 255
  const jj = j & 255
  const kk = k & 255
  const n0 = corner(permMod12[ii + perm[jj + perm[kk]]], x0, y0, z0)
  const n1 = corner(permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]], x0 - i1 + G3, y0 - j1 + G3, z0 - k1 + G3)
  const n2 = corner(permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]], x0 - i2 + 2 * G3, y0 - j2 + 2 * G3, z0 - k2 + 2 * G3)
  const n3 = corner(permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]], x0 - 1 + 3 * G3, y0 - 1 + 3 * G3, z0 - 1 + 3 * G3)

  return 32 * (n0 + n1 + n2 + n3)
}
