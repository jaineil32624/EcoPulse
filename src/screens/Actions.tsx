import { useMemo, useState } from 'react'
import { useApi } from '../context.ts'
import { ACTIONS, CATEGORIES } from '../data.ts'
import type { Category, Level } from '../types.ts'
import { dayKey, lastNDays, shortDay } from '../store.ts'

type Filter = 'All' | 'Habits' | Category

export function Actions() {
  const { state, update, logAction, unlogToday, toast } = useApi()
  const [filter, setFilter] = useState<Filter>('All')
  const [level, setLevel] = useState<Level | 'Any'>('Any')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const today = dayKey()
  const week = lastNDays(7)

  const doneToday = useMemo(() => new Set(state.log.filter((e) => e.date === today).map((e) => e.actionId)), [state.log, today])
  const list = ACTIONS.filter((a) => {
    if (filter === 'Habits' && !state.habits.includes(a.id)) return false
    if (filter !== 'All' && filter !== 'Habits' && a.category !== filter) return false
    if (level !== 'Any' && a.level !== level) return false
    if (query && !`${a.title} ${a.category} ${a.reason}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const toggleHabit = (id: string) => {
    const has = state.habits.includes(id)
    update((s) => ({ ...s, habits: has ? s.habits.filter((h) => h !== id) : [...s.habits, id] }))
    toast(has ? 'Removed from your habits' : 'Added to your daily habits', { icon: has ? '➖' : '📌' })
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Daily actions</p>
          <h3>Simple actions, realistic impact.</h3>
        </div>
        <span className="count-pill">{doneToday.size} today</span>
      </div>

      <div className="search-box">
        <span aria-hidden="true">🔎</span>
        <input
          type="search"
          value={query}
          placeholder="Search actions…"
          aria-label="Search actions"
          onChange={(e) => setQuery(e.target.value)}
          id="action-search"
        />
      </div>

      <div className="chip-row filters" role="tablist" aria-label="Filter by category">
        {(['All', 'Habits'] as const).map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {f === 'Habits' ? '📌 My habits' : 'All'}
          </button>
        ))}
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={filter === c.id} className={`chip ${filter === c.id ? 'on' : ''}`} onClick={() => setFilter(c.id)}>
            {c.icon} {c.id}
          </button>
        ))}
      </div>
      <div className="chip-row levels" aria-label="Filter by difficulty">
        {(['Any', 'Easy', 'Medium', 'Hard'] as const).map((l) => (
          <button key={l} type="button" className={`chip small ${level === l ? 'on' : ''}`} onClick={() => setLevel(l)} aria-pressed={level === l}>
            {l === 'Any' ? 'Any difficulty' : l}
          </button>
        ))}
      </div>

      {filter === 'Habits' && state.habits.length > 0 && (
        <div className="habit-grid" aria-label="Habit tracker for the last 7 days">
          <div className="habit-grid-row head">
            <span />
            {week.map((d) => (
              <small key={d} className={d === today ? 'today' : ''}>
                {shortDay(d).slice(0, 2)}
              </small>
            ))}
          </div>
          {state.habits.map((id) => {
            const a = ACTIONS.find((x) => x.id === id)
            if (!a) return null
            return (
              <div className="habit-grid-row" key={id}>
                <span className="habit-name">
                  {a.icon} {a.title}
                </span>
                {week.map((d) => {
                  const hit = state.log.some((e) => e.date === d && e.actionId === id)
                  return <span key={d} className={`habit-dot ${hit ? 'hit' : ''}`} title={`${shortDay(d)}: ${hit ? 'done' : 'not yet'}`} />
                })}
              </div>
            )
          })}
        </div>
      )}

      <div className="action-list">
        {list.length === 0 && <p className="empty">No actions match. Try another filter.</p>}
        {list.map((action) => {
          const done = doneToday.has(action.id)
          const isHabit = state.habits.includes(action.id)
          const isOpen = open === action.id
          const total = state.log.filter((e) => e.actionId === action.id).length
          return (
            <div className={`action-item ${done ? 'is-done' : ''}`} key={action.id}>
              <div className="action-main">
                <span className="action-icon" aria-hidden="true">
                  {action.icon}
                </span>
                <div>
                  <strong>{action.title}</strong>
                  <p>
                    {action.category} • saves ~{action.impact.co2} kg CO₂
                    {action.impact.water ? ` · ${action.impact.water} L water` : ''}
                    {total ? ` · done ${total}×` : ''}
                  </p>
                  <button type="button" className="why-btn" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : action.id)}>
                    {isOpen ? 'Hide why' : 'Why it helps'}
                  </button>
                  {isOpen && <p className="why">{action.reason}</p>}
                </div>
              </div>
              <div className="action-meta">
                <span className={`lvl lvl-${action.level.toLowerCase()}`}>{action.level}</span>
                <span>{action.time}</span>
                <button
                  type="button"
                  className={`pin-btn ${isHabit ? 'on' : ''}`}
                  aria-pressed={isHabit}
                  aria-label={isHabit ? 'Remove from habits' : 'Add to habits'}
                  title={isHabit ? 'In your habits' : 'Add to habits'}
                  onClick={() => toggleHabit(action.id)}
                >
                  📌
                </button>
                <button
                  type="button"
                  className={`mini-btn ${done ? 'done' : ''}`}
                  aria-pressed={done}
                  onClick={(e) => (done ? unlogToday(action.id) : logAction(action.id, undefined, e.currentTarget))}
                >
                  {done ? '✓ Done' : 'Complete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
