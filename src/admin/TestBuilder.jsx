import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TestBuilder() {
  var [title,       setTitle]       = useState('')
  var [type,        setType]        = useState('daily')
  var [duration,    setDuration]    = useState(60)
  var [correctMark, setCorrectMark] = useState(4)
  var [negMark,     setNegMark]     = useState(1)
  var [questions,   setQuestions]   = useState([])
  var [loading,     setLoading]     = useState(false)
  var [saving,      setSaving]      = useState(false)
  var [message,     setMessage]     = useState(null)
  var navigate = useNavigate()

  useEffect(function() {
    var stored = localStorage.getItem('ayurthon_selected_questions')
    if (stored) {
      var ids = JSON.parse(stored)
      if (ids.length > 0) fetchQuestions(ids)
    }
  }, [])

  async function fetchQuestions(ids) {
    setLoading(true)
    try {
      var res = await api.post('/api/questions/by-ids', { ids: ids })
      setQuestions(res.data.questions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function removeQuestion(id) {
    setQuestions(function(prev) { return prev.filter(function(q) { return q._id !== id }) })
  }

  function moveQuestion(index, dir) {
    var newQ   = questions.slice()
    var target = index + dir
    if (target < 0 || target >= newQ.length) return
    var tmp = newQ[index]; newQ[index] = newQ[target]; newQ[target] = tmp
    setQuestions(newQ)
  }

  var totalMarks = questions.length * Math.round(Number(correctMark) || 4)

  async function handleSave(publish) {
    if (!title.trim()) { setMessage({ type: 'error', text: 'Test ka title dein' }); return }
    if (questions.length === 0) { setMessage({ type: 'error', text: 'Koi question select nahi kiya' }); return }

    setSaving(true); setMessage(null)
    try {
      var res = await api.post('/api/tests', {
        title:          title,
        type:           type,
        question_ids:   questions.map(function(q) { return q._id }),
        duration_minutes: Math.round(Number(duration)),
        correct_marks:  Math.round(Number(correctMark) || 4),
        negative_marks: Math.round(Math.abs(Number(negMark) || 1))
      })

      if (publish) {
        var pubRes = await api.post('/api/tests/' + res.data.test._id + '/publish')
        setMessage({
          type: 'success',
          text: '✅ Published! Telegram: ' + (pubRes.data.telegram_sent ? '✅ Sent' : '⚠️ Failed')
        })
      } else {
        setMessage({ type: 'success', text: '✅ Test draft mein save ho gaya!' })
      }

      localStorage.removeItem('ayurthon_selected_questions')
      setTimeout(function() { navigate('/admin/tests') }, 1800)
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Error saving test' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>🏗️ Test Builder</h1>
        <p>Test configure karein aur publish karein</p>
      </div>

      {message && (
        <div className={'alert alert-' + message.type} style={{ cursor: 'pointer' }} onClick={function() { setMessage(null) }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>

        {/* Left: Config */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-title">⚙️ Test Settings</div>

          <div className="form-group">
            <label className="form-label">Test Title *</label>
            <input className="form-control" placeholder="e.g. Charak Sutra 1-10 + Rasa A" value={title} onChange={function(e) { setTitle(e.target.value) }} />
          </div>

          <div className="form-group">
            <label className="form-label">Test Type</label>
            <select className="form-control" value={type} onChange={function(e) { setType(e.target.value) }}>
              <option value="daily">📅 Daily CBT</option>
              <option value="diagnostic">🩺 Diagnostic Test</option>
              <option value="weekly">📆 Weekly CBT</option>
              <option value="grand">🏆 Grand Test</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <input type="number" className="form-control" value={duration} onChange={function(e) { setDuration(e.target.value) }} />
          </div>

          {/* Marks Settings */}
          <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '10px', color: 'var(--dark)' }}>
              📊 Marks Configuration
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">✅ Marks Per Correct</label>
                <input
                  type="number" className="form-control" min="1" max="10" step="1"
                  value={correctMark}
                  onChange={function(e) { setCorrectMark(e.target.value) }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">❌ Negative Per Wrong</label>
                <input
                  type="number" className="form-control" min="0" max="10" step="1"
                  value={negMark}
                  onChange={function(e) { setNegMark(e.target.value) }}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: '#F0F4FF', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.87rem' }}>
            <div>📋 Questions: <strong>{questions.length}</strong></div>
            <div>🏆 Total Marks: <strong style={{ color: 'var(--saffron)' }}>{totalMarks}</strong></div>
            <div>⏱ Duration: <strong>{duration} min</strong></div>
            <div>➕ Correct: <strong style={{ color: 'var(--success)' }}>+{correctMark}</strong> &nbsp; ➖ Wrong: <strong style={{ color: 'var(--error)' }}>-{negMark}</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button className="btn btn-outline btn-full" onClick={function() { handleSave(false) }} disabled={saving}>
              💾 Save as Draft
            </button>
            <button className="btn btn-success btn-full btn-lg" onClick={function() { handleSave(true) }} disabled={saving}>
              {saving ? '⏳...' : '🚀 Publish + Telegram bhejo'}
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button className="btn btn-sm" style={{ background: 'var(--border)' }} onClick={function() { navigate('/admin/questions') }}>
              ← Aur questions add karo
            </button>
          </div>
        </div>

        {/* Right: Question List */}
        <div className="card">
          <div className="card-title">📋 Selected Questions ({questions.length})</div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>Koi question select nahi kiya</p>
              <button className="btn btn-outline" style={{ marginTop: '12px' }} onClick={function() { navigate('/admin/questions') }}>
                📚 Question Bank se select karo
              </button>
            </div>
          ) : (
            questions.map(function(q, i) {
              return (
                <div key={q._id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 700, minWidth: '24px', fontSize: '0.85rem' }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p className="deva" style={{ fontSize: '0.88rem' }}>{q.text.substring(0, 120)}{q.text.length > 120 ? '...' : ''}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {q.subject} {q.sthan ? '> ' + q.sthan : ''} | Ans: <strong style={{ color: 'var(--success)' }}>{q.correct_answer}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button className="btn btn-sm" style={{ padding: '2px 8px', background: 'var(--border)' }} onClick={function() { moveQuestion(i, -1) }} disabled={i === 0}>↑</button>
                    <button className="btn btn-sm" style={{ padding: '2px 8px', background: 'var(--border)' }} onClick={function() { moveQuestion(i, 1) }} disabled={i === questions.length - 1}>↓</button>
                    <button className="btn btn-sm btn-danger" style={{ padding: '2px 8px' }} onClick={function() { removeQuestion(q._id) }}>✕</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
