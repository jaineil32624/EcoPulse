import { useState } from 'react'
import type { LogEntry } from '../types.ts'
import { ACTION_BY_ID } from '../data.ts'
import { dayKey, lastNDays, shortDay } from '../store.ts'

function co2ByDay(log: LogEntry[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const e of log) {
    const a = ACTION_BY_ID[e.actionId]
    if (!a) continue
    m.set(e.date, (m.get(e.date) ?? 0) + a.impact.co2)
  }
  return m
}

function countByDay(log: LogEntry[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const e of log) m.set(e.date, (m.get(e.date) ?? 0) + 1)
  return m
}

/** Last 7 days of CO₂ saved, as interactive bars. */
export function WeekBars({ log }: { log: LogEntry[] }) {
  const days = lastNDays(7)
  const byDay = co2ByDay(log)
  const counts = countByDay(log)
  const values = days.map((d) => byDay.get(d) ?? 0)
  const max = Math.max(2, ...values)
  const today = dayKey()
  const [selected, setSelected] = useState<string>(today)
  const selIdx = days.indexOf(selected)
  const selVal = values[selIdx] ?? 0
  return (
    <div className="week-chart">
      <div className="week-readout" aria-live="polite">
        <strong>{selVal.toFixed(1)} kg CO₂</strong>
        <span>
          saved {selected === today ? 'today' : `on ${shortDay(selected)}`} · {counts.get(selected) ?? 0} action{(counts.get(selected) ?? 0) === 1 ? '' : 's'}
        </span>
      </div>
      <div className="bar-chart" role="group" aria-label="CO₂ saved in the last 7 days">
        {days.map((d, i) => {
          const h = values[i] > 0 ? Math.max(8, (values[i] / max) * 100) : 4
          return (
            <button
              type="button"
              key={d}
              className={`bar-col ${d === selected ? 'sel' : ''} ${d === today ? 'today' : ''}`}
              onClick={() => setSelected(d)}
              onMouseEnter={() => setSelected(d)}
              aria-label={`${shortDay(d)}: ${values[i].toFixed(1)} kg CO₂ saved`}
              aria-pressed={d === selected}
            >
              <span className="bar" style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }} />
              <small>{shortDay(d).slice(0, 2)}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Cumulative CO₂ saved over the last 30 days. */
export function TrendLine({ log }: { log: LogEntry[] }) {
  const days = lastNDays(30)
  const byDay = co2ByDay(log)
  let running = 0
  // include everything logged before the window as the starting point
  const first = days[0]
  for (const [d, v] of byDay) if (d < first) running += v
  const series = days.map((d) => (running += byDay.get(d) ?? 0))
  const max = Math.max(5, ...series)
  const min = Math.min(...series)
  const W = 280
  const H = 110
  const pad = 10
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / Math.max(0.001, max - min)) * (H - pad * 2)
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${(W - pad).toFixed(1)} ${H - pad} L${pad} ${H - pad} Z`
  const [hover, setHover] = useState<number | null>(null)
  const idx = hover ?? series.length - 1
  const [hx, hy] = pts[idx]
  return (
    <div className="trend">
      <div className="week-readout">
        <strong>{series[idx].toFixed(1)} kg CO₂</strong>
        <span>total saved by {idx === series.length - 1 ? 'today' : new Date(days[idx] + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="line-chart"
        role="img"
        aria-label="Cumulative CO₂ saved over the last 30 days"
        onMouseLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const rel = (e.clientX - r.left) / r.width
          setHover(Math.max(0, Math.min(series.length - 1, Math.round(rel * (series.length - 1)))))
        }}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64a97b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#64a97b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendFill)" />
        <path d={line} className="chart-line" pathLength={320} />
        <line x1={hx} x2={hx} y1={pad} y2={H - pad} className="trend-guide" />
        <circle cx={hx} cy={hy} r={4.5} className="trend-dot" />
      </svg>
    </div>
  )
}

/** GitHub-style 12-week activity heatmap. */
export function Heatmap({ log, weeks = 12 }: { log: LogEntry[]; weeks?: number }) {
  const counts = countByDay(log)
  const today = new Date()
  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay())) // end of this week (Sat)
  const cells: { key: string; n: number; future: boolean }[] = []
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const key = dayKey(d)
    cells.push({ key, n: counts.get(key) ?? 0, future: d > today })
  }
  return (
    <div className="heatmap" role="img" aria-label={`Activity over the last ${weeks} weeks`} style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
      {cells.map((c) => (
        <span
          key={c.key}
          className={`hm-cell l${Math.min(4, c.n)} ${c.future ? 'future' : ''}`}
          title={c.future ? '' : `${c.key}: ${c.n} action${c.n === 1 ? '' : 's'}`}
        />
      ))}
    </div>
  )
}

export function Ring({ value, size = 140, label }: { value: number; size?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const style = { ['--value' as string]: `${pct}%`, width: size, height: size }
  return (
    <div className="ring" style={style} role="img" aria-label={label ?? `${pct}%`}>
      <span>{pct}%</span>
    </div>
  )
}
