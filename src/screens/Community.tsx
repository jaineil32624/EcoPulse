import { useState } from 'react'
import { useApi } from '../context.ts'
import { CHALLENGES, EVENTS, SEED_POSTS } from '../data.ts'
import { challengeProgress, dayKey, totalsFor, uid } from '../store.ts'

function ago(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${Math.round(minutes)} min ago`
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} hr ago`
  return `${Math.round(minutes / 1440)} d ago`
}

export function Community() {
  const { state, update, toast, share, celebrate } = useApi()
  const [draft, setDraft] = useState('')
  const [joining, setJoining] = useState<string | null>(null)
  const today = dayKey()
  const mine = totalsFor(state.log)
  // A gently growing community counter, with your own impact folded in.
  const weekSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))
  const communityCo2 = 18420 + (weekSeed % 7) * 311 + Math.round(mine.co2)
  const communityWater = 912300 + (weekSeed % 5) * 4100 + Math.round(mine.water)
  const meterPct = Math.min(100, Math.round((communityCo2 / 25000) * 100))
  const name = state.settings.anonymous ? 'Anonymous' : state.profile.name || 'You'

  const join = (id: string, mode: 'solo' | 'friends', btn?: HTMLElement | null) => {
    update((s) => ({ ...s, challenges: { ...s.challenges, [id]: { joinedAt: today, mode, checkins: [] } } }))
    setJoining(null)
    celebrate(btn)
    const c = CHALLENGES.find((x) => x.id === id)
    toast(`Joined “${c?.title}”${mode === 'friends' ? ' — invite link ready' : ''}`, { icon: c?.icon })
    if (mode === 'friends' && c) share(`Join me: ${c.title}`, `Join my EcoPulse challenge “${c.title}” — ${c.detail}`, 'community')
  }
  const leave = (id: string) => {
    const prev = state.challenges[id]
    update((s) => {
      const next = { ...s.challenges }
      delete next[id]
      return { ...s, challenges: next }
    })
    toast('Left challenge', { icon: '👋', undo: () => update((s) => ({ ...s, challenges: { ...s.challenges, [id]: prev } })) })
  }
  const checkIn = (id: string, btn: HTMLElement) => {
    update((s) => {
      const cs = s.challenges[id]
      if (!cs || cs.checkins.includes(today)) return s
      return { ...s, challenges: { ...s.challenges, [id]: { ...cs, checkins: [...cs.checkins, today] } } }
    })
    celebrate(btn)
    toast('Checked in for today', { icon: '✅' })
  }
  const toggleCheer = (id: string) => {
    const on = state.cheers.includes(id)
    update((s) => ({ ...s, cheers: on ? s.cheers.filter((c) => c !== id) : [...s.cheers, id] }))
  }
  const post = () => {
    const text = draft.trim()
    if (!text) return
    update((s) => ({ ...s, posts: [{ id: uid(), text: text.slice(0, 200), ts: Date.now(), anonymous: s.settings.anonymous }, ...s.posts].slice(0, 30) }))
    setDraft('')
    toast('Shared with the community', { icon: '💬' })
  }
  const toggleEvent = (id: string) => {
    const on = state.events.includes(id)
    update((s) => ({ ...s, events: on ? s.events.filter((e) => e !== id) : [...s.events, id] }))
    toast(on ? 'RSVP removed' : 'You’re going! Added to your plans', { icon: on ? '🗓️' : '🎉' })
  }

  const feed = [
    ...state.posts.map((p) => ({ id: p.id, author: p.anonymous ? 'Anonymous' : state.profile.name || 'You', avatar: '🌿', text: p.text, minutes: (Date.now() - p.ts) / 60000, cheers: 0, own: true })),
    ...SEED_POSTS.map((p) => ({ id: p.id, author: p.author, avatar: p.avatar, text: p.text, minutes: p.minutesAgo, cheers: p.cheers, own: false })),
  ].sort((a, b) => a.minutes - b.minutes)

  return (
    <>
      <section className="impact-banner big">
        <p className="eyebrow">This week, together</p>
        <strong>
          EcoPulse users saved {communityCo2.toLocaleString()} kg of CO₂ and {communityWater.toLocaleString()} L of water.
        </strong>
        <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={meterPct} aria-label="Community goal progress">
          <span style={{ width: `${meterPct}%` }} />
        </div>
        <small>
          {meterPct}% of this week’s 25,000 kg community goal · your share: {mine.co2.toFixed(1)} kg
        </small>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Challenges</p>
            <h3>This week’s challenges</h3>
          </div>
        </div>
        <div className="challenge-grid">
          {CHALLENGES.map((c) => {
            const joined = state.challenges[c.id]
            const prog = challengeProgress(state, c.id)
            const pct = Math.round((prog.done / prog.total) * 100)
            const completed = Boolean(joined?.completed)
            return (
              <article className={`challenge-card ${joined ? 'is-joined' : ''}`} key={c.id}>
                <span className="badge">{completed ? 'Completed' : joined ? (joined.mode === 'friends' ? 'With friends' : 'Joined') : c.badge}</span>
                <h4>
                  <span aria-hidden="true">{c.icon}</span> {c.title}
                </h4>
                <p>{c.detail}</p>
                <small className="xp">
                  {c.days} days · +{c.xp} XP
                </small>
                {joined ? (
                  <>
                    <div className="meter small" aria-label={`${prog.done} of ${prog.total} days`}>
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <small>
                      {prog.done}/{prog.total} days
                    </small>
                    <div className="challenge-btns">
                      {!completed && (
                        <button type="button" disabled={joined.checkins.includes(today)} onClick={(e) => checkIn(c.id, e.currentTarget)}>
                          {joined.checkins.includes(today) ? 'Checked in ✓' : 'Check in today'}
                        </button>
                      )}
                      <button type="button" className="ghost" onClick={() => leave(c.id)} aria-label={`Leave ${c.title}`}>
                        Leave
                      </button>
                    </div>
                  </>
                ) : joining === c.id ? (
                  <div className="challenge-btns">
                    <button type="button" onClick={(e) => join(c.id, 'solo', e.currentTarget)}>
                      Solo
                    </button>
                    <button type="button" onClick={(e) => join(c.id, 'friends', e.currentTarget)}>
                      With friends
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setJoining(c.id)}>
                    Join challenge
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Community</p>
            <h3>Weekly wins</h3>
          </div>
        </div>
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault()
            post()
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="“I biked to work today.” Share your win…" maxLength={200} aria-label="Share a win" />
          <button type="submit" className="primary-btn" disabled={!draft.trim()}>
            Share
          </button>
        </form>
        <small className="composer-hint">Posting as {name}. Posts stay on this device.</small>
        <div className="post-list">
          {feed.map((p) => {
            const cheered = state.cheers.includes(p.id)
            return (
              <article className={`post-card ${p.own ? 'own' : ''}`} key={p.id}>
                <div className="post-top">
                  <strong>
                    <span className="avatar" aria-hidden="true">{p.avatar}</span> {p.author}
                  </strong>
                  <span>{ago(p.minutes)}</span>
                </div>
                <p>{p.text}</p>
                <div className="post-actions">
                  <button type="button" className={`cheer ${cheered ? 'on' : ''}`} aria-pressed={cheered} onClick={() => toggleCheer(p.id)}>
                    👏 {p.cheers + (cheered ? 1 : 0)}
                  </button>
                  {p.own && (
                    <button type="button" className="cheer" onClick={() => update((s) => ({ ...s, posts: s.posts.filter((x) => x.id !== p.id) }))}>
                      Delete
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Nearby</p>
            <h3>Local events</h3>
          </div>
        </div>
        <div className="event-list">
          {EVENTS.map((ev) => {
            const going = state.events.includes(ev.id)
            return (
              <div className="event-item" key={ev.id}>
                <span className="event-icon" aria-hidden="true">{ev.icon}</span>
                <div>
                  <strong>{ev.title}</strong>
                  <small>
                    {ev.when} · {ev.where}
                  </small>
                </div>
                <button type="button" className={`mini-btn ${going ? 'done' : ''}`} aria-pressed={going} onClick={() => toggleEvent(ev.id)}>
                  {going ? 'Going ✓' : 'RSVP'}
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
