import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('summary')

  if (state && state.alreadyAttempted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚫</div>
          <h2 style={{ color: 'var(--error)', marginBottom: '8px' }}>Already Attempted!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Aapne <strong>{state.testTitle}</strong> pehle hi attempt kar liya hai.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
            Ek username se sirf ek baar attempt allowed hai.
          </p>
        </div>
      </div>
    )
  }

  if (!state || !state.result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="alert alert-error">Result nahi mila.</div>
      </div>
    )
  }

  var result = state.result
  var testTitle = state.testTitle
  var testId = state.testId

  var score = result.score || 0
  var total = result.total || 0
  var correct = result.correct || 0
  var incorrect = result.incorrect || 0
  var unattempted = result.unattempted || 0
  var accuracy = result.accuracy || 0
  var rank = result.rank || 0
  var time_taken_seconds = result.time_taken_seconds || 0
  var wrong_questions = result.wrong_questions || []
  var skipped_questions = result.skipped_questions || []
  var answers = result.answers || []

  function formatTime(sec) {
    var m = Math.floor(sec / 60)
    var s = sec % 60
    return m + ' min ' + s + ' sec'
  }

  function getGrade() {
    if (accuracy >= 90) return { label: 'Excellent! 🏆', color: '#FFD700' }
    if (accuracy >= 75) return { label: 'Very Good! 🌟', color: 'var(--success)' }
    if (accuracy >= 60) return { label: 'Good 👍', color: 'var(--saffron)' }
    if (accuracy >= 40) return { label: 'Average 📚', color: '#E67E22' }
    return { label: 'Need Practice 💪', color: 'var(--error)' }
  }

  var grade = getGrade()

  var answerMap = {}
  answers.forEach(function(a) {
    answerMap[String(a.question_id)] = a.selected_option
  })

  var tabs = [
    { key: 'summary', label: '📊 Summary' },
    { key: 'wrong',   label: '❌ Wrong (' + wrong_questions.length + ')' },
    { key: 'skipped', label: '⬜ Skipped (' + skipped_questions.length + ')' },
    { key: 'all',     label: '📋 All Answers' }
  ]

  function QuestionCard(props) {
    var q = props.q
    var index = props.index
    var label = props.label
    var labelColor = props.labelColor
    var labelBg = props.labelBg
    var studentAns = props.studentAns

    return (
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: labelBg, color: labelColor }}>
            {label} Q{index + 1}
          </span>
          <span className="badge" style={{ background: '#FFF3CD', color: '#856404', fontSize: '0.7rem' }}>
            {q.type ? q.type.replace(/_/g, ' ') : 'mcq'}
          </span>
        </div>

        <p className="deva" style={{ fontSize: '0.95rem', lineHeight: '1.9', marginBottom: '12px', fontWeight: 500 }}>
          {q.text}
        </p>

        {Object.entries(q.options).map(function(entry) {
          var key = entry[0]
          var val = entry[1]
          var isCorrect = key === q.correct_answer
          var isSelected = key === studentAns
          return (
            <div key={key} style={{
              padding: '8px 14px',
              marginBottom: '6px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              border: '2px solid ' + (isCorrect ? 'var(--success)' : isSelected ? 'var(--error)' : 'var(--border)'),
              background: isCorrect ? 'var(--green-light)' : isSelected ? '#FDE8E8' : 'white',
              fontWeight: (isCorrect || isSelected) ? 600 : 400
            }} className="deva">
              {isCorrect ? '✅' : isSelected ? '❌' : '○'} <strong>{key}.</strong> {val}
              {isCorrect && (
                <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginLeft: '8px' }}>(सही उत्तर)</span>
              )}
              {isSelected && !isCorrect && (
                <span style={{ fontSize: '0.72rem', color: 'var(--error)', marginLeft: '8px' }}>(आपका उत्तर)</span>
              )}
            </div>
          )
        })}

        {q.explanation && (
          <div style={{ marginTop: '10px', padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px', fontSize: '0.85rem' }}>
            💡 <strong>व्याख्या:</strong> {q.explanation}
          </div>
        )}
        {q.reference && (
          <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            📖 {q.reference}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>

      <div style={{ background: 'var(--dark)', color: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.2rem' }}>🌿</div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--saffron)' }}>Ayurthon</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{testTitle}</div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>

        <div className="result-hero">
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>आपका Result</div>
          <div className="result-score">
            {score}
            <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>/{total}</span>
          </div>
          <div className="result-rank">🏆 Rank: #{rank}</div>
          <div style={{ marginTop: '12px', fontSize: '1.1rem', color: grade.color, fontWeight: 700 }}>
            {grade.label}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            ⏱ {formatTime(time_taken_seconds)}
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--success)' }}>{correct}</div>
            <div className="stat-label">✅ Correct</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--error)' }}>{incorrect}</div>
            <div className="stat-label">❌ Wrong</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#E67E22' }}>{unattempted}</div>
            <div className="stat-label">⬜ Skipped</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{accuracy}%</div>
            <div className="stat-label">🎯 Accuracy</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tabs.map(function(t) {
            return (
              <button
                key={t.key}
                className={'btn btn-sm ' + (tab === t.key ? 'btn-primary' : 'btn-outline')}
                onClick={function() { setTab(t.key) }}
              >
                {t.label}
              </button>
            )
          })}
          {testId && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={function() { navigate('/leaderboard/' + testId) }}
            >
              🏆 Leaderboard
            </button>
          )}
        </div>

        {tab === 'summary' && (
          <div className="card">
            <div className="card-title">📊 Performance Summary</div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Accuracy</span><span>{accuracy}%</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  width: accuracy + '%',
                  background: accuracy >= 60 ? 'var(--success)' : 'var(--error)',
                  height: '100%',
                  borderRadius: '8px',
                  transition: 'width 1s'
                }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Score</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--saffron)' }}>{score} / {total}</div>
              </div>
              <div style={{ padding: '10px', background: 'var(--green-light)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Your Rank</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)' }}>#{rank}</div>
              </div>
              <div style={{ padding: '10px', background: '#F0F4FF', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Time Taken</div>
                <div style={{ fontWeight: 700, color: '#3730A3' }}>{formatTime(time_taken_seconds)}</div>
              </div>
              <div style={{ padding: '10px', background: '#FDE8E8', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Wrong + Skipped</div>
                <div style={{ fontWeight: 700, color: 'var(--error)' }}>{incorrect + unattempted} questions</div>
              </div>
            </div>
            {(wrong_questions.length > 0 || skipped_questions.length > 0) && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#FFF3CD', borderRadius: '8px', fontSize: '0.85rem', color: '#856404' }}>
                💡 <strong>{wrong_questions.length} galat</strong> aur <strong>{skipped_questions.length} skip</strong> — review tab mein jaake padh lo!
              </div>
            )}
          </div>
        )}

        {tab === 'wrong' && (
          <div>
            {wrong_questions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '3rem' }}>🎉</div>
                <p style={{ fontWeight: 700, color: 'var(--success)', marginTop: '8px' }}>Koi galat jawab nahi!</p>
              </div>
            ) : (
              wrong_questions.map(function(q, i) {
                return (
                  <QuestionCard
                    key={q._id}
                    q={q}
                    index={i}
                    label="❌"
                    labelColor="var(--error)"
                    labelBg="#FDE8E8"
                    studentAns={answerMap[String(q._id)]}
                  />
                )
              })
            )}
          </div>
        )}

        {tab === 'skipped' && (
          <div>
            {skipped_questions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '3rem' }}>💯</div>
                <p style={{ fontWeight: 700, color: 'var(--success)', marginTop: '8px' }}>Koi question skip nahi kiya!</p>
              </div>
            ) : (
              skipped_questions.map(function(q, i) {
                return (
                  <QuestionCard
                    key={q._id}
                    q={q}
                    index={i}
                    label="⬜ Skipped"
                    labelColor="#856404"
                    labelBg="#FFF3CD"
                    studentAns={null}
                  />
                )
              })
            )}
          </div>
        )}

        {tab === 'all' && (
          <div className="card">
            <div className="card-title">📋 All Answers</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
              {answers.map(function(a, i) {
                return (
                  <div key={i} style={{
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    background: a.is_correct ? 'var(--green-light)' : a.is_skipped ? '#F5F5F5' : '#FDE8E8',
                    border: '1.5px solid ' + (a.is_correct ? 'var(--success)' : a.is_skipped ? '#ccc' : 'var(--error)')
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Q{i + 1}</div>
                    <div style={{ fontWeight: 700, color: a.is_correct ? 'var(--success)' : a.is_skipped ? 'var(--text-muted)' : 'var(--error)' }}>
                      {a.selected_option || '—'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--success)' }}>✓{a.correct_option}</div>
                    <div style={{ fontSize: '0.65rem', marginTop: '2px', color: a.is_correct ? 'var(--success)' : a.is_skipped ? '#999' : 'var(--error)' }}>
                      {a.is_correct ? '✅' : a.is_skipped ? '⬜' : '❌'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
