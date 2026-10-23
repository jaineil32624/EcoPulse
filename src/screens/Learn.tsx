import { useState } from 'react'
import { useApi } from '../context.ts'
import { LEARN_CARDS, QUIZ } from '../data.ts'

export function Learn() {
  const { state, update, toast, celebrate } = useApi()
  const [expanded, setExpanded] = useState<string | null>('carbon')
  const [flipped, setFlipped] = useState<string[]>([])
  const [quizIdx, setQuizIdx] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const openCard = (id: string) => {
    const next = expanded === id ? null : id
    setExpanded(next)
    if (next && !state.learned.includes(id)) update((s) => ({ ...s, learned: [...s.learned, id] }))
  }

  const answer = (i: number, btn: HTMLElement) => {
    if (quizIdx === null || picked !== null) return
    setPicked(i)
    if (i === QUIZ[quizIdx].answer) {
      setScore((s) => s + 1)
      celebrate(btn)
    }
  }
  const nextQ = () => {
    if (quizIdx === null) return
    if (quizIdx + 1 >= QUIZ.length) {
      const final = score
      update((s) => ({ ...s, quizBest: Math.max(s.quizBest, final) }))
      toast(`Quiz done: ${final}/${QUIZ.length}${final === QUIZ.length ? ' — perfect!' : ''}`, { icon: '🧠' })
      setQuizIdx(null)
    } else {
      setQuizIdx(quizIdx + 1)
    }
    setPicked(null)
  }

  const myths = LEARN_CARDS.filter((c) => c.myth)
  const q = quizIdx !== null ? QUIZ[quizIdx] : null

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Learn</p>
            <h3>Helpful ideas, made simple</h3>
          </div>
          <span className="count-pill">
            {state.learned.length}/{LEARN_CARDS.length} read
          </span>
        </div>
        <div className="learn-list">
          {LEARN_CARDS.map((card) => {
            const isOpen = expanded === card.id
            const read = state.learned.includes(card.id)
            return (
              <article className={`learn-card ${isOpen ? 'open' : ''}`} key={card.id}>
                <button type="button" className="learn-toggle" aria-expanded={isOpen} onClick={() => openCard(card.id)}>
                  <span>
                    <span aria-hidden="true">{card.icon}</span> {card.title} {read && <small className="read-dot" title="Read">●</small>}
                  </span>
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="learn-body">
                    <p>{card.body}</p>
                    <p className="more">{card.more}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Myth vs fact</p>
            <h3>Tap a card to flip it</h3>
          </div>
        </div>
        <div className="myth-grid">
          {myths.map((c) => {
            const on = flipped.includes(c.id)
            return (
              <button
                type="button"
                key={c.id}
                className={`myth-card ${on ? 'flipped' : ''}`}
                aria-pressed={on}
                onClick={() => setFlipped((f) => (on ? f.filter((x) => x !== c.id) : [...f, c.id]))}
              >
                <span className="myth-inner">
                  <span className="myth-face front">
                    <b>Myth</b>
                    {c.myth?.myth}
                  </span>
                  <span className="myth-face back">
                    <b>Fact</b>
                    {c.myth?.fact}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel quiz-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Quick quiz</p>
            <h3>{q ? `Question ${(quizIdx ?? 0) + 1} of ${QUIZ.length}` : 'Test what you know'}</h3>
          </div>
          {state.quizBest > 0 && <span className="count-pill">Best {state.quizBest}/{QUIZ.length}</span>}
        </div>
        {!q ? (
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setScore(0)
              setPicked(null)
              setQuizIdx(0)
            }}
          >
            Start the 5-question quiz
          </button>
        ) : (
          <div className="quiz">
            <p className="quiz-q">{q.q}</p>
            <div className="quiz-opts">
              {q.options.map((o, i) => {
                const state2 = picked === null ? '' : i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim'
                return (
                  <button type="button" key={o} className={`quiz-opt ${state2}`} disabled={picked !== null} onClick={(e) => answer(i, e.currentTarget)}>
                    {o}
                  </button>
                )
              })}
            </div>
            {picked !== null && (
              <div className="quiz-why">
                <p>
                  {picked === q.answer ? '✅ Correct! ' : '💡 Not quite. '}
                  {q.why}
                </p>
                <button type="button" className="primary-btn" onClick={nextQ}>
                  {(quizIdx ?? 0) + 1 >= QUIZ.length ? 'See score' : 'Next question'}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}
