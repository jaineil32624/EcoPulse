import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { ApiContext, type Api, type DialogKey, type ToastOptions } from './context.ts'
import { ACTION_BY_ID, BADGES, CHALLENGES, estimateFootprint } from './data.ts'
import type { AppState, TabKey } from './types.ts'
import { addDays, challengeProgress, currentStreak, dayKey, loadState, newlyEarnedBadges, planetScore, saveState, totalsFor, uid } from './store.ts'
import { appUrl, chime, leafBurst, shareOrCopy } from './fx.ts'
import { Home } from './screens/Home.tsx'
import { Actions } from './screens/Actions.tsx'
import { Community } from './screens/Community.tsx'
import { Learn } from './screens/Learn.tsx'
import { Profile } from './screens/Profile.tsx'
import { Calculator, GetApp, Help, LogDialog, Onboarding, Palette, type InstallPromptEvent } from './components/Dialogs.tsx'

const tabs = [
  { id: 'home' as const, label: 'Home', icon: '🌿' },
  { id: 'actions' as const, label: 'Actions', icon: '✅' },
  { id: 'community' as const, label: 'Community', icon: '💬' },
  { id: 'learn' as const, label: 'Learn', icon: '📘' },
  { id: 'profile' as const, label: 'Profile', icon: '👤' },
]

const TAB_IDS = tabs.map((t) => t.id) as TabKey[]

