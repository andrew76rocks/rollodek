/**
 * Placeholder Scene art: one wide SVG per Scene (sky, sun, ruined skyline,
 * ground), which each card shows a slice of. TODO(drew): replace with real
 * Scene panoramas from Figma when they exist.
 */
const PALETTES = [
  { sky: ['#6b5b8d', '#b8944e'], sun: '#fae6b4', city: '#3a3027', ground: '#2b2419' },
  { sky: ['#5a6878', '#7ba3c4'], sun: '#e8e0d4', city: '#2d3740', ground: '#1f2a33' },
  { sky: ['#1e1a2e', '#6b5b8d'], sun: '#b8944e', city: '#231e36', ground: '#151222' },
]

export function panoramaUrl(scene: number): string {
  const p = PALETTES[(scene - 1) % PALETTES.length]
  const W = 1200
  const H = 300
  // Deterministic skyline per Scene
  let seed = scene * 9301 + 49297
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  let x = 0
  const buildings: string[] = []
  while (x < W) {
    const w = 30 + rand() * 70
    const h = 40 + rand() * 120
    const lean = rand() > 0.75 ? rand() * 14 - 7 : 0 // a few collapsed-looking roofs
    buildings.push(`<path d="M${x} ${H - 60} V${H - 60 - h} L${x + w} ${H - 60 - h + lean} V${H - 60} Z"/>`)
    x += w + rand() * 18
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#s)"/>
<circle cx="${W * (0.25 + (scene % 3) * 0.25)}" cy="${H * 0.35}" r="34" fill="${p.sun}" opacity="0.7"/>
<g fill="${p.city}">${buildings.join('')}</g>
<rect y="${H - 62}" width="${W}" height="62" fill="${p.ground}"/>
</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
