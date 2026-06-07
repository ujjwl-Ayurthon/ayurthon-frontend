import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

var TYPE_EMOJI = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }
var TYPE_LABEL = { daily: 'Daily CBT', diagnostic: 'Diagnostic Test', weekly: 'Weekly CBT', grand: 'Grand Test' }

function toIST(dateStr) {
  if (!dateStr) return null
  var d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  })
}

function localToUTC(localStr) {
  if (!localStr) return null
  var d = new Date(localStr)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

function utcToLocalInput(utcStr) {
  if (!utcStr) return ''
  var d = new Date(utcStr)
  if (isNaN(d.getTime())) return ''
  var ist = new Date(d.getTime() + (5.5 * 60 * 60 * 1000))
  var pad = function(n) { return n < 10 ? '0' + n : '' + n }
  return ist.getUTCFullYear() + '-' + pad(ist.getUTCMonth() + 1) + '-' +
    pad(ist.getUTCDate()) + 'T' + pad(ist.getUTCHours()) + ':' + pad(ist.getUTCMinutes())
}

function buildDefaultMessage(test) {
  var negLine = (test.negative_marks && Number(test.negative_marks) > 0)
    ? '➖ Negative Marking: ' + test.negative_marks + ' per wrong'
    : '✅ No Negative Marking'
  var qCount = test.questions ? test.questions.length : Math.round((test.total_marks || 0) / (test.correct_marks || 4))
  var marks  = qCount * (test.correct_marks || 4)
  return TYPE_EMOJI[test.type] + ' Ayurthon — ' + TYPE_LABEL[test.type] + '\n\n' +
    '📚 ' + test.title + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '❓ Questions: ' + qCount + '\n' +
    '⏱ Duration: ' + test.duration_minutes + ' Minutes\n' +
    '🏆 Total Marks: ' + marks + ' (+' + (test.correct_marks || 4) + ' / -' + (test.negative_marks || 1) + ')\n' +
    negLine + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '📊 Result & Leaderboard turant milega!\n\n' +
    'सभी को शुभकामनाएं! 🌿'
}

export default function TestList() {
  var [tests,         setTests]         = useState([])
  var [loading,       setLoading]       = useState(true)
  var [message,       setMessage]       = useState(null)
  var [publishModal,  setPublishModal]  = useState(null)
  var [editModal,     setEditModal]     = useState(null)
  var [viewModal,     setViewModal]     = useState(null)   // { test, questions }
  var [editQModal,    setEditQModal]    = useState(null)   // { testId, question }
  var [publishing,    setPublishing]    = useState(false)
  var [saving,        setSaving]        = useState(false)
  var [savingQ,       setSavingQ]       = useState(false)
  var [loadingQ,      setLoadingQ]      = useState(false)
  var [channels,      setChannels]      = useState([])
  var [selectedCh,    setSelectedCh]    = useState('')
  var [customMsg,     setCustomMsg]     = useState('')
  var [editData,      setEditData]      = useState({})
  var [editQData,     setEditQData]     = useState({})

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

  // ── View Questions Modal ───────────────────────────────────
  async function openViewModal(test) {
    setLoadingQ(true)
    setViewModal({ test: test, questions: [] })
    try {
      var res = await api.get('/api/tests/' + test._id)
      setViewModal({ test: res.data.test, questions: res.data.test.questions || [] })
    } catch (e) {
      setMessage({ type: 'error', text: 'Questions load nahi hue' })
      setViewModal(null)
    } finally {
      setLoadingQ(false)
    }
  }

  // ── Edit Question Modal ────────────────────────────────────
  function openEditQ(testId, q) {
    setEditQData({
      text:           q.text           || '',
      type:           q.type           || 'mcq',
      optionA:        q.options ? q.options.A : '',
      optionB:        q.options ? q.options.B : '',
      optionC:        q.options ? q.options.C : '',
      optionD:        q.options ? q.options.D : '',
      correct_answer: q.correct_answer || 'A',
      explanation:    q.explanation    || '',
      reference:      q.reference      || ''
    })
    setEditQModal({ testId: testId, question: q })
  }

  async function saveEditQ() {
    if (!editQModal) return
    setSavingQ(true)
    try {
      var res = await api.put(
        '/api/tests/' + editQModal.testId + '/question/' + editQModal.question._id,
        {
          text:           editQData.text,
          type:           editQData.type,
          options:        { A: editQData.optionA, B: editQData.optionB, C: editQData.optionC, D: editQData.optionD },
          correct_answer: editQData.correct_answer,
          explanation:    editQData.explanation,
          reference:      editQData.reference
        }
      )
      setMessage({ type: 'success', text: '✅ Question updated!' })
      setEditQModal(null)

      // Refresh view modal questions
      if (viewModal) {
        var updatedQ = res.data.question
        setViewModal(function(prev) {
          if (!prev) return prev
          return {
            test: prev.test,
            questions: prev.questions.map(function(q) {
              return q._id === updatedQ._id ? updatedQ : q
            })
          }
        })
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.response ? e.response.data.error : 'Update failed' })
    } finally {
      setSavingQ(false)
    }
  }

  function updateEditQ(key, val) {
    setEditQData(function(prev) {
      var next = Object.assign({}, prev)
      next[key] = val
      return next
    })
  }

  // ── Publish Modal ─────────────────────────────────────────
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
        channel_id: selectedCh, custom_message: customMsg
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

  // ── Edit Test Modal ───────────────────────────────────────
  function openEdit(test) {
    setEditData({
      title:             test.title,
      type:              test.type,
      duration_minutes:  test.duration_minutes,
      correct_marks:     test.correct_marks  || 4,
      negative_marks:    test.negative_marks || 1,
      scheduled_at:      utcToLocalInput(test.scheduled_at),
      scheduled_channel: test.scheduled_channel || '',
      expires_at:        utcToLocalInput(test.expires_at)
    })
    setEditModal(test)
  }

  function updateEdit(key, val) {
    setEditData(function(prev) { var n = Object.assign({}, prev); n[key] = val; return n })
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await api.put('/api/tests/' + editModal._id, {
        title:             editData.title,
        type:              editData.type,
        duration_minutes:  Number(editData.duration_minutes),
        correct_marks:     Number(editData.correct_marks),
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

  var OVERLAY = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  var MODAL   = { maxWidth: '520px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }
  var CLOSE_BTN = { position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', zIndex: 10 }

  return (
    <div>
      <div className="page-header">
        <h1>📋 All Tests</h1>
        <p>Publish, Edit, View Questions — sabhi statuses ke liye</p>
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
                  <th>Status</th><th>TG</th><th>Scheduled (IST)</th><th>Expiry (IST)</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(function(t) {
                  var qCount    = t.questions ? t.questions.length : Math.round((t.total_marks || 0) / (t.correct_marks || 4))
                  var schedIST  = toIST(t.scheduled_at)
                  var expiryIST = toIST(t.expires_at)
                  return (
                    <tr key={t._id}>
                      <td><strong>{t.title}</strong></td>
                      <td><span className={'badge badge-' + t.type}>{TYPE_EMOJI[t.type]} {t.type}</span></td>
                      <td>{qCount}</td>
                      <td>
                        <span style={{ color: 'var(--saffron)', fontWeight: 700 }}>{qCount * (t.correct_marks || 4)}</span>
                        <span style={{ color: 'var(--error)', fontSize: '0.72rem', marginLeft: '4px' }}>(-{t.negative_marks || 1})</span>
                      </td>
                      <td><span className={'badge badge-' + t.status}>{t.status}</span></td>
                      <td>{t.telegram_sent ? '✅' : '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: schedIST ? 'var(--saffron)' : 'var(--text-muted)' }}>{schedIST || '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: expiryIST ? '#E67E22' : 'var(--text-muted)' }}>
                        {expiryIST || <span style={{ color: 'var(--success)', fontSize: '0.72rem' }}>Always Open</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {/* View Questions — always visible for all statuses */}
                          <button className="btn btn-outline btn-sm" onClick={function() { openViewModal(t) }} title="View & Edit Questions">
                            👁️
                          </button>
                          {/* Edit test settings — always visible */}
                          <button className="btn btn-outline btn-sm" onClick={function() { openEdit(t) }} title="Edit Test Settings">
                            ✏️
                          </button>
                          {t.status === 'draft' && (
                            <button className="btn btn-success btn-sm" onClick={function() { openPublishModal(t) }}>🚀</button>
                          )}
                          {t.status === 'published' && (
                            <>
                              <button className="btn btn-outline btn-sm" onClick={function() { copyLink(t.link_token) }} title="Copy Link">🔗</button>
                              <button className="btn btn-sm" style={{ background: '#E67E22', color: 'white' }} onClick={function() { recalcRanks(t._id) }} title="Recalculate Ranks">🔄</button>
                              <button className="btn btn-sm" style={{ background: '#6c757d', color: 'white' }} onClick={function() { closeTest(t._id) }} title="Close Test">🔒</button>
                            </>
                          )}
                          <button className="btn btn-sm btn-outline" onClick={function() { navigate('/admin/results/' + t._id) }} title="Results">📊</button>
                          <button className="btn btn-sm btn-danger" onClick={function() { deleteTest(t._id) }} title="Delete">🗑️</button>
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

      {/* ── View Questions Modal ─────────────────────────────── */}
      {viewModal && (
        <div style={OVERLAY}>
          <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={function() { setViewModal(null) }} style={CLOSE_BTN}>✕</button>
            <div className="card-title">
              👁️ Questions — {viewModal.test.title}
              <span className={'badge badge-' + viewModal.test.status} style={{ marginLeft: '10px', fontSize: '0.75rem' }}>
                {viewModal.test.status}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              ✏️ Kisi bhi question pe "Edit" click karo — published test mein bhi typos fix kar sakte ho
            </p>

            {loadingQ ? (
              <div className="loading-wrap"><div className="spinner" /></div>
            ) : viewModal.questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Koi question nahi mila</div>
            ) : (
              viewModal.questions.map(function(q, i) {
                return (
                  <div key={q._id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: '#E8F4FD', color: '#1565C0' }}>Q{i + 1}</span>
                        <span className="badge" style={{ background: '#FFF3CD', color: '#856404', fontSize: '0.7rem' }}>{q.type}</span>
                        <span className="badge" style={{ background: 'var(--green-light)', color: 'var(--success)', fontSize: '0.7rem' }}>Ans: {q.correct_answer}</span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={function() { openEditQ(viewModal.test._id, q) }}
                        style={{ flexShrink: 0 }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                    <p className="deva" style={{ fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '8px' }}>{q.text}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {q.options && Object.entries(q.options).map(function(entry) {
                        var k = entry[0], v = entry[1]
                        return (
                          <div key={k} style={{
                            padding: '5px 10px', borderRadius: '6px', fontSize: '0.82rem',
                            background: k === q.correct_answer ? 'var(--green-light)' : '#F8F9FA',
                            border: '1px solid ' + (k === q.correct_answer ? 'var(--success)' : 'var(--border)'),
                            fontWeight: k === q.correct_answer ? 600 : 400
                          }} className="deva">
                            {k === q.correct_answer ? '✅' : '○'} <strong>{k}.</strong> {v}
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '6px 10px', background: 'var(--saffron-light)', borderRadius: '6px' }}>
                        💡 {q.explanation}
                      </div>
                    )}
                    {q.reference && (
                      <div style={{ marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>📖 {q.reference}</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ── Edit Question Modal ──────────────────────────────── */}
      {editQModal && (
        <div style={Object.assign({}, OVERLAY, { zIndex: 1100 })}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={function() { setEditQModal(null) }} style={CLOSE_BTN}>✕</button>
            <div className="card-title">✏️ Edit Question</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--saffron)', marginBottom: '14px' }}>
              ⚠️ Yeh change LIVE test mein bhi reflect hoga — students jo abhi attempt kar rahe hain unhe updated question dikhega
            </p>

            <div className="form-group">
              <label className="form-label">Question Type</label>
              <select className="form-control" value={editQData.type} onChange={function(e) { updateEditQ('type', e.target.value) }}>
                <option value="mcq">MCQ</option>
                <option value="assertion_reason">Assertion Reason</option>
                <option value="match_following">Match Following</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea className="form-control deva" style={{ minHeight: '100px', fontSize: '0.9rem' }}
                value={editQData.text} onChange={function(e) { updateEditQ('text', e.target.value) }} />
            </div>

            {['A','B','C','D'].map(function(k) {
              return (
                <div key={k} className="form-group">
                  <label className="form-label" style={{ color: k === editQData.correct_answer ? 'var(--success)' : 'var(--text)' }}>
                    Option {k} {k === editQData.correct_answer ? '✅ (Correct)' : ''}
                  </label>
                  <input className="form-control deva"
                    value={editQData['option' + k] || ''}
                    onChange={function(e) { var u = {}; u['option' + k] = e.target.value; updateEditQ('option' + k, e.target.value) }}
                  />
                </div>
              )
            })}

            <div className="form-group">
              <label className="form-label">Correct Answer *</label>
              <select className="form-control" value={editQData.correct_answer}
                onChange={function(e) { updateEditQ('correct_answer', e.target.value) }}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Explanation</label>
              <textarea className="form-control deva" style={{ minHeight: '80px' }}
                value={editQData.explanation} onChange={function(e) { updateEditQ('explanation', e.target.value) }} />
            </div>

            <div className="form-group">
              <label className="form-label">Reference</label>
              <input className="form-control" value={editQData.reference}
                onChange={function(e) { updateEditQ('reference', e.target.value) }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-full" onClick={function() { setEditQModal(null) }}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={saveEditQ} disabled={savingQ}>
                {savingQ ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Test Settings Modal ─────────────────────────── */}
      {editModal && (
        <div style={OVERLAY}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={function() { setEditModal(null) }} style={CLOSE_BTN}>✕</button>
            <div className="card-title">✏️ Edit Test Settings</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Status: <span className={'badge badge-' + editModal.status}>{editModal.status}</span> — sabhi statuses ke liye edit allowed
            </p>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Duration (min)</label>
                <input type="number" className="form-control" value={editData.duration_minutes}
                  onChange={function(e) { updateEdit('duration_minutes', e.target.value) }} />
              </div>
              <div className="form-group">
                <label className="form-label">✅ Per Correct</label>
                <input type="number" className="form-control" min="1" step="1" value={editData.correct_marks}
                  onChange={function(e) { updateEdit('correct_marks', e.target.value) }} />
              </div>
              <div className="form-group">
                <label className="form-label">❌ Per Wrong</label>
                <input type="number" className="form-control" min="0" step="1" value={editData.negative_marks}
                  onChange={function(e) { updateEdit('negative_marks', e.target.value) }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">⏰ Auto-Publish (IST)</label>
              <input type="datetime-local" className="form-control" value={editData.scheduled_at}
                onChange={function(e) { updateEdit('scheduled_at', e.target.value) }} />
            </div>
            {editData.scheduled_at && (
              <div className="form-group">
                <label className="form-label">Auto-Publish Channel</label>
                <select className="form-control" value={editData.scheduled_channel}
                  onChange={function(e) { updateEdit('scheduled_channel', e.target.value) }}>
                  <option value="">-- Select --</option>
                  {channels.map(function(ch) { return <option key={ch.id} value={ch.id}>{ch.name}</option> })}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">
                🔒 Expiry (IST)
                <span style={{ fontWeight: 400, color: 'var(--success)', marginLeft: '8px', fontSize: '0.75rem' }}>optional</span>
              </label>
              <input type="datetime-local" className="form-control" value={editData.expires_at}
                onChange={function(e) { updateEdit('expires_at', e.target.value) }} />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.73rem' }}>
                {editData.expires_at ? '⏰ Test is time ke baad close hoga' : '✅ Always Open'}
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-full" onClick={function() { setEditModal(null) }}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={saveEdit} disabled={saving}>
                {saving ? '⏳...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Publish Modal ────────────────────────────────────── */}
      {publishModal && (
        <div style={OVERLAY}>
          <div className="card" style={Object.assign({}, MODAL, { maxWidth: '500px' })}>
            <button onClick={function() { setPublishModal(null) }} style={CLOSE_BTN}>✕</button>
            <div className="card-title">🚀 Publish — {publishModal.title}</div>

            <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Questions</span><br /><strong>{publishModal.questions ? publishModal.questions.length : Math.round((publishModal.total_marks || 0) / (publishModal.correct_marks || 4))}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Total Marks</span><br /><strong style={{ color: 'var(--saffron)' }}>{(publishModal.questions ? publishModal.questions.length : Math.round((publishModal.total_marks || 0) / (publishModal.correct_marks || 4))) * (publishModal.correct_marks || 4)}</strong></div>
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
              <label className="form-label">✏️ Message (editable)</label>
              <textarea className="form-control" style={{ minHeight: '160px', fontSize: '0.83rem', fontFamily: 'monospace', lineHeight: '1.7' }}
                value={customMsg} onChange={function(e) { setCustomMsg(e.target.value) }} />
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
    </div>
  )
}
