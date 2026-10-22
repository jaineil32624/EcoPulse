import type { Category, EcoAction, Footprint, Profile } from './types.ts'

export const CATEGORIES: { id: Category; icon: string; tint: string }[] = [
  { id: 'Energy', icon: '⚡', tint: '#f2c94c' },
  { id: 'Transport', icon: '🚲', tint: '#5aa9d6' },
  { id: 'Food', icon: '🥗', tint: '#6fbf73' },
  { id: 'Waste', icon: '♻️', tint: '#9b8ad6' },
]

export const ACTIONS: EcoAction[] = [
  { id: 'standby', title: 'Turn off standby devices', category: 'Energy', icon: '🔌', impact: { co2: 0.2, water: 0, waste: 0 }, level: 'Easy', time: 'Quick', reason: 'TVs, consoles and chargers on standby can use 5–10% of household electricity without doing anything useful.' },
  { id: 'cold-wash', title: 'Wash laundry in cold water', category: 'Energy', icon: '🧺', impact: { co2: 0.6, water: 0, waste: 0 }, level: 'Easy', time: 'Quick', reason: 'Around 90% of a washing machine’s energy goes into heating water. Modern detergents clean well at 30°C.' },
  { id: 'air-dry', title: 'Air-dry a load of laundry', category: 'Energy', icon: '👕', impact: { co2: 1.8, water: 0, waste: 0 }, level: 'Medium', time: 'Medium', reason: 'A tumble dryer is one of the most power-hungry appliances at home. A rack and a breeze are free.' },
  { id: 'thermostat', title: 'Nudge the thermostat 1°C', category: 'Energy', icon: '🌡️', impact: { co2: 0.9, water: 0, waste: 0 }, level: 'Easy', time: 'Quick', reason: 'Each degree of heating or cooling you skip trims roughly 6–10% off that energy use.' },
  { id: 'short-shower', title: 'Take a 5-minute shower', category: 'Energy', icon: '🚿', impact: { co2: 0.4, water: 40, waste: 0 }, level: 'Easy', time: 'Quick', reason: 'Shorter showers save both the water and the energy used to heat it.' },
  { id: 'bike-walk', title: 'Bike or walk a short trip', category: 'Transport', icon: '🚶', impact: { co2: 1.2, water: 0, waste: 0 }, level: 'Easy', time: 'Medium', reason: 'Short car trips are the least efficient: cold engines burn more fuel. Walking or biking also boosts your mood.' },
  { id: 'transit', title: 'Take public transit', category: 'Transport', icon: '🚌', impact: { co2: 2.1, water: 0, waste: 0 }, level: 'Easy', time: 'Medium', reason: 'A full bus or train moves many people for the emissions of a few cars.' },
  { id: 'carpool', title: 'Carpool with someone', category: 'Transport', icon: '🚗', impact: { co2: 1.6, water: 0, waste: 0 }, level: 'Medium', time: 'Quick', reason: 'Sharing a ride splits the emissions of the trip between everyone on board.' },
  { id: 'wfh', title: 'Skip a commute (work/study from home)', category: 'Transport', icon: '🏠', impact: { co2: 3.0, water: 0, waste: 0 }, level: 'Medium', time: 'Quick', reason: 'The greenest trip is the one you do not need to take.' },
  { id: 'veg-meal', title: 'Eat a vegetarian meal', category: 'Food', icon: '🥕', impact: { co2: 1.4, water: 300, waste: 0 }, level: 'Easy', time: 'Quick', reason: 'Plant-based meals usually need far less land, water and energy than meat-heavy ones.' },
  { id: 'plant-day', title: 'Go fully plant-based today', category: 'Food', icon: '🌱', impact: { co2: 3.2, water: 900, waste: 0 }, level: 'Hard', time: 'Long', reason: 'One plant-based day a week adds up to a big cut over a year — and it’s a fun cooking challenge.' },
  { id: 'meal-plan', title: 'Plan meals to avoid food waste', category: 'Food', icon: '📝', impact: { co2: 0.8, water: 120, waste: 0.6 }, level: 'Medium', time: 'Medium', reason: 'Roughly a third of food is wasted. A quick plan and a shopping list keep it on your plate, not in the bin.' },
  { id: 'leftovers', title: 'Eat up leftovers', category: 'Food', icon: '🍱', impact: { co2: 0.5, water: 80, waste: 0.4 }, level: 'Easy', time: 'Quick', reason: 'Food that gets eaten never needs replacing — saving all the energy it took to grow and ship.' },
  { id: 'local', title: 'Buy local or seasonal produce', category: 'Food', icon: '🧺', impact: { co2: 0.4, water: 0, waste: 0.1 }, level: 'Easy', time: 'Medium', reason: 'Seasonal food skips heated greenhouses and long cold-chain shipping.' },
  { id: 'bottle', title: 'Use a reusable bottle', category: 'Waste', icon: '🧴', impact: { co2: 0.1, water: 3, waste: 0.05 }, level: 'Easy', time: 'Quick', reason: 'Every refill is one less single-use bottle made, shipped and thrown away.' },
  { id: 'bag', title: 'Bring a reusable bag', category: 'Waste', icon: '🛍️', impact: { co2: 0.05, water: 0, waste: 0.03 }, level: 'Easy', time: 'Quick', reason: 'Small, but easy to repeat — and it keeps plastic out of rivers and oceans.' },
  { id: 'compost', title: 'Compost food scraps', category: 'Waste', icon: '🪱', impact: { co2: 0.5, water: 0, waste: 0.8 }, level: 'Medium', time: 'Quick', reason: 'Food in landfill makes methane. In compost it turns into soil food instead.' },
  { id: 'recycle', title: 'Sort recyclables correctly', category: 'Waste', icon: '♻️', impact: { co2: 0.3, water: 0, waste: 0.5 }, level: 'Easy', time: 'Quick', reason: 'Clean, correctly sorted recycling actually gets recycled; contaminated loads often get landfilled.' },
  { id: 'repair', title: 'Repair or reuse instead of buying', category: 'Waste', icon: '🧵', impact: { co2: 2.5, water: 200, waste: 0.5 }, level: 'Hard', time: 'Long', reason: 'Most of a product’s footprint comes from making it. Making it last longer is a big win.' },
]

