import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function QuestionBank() {
  const [taxonomy,   setTaxonomy]   = useState(null)
  const [questions,  setQuestions]  = useState([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [selected,   setSelected]   = useState([])
  const [page,       setPage]       = useState(1)

  // Filters
  const [fCategory, setFCategory] = useState('')
  const [fSubject,  setFSubject]  = useState('')
  const [fSthan,    setFSthan]    = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/questions/taxonomy').then(r => setTaxonomy(r.data.taxonomy))
  }, [])

  useEffect(() => {
    fetchQuestions()
  }, [fCategory, fSubject, fSthan, page])

  async function fetchQuestions() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 30 })
      if (fCategory) params.append('category', fCategory)
      if (fSubject)  params.append('subject',  fSubject)
      if (fSthan)    params.append('sthan',     fSthan)
      const res = await api.get(`/api/questions?${params}`)
      setQuestions(res.data.questions)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function selectAll() {
    const ids = questions.map(q => q._id)
    setSelected(prev => [...new Set([...prev, ...ids])])
  }

  function goToBuilder() {
    localStorage.setItem('ayurthon_selected_questions', JSON.stringify(selected))
    navigate('/admin/builder')
  }

  const subjects = taxonomy && fCategory ? Object.keys(taxonomy[fCategory]?.subjects || {}) : []
  const sthans   = taxonomy && fCategory && fSubject ? Object.keys(taxonomy[fCategory]?.subjects[fSubject]?.sthan || {}) : []

  return (
    <div>
      <div className="page-header">
        <h1>📚 Question Bank</h1>
        <p>Questions filter karein aur test ke liye select karein</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-control" value={fCategory} onChange={e => { setFCategory(e.target.value); setFSubject(''); setFSthan(''); setPage(1) }}>
              <option value="">All Categories</option>
              <option value="samhita">संहिता</option>
              <option value="short_subject">लघु विषय</option>
              <option value="modern">आधुनिक</option>
            </select>
          </div>
          {fCategory && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject</label>
              <select className="form-control" value={fSubject} onChange={e => { setFSubject(e.target.value); setFSthan(''); setPage(1) }}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          {fSubject && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sthan</label>
              <select className="form-control" value={fSthan} onChange={e => { setFSthan(e.target.value); setPage(1) }}>
                <option value="">All Sthan</option>
                {sthans.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Total: <strong>{total}</strong> | Selected: <strong style={{ color: 'var(--saffron)' }}>{selected.length}</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={selectAll}>✅ Select All (Page)</button>
          <button className="btn btn-sm" style={{ background: 'var(--border)' }} onClick={() => setSelected([])}>Clear</button>
          {selected.length > 0 && (
            <button className="btn btn-primary btn-sm" onClick={goToBuilder}>
              🏗️ Build Test ({selected.length} Qs)
            </button>
          )}
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {questions.map(q => (
            <div
              key={q._id}
              className={`question-item ${selected.includes(q._id) ? 'selected' : ''}`}
              onClick={() => toggleSelect(q._id)}
            >
              <input type="checkbox" checked={selected.includes(q._id)} onChange={() => {}} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#E8F4FD', color: '#1565C0', fontSize: '0.7rem' }}>{q.subject}</span>
                  {q.sthan && <span className="badge" style={{ background: '#F0F4FF', color: '#3730A3', fontSize: '0.7rem' }}>{q.sthan}</span>}
                  <span className="badge" style={{ background: '#FFF3CD', color: '#856404', fontSize: '0.7rem' }}>{q.type}</span>
                </div>
                <p className="question-text">{q.text.substring(0, 150)}{q.text.length > 150 ? '...' : ''}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Ans: <strong style={{ color: 'var(--success)' }}>{q.correct_answer}</strong>
                  {q.reference && <span style={{ marginLeft: '12px' }}>📖 {q.reference}</span>}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ padding: '6px 14px', fontSize: '0.9rem' }}>Page {page}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={questions.length < 30}>Next →</button>
          </div>
        </>
      )}
    </div>
  )
}
