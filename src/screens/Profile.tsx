import { useRef } from 'react'
import { useApi } from '../context.ts'
import { BADGES, GOAL_OPTIONS } from '../data.ts'
import { bestStreak, clearState, currentStreak, defaultState, levelFor, LEVELS, planetScore, totalsFor } from '../store.ts'
import { Heatmap } from '../components/Charts.tsx'
import { downloadFile } from '../fx.ts'
import type { AppState } from '../types.ts'

export function Profile() {
  const { state, update, toast, openDialog, share } = useApi()
  const fileRef = useRef<HTMLInputElement>(null)
  const score = planetScore(state)
  const level = levelFor(score)
  const t = totalsFor(state.log)
  const streak = currentStreak(state.log)
  const best = bestStreak(state.log)
  const earned = Object.keys(state.badges).length

  const toggleGoal = (id: string) =>
    update((s) => ({ ...s, goals: s.goals.includes(id) ? s.goals.filter((g) => g !== id) : [...s.goals, id] }))

  const setSetting = <K extends keyof AppState['settings']>(k: K, v: AppState['settings'][K]) =>
    update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }))

  const exportData = () => {
    downloadFile(`ecopulse-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), 'application/json')
    toast('Backup downloaded', { icon: '💾' })
  }
  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<AppState>
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.log)) throw new Error('bad')
      const base = defaultState()
      update(() => ({ ...base, ...parsed, profile: { ...base.profile, ...parsed.profile }, settings: { ...base.settings, ...parsed.settings }, version: 1, onboarded: true }))
      toast('Backup restored', { icon: '✅' })
    } catch {
      toast('That file is not an EcoPulse backup', { icon: '⚠️' })
    }
  }
  const reset = () => {
    if (!window.confirm('Reset EcoPulse? This clears your actions, streaks and badges on this device.')) return
    const prev = state
    clearState()
    update(() => defaultState())
    toast('Everything was reset', { icon: '🧹', undo: () => update(() => prev) })
  }

  return (
    <>
      <section className="panel level-panel">
        <div className="level-top">
          <span className="level-icon" aria-hidden="true">{level.icon}</span>
          <div>
            <p className="eyebrow">Planet Score</p>
            <h3>
              {score} · {level.name}
            </h3>
            <div className="meter" aria-label="Progress to next level">
              <span style={{ width: `${Math.round(level.progress * 100)}%` }} />
            </div>
            <small>{level.next ? `${level.next - score} pts to ${LEVELS[level.index + 1].name}` : 'Top level reached — amazing!'}</small>
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <b>🔥 {streak}</b>
            <small>day streak</small>
          </div>
          <div>
            <b>⭐ {best}</b>
            <small>best streak</small>
          </div>
          <div>
            <b>{t.count}</b>
            <small>actions</small>
          </div>
          <div>
            <b>{t.co2.toFixed(1)} kg</b>
            <small>CO₂ saved</small>
          </div>
        </div>
        <p className="eyebrow hm-label">Last 12 weeks</p>
        <Heatmap log={state.log} />
        <div className="hero-actions">
          <button type="button" className="secondary-btn" onClick={() => share('My EcoPulse progress', `I’m a ${level.name} on EcoPulse: ${score} Planet Score, ${streak}-day streak and ${t.co2.toFixed(1)} kg CO₂ saved 🌿`, 'profile')}>
            Share progress ↗
          </button>
          <button type="button" className="secondary-btn" onClick={() => openDialog('calculator')}>
            Retake footprint quiz
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Badges</p>
            <h3>
              {earned} of {BADGES.length} unlocked
            </h3>
          </div>
        </div>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const on = state.badges[b.id]
            return (
              <div className={`badge-tile ${on ? 'on' : ''}`} key={b.id} title={on ? `Earned ${on}` : b.detail}>
                <span aria-hidden="true">{b.icon}</span>
                <b>{b.title}</b>
                <small>{on ? 'Unlocked' : b.detail}</small>
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Profile</p>
            <h3>Your goals</h3>
          </div>
        </div>
        <div className="goal-list">
          {GOAL_OPTIONS.map((g) => {
            const on = state.goals.includes(g.id)
            return (
              <button type="button" key={g.id} className={`goal-pill ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleGoal(g.id)}>
                <span aria-hidden="true">{on ? '✓' : g.icon}</span> {g.label}
              </button>
            )
          })}
        </div>
        <small className="muted">Your first selected goal drives the progress ring on Home.</small>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h3>Privacy & preferences</h3>
          </div>
        </div>
        <div className="settings">
          <label className="toggle-row">
            <input type="checkbox" checked={state.settings.anonymous} onChange={(e) => setSetting('anonymous', e.target.checked)} />
            <span className="switch" aria-hidden="true" />
            <span>
              Anonymous community mode <small>Hide your name on posts</small>
            </span>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={state.settings.precision === 'precise'} onChange={(e) => setSetting('precision', e.target.checked ? 'precise' : 'approximate')} />
            <span className="switch" aria-hidden="true" />
            <span>
              Precise location <small>Approximate (city level) is the default</small>
            </span>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={state.settings.sound} onChange={(e) => setSetting('sound', e.target.checked)} />
            <span className="switch" aria-hidden="true" />
            <span>
              Sounds <small>A soft chime when you log an action</small>
            </span>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={state.settings.reduceMotion} onChange={(e) => setSetting('reduceMotion', e.target.checked)} />
            <span className="switch" aria-hidden="true" />
            <span>
              Reduce motion <small>Calm the background and celebrations</small>
            </span>
          </label>
        </div>
        <p className="privacy-note">
          🔒 We use your answers to personalize your footprint estimate and suggest relevant actions. Everything is stored only on this device and never shared without your
          permission.
        </p>
        <div className="hero-actions">
          <button type="button" className="secondary-btn" onClick={exportData}>
            Export backup
          </button>
          <button type="button" className="secondary-btn" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <button type="button" className="secondary-btn" onClick={() => openDialog('getapp')}>
            ⬇ Get the app
          </button>
          <button type="button" className="secondary-btn danger" onClick={reset}>
            Reset
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void importData(f)
              e.target.value = ''
            }}
          />
        </div>
      </section>
    </>
  )
}
