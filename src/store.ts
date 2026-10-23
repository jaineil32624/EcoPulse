import { ACTION_BY_ID, BADGES, CATEGORIES, CHALLENGES } from './data.ts'
import type { AppState, LogEntry, Profile } from './types.ts'

const KEY = 'ecopulse:v1'

export const DEFAULT_PROFILE: Profile = {
  name: '',
  location: '',
  household: 2,
  commute: 'transit',
  diet: 'flexitarian',
  energy: 'moderate',
  recycling: 'often',
  plastic: 'sometimes',
  coldLaundry: false,
  flights: 'one',
}

export function defaultState(): AppState {
  return {
    version: 1,
    onboarded: false,
    profile: { ...DEFAULT_PROFILE },
    goals: ['carbon-10'],
    habits: ['standby', 'bike-walk', 'meal-plan'],
    log: [],
    challenges: {},
    cheers: [],
    posts: [],
    events: [],
    learned: [],
    quizBest: 0,
    badges: {},
    settings: { anonymous: false, precision: 'approximate', reduceMotion: false, sound: true },
  }
}

export function loadState(): AppState {
  const base = defaultState()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (!parsed || typeof parsed !== 'object') return base
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      log: Array.isArray(parsed.log) ? parsed.log.filter((e) => e && ACTION_BY_ID[e.actionId]) : [],
      version: 1,
    }
  } catch {
    return base
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable (private mode / quota) — app keeps working in memory */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/* ---------- dates ---------- */

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  return dayKey(date)
}

export function shortDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short' })
}

/* ---------- derived stats ---------- */

export interface Totals {
  co2: number
  water: number
  waste: number
  count: number
}

export function totalsFor(entries: LogEntry[]): Totals {
  const t: Totals = { co2: 0, water: 0, waste: 0, count: entries.length }
  for (const e of entries) {
    const a = ACTION_BY_ID[e.actionId]
    if (!a) continue
    t.co2 += a.impact.co2
    t.water += a.impact.water
    t.waste += a.impact.waste
  }
  return t
}

export function activeDays(log: LogEntry[]): Set<string> {
  return new Set(log.map((e) => e.date))
}

/** Current streak: consecutive days with at least one action, ending today (or yesterday if today is empty). */
export function currentStreak(log: LogEntry[], today: string = dayKey()): number {
  const days = activeDays(log)
  let cursor = days.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function bestStreak(log: LogEntry[]): number {
  const days = [...activeDays(log)].sort()
  let best = 0
  let run = 0
  let prev = ''
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}

export function lastNDays(n: number, today: string = dayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)))
}

export function challengeProgress(state: AppState, id: string): { done: number; total: number } {
  const c = CHALLENGES.find((x) => x.id === id)
  const s = state.challenges[id]
  if (!c || !s) return { done: 0, total: c?.days ?? 1 }
  const days = new Set<string>(s.checkins)
  for (const e of state.log) {
    if (e.date >= s.joinedAt && c.actionIds.includes(e.actionId)) days.add(e.date)
  }
  return { done: Math.min(c.days, days.size), total: c.days }
}

export function planetScore(state: AppState): number {
  const t = totalsFor(state.log)
  const challengeXp = CHALLENGES.reduce((sum, c) => sum + (state.challenges[c.id]?.completed ? c.xp : 0), 0)
  return Math.round(100 + t.count * 5 + t.co2 * 2 + currentStreak(state.log) * 6 + challengeXp + Object.keys(state.badges).length * 10 + state.learned.length * 3)
}

export const LEVELS = [
  { min: 0, name: 'Seedling', icon: '🌱' },
  { min: 200, name: 'Sprout', icon: '🌿' },
  { min: 350, name: 'Sapling', icon: '🪴' },
  { min: 550, name: 'Young tree', icon: '🌳' },
  { min: 800, name: 'Grove keeper', icon: '🌲' },
  { min: 1200, name: 'Forest guardian', icon: '🏞️' },
]

export function levelFor(score: number): { index: number; name: string; icon: string; next: number | null; progress: number } {
  let index = 0
  for (let i = 0; i < LEVELS.length; i++) if (score >= LEVELS[i].min) index = i
  const cur = LEVELS[index]
  const nxt = LEVELS[index + 1]
  const progress = nxt ? (score - cur.min) / (nxt.min - cur.min) : 1
  return { index, name: cur.name, icon: cur.icon, next: nxt ? nxt.min : null, progress: Math.max(0, Math.min(1, progress)) }
}

/** Returns badge ids that are newly earned given the state. */
export function newlyEarnedBadges(state: AppState): string[] {
  const t = totalsFor(state.log)
  const cats = new Set(state.log.map((e) => ACTION_BY_ID[e.actionId]?.category))
  const checks: Record<string, boolean> = {
    'first-step': t.count >= 1,
    'streak-3': bestStreak(state.log) >= 3,
    'streak-7': bestStreak(state.log) >= 7,
    'ten-actions': t.count >= 10,
    'fifty-actions': t.count >= 50,
    'all-categories': CATEGORIES.every((c) => cats.has(c.id)),
    'co2-25': t.co2 >= 25,
    'challenge-done': Object.values(state.challenges).some((c) => Boolean(c.completed)),
    scholar: state.learned.length >= 5,
    'quiz-ace': state.quizBest >= 5,
    community: state.posts.length > 0 || state.cheers.length > 0,
  }
  return BADGES.filter((b) => checks[b.id] && !state.badges[b.id]).map((b) => b.id)
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}
