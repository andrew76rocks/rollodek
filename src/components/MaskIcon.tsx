import type { CSSProperties } from 'react'
import styles from './MaskIcon.module.css'

interface MaskIconProps {
  src: string
  size: number
}

/**
 * Renders a single-color exported SVG as a mask filled with currentColor,
 * so the Figma artwork tints with the surrounding text color.
 */
export function MaskIcon({ src, size }: MaskIconProps) {
  const style = { '--icon-src': `url("${src}")`, width: size, height: size } as CSSProperties
  return <span className={styles.icon} style={style} aria-hidden />
}
