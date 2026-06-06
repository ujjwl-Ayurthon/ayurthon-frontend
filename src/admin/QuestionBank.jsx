import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function QuestionBank() {
  var [taxonomy,   setTaxonomy]   = useState(null)
  var [questions,  setQuestions]  = useState([])
  var [total,      setTotal]      = useState(0)
  var [loading,    setLoading]    = useState(false)
  var [selected,   setSelected]   = useState([])
  var [page,       setPage]       = useState(1)
  var [search,     setSearch]     = useState('')
  var [searchInput,setSearchInput]= useState('')
  var [editModal,  setEditModal]  = useState(null)
  var [editData,   setEditData]   = useState({})
  var [saving,     setSaving]     = useState(false)
  var [message,    setMessage]    = useState(null)

  var [fCategory, setFCategory] = useState('')
  var [fSubject,  setFSubject]  = useState('')
  var [fSthan,    setFSthan]    = useState('')

  var navigate = useNavigate()

  useEffect(function() {
    api.get('/api/questions/taxonomy').then(function(r) { setTaxonomy(r.data.taxonomy) })
  }, [])

  useEffect(function() {
    fetchQuestions()
  }, [fCategory, fSubject, fSthan, page, search])

  async function fetchQuestions() {
    setLoading(true)
    try {
      var params = new URLSearchParams({ page: page, limit: 30 })
      if (fCategory) params.append('category', fCategory)
      if (fSubject)  params.append('subject',  fSubject)
      if (fSthan)    params.append('sthan',     fSthan)
      if (search)    params.append('search',    search)
      var res = await api.get('/api/questions?' + params.toString())
      setQuestions(res.data.questions)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(id) {
    setSelected(function(prev) {
      return prev.includes(id) ? prev.filter(function(x) { return x !== id }) : prev.concat([id])
    })
  }

  function selectAll() {
    var ids = questions.map(function(q) { return q._id })
    setSelected(function(prev) {
      var combined = prev.concat(ids)
      return combined.filter(function(v, i, a) { return a.indexOf(v) === i })
    })
  }

  function clearSelection() { setSelected([]) }

  function goToBuilder() {
    localStorage.setItem('ayurthon_selected_questions', JSON.stringify(selected))
    navigate('/admin/builder')
  }

  // ── Edit ─────────────────────────────────────────────────
  function openEdit(q) {
    setEditData({
      text:           q.text,
      type:           q.type,
      optionA:        q.options.A,
      optionB:        q.options.B,
      optionC:        q.options.C,
      optionD:        q.options.D,
      correct_answer: q.correct_answer,
      explanation:    q.explanation || '',
      reference:      q.reference   || '',
      subject:        q.subject,
      sthan:          q.sthan    || '',
      chapter:        q.chapter  || ''
    })
    setEditModal(q)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await api.put('/api/questions/' + editModal._id, {
        text:           editData.text,
        type:           editData.type,
        options:        { A: editData.optionA, B: editData.optionB, C: editData.optionC, D: editData.optionD },
        correct_answer: editData.correct_answer,
        explanation:    editData.explanation,
        reference:      editData.reference,
        subject:        editData.subject,
        sthan:          editData.sthan,
        chapter:        editData.chapter
      })
      setMessage({ type: 'success', text: '✅ Question updated!' })
      setEditModal(null)
      fetchQuestions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Update failed' })
    } finally {
      setSaving(false)
    }
  }

  // ── Delete single ─────────────────────────────────────────
  async function deleteOne(id, text) {
    if (!confirm('Delete karna chahte ho?\n\n"' + text.substring(0, 80) + '"')) return
    try {
      await api.delete('/api/questions/' + id)
      setMessage({ type: 'success', text: '🗑️ Question deleted' })
      setSelected(function(prev) { return prev.filter(function(x) { return x !== id }) })
      fetchQuestions()
    } catch (err) {
      setMessage({ type: 'error', text: 'Delete failed' })
    }
  }

  // ── Bulk delete ───────────────────────────────────────────
  async function bulkDelete() {
    if (selected.length === 0) return
    if (!confirm('Kya aap ' + selected.length + ' questions delete karna chahte ho? Yeh action undo nahi hogi!')) return
    try {
      var res = await api.post('/api/questions/bulk-delete', { ids: selected })
      setMessage({ type: 'success', text: '🗑️ ' + res.data.deleted + ' questions deleted!' })
      setSelected([])
      fetchQuestions()
    } catch (err) {
      setMessage({ type: 'error', text: 'Bulk delete failed' })
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  var subjects = taxonomy && fCategory ? Object.keys(taxonomy[fCategory] ? taxonomy[fCategory].subjects || {} : {}) : []
  var sthans   = taxonomy && fCategory && fSubject && taxonomy[fCategory] && taxonomy[fCategory].subjects[fSubject]
    ? Object.keys(taxonomy[fCategory].subjects[fSubject].sthan || {})
    : []

  return (
    <div>
      <div className="page-header">
        <h1>📚 Question Bank</h1>
        <p>Questions search, filter, edit aur select karein</p>
      </div>

      {message && (
        <div className={'alert alert-' + message.type} style={{ cursor: 'pointer' }} onClick={function() { setMessage(null) }}>
          {message.text} <span style={{ float: 'right' }}>✕</span>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          className="form-control"
          placeholder="🔍 Question text, reference ya explanation search karein..."
          value={searchInput}
          onChange={function(e) { setSearchInput(e.target.value) }}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
        {search && (
          <button type="button" className="btn btn-outline" onClick={function() { setSearch(''); setSearchInput(''); setPage(1) }}>
            Clear
          </button>
        )}
      </form>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-control" value={fCategory} onChange={function(e) { setFCategory(e.target.value); setFSubject(''); setFSthan(''); setPage(1) }}>
              <option value="">All</option>
              <option value="samhita">संहिता</option>
              <option value="short_subject">लघु विषय</option>
              <option value="modern">आधुनिक</option>
            </select>
          </div>
          {fCategory && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject</label>
              <select className="form-control" value={fSubject} onChange={function(e) { setFSubject(e.target.value); setFSthan(''); setPage(1) }}>
                <option value="">All</option>
                {subjects.map(function(s) { return <option key={s} value={s}>{s}</option> })}
              </select>
            </div>
          )}
          {fSubject && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sthan</label>
              <select className="form-control" value={fSthan} onChange={function(e) { setFSthan(e.target.value); setPage(1) }}>
                <option value="">All</option>
                {sthans.map(function(s) { return <option key={s} value={s}>{s}</option> })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Total: <strong>{total}</strong>
          {search && <span style={{ color: 'var(--saffron)' }}> (search: "{search}")</span>}
          {' | '} Selected: <strong style={{ color: 'var(--saffron)' }}>{selected.length}</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={selectAll}>✅ Select Page</button>
          <button className="btn btn-sm" style={{ background: 'var(--border)' }} onClick={clearSelection}>Clear</button>
          {selected.length > 0 && (
            <>
              <button className="btn btn-danger btn-sm" onClick={bulkDelete}>
                🗑️ Delete ({selected.length})
              </button>
              <button className="btn btn-primary btn-sm" onClick={goToBuilder}>
                🏗️ Build Test ({selected.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : questions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          {search ? 'Koi question nahi mila "' + search + '" ke liye' : 'Is filter mein koi question nahi'}
        </div>
      ) : (
        <>
          {questions.map(function(q) {
            var isSelected = selected.includes(q._id)
            return (
              <div
                key={q._id}
                className={'question-item' + (isSelected ? ' selected' : '')}
                onClick={function() { toggleSelect(q._id) }}
              >
                <input type="checkbox" checked={isSelected} onChange={function() {}} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: '#E8F4FD', color: '#1565C0', fontSize: '0.7rem' }}>{q.subject}</span>
                    {q.sthan && <span className="badge" style={{ background: '#F0F4FF', color: '#3730A3', fontSize: '0.7rem' }}>{q.sthan}</span>}
                    <span className="badge" style={{ background: '#FFF3CD', color: '#856404', fontSize: '0.7rem' }}>{q.type}</span>
                    {q.is_duplicate && <span className="badge" style={{ background: '#FDE8E8', color: 'var(--error)', fontSize: '0.7rem' }}>⚠️ Duplicate</span>}
                  </div>
                  <p className="question-text">{q.text.substring(0, 160)}{q.text.length > 160 ? '...' : ''}</p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Ans: <strong style={{ color: 'var(--success)' }}>{q.correct_answer}</strong>
                    {q.reference && <span style={{ marginLeft: '12px' }}>📖 {q.reference}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} onClick={function(e) { e.stopPropagation() }}>
                  <button className="btn btn-outline btn-sm" onClick={function() { openEdit(q) }}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={function() { deleteOne(q._id, q.text) }}>🗑️</button>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <button className="btn btn-outline btn-sm" onClick={function() { setPage(function(p) { return Math.max(1, p-1) }) }} disabled={page === 1}>← Prev</button>
            <span style={{ padding: '6px 14px', fontSize: '0.9rem' }}>Page {page}</span>
            <button className="btn btn-outline btn-sm" onClick={function() { setPage(function(p) { return p+1 }) }} disabled={questions.length < 30}>Next →</button>
          </div>
        </>
      )}

      {/* ── Edit Modal ───────────────────────────────────── */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ maxWidth: '620px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={function() { setEditModal(null) }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>

            <div className="card-title">✏️ Question Edit</div>

            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea className="form-control deva" style={{ minHeight: '100px' }} value={editData.text} onChange={function(e) { setEditData(Object.assign({}, editData, { text: e.target.value })) }} />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={editData.type} onChange={function(e) { setEditData(Object.assign({}, editData, { type: e.target.value })) }}>
                <option value="mcq">MCQ</option>
                <option value="assertion_reason">Assertion Reason</option>
                <option value="match_following">Match Following</option>
              </select>
            </div>

            {['A','B','C','D'].map(function(k) {
              return (
                <div key={k} className="form-group">
                  <label className="form-label">Option {k}</label>
                  <input className="form-control deva" value={editData['option' + k] || ''} onChange={function(e) {
                    var update = {}
                    update['option' + k] = e.target.value
                    setEditData(Object.assign({}, editData, update))
                  }} />
                </div>
              )
            })}

            <div className="form-group">
              <label className="form-label">Correct Answer *</label>
              <select className="form-control" value={editData.correct_answer} onChange={function(e) { setEditData(Object.assign({}, editData, { correct_answer: e.target.value })) }}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Explanation</label>
              <textarea className="form-control deva" style={{ minHeight: '80px' }} value={editData.explanation} onChange={function(e) { setEditData(Object.assign({}, editData, { explanation: e.target.value })) }} />
            </div>

            <div className="form-group">
              <label className="form-label">Reference</label>
              <input className="form-control" value={editData.reference} onChange={function(e) { setEditData(Object.assign({}, editData, { reference: e.target.value })) }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-outline btn-full" onClick={function() { setEditModal(null) }}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={saveEdit} disabled={saving}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
