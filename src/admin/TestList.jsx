import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const TYPE_EMOJI = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }
const TYPE_LABEL = { daily: 'Daily CBT', diagnostic: 'Diagnostic Test', weekly: 'Weekly CBT', grand: 'Grand Test' }

function buildDefaultMessage(test) {
  const negLine = (test.negative_marks && Number(test.negative_marks) > 0)
    ? `➖ Negative Marking: ${test.negative_marks}`
    : '✅ No Negative Marking'
  return `${TYPE_EMOJI[test.type] || '📝'} Ayurthon — ${TYPE_LABEL[test.type] || 'Test'}

📚 ${test.title}
━━━━━━━━━━━━━━━━
❓ Questions: ${test.questions?.length || test.total_marks}
⏱ Duration: ${test.duration_minutes} Minutes
🏆 Total Marks: ${test.total_marks}
${negLine}
━━━━━━━━━━━━━━━━
📊 Result & Leaderboard turant milega!

सभी को शुभकामनाएं! 🌿`
}

export default function TestList() {
  const [tests,        setTests]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [message,      setMessage]      = useState(null)
  const [modal,        setModal]        = useState(null)
  const [publishing,   setPublishing]   = useState(false)
  const [channels,     setChannels]     = useState([])
  const [selectedCh,   setSelectedCh]   = useState('')
  const [customMsg,    setCustomMsg]    = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTests()
    api.get('/api/tests/channels/list')
      .then(r => {
        const chs = r.data.channels || []
        setChannels(chs)
        if (chs.length > 0) setSelectedCh(chs[0].id)
      })
      .catch(err => console.error('Channels fetch error:', err))
  }, [])

  async function fetchTests() {
    try {
      const res = await api.get('/api/tests')
      setTests(res.data.tests)
    } catch (err) {
      setMessage({ type: 'error', text: 'Tests load nahi hue' })
    } finally {
      setLoading(false)
    }
  }

  function openModal(test) {
    setModal(test)
    setCustomMsg(buildDefaultMessage(test))
    if (channels.length > 0) setSelectedCh(channels[0].id)
  }

  async function confirmPublish() {
    if (!selectedCh) {
      setMessage({ type: 'error', text: 'Channel select karo pehle' })
      return
    }
    setPublishing(true)
    try {
      const res = await api.post(`/api/tests/${modal._id}/publish`, {
        channel_id:     selectedCh,
        custom_message: customMsg
      })

      if (res.data.telegram_sent) {
        setMessage({ type: 'success', text: `✅ Published & Telegram pe bhej diya!` })
      } else {
        setMessage({
          type: 'error',
          text: `⚠️ Published but Telegram failed: ${res.data.telegram_error || 'Unknown error'}`
        })
      }
      setModal(null)
      fetchTests()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Publish error' })
    } finally {
      setPublishing(false)
    }
  }

  async function closeTest(id) {
    if (!confirm('Test close karna chahte ho?')) return
    await api.post(`/api/tests/${id}/close`)
    fetchTests()
  }

  async function deleteTest(id) {
    if (!confirm('Test delete karna chahte ho?')) return
    await api.delete(`/api/tests/${id}`)
    fetchTests()
  }

  function copyLink(token) {
    const link = `${window.location.origin}/test/${token}`
    navigator.clipboard.writeText(link)
    setMessage({ type: 'success', text: '📋 Link copied!' })
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 All Tests</h1>
        <p>Sabhi tests ki list aur status</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ cursor: 'pointer' }} onClick={() => setMessage(null)}>
          {message.text} <span style={{ float: 'right', opacity: 0.6 }}>✕</span>
        </div>
      )}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Type</th><th>Questions</th>
                  <th>Duration</th><th>Neg.</th><th>Status</th><th>TG</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t._id}>
                    <td><strong>{t.title}</strong></td>
                    <td><span className={`badge badge-${t.type}`}>{TYPE_EMOJI[t.type]} {t.type}</span></td>
                    <td>{t.questions?.length || t.total_marks || '—'}</td>
                    <td>{t.duration_minutes} min</td>
                    <td>{Number(t.negative_marks) > 0 ? `−${t.negative_marks}` : '—'}</td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    <td>{t.telegram_sent ? '✅' : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {t.status === 'draft' && (
                          <button className="btn btn-success btn-sm" onClick={() => openModal(t)}>
                            🚀 Publish
                          </button>
                        )}
                        {t.status === 'published' && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => copyLink(t.link_token)}>🔗 Link</button>
                            <button className="btn btn-sm" style={{ background: '#6c757d', color: 'white' }} onClick={() => closeTest(t._id)}>🔒 Close</button>
                          </>
                        )}
                        <button className="btn btn-sm btn-outline" onClick={() => navigate(`/admin/results/${t._id}`)}>📊 Results</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteTest(t._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      Koi test nahi mila — pehle test banao
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Publish Preview Modal ───────────────────────── */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 1000, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '16px'
        }}>
          <div className="card" style={{
            maxWidth: '520px', width: '100%', position: 'relative',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            {/* Close */}
            <button onClick={() => setModal(null)} style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'none', border: 'none', fontSize: '1.3rem',
              cursor: 'pointer', color: 'var(--text-muted)', zIndex: 10
            }}>✕</button>

            <div className="card-title">🚀 Publish Preview</div>

            {/* Test Info */}
            <div style={{
              background: 'var(--saffron-light)', borderRadius: '8px',
              padding: '14px', marginBottom: '16px', fontSize: '0.87rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Title</span><br /><strong>{modal.title}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Type</span><br /><strong>{TYPE_LABEL[modal.type]}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Questions</span><br /><strong>{modal.questions?.length || modal.total_marks}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Duration</span><br /><strong>{modal.duration_minutes} min</strong></div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Negative Marking</span><br />
                  <strong style={{ color: Number(modal.negative_marks) > 0 ? 'var(--error)' : 'var(--success)' }}>
                    {Number(modal.negative_marks) > 0 ? `−${modal.negative_marks} per wrong` : 'None'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Channel Selector */}
            <div className="form-group">
              <label className="form-label">📢 Channel Select karo *</label>
              {channels.length === 0 ? (
                <div className="alert alert-error" style={{ fontSize: '0.82rem' }}>
                  ⚠️ Koi channel load nahi hua — Render pe TELEGRAM_CHANNEL_1 check karo
                </div>
              ) : (
                <select
                  className="form-control"
                  value={selectedCh}
                  onChange={e => setSelectedCh(e.target.value)}
                >
                  {channels.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name} ({ch.id})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Editable Message */}
            <div className="form-group">
              <label className="form-label">
                ✏️ Telegram Message
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.78rem' }}>
                  (edit kar sakte ho)
                </span>
              </label>
              <textarea
                className="form-control"
                style={{
                  minHeight: '200px', fontSize: '0.85rem',
                  fontFamily: 'monospace', lineHeight: '1.7'
                }}
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                💡 Launch button automatically add hoga — URL yahan nahi dikhega
              </small>
            </div>

            {/* Telegram Preview Box */}
            <div style={{
              background: '#1A1A2E', borderRadius: '10px',
              padding: '14px', marginBottom: '20px'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginBottom: '8px' }}>
                📱 Channel Preview
              </div>
              <div style={{
                color: 'white', fontSize: '0.83rem',
                lineHeight: '1.8', whiteSpace: 'pre-wrap',
                fontFamily: 'sans-serif'
              }}>
                {customMsg}
              </div>
              <div style={{
                marginTop: '10px', background: '#2D6A4F', borderRadius: '6px',
                padding: '8px 14px', textAlign: 'center', color: 'white',
                fontSize: '0.85rem', fontWeight: 600
              }}>
                🚀 Launch CBT Test — अभी Attempt करें
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-outline btn-full"
                onClick={() => setModal(null)}
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                className="btn btn-success btn-full btn-lg"
                onClick={confirmPublish}
                disabled={publishing || !selectedCh || channels.length === 0}
              >
                {publishing ? '⏳ Publishing...' : '✅ Confirm & Launch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
