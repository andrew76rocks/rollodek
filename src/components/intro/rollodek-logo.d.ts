/** Types for the <rollodek-logo> custom element (rollodek-logo.js, from Claude Design) */
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface RolloDekLogoElement extends HTMLElement {
  readonly duration: number
  play(): void
  pause(): void
  replay(): void
  seek(seconds: number): void
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'rollodek-logo': DetailedHTMLProps<HTMLAttributes<RolloDekLogoElement>, RolloDekLogoElement> & {
        color?: string
        framing?: 'stage' | 'logo'
        spin?: string
        shadow?: 'false'
        paused?: boolean
        loop?: boolean
      }
    }
  }
}