export const ACTION_BY_ID: Record<string, EcoAction> = Object.fromEntries(ACTIONS.map((a) => [a.id, a]))

export interface Challenge {
  id: string
  title: string
  detail: string
  badge: string
  icon: string
  days: number
  actionIds: string[]
  xp: number
}

export const CHALLENGES: Challenge[] = [
  { id: 'car-free', title: 'Car-free day', detail: 'Skip car trips — walk, bike or ride transit.', badge: 'New', icon: '🚲', days: 3, actionIds: ['bike-walk', 'transit', 'carpool', 'wfh'], xp: 60 },
  { id: 'no-plastic', title: 'Zero single-use plastic', detail: 'Bring a reusable bottle and bag every day.', badge: 'Trending', icon: '🧴', days: 7, actionIds: ['bottle', 'bag'], xp: 120 },
  { id: 'plant-weekend', title: 'Plant-based weekend', detail: 'Two days of delicious plant-powered meals.', badge: 'Tasty', icon: '🌱', days: 2, actionIds: ['veg-meal', 'plant-day'], xp: 50 },
  { id: 'energy-saver', title: 'Energy saver week', detail: 'One energy-saving action a day for 5 days.', badge: 'Popular', icon: '⚡', days: 5, actionIds: ['standby', 'cold-wash', 'air-dry', 'thermostat', 'short-shower'], xp: 90 },
  { id: 'waste-warrior', title: 'Waste warrior', detail: 'Compost, sort or repair — 4 days of less trash.', badge: 'Hands-on', icon: '🪱', days: 4, actionIds: ['compost', 'recycle', 'repair', 'leftovers', 'meal-plan'], xp: 80 },
]

export interface LearnCard {
  id: string
  title: string
  icon: string
  body: string
  more: string
  myth?: { myth: string; fact: string }
}

