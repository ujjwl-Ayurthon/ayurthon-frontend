import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TestAttempt() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [stage,    setStage]    = useState('register') // register | test | submitting
  const [test,     setTest]     = useState(null)
  const [name,     setName]     = useState('')
  const [tgUser,   setTgUser]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const [currentQ, setCurrentQ]  = useState(0)
  const [answers,  setAnswers]   = useState({})
  const [timeLeft, setTimeLeft]  = useState(0)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    api.get(`/api/tests/attempt/${token}`)
      .then(r => { setTest(r.data.test); setLoading(false) })
      .catch(() => { setError('Test nahi mila ya abhi live nahi hai'); setLoading(false) })
  }, [token])

  function startTest(e) {
    e.preventDefault()
    if (!name.trim()) return
    setStage('test')
    setTimeLeft(test.duration_minutes * 60)
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSubmit(autoSubmit = false) {
    if (!autoSubmit && !confirm('Test submit karna chahte ho?')) return
    clearInterval(timerRef.current)
    setStage('submitting')

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
    try {
      const res = await api.post('/api/results/submit', {
        test_token: token,
        student_name: name,
        telegram_username: tgUser.replace('@', ''),
        answers,
        time_taken_seconds: timeTaken
      })
      navigate(`/result/${res.data.result._id || token}`, {
        state: { result: res.data.result, testTitle: test.title, testId: test._id }
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Submit error')
      setStage('test')
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  const attemptedCount = Object.keys(answers).length

  if (loading) return <div className="loading-wrap" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (error)   return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div className="alert alert-error" style={{ maxWidth: '400px', width: '100%' }}>{error}</div></div>

  // ── Register Screen ───────────────────────────────────────
  if (stage === 'register') return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem' }}>🌿</div>
          <h1 style={{ color: '#E8750A', fontSize: '1.6rem', fontWeight: 800 }}>Ayurthon</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '4px' }}>{test.title}</p>
        </div>

        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--saffron)' }}>{test.questions?.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions</div>
            </div>
            <div style={{ background: 'var(--green-light)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)' }}>{test.duration_minutes}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minutes</div>
            </div>
            <div style={{ background: '#F0F4FF', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3730A3' }}>{test.total_marks}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marks</div>
            </div>
          </div>

          <form onSubmit={startTest}>
            <div className="form-group">
              <label className="form-label">आपका नाम *</label>
              <input className="form-control" placeholder="Pura naam likhein" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Telegram Username</label>
              <input className="form-control" placeholder="@username (optional)" value={tgUser} onChange={e => setTgUser(e.target.value)} />
            </div>
            <div style={{ background: '#FFF3CD', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: '#856404', marginBottom: '16px' }}>
              ⚠️ Test start hone ke baad tab band mat karein. Ek baar hi submit hoga.
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              🚀 Test Start करें
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  // ── Submitting ────────────────────────────────────────────
  if (stage === 'submitting') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ margin: 0 }} />
      <p style={{ color: 'var(--text-muted)' }}>Result calculate ho raha hai...</p>
    </div>
  )

  // ── Test Screen ───────────────────────────────────────────
  const q = test.questions[currentQ]
  const isWarning = timeLeft < 300

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div className="cbt-header">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{test.title}</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>Q {currentQ + 1} / {test.questions.length}</div>
        </div>
        <div className={`timer ${isWarning ? 'warning' : ''}`}>⏱ {formatTime(timeLeft)}</div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Attempted</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--saffron)', textAlign: 'center' }}>{attemptedCount}/{test.questions.length}</div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Question */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="badge" style={{ background: 'var(--saffron-light)', color: 'var(--saffron)' }}>Question {currentQ + 1}</span>
            <span className="badge" style={{ background: '#F0F4FF', color: '#3730A3' }}>{q.type?.replace('_', ' ')}</span>
          </div>

          <p className="deva" style={{ fontSize: '1.05rem', lineHeight: '1.9', marginBottom: '20px', fontWeight: '500' }}>
            {q.text}
          </p>

          {Object.entries(q.options).map(([key, val]) => (
            <button
              key={key}
              className={`option-btn ${answers[q._id] === key ? 'selected' : ''}`}
              onClick={() => setAnswers(prev => ({ ...prev, [q._id]: key }))}
            >
              <strong>{key}.</strong> {val}
            </button>
          ))}

          {answers[q._id] && (
            <button
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginTop: '4px' }}
              onClick={() => setAnswers(prev => { const n = {...prev}; delete n[q._id]; return n })}
            >
              ✕ Clear selection
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button className="btn btn-outline" onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}>← Prev</button>
          <button className="btn btn-danger" onClick={() => handleSubmit()}>📤 Submit Test</button>
          <button className="btn btn-outline" onClick={() => setCurrentQ(p => Math.min(test.questions.length - 1, p + 1))} disabled={currentQ === test.questions.length - 1}>Next →</button>
        </div>

        {/* Question Nav Grid */}
        <div className="card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            🟧 Attempted | ⬜ Not attempted
          </div>
          <div className="question-nav">
            {test.questions.map((_, i) => (
              <button
                key={i}
                className={`q-nav-btn ${answers[test.questions[i]._id] ? 'answered' : ''} ${i === currentQ ? 'current' : ''}`}
                onClick={() => setCurrentQ(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
