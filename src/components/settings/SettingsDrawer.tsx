import {
  ArrowCounterClockwiseIcon,
  CopyIcon,
  DownloadSimpleIcon,
  FloppyDiskIcon,
  MinusIcon,
  PlusIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DC_TIERS,
  defaultGameConfig,
  getAt,
  setAt,
  useGameConfigStore,
  type DcTier,
  type GameConfig,
} from '../../config/gameConfig.ts'
import { logEvent } from '../../store/eventLogStore.ts'
import { useUiStore } from '../../store/uiStore.ts'
import { SideDrawer } from '../drawer/SideDrawer.tsx'
import { canSaveToFile, configToJson, downloadConfig, saveConfigToFile } from './saveConfigFile.ts'
import { configWarnings, dcRange, FIELD_LABELS, SETTINGS_SECTIONS, TIER_LABELS, type SettingField } from './settingsSchema.ts'
import styles from './SettingsDrawer.module.css'

/** Game configuration form: overrides game-config.json for playtesting. */
export function SettingsDrawer() {
  const open = useUiStore((s) => s.openDrawer === 'settings')
  const setOpenDrawer = useUiStore((s) => s.setOpenDrawer)
  const close = useCallback(() => setOpenDrawer(null), [setOpenDrawer])

  // On close, record what changed during this visit in the event log
  const snapshot = useRef<GameConfig | null>(null)
  useEffect(() => {
    const current = useGameConfigStore.getState().config
    if (open) {
      snapshot.current = current
      return
    }
    if (!snapshot.current) return
    const changes = diffConfig(snapshot.current, current)
    snapshot.current = null
    if (changes.length) logEvent('settings.change', `Settings changed: ${changes.join(', ')}`, { changes })
  }, [open])

  return (
    <SideDrawer open={open} onClose={close} title="Settings" width={640}>
      <SettingsForm />
    </SideDrawer>
  )
}

function SettingsForm() {
  const config = useGameConfigStore((s) => s.config)
  const setConfig = useGameConfigStore((s) => s.setConfig)
  const reset = useGameConfigStore((s) => s.reset)
  const warnings = configWarnings(config)
  const modifiedCount = diffConfig(defaultGameConfig, config).length
  const update = (path: string, value: unknown) => setConfig(setAt(config, path, value))

  // Brief status in the footer after a save ("Saved to game-config.json")
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const saveToFile = async () => {
    try {
      const name = await saveConfigToFile(config)
      if (!name) return // cancelled
      setSaveStatus(`Saved to ${name}`)
      logEvent('settings.change', `Saved settings to ${name}`)
    } catch (err) {
      setSaveStatus('Save failed — try Copy JSON instead')
      console.error(err)
    }
    window.setTimeout(() => setSaveStatus(null), 4000)
  }

  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => scroller.current?.focus({ preventScroll: true }), [])

  return (
    <>
      <div ref={scroller} className={styles.scroller} tabIndex={-1}>
        <p className={styles.intro}>
          Tune the rules for playtesting. Defaults come from <code>src/data/game-config.json</code>; your changes are
          saved in this browser. Export to put them in the repo.
        </p>

        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.id} className={styles.section} aria-labelledby={`settings-${section.id}`}>
            <h3 id={`settings-${section.id}`} className={styles.sectionTitle}>
              {section.title}
            </h3>
            {section.description && <p className={styles.sectionDescription}>{section.description}</p>}

            {section.id === 'dc' && (
              <p className={styles.computed}>
                DC ranges now: Easy {dcRange(config, config.dc.easyOffset).join('–')} · Medium{' '}
                {dcRange(config, config.dc.mediumOffset).join('–')} · Dangerous{' '}
                {dcRange(config, config.dc.dangerousOffset).join('–')}
              </p>
            )}

            <div className={styles.fields}>
              {section.fields.map((field) => (
                <FieldRow
                  key={field.path}
                  field={field}
                  value={getAt(config, field.path)}
                  defaultValue={getAt(defaultGameConfig, field.path)}
                  onChange={(v) => update(field.path, v)}
                />
              ))}
            </div>

            {warnings[section.id] && (
              <p className={styles.warning} role="status">
                <WarningIcon size={16} weight="fill" aria-hidden />
                {warnings[section.id]}
              </p>
            )}
          </section>
        ))}
      </div>

      <footer className={styles.footer}>
        <span className={styles.modified} role="status">
          {saveStatus ??
            (modifiedCount === 0 ? 'All defaults' : `${modifiedCount} setting${modifiedCount === 1 ? '' : 's'} changed`)}
        </span>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={reset} disabled={modifiedCount === 0}>
            <ArrowCounterClockwiseIcon size={16} weight="bold" aria-hidden /> Reset all
          </button>
          <CopyButton config={config} />
          {canSaveToFile ? (
            <button type="button" className={styles.primary} onClick={saveToFile}>
              <FloppyDiskIcon size={16} weight="bold" aria-hidden /> Save to…
            </button>
          ) : (
            // Safari / Firefox: no save dialog API, so a plain download
            <button type="button" className={styles.primary} onClick={() => downloadConfig(config)}>
              <DownloadSimpleIcon size={16} weight="bold" aria-hidden /> Download JSON
            </button>
          )}
        </div>
      </footer>
    </>
  )
}