export const LEARN_CARDS: LearnCard[] = [
  { id: 'carbon', icon: '👣', title: 'What is a carbon footprint?', body: 'A carbon footprint is the total greenhouse gas impact of your daily choices, from transport to food.', more: 'It is measured in CO₂-equivalent (CO₂e), which converts gases like methane into the amount of CO₂ that would warm the planet by the same amount. The global average is about 4.7 tonnes per person per year; the US average is around 14 tonnes.' },
  { id: 'small', icon: '🌊', title: 'Why small actions matter', body: 'When millions of people make small changes, the impact grows fast and becomes measurable.', more: 'If one million people each skipped one 10 km car trip a week, that would save roughly 100,000 tonnes of CO₂ a year — like taking 20,000 cars off the road. Habits also spread: people copy what their friends and neighbors do.' },
  { id: 'recycle-myth', icon: '♻️', title: 'Myth vs fact: recycling', body: 'Recycling matters — but only when it’s done right.', more: 'Rinse containers, keep recycling dry, and check what your local program accepts. Reduce and reuse come first: they avoid the footprint of making something at all.', myth: { myth: 'Everything with a recycling symbol gets recycled.', fact: 'The symbol shows the plastic type, not that your area accepts it. Check your local rules.' } },
  { id: 'renewable-myth', icon: '☀️', title: 'Myth vs fact: renewable energy', body: 'Solar and wind are now the cheapest new electricity in most of the world.', more: 'Grids balance supply with storage, hydro, interconnection and demand that shifts in time. Each year the share of clean power grows and the cost keeps falling.', myth: { myth: 'Renewables can’t power a grid because the sun sets.', fact: 'Batteries, wind at night, hydro and smart demand already keep grids stable with high renewable shares.' } },
  { id: 'food', icon: '🍽️', title: 'Food: what matters most', body: 'What you eat usually matters more than how far it travelled.', more: 'Transport is typically under 10% of a food’s footprint. Beef and lamb have the highest impact per gram of protein; beans, lentils and tofu are among the lowest.', myth: { myth: 'Eating local is always the greenest choice.', fact: 'What you eat matters far more than food miles for most foods.' } },
  { id: 'water', icon: '💧', title: 'Hidden water', body: 'Most of the water you “use” is hidden inside food and products.', more: 'A cup of coffee takes about 130 litres of water to produce from bean to cup; a cotton T-shirt about 2,700 litres. Choosing to reuse and waste less food saves this “virtual water”.' },
  { id: 'greenhouse', icon: '🌍', title: 'The greenhouse effect, simply', body: 'Greenhouse gases act like a blanket that keeps heat close to Earth.', more: 'A natural blanket keeps Earth livable. Burning fossil fuels thickens that blanket, so more heat stays in and the climate warms. Thinning it again means cutting emissions and protecting forests and soils.' },
]

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
  why: string
}

export const QUIZ: QuizQuestion[] = [
  { q: 'Which usually has the biggest impact on a meal’s footprint?', options: ['How far it travelled', 'What food it is', 'The packaging'], answer: 1, why: 'Food type dominates — transport is typically under 10%.' },
  { q: 'Most of a washing machine’s energy goes into…', options: ['Spinning the drum', 'Heating the water', 'The display'], answer: 1, why: 'Around 90% heats water, so cold washes save a lot.' },
  { q: 'Food in landfill mainly produces which gas?', options: ['Methane', 'Oxygen', 'Helium'], answer: 0, why: 'Without air it rots into methane, a potent greenhouse gas.' },
  { q: 'The recycling symbol with a number tells you…', options: ['It will be recycled', 'The plastic type', 'It is compostable'], answer: 1, why: 'It identifies the resin type, not local acceptance.' },
  { q: 'Roughly what share of food is wasted globally?', options: ['About 5%', 'About a third', 'About 80%'], answer: 1, why: 'Around one third of all food is lost or wasted.' },
]

export interface Badge {
  id: string
  icon: string
  title: string
  detail: string
}

export const BADGES: Badge[] = [
  { id: 'first-step', icon: '🌱', title: 'First step', detail: 'Log your first action' },
  { id: 'streak-3', icon: '🔥', title: 'On a roll', detail: '3-day streak' },
  { id: 'streak-7', icon: '🌟', title: 'Week of wins', detail: '7-day streak' },
  { id: 'ten-actions', icon: '🔟', title: 'Ten strong', detail: 'Log 10 actions' },
  { id: 'fifty-actions', icon: '🏅', title: 'Half century', detail: 'Log 50 actions' },
  { id: 'all-categories', icon: '🌈', title: 'Well-rounded', detail: 'Log an action in every category' },
  { id: 'co2-25', icon: '☁️', title: 'Cloud lifter', detail: 'Save 25 kg CO₂' },
  { id: 'challenge-done', icon: '🏆', title: 'Challenger', detail: 'Finish a challenge' },
  { id: 'scholar', icon: '📘', title: 'Curious mind', detail: 'Read 5 learn cards' },
  { id: 'quiz-ace', icon: '🧠', title: 'Quiz ace', detail: 'Score 5/5 on the quiz' },
  { id: 'community', icon: '💬', title: 'Good vibes', detail: 'Share a win or cheer someone' },
]

