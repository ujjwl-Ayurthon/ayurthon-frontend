import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const [tab, setTab] = useState('summary')

  if (!state?.result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="alert alert-error">Result nahi mila. Test dobara attempt karein.</div>
      </div>
    )
  }

  const { result, testTitle, testId } = state
  const { score, total, correct, incorrect, unattempted, accuracy, rank, time_taken_seconds, wrong_questions, answers } = result

  function formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60
    return `${m} min ${s} sec`
  }

  function getGrade() {
    if (accuracy >= 90) return { label: 'Excellent! 🏆', color: '#FFD700' }
    if (accuracy >= 75) return { label: 'Very Good! 🌟', color: 'var(--success)' }
    if (accuracy >= 60) return { label: 'Good 👍', color: 'var(--saffron)' }
    if (accuracy >= 40) return { label: 'Average 📚', color: '#E67E22' }
    return { label: 'Need Practice 💪', color: 'var(--error)' }
  }

  const grade = getGrade()

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ background: 'var(--dark)', color: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.2rem' }}>🌿</div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--saffron)' }}>Ayurthon</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{testTitle}</div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Result Hero */}
        <div className="result-hero">
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>आपका Result</div>
          <div className="result-score">{score}<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>/{total}</span></div>
          <div className="result-rank">🏆 Rank: #{rank}</div>
          <div style={{ marginTop: '12px', fontSize: '1.1rem', color: grade.color, fontWeight: 700 }}>{grade.label}</div>
          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>⏱ {formatTime(time_taken_seconds)}</div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--success)' }}>{correct}</div>
            <div className="stat-label">✅ Correct</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--error)' }}>{incorrect}</div>
            <div className="stat-label">❌ Incorrect</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--text-muted)' }}>{unattempted}</div>
            <div className="stat-label">⬜ Skipped</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{accuracy}%</div>
            <div className="stat-label">🎯 Accuracy</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className={`btn ${tab === 'summary' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('summary')}>📊 Summary</button>
          <button className={`btn ${tab === 'wrong' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('wrong')}>❌ Wrong ({wrong_questions?.length || 0})</button>
          <button className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('all')}>📋 All Answers</button>
          {testId && (
            <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/leaderboard/${testId}`)}>
              🏆 Leaderboard
            </button>
          )}
        </div>

        {/* Summary Tab */}
        {tab === 'summary' && (
          <div className="card">
            <div className="card-title">📊 Performance Summary</div>

            {/* Accuracy bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Accuracy</span><span>{accuracy}%</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${accuracy}%`, background: accuracy >= 60 ? 'var(--success)' : 'var(--error)', height: '100%', borderRadius: '8px', transition: 'width 1s' }} />
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
                <div style={{ color: 'var(--text-muted)' }}>Wrong</div>
                <div style={{ fontWeight: 700, color: 'var(--error)' }}>{incorrect} questions</div>
              </div>
            </div>

            {wrong_questions?.length > 0 && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#FFF3CD', borderRadius: '8px', fontSize: '0.85rem', color: '#856404' }}>
                💡 <strong>{wrong_questions.length} galat questions</strong> hain — review karein aur unhe dobara padhein!
              </div>
            )}
          </div>
        )}

        {/* Wrong Questions Tab */}
        {tab === 'wrong' && (
          <div>
            {!wrong_questions || wrong_questions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '3rem' }}>🎉</div>
                <p style={{ fontWeight: 700, color: 'var(--success)', marginTop: '8px' }}>Koi galat jawab nahi!</p>
              </div>
            ) : (
              wrong_questions.map((q, i) => {
                const studentAns = answers?.find(a => a.question_id === q._id)?.selected_option
                return (
                  <div key={q._id} className="card" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <span className="badge" style={{ background: '#FDE8E8', color: 'var(--error)' }}>❌ Q{i + 1}</span>
                      <span className="badge" style={{ background: '#FFF3CD', color: '#856404', fontSize: '0.7rem' }}>{q.type?.replace('_', ' ')}</span>
                    </div>

                    <p className="deva" style={{ fontSize: '0.95rem', lineHeight: '1.9', marginBottom: '12px', fontWeight: '500' }}>
                      {q.text}
                    </p>

                    {Object.entries(q.options).map(([key, val]) => {
                      const isCorrect  = key === q.correct_answer
                      const isSelected = key === studentAns
                      return (
                        <div key={key} style={{
                          padding: '8px 14px', marginBottom: '6px', borderRadius: '8px', fontSize: '0.9rem',
                          border: `2px solid ${isCorrect ? 'var(--success)' : isSelected ? 'var(--error)' : 'var(--border)'}`,
                          background: isCorrect ? 'var(--green-light)' : isSelected ? '#FDE8E8' : 'white',
                          fontWeight: isCorrect || isSelected ? '600' : '400'
                        }} className="deva">
                          {isCorrect ? '✅' : isSelected ? '❌' : '○'} <strong>{key}.</strong> {val}
                          {isCorrect  && <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginLeft: '8px' }}>(सही उत्तर)</span>}
                          {isSelected && !isCorrect && <span style={{ fontSize: '0.75rem', color: 'var(--error)', marginLeft: '8px' }}>(आपका उत्तर)</span>}
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
                        📖 Reference: {q.reference}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* All Answers Tab */}
        {tab === 'all' && answers && (
          <div className="card">
            <div className="card-title">📋 All Answers</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
              {answers.map((a, i) => (
                <div key={i} style={{
                  padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '0.82rem',
                  background: a.is_correct ? 'var(--green-light)' : a.selected_option ? '#FDE8E8' : 'var(--border)',
                  border: `1px solid ${a.is_correct ? 'var(--success)' : a.selected_option ? 'var(--error)' : 'var(--border)'}`
                }}>
                  <div style={{ fontWeight: 700 }}>Q{i + 1}</div>
                  <div style={{ color: 'var(--text-muted)' }}>You: <strong>{a.selected_option || '—'}</strong></div>
                  <div style={{ color: 'var(--success)' }}>Ans: <strong>{a.correct_option}</strong></div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
