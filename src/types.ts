export type TabKey = 'home' | 'actions' | 'community' | 'learn' | 'profile'

export type Category = 'Energy' | 'Transport' | 'Food' | 'Waste'

export type Level = 'Easy' | 'Medium' | 'Hard'
export type TimeNeeded = 'Quick' | 'Medium' | 'Long'

export interface Impact {
  co2: number // kg CO2 saved per completion
  water: number // litres saved per completion
  waste: number // kg waste avoided per completion
}

export interface EcoAction {
  id: string
  title: string
  category: Category
  icon: string
  impact: Impact
  level: Level
  time: TimeNeeded
  reason: string
}

export interface LogEntry {
  id: string
  actionId: string
  date: string // YYYY-MM-DD (local)
  ts: number
  note?: string
}

export type Commute = 'car' | 'carpool' | 'transit' | 'bike' | 'remote'
export type Diet = 'meat' | 'flexitarian' | 'vegetarian' | 'vegan'
export type Energy = 'low' | 'moderate' | 'high'
export type Frequency = 'never' | 'sometimes' | 'often' | 'always'
export type Flights = 'none' | 'one' | 'few' | 'many'

export interface Profile {
  name: string
  location: string
  household: number
  commute: Commute
  diet: Diet
  energy: Energy
  recycling: Frequency
  plastic: Frequency
  coldLaundry: boolean
  flights: Flights
}

export interface Footprint {
  carbonYear: number // tonnes CO2e per person per year
  carbonMonth: number // kg CO2e per month
  waterDay: number // litres per day
  wasteScore: number // 0-100 (higher is better)
}

export interface ChallengeState {
  joinedAt: string
  mode: 'solo' | 'friends'
  checkins: string[] // dates
  completed?: string
}

export interface UserPost {
  id: string
  text: string
  ts: number
  anonymous: boolean
}

export interface Settings {
  anonymous: boolean
  precision: 'approximate' | 'precise'
  reduceMotion: boolean
  sound: boolean
}

export interface AppState {
  version: 1
  onboarded: boolean
  profile: Profile
  goals: string[]
  habits: string[]
  log: LogEntry[]
  challenges: Record<string, ChallengeState>
  cheers: string[]
  posts: UserPost[]
  events: string[]
  learned: string[]
  quizBest: number
  badges: Record<string, string> // badge id -> date earned
  settings: Settings
}
