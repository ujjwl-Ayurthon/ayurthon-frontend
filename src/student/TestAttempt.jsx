import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TestAttempt() {
  var params = useParams()
  var token  = params.token
  var navigate = useNavigate()

  var ATTEMPT_KEY = 'ayurthon_attempt_' + token
  var SESSION_KEY = 'ayurthon_session_' + token

  var [stage,    setStage]    = useState('register')
  var [test,     setTest]     = useState(null)
  var [name,     setName]     = useState('')
  var [tgUser,   setTgUser]   = useState('')
  var [loading,  setLoading]  = useState(true)
  var [error,    setError]    = useState('')
  var [currentQ, setCurrentQ] = useState(0)
  var [answers,  setAnswers]  = useState({})
  var [timeLeft, setTimeLeft] = useState(0)

  var timerRef     = useRef(null)
  var startTimeRef = useRef(null)
  var answersRef   = useRef({})

  useEffect(function() { answersRef.current = answers }, [answers])

  useEffect(function() {
    // Device-level lock check first
    var savedResultId = localStorage.getItem(ATTEMPT_KEY)
    if (savedResultId) {
      navigate('/result/' + savedResultId, {
        state: { alreadyAttempted: true, fromDevice: true }
      })
      return
    }

    api.get('/api/tests/attempt/' + token)
      .then(function(r) {
        setTest(r.data.test)

        // Resume session if tab was closed mid-test
        var saved = localStorage.getItem(SESSION_KEY)
        if (saved) {
          try {
            var session  = JSON.parse(saved)
            var elapsed  = Math.floor((Date.now() - session.startTime) / 1000)
            var remaining = (r.data.test.duration_minutes * 60) - elapsed

            setName(session.name    || '')
            setTgUser(session.tgUser || '')
            setAnswers(session.answers || {})
            answersRef.current = session.answers || {}
            setCurrentQ(session.currentQ || 0)

            if (remaining <= 0) {
              doSubmit(session.name, session.tgUser, session.answers, r.data.test, session.startTime)
            } else {
              setTimeLeft(remaining)
              startTimeRef.current = session.startTime
              setStage('test')
              beginTimer(remaining, r.data.test, session.name, session.tgUser)
            }
          } catch (e) {
            localStorage.removeItem(SESSION_KEY)
          }
        }
        setLoading(false)
      })
      .catch(function(err) {
        var msg = err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Test nahi mila ya abhi live nahi hai'
        setError(msg)
        setLoading(false)
      })
  }, [token])

  function saveSession(ans, q) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      name:      name,
      tgUser:    tgUser,
      answers:   ans !== undefined ? ans : answersRef.current,
      currentQ:  q   !== undefined ? q   : currentQ,
      startTime: startTimeRef.current
    }))
  }

  function beginTimer(seconds, testData, sName, sTg) {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(function() {
      setTimeLeft(function(prev) {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          doSubmit(sName, sTg, answersRef.current, testData, startTimeRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleRegister(e) {
    e.preventDefault()
    var tg = tgUser.replace('@', '').toLowerCase()

    // Backend check — re-entry: redirect to existing result instantly
    if (tg) {
      try {
        var check = await api.get('/api/results/check/' + token + '/' + tg)
        if (check.data.attempted) {
          localStorage.setItem(ATTEMPT_KEY, check.data.result_id)
          // Fetch full result for review
          navigate('/result/' + check.data.result_id, {
            state: { reEntry: true, testTitle: test ? test.title : '' }
          })
          return
        }
      } catch (e) { /* proceed if check fails */ }
    }

    var now   = Date.now()
    startTimeRef.current = now
    var total = test.duration_minutes * 60
    setTimeLeft(total)
    setStage('test')
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      name: name, tgUser: tg, answers: {}, currentQ: 0, startTime: now
    }))
    beginTimer(total, test, name, tg)
  }

  async function doSubmit(sName, sTg, currentAnswers, testData, startTime) {
    setStage('submitting')
    clearInterval(timerRef.current)
    var start   = startTime || startTimeRef.current || Date.now()
    var elapsed = Math.floor((Date.now() - start) / 1000)

    try {
      var res = await api.post('/api/results/submit', {
        test_token:         token,
        student_name:       sName || name,
        telegram_username:  (sTg || tgUser).replace('@', ''),
        answers:            currentAnswers || answersRef.current,
        time_taken_seconds: elapsed
      })

      if (res.data.alreadySubmitted) {
        localStorage.removeItem(SESSION_KEY)
        localStorage.setItem(ATTEMPT_KEY, String(res.data.resultId))
        navigate('/result/' + res.data.resultId, {
          state: { reEntry: true, testTitle: testData ? testData.title : '' }
        })
        return
      }

      var resultId = res.data.result._id
      localStorage.removeItem(SESSION_KEY)
      localStorage.setItem(ATTEMPT_KEY, String(resultId))

      navigate('/result/' + resultId, {
        state: {
          result:    res.data.result,
          testTitle: testData ? testData.title : (test ? test.title : ''),
          testId:    testData ? testData._id    : (test ? test._id   : '')
        }
      })
    } catch (err) {
      var errData = err.response ? err.response.data : {}
      if (errData.alreadySubmitted) {
        localStorage.removeItem(SESSION_KEY)
        localStorage.setItem(ATTEMPT_KEY, String(errData.resultId))
        navigate('/result/' + errData.resultId, {
          state: { reEntry: true, testTitle: testData ? testData.title : '' }
        })
        return
      }
      setError(errData.error || 'Submit error hua, dobara try karo')
      setStage('test')
    }
  }

  function handleSubmit() {
    if (!confirm('Test submit karna chahte ho?')) return
    doSubmit(name, tgUser, answersRef.current, test, startTimeRef.current)
  }

  function setAnswer(qId, key) {
    var updated = Object.assign({}, answersRef.current)
    updated[qId] = key
    setAnswers(updated)
    answersRef.current = updated
  }

  function clearAnswer(qId) {
    var updated = Object.assign({}, answersRef.current)
    delete updated[qId]
    setAnswers(updated)
    answersRef.current = updated
  }

  function handleQChange(i) {
    saveSession(answersRef.current, i)
    setCurrentQ(i)
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60)
    var s = sec % 60
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
  }

  if (loading) return <div className="loading-wrap" style={{ minHeight: '100vh' }}><div className="spinner" /></div>

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="alert alert-error" style={{ maxWidth: '400px', width: '100%' }}>{error}</div>
    </div>
  )

  if (stage === 'register') return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem' }}>🌿</div>
          <h1 style={{ color: '#E8750A', fontSize: '1.6rem', fontWeight: 800 }}>Ayurthon</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '4px' }}>{test ? test.title : ''}</p>
        </div>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--saffron)' }}>{test ? test.questions.length : 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions</div>
            </div>
            <div style={{ background: 'var(--green-light)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)' }}>{test ? test.duration_minutes : 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minutes</div>
            </div>
            <div style={{ background: '#F0F4FF', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3730A3' }}>{test ? test.total_marks : 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marks</div>
            </div>
          </div>
          {test && (
            <div style={{ background: '#F0F4FF', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: '#3730A3', marginBottom: '16px', textAlign: 'center' }}>
              +{test.correct_marks || 4} Correct &nbsp;|&nbsp; -{test.negative_marks || 1} Wrong
            </div>
          )}
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">आपका नाम *</label>
              <input className="form-control" placeholder="Pura naam likhein" value={name} onChange={function(e) { setName(e.target.value) }} required />
            </div>
            <div className="form-group">
              <label className="form-label">Telegram Username *</label>
              <input className="form-control" placeholder="@username" value={tgUser} onChange={function(e) { setTgUser(e.target.value) }} required />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                ⚠️ Agar pehle attempt kiya hai to result dikha diya jayega
              </small>
            </div>
            <div style={{ background: '#FFF3CD', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: '#856404', marginBottom: '16px' }}>
              ⚠️ Tab band mat karein — progress save hoti rahegi
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">🚀 Test Start करें</button>
          </form>
        </div>
      </div>
    </div>
  )

  if (stage === 'submitting') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ margin: 0 }} />
      <p style={{ color: 'var(--text-muted)' }}>Result calculate ho raha hai...</p>
    </div>
  )

  if (!test) return null

  var q = test.questions[currentQ]
  var isWarning = timeLeft < 300

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <div className="cbt-header">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{test.title}</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>Q {currentQ + 1} / {test.questions.length}</div>
        </div>
        <div className={'timer' + (isWarning ? ' warning' : '')}>⏱ {formatTime(timeLeft)}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Attempted</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--saffron)' }}>{Object.keys(answers).length}/{test.questions.length}</div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="badge" style={{ background: 'var(--saffron-light)', color: 'var(--saffron)' }}>Question {currentQ + 1}</span>
            <span className="badge" style={{ background: '#F0F4FF', color: '#3730A3' }}>{q.type ? q.type.replace(/_/g, ' ') : 'mcq'}</span>
          </div>
          <p className="deva" style={{ fontSize: '1.05rem', lineHeight: '1.9', marginBottom: '20px', fontWeight: 500 }}>{q.text}</p>
          {Object.entries(q.options).map(function(entry) {
            var key = entry[0], val = entry[1]
            var isSelected = answers[q._id] === key
            return (
              <button key={key} className={'option-btn' + (isSelected ? ' selected' : '')} onClick={function() { setAnswer(q._id, key) }}>
                <strong>{key}.</strong> {val}
              </button>
            )
          })}
          {answers[q._id] && (
            <button style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginTop: '4px' }} onClick={function() { clearAnswer(q._id) }}>
              ✕ Clear selection
            </button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button className="btn btn-outline" onClick={function() { handleQChange(Math.max(0, currentQ - 1)) }} disabled={currentQ === 0}>← Prev</button>
          <button className="btn btn-danger" onClick={handleSubmit}>📤 Submit Test</button>
          <button className="btn btn-outline" onClick={function() { handleQChange(Math.min(test.questions.length - 1, currentQ + 1)) }} disabled={currentQ === test.questions.length - 1}>Next →</button>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>🟧 Attempted &nbsp; ⬜ Not attempted</div>
          <div className="question-nav">
            {test.questions.map(function(_, i) {
              var qId = test.questions[i]._id
              var isAnswered = answers[qId] !== undefined && answers[qId] !== null
              var isCurrent  = i === currentQ
              return (
                <button key={i} className={'q-nav-btn' + (isAnswered ? ' answered' : '') + (isCurrent ? ' current' : '')} onClick={function() { handleQChange(i) }}>
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
