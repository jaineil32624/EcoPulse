import { useState } from 'react'
import './App.css'

type TabKey = 'home' | 'actions' | 'community' | 'learn' | 'profile'

const tabs = [
  { id: 'home' as const, label: 'Home', icon: '🌿' },
  { id: 'actions' as const, label: 'Actions', icon: '✅' },
  { id: 'community' as const, label: 'Community', icon: '💬' },
  { id: 'learn' as const, label: 'Learn', icon: '📘' },
  { id: 'profile' as const, label: 'Profile', icon: '👤' },
]

const stats = [
  { label: 'Carbon', value: '4.2 t', hint: 'Monthly estimate' },
  { label: 'Water', value: '1.8k L', hint: 'This month' },
  { label: 'Waste', value: '82/100', hint: 'Recycling score' },
]

const actions = [
  { title: 'Turn off standby devices', category: 'Energy', impact: '1.2 kg CO₂ saved/week', time: 'Quick', level: 'Easy' },
  { title: 'Bike or walk for short trips', category: 'Transport', impact: '2.4 kg CO₂ saved/week', time: 'Quick', level: 'Easy' },
  { title: 'Plan meals to reduce waste', category: 'Food', impact: '0.8 kg waste avoided/week', time: 'Medium', level: 'Medium' },
]

const challenges = [
  { title: 'Car-free day', detail: 'Skip one car trip this week', badge: 'New' },
  { title: 'Zero single-use plastic', detail: 'Bring a reusable bottle and bag', badge: 'Trending' },
]

const posts = [
  { author: 'Mina', text: 'Took the bus and logged a low-carbon day. Feeling good.', meta: '12 min ago' },
  { author: 'Theo', text: 'Composted my kitchen scraps for the first time.', meta: '1 hr ago' },
]

const learnCards = [
  { id: 'carbon', title: 'What is a carbon footprint?', body: 'A carbon footprint is the total greenhouse gas impact of your daily choices, from transport to food.' },
  { id: 'small', title: 'Why small actions matter', body: 'When millions of people make small changes, the impact grows fast and becomes measurable.' },
]

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [completedActions, setCompletedActions] = useState<string[]>(['Turn off standby devices'])
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>(['Car-free day'])
  const [expandedLearn, setExpandedLearn] = useState<string | null>('carbon')

  const goalProgress = Math.min(100, 62 + completedActions.length * 8 + joinedChallenges.length * 5)
  const planetScore = 132 + completedActions.length * 7 + joinedChallenges.length * 8

  const toggleAction = (title: string) => {
    setCompletedActions((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    )
  }

  const toggleChallenge = (title: string) => {
    setJoinedChallenges((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    )
  }

  const ringStyle = { ['--value' as string]: `${goalProgress}%` }

  return (
    <div className="app-shell">
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
          <div>
            <p className="eyebrow">EcoPulse</p>
            <h1>Progress, not perfection.</h1>
          </div>
          <button type="button" className="icon-btn" onClick={() => setActiveTab('profile')}>
            ⚙️
          </button>
        </header>

        <main className="content-area">
          {activeTab === 'home' && (
            <>
              <section className="hero-card">
                <div>
                  <p className="eyebrow">Today’s snapshot</p>
                  <h2>Small steps, steady progress.</h2>
                  <p className="hero-copy">
                    You’re on track to cut your footprint with a few simple habits this week.
                  </p>
                  <div className="hero-actions">
                    <button type="button" className="primary-btn" onClick={() => setActiveTab('actions')}>
                      Log an action
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => setActiveTab('community')}>
                      See community
                    </button>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="score-tile">
                    <div className="ring" style={ringStyle}>
                      <span>{goalProgress}%</span>
                    </div>
                    <div className="score-info">
                      <strong>Goal on track</strong>
                      <p>Keep the pace steady with one action today.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="stats-grid">
                {stats.map((stat) => (
                  <article className="stat-card" key={stat.label}>
                    <p>{stat.label}</p>
                    <h3>{stat.value}</h3>
                    <span>{stat.hint}</span>
                  </article>
                ))}
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">This month</p>
                    <h3>Impact trend</h3>
                  </div>
                </div>
                <div className="chart-card">
                  <svg viewBox="0 0 280 120" className="line-chart" aria-label="Impact trend chart">
                    <path d="M10 90 C55 75, 75 70, 100 72 S155 85, 180 70 S230 40, 270 22" className="chart-line" />
                  </svg>
                  <div className="bar-chart" aria-label="Weekly impact bars">
                    {[48, 70, 58, 82, 63].map((height, index) => (
                      <div key={index} className="bar" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'actions' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Daily actions</p>
                  <h3>Small wins you can try</h3>
                </div>
              </div>
              <div className="action-list">
                {actions.map((action) => {
                  const done = completedActions.includes(action.title)
                  return (
                    <div className="action-item" key={action.title}>
                      <div>
                        <strong>{action.title}</strong>
                        <p>{action.category} • {action.impact}</p>
                      </div>
                      <div className="action-meta">
                        <span>{action.level}</span>
                        <span>{action.time}</span>
                        <button type="button" className={`mini-btn ${done ? 'done' : ''}`} onClick={() => toggleAction(action.title)}>
                          {done ? 'Completed' : 'Complete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {activeTab === 'community' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Community</p>
                  <h3>Weekly wins</h3>
                </div>
              </div>
              <div className="impact-banner">
                <strong>{planetScore} points</strong>
                <p>saved together by EcoPulse users this week</p>
              </div>
              <div className="post-list">
                {posts.map((post) => (
                  <article className="post-card" key={post.author + post.meta}>
                    <div className="post-top">
                      <strong>{post.author}</strong>
                      <span>{post.meta}</span>
                    </div>
                    <p>{post.text}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'learn' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Learn</p>
                  <h3>Helpful ideas, made simple</h3>
                </div>
              </div>
              <div className="learn-list">
                {learnCards.map((card) => {
                  const isOpen = expandedLearn === card.id
                  return (
                    <article className="learn-card" key={card.id}>
                      <button type="button" className="learn-toggle" onClick={() => setExpandedLearn(isOpen ? null : card.id)}>
                        <span>{card.title}</span>
                        <span>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <p>{card.body}</p>}
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {activeTab === 'profile' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Profile</p>
                  <h3>Your goals</h3>
                </div>
              </div>
              <div className="profile-card">
                <p className="goal-pill">Reduce my carbon footprint by 10% in 3 months</p>
                <p>Current streak: 6 days</p>
                <p>Badges unlocked: 3</p>
              </div>
              <div className="challenge-grid">
                {challenges.map((challenge) => {
                  const joined = joinedChallenges.includes(challenge.title)
                  return (
                    <article className="challenge-card" key={challenge.title}>
                      <span className="badge">{challenge.badge}</span>
                      <h4>{challenge.title}</h4>
                      <p>{challenge.detail}</p>
                      <button type="button" className={joined ? 'joined' : ''} onClick={() => toggleChallenge(challenge.title)}>
                        {joined ? 'Joined' : 'Join challenge'}
                      </button>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </main>

        <nav className="bottom-nav" aria-label="Primary">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span>{tab.icon}</span>
              <small>{tab.label}</small>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default App