function tabFromHash(): TabKey {
  const h = window.location.hash.replace(/^#\/?/, '').split(/[?&]/)[0] as TabKey
  return TAB_IDS.includes(h) ? h : 'home'
}

interface Toast {
  id: string
  message: string
  icon?: string
  undo?: () => void
}

function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [activeTab, setActiveTab] = useState<TabKey>(() => tabFromHash())
  const [dialog, setDialog] = useState<DialogKey>(null)
  const [logFor, setLogFor] = useState<string | undefined>(undefined)
  const [logOpen, setLogOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [unlocked, setUnlocked] = useState<string | null>(null)
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [tabAnim, setTabAnim] = useState(0)
  const contentRef = useRef<HTMLElement>(null)

  const footprint = useMemo(() => estimateFootprint(state.profile), [state.profile])

  /* ---------- persistence ---------- */
  useEffect(() => saveState(state), [state])

  /* ---------- badges + challenge completion ---------- */
  useEffect(() => {
    // complete challenges whose progress is full
    const finished = CHALLENGES.filter((c) => state.challenges[c.id] && !state.challenges[c.id].completed && challengeProgress(state, c.id).done >= c.days)
    if (finished.length) {
      setState((s) => {
        const ch = { ...s.challenges }
        for (const c of finished) ch[c.id] = { ...ch[c.id], completed: dayKey() }
        return { ...s, challenges: ch }
      })
      setUnlocked(`challenge:${finished[0].id}`)
      return
    }
    const fresh = newlyEarnedBadges(state)
    if (fresh.length) {
      setState((s) => {
        const b = { ...s.badges }
        for (const id of fresh) b[id] = dayKey()
        return { ...s, badges: b }
      })
      setUnlocked(fresh[0])
    }
  }, [state])

  /* ---------- toasts ---------- */
  const toast = useCallback((message: string, opts?: ToastOptions) => {
    const id = uid()
    setToasts((t) => [...t.slice(-2), { id, message, icon: opts?.icon, undo: opts?.undo }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts?.undo ? 5000 : 3000)
  }, [])

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), [])

  const celebrate = useCallback(
    (origin?: HTMLElement | null) => {
      leafBurst(origin, state.settings.reduceMotion)
    },
    [state.settings.reduceMotion],
  )

  const logAction = useCallback(
    (actionId: string, note?: string, origin?: HTMLElement | null, dayOffset = 0) => {
      const a = ACTION_BY_ID[actionId]
      if (!a) return
      const entry = { id: uid(), actionId, date: addDays(dayKey(), dayOffset), ts: Date.now() + dayOffset * 86400000, note }
      setState((s) => ({ ...s, log: [...s.log, entry] }))
      leafBurst(origin, state.settings.reduceMotion)
      chime(state.settings.sound)
      const parts = [a.impact.co2 ? `${a.impact.co2} kg CO₂` : '', a.impact.water ? `${a.impact.water} L water` : ''].filter(Boolean).join(' and ')
      toast(`Nice work. This could save about ${parts}.`, {
        icon: a.icon,
        undo: () => setState((s) => ({ ...s, log: s.log.filter((e) => e.id !== entry.id) })),
      })
    },
    [state.settings.reduceMotion, state.settings.sound, toast],
  )

  const unlogToday = useCallback(
    (actionId: string) => {
      const today = dayKey()
      let removed: AppState['log'][number] | undefined
      setState((s) => {
        const idx = [...s.log].reverse().findIndex((e) => e.date === today && e.actionId === actionId)
        if (idx < 0) return s
        const real = s.log.length - 1 - idx
        removed = s.log[real]
        return { ...s, log: s.log.filter((_, i) => i !== real) }
      })
      toast('Marked as not done', {
        icon: '↩️',
        undo: () => {
          if (removed) {
            const r = removed
            setState((s) => ({ ...s, log: [...s.log, r] }))
          }
        },
      })
    },
    [toast],
  )

  const go = useCallback((tab: TabKey) => {
    setActiveTab(tab)
    setTabAnim((n) => n + 1)
    const hash = tab === 'home' ? '' : `#${tab}`
    if (window.location.hash !== hash) history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`)
    contentRef.current?.scrollTo?.({ top: 0 })
    window.scrollTo?.({ top: 0 })
  }, [])

  const openLog = useCallback((actionId?: string) => {
    setLogFor(actionId)
    setLogOpen(true)
  }, [])

  const share = useCallback(
    (title: string, text: string, tab?: TabKey) => {
      void shareOrCopy(title, text, appUrl(tab && tab !== 'home' ? tab : '')).then((r) => {
        if (r === 'copied') toast('Copied to clipboard — paste it anywhere', { icon: '📋' })
        else if (r === 'shared') toast('Thanks for sharing!', { icon: '💚' })
        else if (r === 'failed') toast('Could not share on this device', { icon: '⚠️' })
      })
    },
    [toast],
  )

  const openDialog = useCallback((d: DialogKey) => setDialog(d), [])

  const shareProgress = useCallback(() => {
    const t = totalsFor(state.log)
    share('My EcoPulse progress', `I’ve logged ${t.count} eco actions, saved ${t.co2.toFixed(1)} kg CO₂ and have a ${currentStreak(state.log)}-day streak on EcoPulse 🌿 (Planet Score ${planetScore(state)})`, 'profile')
  }, [share, state])

  /* ---------- hash routing ---------- */
  useEffect(() => {
    const onHash = () => setActiveTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  /* ---------- PWA install prompt ---------- */
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallPromptEvent)
    }
    const onInstalled = () => setInstallEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  /* ---------- keyboard shortcuts ---------- */
  const anyDialog = dialog !== null || logOpen || !state.onboarded || unlocked !== null
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setDialog((d) => (d === 'palette' ? null : 'palette'))
        return
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey || anyDialog) return
      const n = Number(e.key)
      if (n >= 1 && n <= 5) {
        e.preventDefault()
        go(TAB_IDS[n - 1])
        return
      }
      // Stop the shortcut key from being typed into an input that a dialog autofocuses.
      if (['l', 'L', '/', '?', 'f', 'F', 'g', 'G', 's', 'S'].includes(e.key)) e.preventDefault()
      switch (e.key) {
        case 'l':
        case 'L':
          e.preventDefault()
          openLog()
          break
        case '/':
          e.preventDefault()
          go('actions')
          window.setTimeout(() => document.getElementById('action-search')?.focus(), 30)
          break
        case '?':
          setDialog('help')
          break
        case 'f':
        case 'F':
          setDialog('calculator')
          break
        case 'g':
        case 'G':
          setDialog('getapp')
          break
        case 's':
        case 'S':
          shareProgress()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [anyDialog, go, openLog, shareProgress])

  const api: Api = useMemo(
    () => ({ state, footprint, update, logAction, unlogToday, toast, go, openLog, share, celebrate, openDialog }),
    [state, footprint, update, logAction, unlogToday, toast, go, openLog, share, celebrate, openDialog],
  )

  const paletteExtra = useMemo(
    () => [
      { id: 'log', label: 'Log an action…', icon: '➕', hint: 'L', run: () => openLog() },
      { id: 'calc', label: 'Open footprint calculator', icon: '📊', hint: 'F', run: () => setDialog('calculator') },
      { id: 'share', label: 'Share my progress', icon: '↗️', hint: 'S', run: shareProgress },
      { id: 'getapp', label: 'Get the app (Android, install, iPhone)', icon: '⬇️', hint: 'G', run: () => setDialog('getapp') },
      { id: 'help', label: 'Keyboard shortcuts & help', icon: '❓', hint: '?', run: () => setDialog('help') },
      { id: 'motion', label: state.settings.reduceMotion ? 'Turn animations on' : 'Reduce motion', icon: '🌀', run: () => update((s) => ({ ...s, settings: { ...s.settings, reduceMotion: !s.settings.reduceMotion } })) },
    ],
    [openLog, shareProgress, state.settings.reduceMotion, update],
  )

  const unlockedInfo = useMemo(() => {
    if (!unlocked) return null
    if (unlocked.startsWith('challenge:')) {
      const c = CHALLENGES.find((x) => `challenge:${x.id}` === unlocked)
      return c ? { icon: '🏆', title: `${c.title} complete!`, detail: `You earned ${c.xp} XP. Consistency beats perfection.` } : null
    }
    const b = BADGES.find((x) => x.id === unlocked)
    return b ? { icon: b.icon, title: `Badge unlocked: ${b.title}`, detail: b.detail } : null
  }, [unlocked])

  useEffect(() => {
    if (unlockedInfo) {
      leafBurst(null, state.settings.reduceMotion)
      chime(state.settings.sound)
    }
  }, [unlockedInfo])

  return (
    <ApiContext.Provider value={api}>
      <div className={`app-shell ${state.settings.reduceMotion ? 'calm' : ''}`}>
        <div className="phone-frame">
          <div className="ambient-scene" aria-hidden="true">
            <div className="cloud cloud-1" />
            <div className="cloud cloud-2" />
            <div className="firefly firefly-1" />
            <div className="firefly firefly-2" />
            <div className="leaf leaf-1" />
            <div className="leaf leaf-2" />
            <div className="drift-wave" />
          </div>

          <header className="app-header">
            <div className="brand">
              <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" width={36} height={36} />
              <div>
                <p className="eyebrow">EcoPulse</p>
                <h1>Progress, not perfection.</h1>
              </div>
            </div>
            <div className="header-btns">
              <button type="button" className="icon-btn" onClick={() => setDialog('palette')} aria-label="Search and commands (Ctrl+K)" title="Search · Ctrl K">
                🔎
              </button>
              <button type="button" className="icon-btn" onClick={() => setDialog('getapp')} aria-label="Get the app" title="Get the app">
                ⬇
              </button>
              <button type="button" className="icon-btn" onClick={() => setDialog('help')} aria-label="Help and keyboard shortcuts" title="Shortcuts · ?">
                ?
              </button>
            </div>
          </header>

          <main className="content-area" ref={contentRef} key={tabAnim} data-tab={activeTab}>
            {activeTab === 'home' && <Home />}
            {activeTab === 'actions' && <Actions />}
            {activeTab === 'community' && <Community />}
            {activeTab === 'learn' && <Learn />}
            {activeTab === 'profile' && <Profile />}
          </main>

          <button type="button" className="fab" onClick={() => openLog()} aria-label="Log an action (L)" title="Log an action · L">
            ＋
          </button>

          <nav className="bottom-nav" aria-label="Primary">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                title={`${tab.label} · ${i + 1}`}
                onClick={() => go(tab.id)}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <small>{tab.label}</small>
              </button>
            ))}
          </nav>
        </div>

        <aside className="side-panel" aria-label="Summary">
          <SidePanel />
        </aside>

        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div className="toast" key={t.id}>
              {t.icon && <span aria-hidden="true">{t.icon}</span>}
              <span>{t.message}</span>
              {t.undo && (
                <button
                  type="button"
                  onClick={() => {
                    t.undo?.()
                    setToasts((all) => all.filter((x) => x.id !== t.id))
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          ))}
        </div>

        {!state.onboarded && (
          <Onboarding
            onDone={(profile, goals, first) => {
              setState((s) => ({ ...s, profile, goals, onboarded: true }))
              if (first) window.setTimeout(() => logAction(first), 200)
            }}
          />
        )}
        {state.onboarded && logOpen && <LogDialog initial={logFor} onClose={() => setLogOpen(false)} />}
        {dialog === 'help' && <Help onClose={() => setDialog(null)} />}
        {dialog === 'calculator' && <Calculator onClose={() => setDialog(null)} />}
        {dialog === 'getapp' && <GetApp onClose={() => setDialog(null)} installEvent={installEvent} onInstalled={() => setInstallEvent(null)} />}
        {dialog === 'palette' && <Palette onClose={() => setDialog(null)} go={go} extra={paletteExtra} />}
        {unlockedInfo && state.onboarded && (
          <div className="unlock-backdrop" onClick={() => setUnlocked(null)}>
            <div className="unlock-card" role="alertdialog" aria-label={unlockedInfo.title}>
              <span className="unlock-icon" aria-hidden="true">{unlockedInfo.icon}</span>
              <h3>{unlockedInfo.title}</h3>
              <p>{unlockedInfo.detail}</p>
              <button type="button" className="primary-btn" autoFocus onClick={() => setUnlocked(null)}>
                Keep going
              </button>
            </div>
          </div>
        )}
      </div>
    </ApiContext.Provider>
  )
}

/** Desktop-only companion panel with summary + insights (hidden on narrow screens). */
function SidePanel() {
  return (
    <ApiContext.Consumer>
      {(api) => {
        if (!api) return null
        const { state, footprint, openLog, go } = api
        const t = totalsFor(state.log)
        const score = planetScore(state)
        const streak = currentStreak(state.log)
        const active = CHALLENGES.filter((c) => state.challenges[c.id] && !state.challenges[c.id].completed)
        const trees = t.co2 / 21 // a tree absorbs ~21 kg CO2 / year
        return (
          <>
            <div className="side-card">
              <p className="eyebrow">Your impact so far</p>
              <div className="side-big">{t.co2.toFixed(1)} kg CO₂</div>
              <small>
                ≈ {trees >= 1 ? `${trees.toFixed(1)} trees’` : `${Math.round(trees * 365)} days of a tree’s`} yearly absorption · {Math.round(t.water)} L water
              </small>
            </div>
            <div className="side-card row">
              <div>
                <b>🔥 {streak}</b>
                <small>streak</small>
              </div>
              <div>
                <b>🌍 {score}</b>
                <small>Planet Score</small>
              </div>
              <div>
                <b>{footprint.carbonYear} t</b>
                <small>yearly est.</small>
              </div>
            </div>
            <div className="side-card">
              <p className="eyebrow">Active challenges</p>
              {active.length === 0 ? (
                <button type="button" className="link-btn" onClick={() => go('community')}>
                  Browse challenges →
                </button>
              ) : (
                active.map((c) => {
                  const p = challengeProgress(state, c.id)
                  return (
                    <div className="side-challenge" key={c.id}>
                      <span>
                        {c.icon} {c.title}
                      </span>
                      <div className="meter small">
                        <span style={{ width: `${(p.done / p.total) * 100}%` }} />
                      </div>
                      <small>
                        {p.done}/{p.total} days
                      </small>
                    </div>
                  )
                })
              )}
            </div>
            <button type="button" className="primary-btn wide" onClick={() => openLog()}>
              ＋ Log an action
            </button>
            <p className="side-hint">
              Press <kbd>?</kbd> for shortcuts · <kbd>Ctrl</kbd> <kbd>K</kbd> to search
            </p>
          </>
        )
      }}
    </ApiContext.Consumer>
  )
}

export default App
