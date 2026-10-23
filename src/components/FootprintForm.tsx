import type { Commute, Diet, Energy, Flights, Frequency, Profile } from '../types.ts'

interface Opt<T extends string> {
  v: T
  label: string
  icon: string
}

const COMMUTE: Opt<Commute>[] = [
  { v: 'car', label: 'Car', icon: '🚗' },
  { v: 'carpool', label: 'Carpool', icon: '🚙' },
  { v: 'transit', label: 'Transit', icon: '🚌' },
  { v: 'bike', label: 'Bike / walk', icon: '🚲' },
  { v: 'remote', label: 'Remote', icon: '🏠' },
]
const DIET: Opt<Diet>[] = [
  { v: 'meat', label: 'Meat most days', icon: '🍖' },
  { v: 'flexitarian', label: 'Flexitarian', icon: '🥪' },
  { v: 'vegetarian', label: 'Vegetarian', icon: '🧀' },
  { v: 'vegan', label: 'Vegan', icon: '🥦' },
]
const ENERGY: Opt<Energy>[] = [
  { v: 'low', label: 'Low', icon: '🕯️' },
  { v: 'moderate', label: 'Moderate', icon: '💡' },
  { v: 'high', label: 'High', icon: '🔆' },
]
const FREQ: Opt<Frequency>[] = [
  { v: 'never', label: 'Never', icon: '' },
  { v: 'sometimes', label: 'Sometimes', icon: '' },
  { v: 'often', label: 'Often', icon: '' },
  { v: 'always', label: 'Always', icon: '' },
]
const FLIGHTS: Opt<Flights>[] = [
  { v: 'none', label: 'None', icon: '' },
  { v: 'one', label: '1 / year', icon: '' },
  { v: 'few', label: '2–4', icon: '' },
  { v: 'many', label: '5+', icon: '' },
]

function Chips<T extends string>({ name, opts, value, onChange }: { name: string; opts: Opt<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="chip-row" role="radiogroup" aria-label={name}>
      {opts.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} className={`chip ${value === o.v ? 'on' : ''}`} onClick={() => onChange(o.v)}>
          {o.icon && <span aria-hidden="true">{o.icon}</span>} {o.label}
        </button>
      ))}
    </div>
  )
}

export type Section = 'about' | 'travel' | 'home' | 'habits'

export function FootprintForm({ profile, onChange, sections }: { profile: Profile; onChange: (p: Profile) => void; sections: Section[] }) {
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...profile, [k]: v })
  return (
    <div className="fp-form">
      {sections.includes('about') && (
        <>
          <label className="field">
            <span>What should we call you?</span>
            <input value={profile.name} maxLength={24} placeholder="e.g. Ava" onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className="field">
            <span>City or region</span>
            <input value={profile.location} maxLength={40} placeholder="e.g. Seattle, WA" onChange={(e) => set('location', e.target.value)} />
          </label>
          <div className="field">
            <span>Household size</span>
            <div className="stepper">
              <button type="button" aria-label="Fewer people" onClick={() => set('household', Math.max(1, profile.household - 1))}>
                −
              </button>
              <strong aria-live="polite">{profile.household}</strong>
              <button type="button" aria-label="More people" onClick={() => set('household', Math.min(10, profile.household + 1))}>
                +
              </button>
              <small>{profile.household === 1 ? 'just me' : 'people'}</small>
            </div>
          </div>
        </>
      )}
      {sections.includes('travel') && (
        <>
          <div className="field">
            <span>Typical commute</span>
            <Chips name="Commute" opts={COMMUTE} value={profile.commute} onChange={(v) => set('commute', v)} />
          </div>
          <div className="field">
            <span>Flights per year</span>
            <Chips name="Flights" opts={FLIGHTS} value={profile.flights} onChange={(v) => set('flights', v)} />
          </div>
        </>
      )}
      {sections.includes('home') && (
        <>
          <div className="field">
            <span>Diet</span>
            <Chips name="Diet" opts={DIET} value={profile.diet} onChange={(v) => set('diet', v)} />
          </div>
          <div className="field">
            <span>Home energy use</span>
            <Chips name="Energy" opts={ENERGY} value={profile.energy} onChange={(v) => set('energy', v)} />
          </div>
        </>
      )}
      {sections.includes('habits') && (
        <>
          <div className="field">
            <span>How often do you recycle?</span>
            <Chips name="Recycling" opts={FREQ} value={profile.recycling} onChange={(v) => set('recycling', v)} />
          </div>
          <div className="field">
            <span>Single-use plastic</span>
            <Chips name="Plastic" opts={FREQ} value={profile.plastic} onChange={(v) => set('plastic', v)} />
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={profile.coldLaundry} onChange={(e) => set('coldLaundry', e.target.checked)} />
            <span className="switch" aria-hidden="true" />
            <span>I usually wash laundry in cold water</span>
          </label>
        </>
      )}
    </div>
  )
}
