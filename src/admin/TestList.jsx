import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

var TYPE_EMOJI = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }
var TYPE_LABEL = { daily: 'Daily CBT', diagnostic: 'Diagnostic Test', weekly: 'Weekly CBT', grand: 'Grand Test' }

function buildDefaultMessage(test) {
  var negLine = (test.negative_marks && Number(test.negative_marks) > 0)
    ? '➖ Negative Marking: ' + test.negative_marks
    : '✅ No Negative Marking'
  var qCount = test.questions ? test.questions.length : test.total_marks
  return (TYPE_EMOJI[test.type] || '📝') + ' Ayurthon — ' + (TYPE_LABEL[test.type] || 'Test') + '\n\n' +
    '📚 ' + test.title + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '❓ Questions: ' + qCount + '\n' +
    '⏱ Duration: ' + test.duration_minutes + ' Minutes\n' +
    '🏆 Total Marks: ' + test.total_marks + '\n' +
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
  var [scheduleMode, setScheduleMode] = useState(false)
  var [scheduleAt,   setScheduleAt]   = useState('')
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
      .catch(function(err) { console.error('Channels error:', err) })
  }, [])

  async function fetchTests() {
    try {
      var res = await api.get('/api/tests')
      setTests(res.data.tests)
    } catch (err) {
      setMessage({ type: 'error', text: 'Tests load error' })
    } finally {
      setLoading(false)
    }
  }

  function openPublishModal(test) {
    setPublishModal(test)
    setCustomMsg(buildDefaultMessage(test))
    setScheduleMode(false)
    setScheduleAt('')
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
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Publish error' })
    } finally {
      setPublishing(false) }
  }

  // ── Edit draft test ───────────────────────────────────────
  function openEdit(test) {
    setEditData({
      title:            test.title,
      type:             test.type,
      duration_minutes: test.duration_minutes,
      negative_marks:   test.negative_marks || 0,
      scheduled_at:     test.scheduled_at ? new Date(test.scheduled_at).toISOString().slice(0,16) : '',
      scheduled_channel:test.scheduled_channel || ''
    })
    setEditModal(test)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await api.put('/api/tests/' + editModal._id, {
        title:             editData.title,
        type:              editData.type,
        duration_minutes:  Number(editData.duration_minutes),
        negative_marks:    Number(editData.negative_marks),
        scheduled_at:      editData.scheduled_at || null,
        scheduled_channel: editData.scheduled_channel || null
      })
      setMessage({ type: 'success', text: '✅ Test updated!' })
      setEditModal(null)
      fetchTests()
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Update error' })
    } finally {
      setSaving(false)
    }
  }

  async function recalcRanks(id) {
    try {
      var res = await api.post('/api/tests/' + id + '/recalculate-ranks')
      setMessage({ type: 'success', text: '🔄 ' + res.data.updated + ' ranks recalculated!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Recalculate failed' })
    }
  }

  async function closeTest(id) {
    if (!confirm('Test close karna chahte ho? Ranks final ho jaayenge.')) return
    var res = await api.post('/api/tests/' + id + '/close')
    setMessage({ type: 'success', text: '🔒 Test closed. ' + res.data.ranks_recalculated + ' ranks finalized.' })
    fetchTests()
  }

  async function deleteTest(id) {
    if (!confirm('Test permanently delete karna chahte ho?')) return
    await api.delete('/api/tests/' + id)
    fetchTests()
  }

  function copyLink(token) {
    var link = window.location.origin + '/test/' + token
    navigator.clipboard.writeText(link)
    setMessage({ type: 'success', text: '📋 Link copied!' })
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 All Tests</h1>
        <p>Sabhi tests ki list, status aur management</p>
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
                  <th>Title</th><th>Type</th><th>Qs</th><th>Dur</th>
                  <th>Neg</th><th>Status</th><th>TG</th><th>Scheduled</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(function(t) {
                  return (
                    <tr key={t._id}>
                      <td><strong>{t.title}</strong></td>
                      <td><span className={'badge badge-' + t.type}>{TYPE_EMOJI[t.type]} {t.type}</span></td>
                      <td>{t.questions ? t.questions.length : t.total_marks}</td>
                      <td>{t.duration_minutes}m</td>
                      <td>{Number(t.negative_marks) > 0 ? '-' + t.negative_marks : '—'}</td>
                      <td><span className={'badge badge-' + t.status}>{t.status}</span></td>
                      <td>{t.telegram_sent ? '✅' : '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.scheduled_at ? new Date(t.scheduled_at).toLocaleString('hi-IN') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {t.status === 'draft' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={function() { openPublishModal(t) }}>🚀 Publish</button>
                              <button className="btn btn-outline btn-sm" onClick={function() { openEdit(t) }}>✏️ Edit</button>
                            </>
                          )}
                          {t.status === 'published' && (
                            <>
                              <button className="btn btn-outline btn-sm" onClick={function() { copyLink(t.link_token) }}>🔗 Link</button>
                              <button className="btn btn-sm" style={{ background: '#E67E22', color: 'white' }} onClick={function() { recalcRanks(t._id) }}>🔄 Ranks</button>
                              <button className="btn btn-sm" style={{ background: '#6c757d', color: 'white' }} onClick={function() { closeTest(t._id) }}>🔒 Close</button>
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
          <div className="card" style={{ maxWidth: '460px', width: '100%', position: 'relative' }}>
            <button onClick={function() { setEditModal(null) }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            <div className="card-title">✏️ Edit Test (Draft only)</div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-control" value={editData.title} onChange={function(e) { setEditData(Object.assign({}, editData, { title: e.target.value })) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={editData.type} onChange={function(e) { setEditData(Object.assign({}, editData, { type: e.target.value })) }}>
                <option value="daily">📅 Daily CBT</option>
                <option value="diagnostic">🩺 Diagnostic</option>
                <option value="weekly">📆 Weekly CBT</option>
                <option value="grand">🏆 Grand Test</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Duration (min)</label>
                <input type="number" className="form-control" value={editData.duration_minutes} onChange={function(e) { setEditData(Object.assign({}, editData, { duration_minutes: e.target.value })) }} />
              </div>
              <div className="form-group">
                <label className="form-label">Negative Marks</label>
                <input type="number" className="form-control" step="0.25" value={editData.negative_marks} onChange={function(e) { setEditData(Object.assign({}, editData, { negative_marks: e.target.value })) }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">⏰ Schedule Auto-Publish (optional)</label>
              <input type="datetime-local" className="form-control" value={editData.scheduled_at} onChange={function(e) { setEditData(Object.assign({}, editData, { scheduled_at: e.target.value })) }} />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Set karo → cron-job.org se /api/tests/scheduled/run call karo har 5 min mein
              </small>
            </div>
            {editData.scheduled_at && (
              <div className="form-group">
                <label className="form-label">Schedule Channel</label>
                <select className="form-control" value={editData.scheduled_channel} onChange={function(e) { setEditData(Object.assign({}, editData, { scheduled_channel: e.target.value })) }}>
                  <option value="">-- Select --</option>
                  {channels.map(function(ch) { return <option key={ch.id} value={ch.id}>{ch.name}</option> })}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-full" onClick={function() { setEditModal(null) }}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={saveEdit} disabled={saving}>
                {saving ? '⏳...' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