export const GOAL_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: 'carbon-10', label: 'Reduce my carbon footprint by 10% in 3 months', icon: '☁️' },
  { id: 'food-waste', label: 'Cut food waste in half', icon: '🍎' },
  { id: 'actions-20', label: 'Complete 20 sustainable actions this month', icon: '✅' },
  { id: 'challenge-weekly', label: 'Join one community challenge per week', icon: '🤝' },
]

export const SEED_POSTS = [
  { id: 'p1', author: 'Mina', avatar: '🦊', text: 'Took the bus and logged a low-carbon day. Feeling good.', minutesAgo: 12, cheers: 14 },
  { id: 'p2', author: 'Theo', avatar: '🐢', text: 'Composted my kitchen scraps for the first time.', minutesAgo: 60, cheers: 22 },
  { id: 'p3', author: 'Priya', avatar: '🦉', text: 'Week 3 of plant-based Mondays — lentil tacos were a hit with the whole family.', minutesAgo: 180, cheers: 31 },
  { id: 'p4', author: 'Sam', avatar: '🐝', text: 'Fixed my bike’s flat instead of driving. 4 km of sunshine.', minutesAgo: 320, cheers: 9 },
]

export const EVENTS = [
  { id: 'e1', title: 'Neighborhood park cleanup', when: 'Sat · 9:00 AM', where: 'Riverside Park', icon: '🧤' },
  { id: 'e2', title: 'Community tree planting', when: 'Sun · 10:30 AM', where: 'Oak Street green', icon: '🌳' },
  { id: 'e3', title: 'Repair café workshop', when: 'Wed · 6:00 PM', where: 'Public library', icon: '🔧' },
]

export const TIPS = [
  'Unplug chargers when your devices are full — small, but it adds up.',
  'Keep a reusable bottle by the door so you never forget it.',
  'Batch errands into one trip to cut driving.',
  'Freeze bread and leftovers before they go stale.',
  'A lid on the pot boils water faster and saves energy.',
  'Try one new plant-based recipe this week.',
  'Lower your water heater to 50°C (120°F).',
  'Check the recycling rules for your area — they vary a lot.',
]

export const REGION_AVERAGE_T = 8.0 // t CO2e / person / year baseline comparison

/** Rough, transparent footprint estimate — not a scientific audit. */
export function estimateFootprint(p: Profile): Footprint {
  const commute = { car: 3.2, carpool: 1.8, transit: 1.0, bike: 0.2, remote: 0.4 }[p.commute]
  const diet = { meat: 2.5, flexitarian: 1.9, vegetarian: 1.4, vegan: 1.1 }[p.diet]
  const energyHome = { low: 2.4, moderate: 4.2, high: 6.6 }[p.energy]
  const energy = energyHome / Math.max(1, Math.sqrt(p.household)) - (p.coldLaundry ? 0.15 : 0)
  const flights = { none: 0, one: 0.6, few: 1.6, many: 3.8 }[p.flights]
  const recycle = { never: 0.5, sometimes: 0.35, often: 0.2, always: 0.1 }[p.recycling]
  const plastic = { never: 0.05, sometimes: 0.12, often: 0.22, always: 0.3 }[p.plastic]
  const carbonYear = Math.max(1, commute + diet + energy + flights + recycle + plastic + 0.9)
  const waterDiet = { meat: 220, flexitarian: 190, vegetarian: 160, vegan: 150 }[p.diet]
  const waterDay = Math.round(waterDiet + (p.energy === 'high' ? 40 : p.energy === 'moderate' ? 25 : 15) - (p.household > 2 ? 10 : 0))
  const recycleScore = { never: 10, sometimes: 35, often: 55, always: 65 }[p.recycling]
  const plasticScore = { never: 35, sometimes: 25, often: 12, always: 4 }[p.plastic]
  const wasteScore = Math.min(100, recycleScore + plasticScore)
  return { carbonYear: round1(carbonYear), carbonMonth: Math.round((carbonYear * 1000) / 12), waterDay, wasteScore }
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}
