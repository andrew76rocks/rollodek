import styles from './PlayArea.module.css'

/** Staging strip where committed cards sit before resolving. */
export function PlayArea() {
  return (
    <section className={styles.area}>
      <h2 className={styles.label}>Play Area</h2>
      {/* Button is inert until check resolution exists */}
      <button type="button" className={styles.playButton} disabled>
        Play Cards
      </button>
    </section>
  )
}
