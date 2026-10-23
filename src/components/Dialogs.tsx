import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog } from './Dialog.tsx'
import { FootprintForm, type Section } from './FootprintForm.tsx'
import { useApi } from '../context.ts'
import { ACTION_BY_ID, ACTIONS, CATEGORIES, estimateFootprint, GOAL_OPTIONS, REGION_AVERAGE_T } from '../data.ts'
import type { Category, Profile, TabKey } from '../types.ts'
import { dayKey } from '../store.ts'

/* ---------------- Onboarding ---------------- */

const STEPS: { title: string; sub: string; sections: Section[] }[] = [
  { title: 'About you', sub: 'Just the basics — you can change these later.', sections: ['about'] },
  { title: 'Getting around', sub: 'Transport is often the biggest slice.', sections: ['travel'] },
  { title: 'Food & home', sub: 'No right answers, just an honest starting point.', sections: ['home'] },
  { title: 'Everyday habits', sub: 'Almost done!', sections: ['habits'] },
]

export function Onboarding({ onDone }: { onDone: (p: Profile, goals: string[], firstAction: string | null) => void }) {
  const { state } = useApi()
  const [step, setStep] = useState(-1)
  const [profile, setProfile] = useState<Profile>(state.profile)
  const [goals, setGoals] = useState<string[]>(['carbon-10'])
  const fp = estimateFootprint(profile)
  const total = STEPS.length + 1
  const isResult = step === STEPS.length

  return (
    <Dialog title="Welcome to EcoPulse" onClose={() => onDone(profile, goals, null)} className="onboarding">
      {step >= 0 && (
        <div className="ob-progress" aria-label={`Step ${step + 1} of ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i <= step ? 'on' : ''} />
          ))}
        </div>
      )}
      {step === -1 && (
        <div className="ob-welcome">
          <div className="ob-logo" aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" width={84} height={84} />
          </div>
          <h2>Small steps, big impact.</h2>
          <p>EcoPulse helps you understand your footprint and build habits that fit your life. Progress, not perfection.</p>
          <button type="button" className="primary-btn" autoFocus onClick={() => setStep(0)}>
            Get started — 1 minute
          </button>
          <button type="button" className="link-btn" onClick={() => onDone(profile, goals, null)}>
            Skip for now
          </button>
        </div>
      )}
      {step >= 0 && step < STEPS.length && (
        <div className="ob-step" key={step}>
          <h2>{STEPS[step].title}</h2>
          <p className="muted">{STEPS[step].sub}</p>
          <FootprintForm profile={profile} onChange={setProfile} sections={STEPS[step].sections} />
        </div>
      )}
      {isResult && (
        <div className="ob-step">
          <h2>Your baseline</h2>
          <FootprintSummary profile={profile} />
          <p className="eyebrow" style={{ marginTop: '1rem' }}>
            Pick your goals
          </p>
          <div className="goal-list">
            {GOAL_OPTIONS.map((g) => {
              const on = goals.includes(g.id)
              return (
                <button type="button" key={g.id} className={`goal-pill ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setGoals((gs) => (on ? gs.filter((x) => x !== g.id) : [...gs, g.id]))}>
                  <span aria-hidden="true">{on ? '✓' : g.icon}</span> {g.label}
                </button>
              )
            })}
          </div>
          <p className="muted" style={{ marginTop: '0.8rem' }}>
            {fp.carbonYear <= REGION_AVERAGE_T ? 'Nice — you’re already below average. ' : ''}Start with a quick win right now?
          </p>
        </div>
      )}
      {step >= 0 && (
        <div className="dialog-foot">
          <button type="button" className="secondary-btn" onClick={() => setStep(step - 1)}>
            Back
          </button>
          {isResult ? (
            <>
              <button type="button" className="secondary-btn" onClick={() => onDone(profile, goals.length ? goals : ['actions-20'], null)}>
                Finish
              </button>
              <button type="button" className="primary-btn" onClick={() => onDone(profile, goals.length ? goals : ['actions-20'], 'bottle')}>
                🧴 Log my first action
              </button>
            </>
          ) : (
            <button type="button" className="primary-btn" onClick={() => setStep(step + 1)}>
              Next
            </button>
          )}
        </div>
      )}
    </Dialog>
  )
}

