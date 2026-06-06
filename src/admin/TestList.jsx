import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

var TYPE_EMOJI = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }
var TYPE_LABEL = { daily: 'Daily CBT', diagnostic: 'Diagnostic Test', weekly: 'Weekly CBT', grand: 'Grand Test' }

// Format UTC date to IST display
function toIST(dateStr) {
  if (!dateStr) return null
  var d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return d.toLocaleString('en-IN', {
    timeZone:    'Asia/Kolkata',
    day:         '2-digit',
    month:       'short',
    year:        'numeric',
    hour:        '2-digit',
    minute:      '2-digit',
    hour12:      true
  })
}

// Convert local datetime-local value to UTC ISO for backend
function localToUTC(localStr) {
  if (!localStr) return null
  // datetime-local gives "YYYY-MM-DDTHH:mm" in browser local time
  // We treat it as IST (UTC+5:30) and convert to UTC
  var d = new Date(localStr)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

// Convert UTC ISO to datetime-local input value in IST
function utcToLocalInput(utcStr) {
  if (!utcStr) return ''
  var d = new Date(utcStr)
  if (isNaN(d.getTime())) return ''
  // Get IST time parts
  var ist = new Date(d.getTime() + (5.5 * 60 * 60 * 1000))
  var pad = function(n) { return n < 10 ? '0' + n : '' + n }
  return ist.getUTCFullYear() + '-' +
    pad(ist.getUTCMonth() + 1) + '-' +
    pad(ist.getUTCDate()) + 'T' +
    pad(ist.getUTCHours()) + ':' +
    pad(ist.getUTCMinutes())
}

function buildDefaultMessage(test) {
  var negLine = (test.negative_marks && Number(test.negative_marks) > 0)
    ? '➖ Negative Marking: ' + test.negative_marks + ' per wrong'
    : '✅ No Negative Marking'
  var qCount  = test.questions ? test.questions.length : test.total_marks
  var marks   = qCount * 4
  return TYPE_EMOJI[test.type] + ' Ayurthon — ' + TYPE_LABEL[test.type] + '\n\n' +
    '📚 ' + test.title + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '❓ Questions: ' + qCount + '\n' +
    '⏱ Duration: ' + test.duration_minutes + ' Minutes\n' +
    '🏆 Total Marks: ' + marks + ' (+4 / ' + (Number(test.negative_marks) > 0 ? '-' + test.negative_marks : '0') + ')\n' +
    negLine + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '📊 Result & Leaderboard turant milega!\n\n' +
    'सभी को शुभकामनाएं! 🌿'
}

export default function TestList() {
  var [tests,        setTests]        = useState([])
  var [loading,      setLoading]      = useState(true)
  var [message,      setMessage]      = useState(null)
  var [publishModal, setPublishModal] = useState(null)
  var [editModal,    setEditModal]    = useState(null)
  var [publishing,   setPublishing]   = useState(false)
  var [saving,       setSaving]       = useState(false)
  var [channels,     setChannels]     = useState([])
  var [selectedCh,   setSelectedCh]   = useState('')
  var [customMsg,    setCustomMsg]    = useState('')
  var [editData,     setEditData]     = useState({})

  var navigate = useNavigate()

  useEffect(function() {
    fetchTests()
    api.get('/api/tests/channels/list')
      .then(function(r) {
        var chs = r.data.channels || []
        setChannels(chs)
        if (chs.length > 0) setSelectedCh(chs[0].id)
      })
      .catch(function(e) { console.error('Channels error:', e) })
  }, [])

  async function fetchTests() {
    try {
      var res = await api.get('/api/tests')
      setTests(res.data.tests)
    } catch (e) {
      setMessage({ type: 'error', text: 'Tests load error' })
    } finally {
      setLoading(false)
    }
  }

  function openPublishModal(test) {
    setPublishModal(test)
    setCustomMsg(buildDefaultMessage(test))
    if (channels.length > 0) setSelectedCh(channels[0].id)
  }

  async function confirmPublish() {
    if (!selectedCh) { setMessage({ type: 'error', text: 'Channel select karo' }); return }
    setPublishing(true)
    try {
      var res = await api.post('/api/tests/' + publishModal._id + '/publish', {
        channel_id:     selectedCh,
        custom_message: customMsg
      })
      setMessage({
        type: res.data.telegram_sent ? 'success' : 'error',
        text: res.data.telegram_sent
          ? '✅ Published & Telegram pe bhej diya!'
          : '⚠️ Published but Telegram failed: ' + (res.data.telegram_error || 'unknown')
      })
      setPublishModal(null)
      fetchTests()
    } catch (e) {
      setMessage({ type: 'error', text: e.response ? e.response.data.error : 'Publish error' })
    } finally {
      setPublishing(false)
    }
  }

  function openEdit(test) {
    setEditData({
      title:             test.title,
      type:              test.type,
      duration_minutes:  test.duration_minutes,
      negative_marks:    test.negative_marks || 0,
      scheduled_at:      utcToLocalInput(test.scheduled_at),
      scheduled_channel: test.scheduled_channel || '',
      expires_at:        utcToLocalInput(test.expires_at)
    })
    setEditModal(test)
  }

  function updateEdit(key, val) {
    setEditData(function(prev) {
      var next = Object.assign({}, prev)
      next[key] = val
      return next
    })
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await api.put('/api/tests/' + editModal._id, {
        title:             editData.title,
        type:              editData.type,
        duration_minutes:  Number(editData.duration_minutes),
        negative_marks:    Number(editData.negative_marks),
        scheduled_at:      localToUTC(editData.scheduled_at),
        scheduled_channel: editData.scheduled_channel || null,
        expires_at:        localToUTC(editData.expires_at)
      })
      setMessage({ type: 'success', text: '✅ Test updated!' })
      setEditModal(null)
      fetchTests()
    } catch (e) {
      setMessage({ type: 'error', text: e.response ? e.response.data.error : 'Update error' })
    } finally {
      setSaving(false)
    }
  }

  async function recalcRanks(id) {
    try {
      var res = await api.post('/api/tests/' + id + '/recalculate-ranks')
      setMessage({ type: 'success', text: '🔄 ' + res.data.updated + ' ranks recalculated!' })
    } catch (e) {
      setMessage({ type: 'error', text: 'Recalculate failed' })
    }
  }

  async function closeTest(id) {
    if (!confirm('Test close karna chahte ho? Ranks final ho jaayenge.')) return
    var res = await api.post('/api/tests/' + id + '/close')
    setMessage({ type: 'success', text: '🔒 Closed. ' + res.data.ranks_recalculated + ' ranks finalized.' })
    fetchTests()
  }

  async function deleteTest(id) {
    if (!confirm('Test permanently delete karna chahte ho?')) return
    await api.delete('/api/tests/' + id)
    fetchTests()
  }

  function copyLink(token) {
    navigator.clipboard.writeText(window.location.origin + '/test/' + token)
    setMessage({ type: 'success', text: '📋 Link copied!' })
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 All Tests</h1>
        <p>Sabhi tests ki list, scheduling aur management</p>
      </div>

      {message && (
        <div className={'alert alert-' + message.type} style={{ cursor: 'pointer' }} onClick={function() { setMessage(null) }}>
          {message.text} <span style={{ float: 'right' }}>✕</span>
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
                  <th>Title</th><th>Type</th><th>Qs</th><th>Marks</th>
                  <th>Status</th><th>TG</th>
                  <th>Auto-Publish (IST)</th>
                  <th>Expiry (IST)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(function(t) {
                  var schedIST  = toIST(t.scheduled_at)
                  var expiryIST = toIST(t.expires_at)
                  var qCount    = t.questions ? t.questions.length : Math.round((t.total_marks || 0) / 4)
                  return (
                    <tr key={t._id}>
                      <td><strong>{t.title}</strong></td>
                      <td><span className={'badge badge-' + t.type}>{TYPE_EMOJI[t.type]} {t.type}</span></td>
                      <td>{qCount}</td>
                      <td>
                        <span style={{ color: 'var(--saffron)', fontWeight: 700 }}>{qCount * 4}</span>
                        {Number(t.negative_marks) > 0 && (
                          <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginLeft: '4px' }}>(-{t.negative_marks})</span>
                        )}
                      </td>
                      <td><span className={'badge badge-' + t.status}>{t.status}</span></td>
                      <td>{t.telegram_sent ? '✅' : '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: schedIST ? 'var(--saffron)' : 'var(--text-muted)' }}>
                        {schedIST || '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: expiryIST ? '#E67E22' : 'var(--text-muted)' }}>
                        {expiryIST || <span style={{ color: 'var(--success)', fontSize: '0.72rem' }}>Always Open</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {t.status === 'draft' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={function() { openPublishModal(t) }}>🚀</button>
                              <button className="btn btn-outline btn-sm" onClick={function() { openEdit(t) }}>✏️</button>
                            </>
                          )}
                          {t.status === 'published' && (
                            <>
                              <button className="btn btn-outline btn-sm" onClick={function() { copyLink(t.link_token) }}>🔗</button>
                              <button className="btn btn-sm" style={{ background: '#E67E22', color: 'white' }} onClick={function() { recalcRanks(t._id) }}>🔄</button>
                              <button className="btn btn-sm" style={{ background: '#6c757d', color: 'white' }} onClick={function() { closeTest(t._id) }}>🔒</button>
                            </>
                          )}
                          <button className="btn btn-sm btn-outline" onClick={function() { navigate('/admin/results/' + t._id) }}>📊</button>
                          <button className="btn btn-sm btn-danger" onClick={function() { deleteTest(t._id) }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {tests.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Koi test nahi mila</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Publish Modal ──────────────────────────────────── */}
      {publishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={function() { setPublishModal(null) }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            <div className="card-title">🚀 Publish — {publishModal.title}</div>

            <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Questions</span><br /><strong>{publishModal.questions ? publishModal.questions.length : publishModal.total_marks}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Total Marks</span><br /><strong style={{ color: 'var(--saffron)' }}>{(publishModal.questions ? publishModal.questions.length : Math.round((publishModal.total_marks || 0) / 4)) * 4}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Negative</span><br /><strong style={{ color: Number(publishModal.negative_marks) > 0 ? 'var(--error)' : 'var(--success)' }}>{Number(publishModal.negative_marks) > 0 ? '-' + publishModal.negative_marks : 'None'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Duration</span><br /><strong>{publishModal.duration_minutes} min</strong></div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">📢 Channel *</label>
              {channels.length === 0 ? (
                <div className="alert alert-error" style={{ fontSize: '0.82rem' }}>⚠️ Render pe TELEGRAM_CHANNEL_1 set karo</div>
              ) : (
                <select className="form-control" value={selectedCh} onChange={function(e) { setSelectedCh(e.target.value) }}>
                  {channels.map(function(ch) { return <option key={ch.id} value={ch.id}>{ch.name} ({ch.id})</option> })}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">✏️ Telegram Message (editable)</label>
              <textarea
                className="form-control"
                style={{ minHeight: '180px', fontSize: '0.83rem', fontFamily: 'monospace', lineHeight: '1.7' }}
                value={customMsg}
                onChange={function(e) { setCustomMsg(e.target.value) }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Launch button auto-add hoga</small>
            </div>

            <div style={{ background: '#1A1A2E', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginBottom: '6px' }}>📱 Preview</div>
              <div style={{ color: 'white', fontSize: '0.82rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{customMsg}</div>
              <div style={{ marginTop: '8px', background: '#2D6A4F', borderRadius: '6px', padding: '7px 12px', textAlign: 'center', color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>
                🚀 Launch CBT Test — अभी Attempt करें
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-full" onClick={function() { setPublishModal(null) }} disabled={publishing}>Cancel</button>
              <button className="btn btn-success btn-full" onClick={confirmPublish} disabled={publishing || !selectedCh || channels.length === 0}>
                {publishing ? '⏳...' : '✅ Confirm & Launch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────── */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={function() { setEditModal(null) }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            <div className="card-title">✏️ Edit Test</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Sirf Draft tests edit ho sakte hain</p>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-control" value={editData.title} onChange={function(e) { updateEdit('title', e.target.value) }} />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={editData.type} onChange={function(e) { updateEdit('type', e.target.value) }}>
                <option value="daily">📅 Daily CBT</option>
                <option value="diagnostic">🩺 Diagnostic</option>
                <option value="weekly">📆 Weekly CBT</option>
                <option value="grand">🏆 Grand Test</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Duration (min)</label>
                <input type="number" className="form-control" value={editData.duration_minutes} onChange={function(e) { updateEdit('duration_minutes', e.target.value) }} />
              </div>
              <div className="form-group">
                <label className="form-label">Negative Marks</label>
                <input type="number" className="form-control" step="0.25" value={editData.negative_marks} onChange={function(e) { updateEdit('negative_marks', e.target.value) }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                ⏰ Auto-Publish Time (IST)
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.75rem' }}>optional</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={editData.scheduled_at}
                onChange={function(e) { updateEdit('scheduled_at', e.target.value) }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.73rem' }}>
                IST mein select karo — system automatically UTC convert karega
              </small>
            </div>

            {editData.scheduled_at && (
              <div className="form-group">
                <label className="form-label">Auto-Publish Channel</label>
                <select className="form-control" value={editData.scheduled_channel} onChange={function(e) { updateEdit('scheduled_channel', e.target.value) }}>
                  <option value="">-- Select Channel --</option>
                  {channels.map(function(ch) { return <option key={ch.id} value={ch.id}>{ch.name}</option> })}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                🔒 End Time / Expiry (IST)
                <span style={{ fontWeight: 400, color: 'var(--success)', marginLeft: '8px', fontSize: '0.75rem' }}>optional — empty = Always Open</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={editData.expires_at}
                onChange={function(e) { updateEdit('expires_at', e.target.value) }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.73rem' }}>
                {editData.expires_at
                  ? '⏰ Test is time ke baad automatically close ho jayega'
                  : '✅ No Expiry — test hamesha open rahega jab tak manually close karo'}
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-outline btn-full" onClick={function() { setEditModal(null) }}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={saveEdit} disabled={saving}>
                {saving ? '⏳...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