interface FieldRowProps {
  field: SettingField
  value: unknown
  defaultValue: unknown
  onChange: (value: unknown) => void
}

function FieldRow({ field, value, defaultValue, onChange }: FieldRowProps) {
  const modified = JSON.stringify(value) !== JSON.stringify(defaultValue)
  const inputId = `setting-${field.path}`

  return (
    <div className={styles.row} data-modified={modified || undefined}>
      <div className={styles.labelCol}>
        <label htmlFor={inputId} className={styles.label}>
          {field.label}
        </label>
        {field.help && <p className={styles.help}>{field.help}</p>}
      </div>

      <div className={styles.controlCol}>
        {field.kind === 'int' && (
          <NumberInput id={inputId} value={value as number} min={field.min} max={field.max} onChange={onChange} />
        )}
        {field.kind === 'toggle' && (
          <button
            id={inputId}
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            className={styles.switch}
            onClick={() => onChange(!value)}
          >
            <span className={styles.switchThumb} />
          </button>
        )}
        {field.kind === 'tiers' && (
          <TierPicker id={inputId} value={value as DcTier[]} onChange={onChange} />
        )}
        <button
          type="button"
          className={styles.resetField}
          onClick={() => onChange(defaultValue)}
          aria-label={`Reset ${field.label} to default (${formatValue(defaultValue)})`}
          title={`Default: ${formatValue(defaultValue)}`}
          disabled={!modified}
        >
          <ArrowCounterClockwiseIcon size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}

/** Stepper + typed entry; typing keeps a draft and clamps into range on blur. */
function NumberInput({ id, value, min, max, onChange }: { id: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)))

  const commit = () => {
    if (draft === null) return
    const n = Number(draft)
    if (draft.trim() !== '' && Number.isFinite(n)) onChange(clamp(n))
    setDraft(null)
  }

  return (
    <div className={styles.stepper}>
      <button type="button" aria-label="Decrease" tabIndex={-1} disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        <MinusIcon size={14} weight="bold" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft ?? value}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = Number(e.target.value)
          if (e.target.value.trim() !== '' && Number.isInteger(n) && n >= min && n <= max) onChange(n)
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
      <button type="button" aria-label="Increase" tabIndex={-1} disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        <PlusIcon size={14} weight="bold" />
      </button>
    </div>
  )
}

function TierPicker({ id, value, onChange }: { id: string; value: DcTier[]; onChange: (v: DcTier[]) => void }) {
  return (
    <div id={id} role="group" className={styles.tiers}>
      {DC_TIERS.map((tier) => {
        const on = value.includes(tier)
        return (
          <button
            key={tier}
            type="button"
            aria-pressed={on}
            className={styles.tier}
            onClick={() => onChange(on ? value.filter((t) => t !== tier) : DC_TIERS.filter((t) => t === tier || value.includes(t)))}
          >
            {TIER_LABELS[tier]}
          </button>
        )
      })}
    </div>
  )
}

function CopyButton({ config }: { config: GameConfig }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={styles.secondary}
      onClick={async () => {
        await navigator.clipboard.writeText(configToJson(config))
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      }}
    >
      <CopyIcon size={16} weight="bold" aria-hidden /> {copied ? 'Copied!' : 'Copy JSON'}
    </button>
  )
}

function formatValue(v: unknown) {
  if (Array.isArray(v)) return v.length ? v.map((t) => TIER_LABELS[t as DcTier] ?? t).join(', ') : 'none'
  if (typeof v === 'boolean') return v ? 'on' : 'off'
  return String(v)
}

/** "Hand size 5 → 6" for every schema field that differs between two configs. */
function diffConfig(before: GameConfig, after: GameConfig) {
  return Object.keys(FIELD_LABELS)
    .filter((path) => JSON.stringify(getAt(before, path)) !== JSON.stringify(getAt(after, path)))
    .map((path) => `${FIELD_LABELS[path]} ${formatValue(getAt(before, path))} → ${formatValue(getAt(after, path))}`)
}