function FootprintSummary({ profile }: { profile: Profile }) {
  const fp = estimateFootprint(profile)
  const pct = Math.min(100, (fp.carbonYear / 16) * 100)
  const avgPct = (REGION_AVERAGE_T / 16) * 100
  return (
    <div className="fp-summary">
      <div className="fp-gauge" role="img" aria-label={`${fp.carbonYear} tonnes per year versus ${REGION_AVERAGE_T} average`}>
        <span className="fp-fill" style={{ width: `${pct}%` }} />
        <span className="fp-avg" style={{ left: `${avgPct}%` }} title="Regional average" />
      </div>
      <div className="fp-legend">
        <span>0 t</span>
        <span>avg {REGION_AVERAGE_T} t</span>
        <span>16 t</span>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <p>☁️ Carbon</p>
          <h3>{fp.carbonYear} t/yr</h3>
          <span>{fp.carbonMonth} kg / month</span>
        </div>
        <div className="stat-card">
          <p>💧 Water</p>
          <h3>{fp.waterDay} L</h3>
          <span>per day</span>
        </div>
        <div className="stat-card">
          <p>♻️ Waste</p>
          <h3>{fp.wasteScore}/100</h3>
          <span>recycling score</span>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Footprint calculator ---------------- */

export function Calculator({ onClose }: { onClose: () => void }) {
  const { state, update, toast } = useApi()
  const [profile, setProfile] = useState<Profile>(state.profile)
  const before = estimateFootprint(state.profile)
  const after = estimateFootprint(profile)
  const delta = Math.round((after.carbonYear - before.carbonYear) * 10) / 10
  return (
    <Dialog title="Footprint calculator" onClose={onClose} wide>
      <p className="muted">A friendly, rough estimate — change any answer and watch it update live.</p>
      <div className="calc-grid">
        <FootprintForm profile={profile} onChange={setProfile} sections={['about', 'travel', 'home', 'habits']} />
        <div className="calc-side">
          <FootprintSummary profile={profile} />
          {delta !== 0 && (
            <p className={`delta ${delta < 0 ? 'good' : 'warm'}`}>
              {delta < 0 ? `▼ ${Math.abs(delta)} t/yr lower than your saved answers` : `▲ ${delta} t/yr higher than your saved answers`}
            </p>
          )}
          <BreakdownBars profile={profile} />
        </div>
      </div>
      <div className="dialog-foot">
        <button type="button" className="secondary-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            update((s) => ({ ...s, profile }))
            toast('Footprint updated', { icon: '📊' })
            onClose()
          }}
        >
          Save answers
        </button>
      </div>
    </Dialog>
  )
}

