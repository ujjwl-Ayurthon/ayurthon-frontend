import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TestBuilder() {
  const [title,    setTitle]    = useState('')
  const [type,     setType]     = useState('daily')
  const [duration, setDuration] = useState(60)
  const [negative, setNegative] = useState(0)
  const [questions, setQuestions] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [message,  setMessage]  = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Load pre-selected questions from QuestionBank
    const stored = localStorage.getItem('ayurthon_selected_questions')
    if (stored) {
      const ids = JSON.parse(stored)
      if (ids.length > 0) fetchQuestions(ids)
    }
  }, [])

  async function fetchQuestions(ids) {
    setLoading(true)
    try {
      const res = await api.post('/api/questions/by-ids', { ids })
      setQuestions(res.data.questions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function removeQuestion(id) {
    setQuestions(prev => prev.filter(q => q._id !== id))
  }

  function moveQuestion(index, dir) {
    const newQ = [...questions]
    const target = index + dir
    if (target < 0 || target >= newQ.length) return
    ;[newQ[index], newQ[target]] = [newQ[target], newQ[index]]
    setQuestions(newQ)
  }

  async function handleSave(publish = false) {
    if (!title.trim()) { setMessage({ type: 'error', text: 'Test ka title dein' }); return }
    if (questions.length === 0) { setMessage({ type: 'error', text: 'Koi question select nahi kiya' }); return }

    setSaving(true); setMessage(null)
    try {
      const res = await api.post('/api/tests', {
        title, type,
        question_ids: questions.map(q => q._id),
        duration_minutes: Number(duration),
        negative_marks: Number(negative)
      })

      if (publish) {
        const pubRes = await api.post(`/api/tests/${res.data.test._id}/publish`)
        setMessage({
          type: 'success',
          text: `✅ Test published! Link: ${pubRes.data.link} | Telegram: ${pubRes.data.telegram_sent ? '✅ Sent' : '⚠️ Failed'}`
        })
      } else {
        setMessage({ type: 'success', text: '✅ Test draft mein save ho gaya!' })
      }

      localStorage.removeItem('ayurthon_selected_questions')
      setTimeout(() => navigate('/admin/tests'), 2000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error saving test' })
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

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>

        {/* Left: Test Config */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-title">⚙️ Test Settings</div>

          <div className="form-group">
            <label className="form-label">Test Title *</label>
            <input className="form-control" placeholder="e.g. Charak Sutra 1-10 + Rasa A" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Test Type</label>
            <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
              <option value="daily">📅 Daily CBT</option>
              <option value="diagnostic">🩺 Diagnostic Test</option>
              <option value="weekly">📆 Weekly CBT</option>
              <option value="grand">🏆 Grand Test</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input type="number" className="form-control" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Negative Marks</label>
              <input type="number" className="form-control" step="0.25" value={negative} onChange={e => setNegative(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '12px', fontSize: '0.88rem', marginBottom: '16px' }}>
            <div>📊 Total Questions: <strong>{questions.length}</strong></div>
            <div>🏆 Total Marks: <strong>{questions.length}</strong></div>
            <div>⏱ Duration: <strong>{duration} min</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button className="btn btn-outline btn-full" onClick={() => handleSave(false)} disabled={saving}>
              💾 Draft Save
            </button>
            <button className="btn btn-success btn-full btn-lg" onClick={() => handleSave(true)} disabled={saving}>
              {saving ? '⏳...' : '🚀 Publish + Telegram bhejo'}
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button className="btn btn-sm" style={{ background: 'var(--border)' }} onClick={() => navigate('/admin/questions')}>
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
              <button className="btn btn-outline" style={{ marginTop: '12px' }} onClick={() => navigate('/admin/questions')}>
                📚 Question Bank se select karo
              </button>
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={q._id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: '700', minWidth: '24px', fontSize: '0.85rem' }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <p className="deva" style={{ fontSize: '0.88rem' }}>{q.text.substring(0, 120)}{q.text.length > 120 ? '...' : ''}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {q.subject} {q.sthan && `> ${q.sthan}`} | Ans: <strong style={{ color: 'var(--success)' }}>{q.correct_answer}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button className="btn btn-sm" style={{ padding: '2px 8px', background: 'var(--border)' }} onClick={() => moveQuestion(i, -1)} disabled={i === 0}>↑</button>
                  <button className="btn btn-sm" style={{ padding: '2px 8px', background: 'var(--border)' }} onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1}>↓</button>
                  <button className="btn btn-sm btn-danger" style={{ padding: '2px 8px' }} onClick={() => removeQuestion(q._id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
