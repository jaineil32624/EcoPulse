import { useMemo } from 'react'
import { useApi } from '../context.ts'
import { ACTION_BY_ID, EVENTS, GOAL_OPTIONS, REGION_AVERAGE_T, TIPS } from '../data.ts'
import { currentStreak, dayKey, lastNDays, levelFor, planetScore, totalsFor } from '../store.ts'
import { Ring, TrendLine, WeekBars } from '../components/Charts.tsx'

function greeting(): string {
  const h = new Date().getHours()
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function fmtWater(l: number): string {
  return l >= 1000 ? `${(l / 1000).toFixed(1)}k L` : `${Math.round(l)} L`
}

export function Home() {
  const { state, footprint, go, openLog, openDialog, share } = useApi()
  const today = dayKey()
  const todayLog = state.log.filter((e) => e.date === today)
  const month = today.slice(0, 7)
  const monthLog = state.log.filter((e) => e.date.startsWith(month))
  const monthTotals = totalsFor(monthLog)
  const allTotals = totalsFor(state.log)
  const streak = currentStreak(state.log)
  const score = planetScore(state)
  const level = levelFor(score)

  // Goal progress: based on the primary goal
  const primary = state.goals[0] ?? 'actions-20'
  const goalInfo = useMemo(() => {
    if (primary === 'carbon-10') {
      const target = (footprint.carbonMonth * 0.1) // kg/month
      return { pct: (monthTotals.co2 / Math.max(1, target)) * 100, text: `${monthTotals.co2.toFixed(1)} of ${Math.round(target)} kg CO₂ cut this month` }
    }
    if (primary === 'food-waste') {
      const food = monthLog.filter((e) => ['meal-plan', 'leftovers', 'compost'].includes(e.actionId)).length
      return { pct: (food / 12) * 100, text: `${food} of 12 food-saving actions this month` }
    }
    if (primary === 'challenge-weekly') {
      const week = lastNDays(7)[0]
      const joined = Object.values(state.challenges).filter((c) => c.joinedAt >= week).length
      return { pct: joined * 100, text: joined ? 'Challenge joined this week' : 'Join a challenge this week' }
    }
    return { pct: (monthLog.length / 20) * 100, text: `${monthLog.length} of 20 actions this month` }
  }, [primary, footprint.carbonMonth, monthTotals.co2, monthLog, state.challenges])
  const goalPct = Math.min(100, Math.round(goalInfo.pct))
  const goalLabel = GOAL_OPTIONS.find((g) => g.id === primary)?.label ?? 'Your goal'

  const effectiveYear = Math.max(0.5, footprint.carbonYear - (monthTotals.co2 * 12) / 1000)
  const diffPct = Math.round(((effectiveYear - REGION_AVERAGE_T) / REGION_AVERAGE_T) * 100)
  const tip = TIPS[(new Date().getDate() + state.log.length) % TIPS.length]
  const nextEvent = EVENTS[0]
  const habitsLeft = state.habits.filter((h) => !todayLog.some((e) => e.actionId === h))

  return (
    <>
      <section className="hero-card">
        <div>
          <p className="eyebrow">
            {greeting()}
            {state.profile.name ? `, ${state.profile.name}` : ''}
          </p>
          <h2>{todayLog.length ? 'You’re making progress.' : 'Small steps, steady progress.'}</h2>
          <p className="hero-copy">
            {todayLog.length
              ? `${todayLog.length} action${todayLog.length === 1 ? '' : 's'} today — about ${totalsFor(todayLog).co2.toFixed(1)} kg CO₂ saved.`
              : 'Pick one small thing to try today. Every step counts.'}
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => openLog()}>
              ＋ Log an action
            </button>
            <button type="button" className="secondary-btn" onClick={() => openDialog('calculator')}>
              Footprint
            </button>
          </div>
          <div className="streak-row">
            <span className={`streak-pill ${streak ? 'hot' : ''}`} title="Current streak">
              🔥 {streak} day{streak === 1 ? '' : 's'}
            </span>
            <button type="button" className="streak-pill" onClick={() => go('profile')} title="Planet Score">
              {level.icon} {score} pts
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="score-tile">
            <Ring value={goalPct} label={`Goal progress ${goalPct}%`} />
            <div className="score-info">
              <strong>{goalPct >= 100 ? 'Goal reached! 🎉' : goalPct >= 50 ? 'Goal on track' : 'Building momentum'}</strong>
              <p title={goalLabel}>{goalInfo.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <button type="button" className="stat-card" onClick={() => openDialog('calculator')}>
          <p>☁️ Carbon</p>
          <h3>{footprint.carbonYear.toFixed(1)} t</h3>
          <span>{footprint.carbonMonth} kg / month est.</span>
        </button>
        <button type="button" className="stat-card" onClick={() => openDialog('calculator')}>
          <p>💧 Water</p>
          <h3>{fmtWater(footprint.waterDay * 30)}</h3>
          <span>{allTotals.water ? `${fmtWater(allTotals.water)} saved` : 'Monthly estimate'}</span>
        </button>
        <button type="button" className="stat-card" onClick={() => openDialog('calculator')}>
          <p>♻️ Waste</p>
          <h3>{Math.min(100, footprint.wasteScore + Math.round(allTotals.waste * 2))}/100</h3>
          <span>Recycling score</span>
        </button>
      </section>

      <section className={`compare-card ${diffPct <= 0 ? 'good' : 'warm'}`}>
        <span aria-hidden="true">{diffPct <= 0 ? '🌍' : '🌤️'}</span>
        <p>
          {diffPct <= 0
            ? `You’re about ${Math.abs(diffPct)}% below the average footprint for your region.`
            : `You’re about ${diffPct}% above average — small changes can make a meaningful difference.`}
        </p>
      </section>

      {habitsLeft.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Today’s habits</p>
              <h3>{state.habits.length - habitsLeft.length} of {state.habits.length} done</h3>
            </div>
            <button type="button" className="link-btn" onClick={() => go('actions')}>
              All actions →
            </button>
          </div>
          <div className="quick-habits">
            {habitsLeft.slice(0, 4).map((id) => {
              const a = ACTION_BY_ID[id]
              if (!a) return null
              return (
                <button type="button" key={id} className="quick-habit" onClick={() => openLog(id)}>
                  <span aria-hidden="true">{a.icon}</span>
                  <span>{a.title}</span>
                  <small>+{a.impact.co2} kg</small>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">This week</p>
            <h3>Impact trend</h3>
          </div>
          <button type="button" className="link-btn" onClick={() => share('My EcoPulse week', `I saved ${totalsFor(state.log.filter((e) => e.date >= lastNDays(7)[0])).co2.toFixed(1)} kg CO₂ this week with EcoPulse 🌿`, 'home')}>
            Share ↗
          </button>
        </div>
        <div className="chart-card">
          <WeekBars log={state.log} />
          <TrendLine log={state.log} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h3>Your latest wins</h3>
          </div>
        </div>
        {state.log.length === 0 ? (
          <p className="empty">Nothing logged yet — tap “Log an action” to start your streak.</p>
        ) : (
          <ul className="recent-list">
            {[...state.log]
              .sort((a, b) => b.ts - a.ts)
              .slice(0, 4)
              .map((e) => {
                const a = ACTION_BY_ID[e.actionId]
                return (
                  <li key={e.id}>
                    <span className="recent-icon" aria-hidden="true">{a.icon}</span>
                    <div>
                      <strong>{a.title}</strong>
                      <small>
                        {e.date === today ? 'Today' : new Date(e.date + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {e.note ? ` · “${e.note}”` : ''}
                      </small>
                    </div>
                    <span className="recent-impact">−{a.impact.co2} kg</span>
                  </li>
                )
              })}
          </ul>
        )}
      </section>

      <section className="local-grid">
        <article className="local-card">
          <p className="eyebrow">Local · {state.profile.location || 'Your area'}</p>
          <div className="aqi">
            <strong>42</strong>
            <div>
              <b>Good air quality</b>
              <small>A great day to walk or bike.</small>
            </div>
          </div>
        </article>
        <button type="button" className="local-card event" onClick={() => go('community')}>
          <p className="eyebrow">Nearby event</p>
          <strong>
            {nextEvent.icon} {nextEvent.title}
          </strong>
          <small>
            {nextEvent.when} · {nextEvent.where}
          </small>
        </button>
      </section>

      <section className="tip-card">
        <span aria-hidden="true">💡</span>
        <p>
          <b>Tip of the day.</b> {tip}
        </p>
      </section>
    </>
  )
}