function BreakdownBars({ profile }: { profile: Profile }) {
  const parts = [
    { label: 'Travel', icon: '🚗', v: { car: 3.2, carpool: 1.8, transit: 1.0, bike: 0.2, remote: 0.4 }[profile.commute] + { none: 0, one: 0.6, few: 1.6, many: 3.8 }[profile.flights] },
    { label: 'Food', icon: '🥗', v: { meat: 2.5, flexitarian: 1.9, vegetarian: 1.4, vegan: 1.1 }[profile.diet] },
    { label: 'Home energy', icon: '⚡', v: { low: 2.4, moderate: 4.2, high: 6.6 }[profile.energy] / Math.max(1, Math.sqrt(profile.household)) },
    { label: 'Stuff & waste', icon: '♻️', v: 0.9 + { never: 0.5, sometimes: 0.35, often: 0.2, always: 0.1 }[profile.recycling] + { never: 0.05, sometimes: 0.12, often: 0.22, always: 0.3 }[profile.plastic] },
  ]
  const max = Math.max(...parts.map((p) => p.v))
  return (
    <div className="breakdown">
      <p className="eyebrow">Where it comes from</p>
      {parts.map((p) => (
        <div className="bd-row" key={p.label}>
          <span>
            {p.icon} {p.label}
          </span>
          <span className="bd-bar">
            <span style={{ width: `${(p.v / max) * 100}%` }} />
          </span>
          <b>{p.v.toFixed(1)} t</b>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Log action ---------------- */

export function LogDialog({ initial, onClose }: { initial?: string; onClose: () => void }) {
  const { state, logAction } = useApi()
  const [cat, setCat] = useState<Category>(initial ? ACTION_BY_ID[initial]?.category ?? 'Transport' : 'Transport')
  const [sel, setSel] = useState<string | null>(initial ?? null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState<'today' | 'yesterday'>('today')
  const btnRef = useRef<HTMLButtonElement>(null)
  const today = dayKey()
  const done = new Set(state.log.filter((e) => e.date === today).map((e) => e.actionId))
  const action = sel ? ACTION_BY_ID[sel] : null
  return (
    <Dialog title="Log an action" onClose={onClose}>
      <div className="chip-row" role="tablist" aria-label="Category">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} className={`chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
            {c.icon} {c.id}
          </button>
        ))}
      </div>
      <div className="log-grid">
        {ACTIONS.filter((a) => a.category === cat).map((a) => (
          <button type="button" key={a.id} className={`log-opt ${sel === a.id ? 'on' : ''}`} aria-pressed={sel === a.id} onClick={() => setSel(a.id)}>
            <span aria-hidden="true">{a.icon}</span>
            <b>{a.title}</b>
            <small>
              ~{a.impact.co2} kg CO₂{done.has(a.id) ? ' · done today' : ''}
            </small>
          </button>
        ))}
      </div>
      {action && (
        <div className="log-confirm">
          <label className="field">
            <span>Optional note</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} placeholder="e.g. biked to the library" />
          </label>
          <div className="chip-row">
            {(['today', 'yesterday'] as const).map((d) => (
              <button key={d} type="button" className={`chip small ${date === d ? 'on' : ''}`} aria-pressed={date === d} onClick={() => setDate(d)}>
                {d === 'today' ? 'Today' : 'Yesterday'}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="dialog-foot">
        <button type="button" className="secondary-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          ref={btnRef}
          type="button"
          className="primary-btn"
          disabled={!action}
          onClick={() => {
            if (!sel) return
            logAction(sel, note.trim() || undefined, btnRef.current, date === 'yesterday' ? -1 : 0)
            onClose()
          }}
        >
          {action ? `Log “${action.title}”` : 'Choose an action'}
        </button>
      </div>
    </Dialog>
  )
}

/* ---------------- Help ---------------- */

export const SHORTCUTS: [string, string][] = [
  ['L', 'Log an action'],
  ['1 – 5', 'Switch tabs (Home, Actions, Community, Learn, Profile)'],
  ['/', 'Search actions'],
  ['Ctrl / ⌘ K', 'Command palette'],
  ['F', 'Footprint calculator'],
  ['S', 'Share your progress'],
  ['G', 'Get the app'],
  ['?', 'This help'],
  ['Esc', 'Close dialogs'],
]

export function Help({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Shortcuts & help" onClose={onClose}>
      <ul className="kbd-list">
        {SHORTCUTS.map(([k, d]) => (
          <li key={k}>
            <kbd>{k}</kbd>
            <span>{d}</span>
          </li>
        ))}
      </ul>
      <p className="muted">
        Your data never leaves this device. Log actions to build streaks, earn badges and raise your Planet Score. Join challenges in Community and test yourself in Learn.
      </p>
    </Dialog>
  )
}

/* ---------------- Get the app ---------------- */

export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const APK_URL = 'https://github.com/jaineil32624/EcoPulse/releases/latest/download/EcoPulse.apk'
export const RELEASES_URL = 'https://github.com/jaineil32624/EcoPulse/releases/latest'

export function GetApp({ onClose, installEvent, onInstalled }: { onClose: () => void; installEvent: InstallPromptEvent | null; onInstalled: () => void }) {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches
  return (
    <Dialog title="Get EcoPulse" onClose={onClose}>
      <div className="getapp">
        <a className="getapp-row" href={APK_URL} rel="noopener">
          <span aria-hidden="true">🤖</span>
          <div>
            <b>Android app</b>
            <small>Download EcoPulse.apk, open it and allow “Install unknown apps” if asked.</small>
          </div>
        </a>
        <button
          type="button"
          className="getapp-row"
          disabled={!installEvent || standalone}
          onClick={async () => {
            if (!installEvent) return
            await installEvent.prompt()
            const choice = await installEvent.userChoice
            if (choice.outcome === 'accepted') onInstalled()
          }}
        >
          <span aria-hidden="true">💻</span>
          <div>
            <b>{standalone ? 'Already installed' : 'Install on this device'}</b>
            <small>{installEvent ? 'Adds EcoPulse to your apps — works offline.' : 'In Chrome or Edge, use the install icon in the address bar.'}</small>
          </div>
        </button>
        <div className={`getapp-row static ${isIOS ? 'hl' : ''}`}>
          <span aria-hidden="true">🍎</span>
          <div>
            <b>iPhone & iPad</b>
            <small>Open in Safari → Share → “Add to Home Screen”.</small>
          </div>
        </div>
        <a className="getapp-row" href={RELEASES_URL} rel="noopener">
          <span aria-hidden="true">📦</span>
          <div>
            <b>All downloads</b>
            <small>APK and an offline web zip on the Releases page.</small>
          </div>
        </a>
      </div>
    </Dialog>
  )
}

/* ---------------- Command palette ---------------- */

interface Cmd {
  id: string
  label: string
  icon: string
  hint?: string
  run: () => void
}

export function Palette({ onClose, go, extra }: { onClose: () => void; go: (t: TabKey) => void; extra: Cmd[] }) {
  const { logAction } = useApi()
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const cmds = useMemo<Cmd[]>(
    () => [
      { id: 'tab-home', label: 'Go to Home', icon: '🌿', hint: '1', run: () => go('home') },
      { id: 'tab-actions', label: 'Go to Actions', icon: '✅', hint: '2', run: () => go('actions') },
      { id: 'tab-community', label: 'Go to Community', icon: '💬', hint: '3', run: () => go('community') },
      { id: 'tab-learn', label: 'Go to Learn', icon: '📘', hint: '4', run: () => go('learn') },
      { id: 'tab-profile', label: 'Go to Profile', icon: '👤', hint: '5', run: () => go('profile') },
      ...extra,
      ...ACTIONS.map((a) => ({ id: `log-${a.id}`, label: `Log: ${a.title}`, icon: a.icon, hint: `${a.impact.co2} kg`, run: () => logAction(a.id) })),
    ],
    [go, extra, logAction],
  )
  const results = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase())).slice(0, 12)
  useEffect(() => setIdx(0), [q])
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('.on')?.scrollIntoView({ block: 'nearest' })
  }, [idx])
  const run = (c: Cmd | undefined) => {
    if (!c) return
    onClose()
    c.run()
  }
  return (
    <Dialog title="Command palette" onClose={onClose} className="palette">
      <input
        className="palette-input"
        autoFocus
        value={q}
        placeholder="Type a command or action…"
        aria-label="Search commands"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setIdx((i) => Math.min(results.length - 1, i + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setIdx((i) => Math.max(0, i - 1))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            run(results[idx])
          }
        }}
      />
      <ul className="palette-list" ref={listRef} role="listbox">
        {results.map((c, i) => (
          <li key={c.id} role="option" aria-selected={i === idx}>
            <button type="button" className={i === idx ? 'on' : ''} onMouseEnter={() => setIdx(i)} onClick={() => run(c)}>
              <span aria-hidden="true">{c.icon}</span>
              <span>{c.label}</span>
              {c.hint && <kbd>{c.hint}</kbd>}
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="empty">No matches</li>}
      </ul>
    </Dialog>
  )
}
