import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Upload() {
  const [taxonomy, setTaxonomy] = useState(null)
  const [category, setCategory] = useState('')
  const [subject,  setSubject]  = useState('')
  const [sthan,    setSthan]    = useState('')
  const [chapter,  setChapter]  = useState('')
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd,   setRangeEnd]   = useState('')
  const [rawText,  setRawText]  = useState('')
  const [parsed,   setParsed]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [message,  setMessage]  = useState(null)

  useEffect(() => {
    api.get('/api/questions/taxonomy').then(r => setTaxonomy(r.data.taxonomy))
  }, [])

  const subjects  = taxonomy && category ? Object.keys(taxonomy[category]?.subjects || {}) : []
  const sthans    = taxonomy && category && subject ? Object.keys(taxonomy[category]?.subjects[subject]?.sthan || {}) : []
  const chapCount = taxonomy && category && subject && sthan ? taxonomy[category]?.subjects[subject]?.sthan[sthan]?.chapters : 0

  async function handleParse() {
    if (!rawText.trim()) return
    setLoading(true); setParsed(null); setMessage(null)
    try {
      const res = await api.post('/api/questions/parse', { raw_text: rawText })
      setParsed(res.data)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Parse error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!parsed || parsed.total === 0) return
    if (!category || !subject) { setMessage({ type: 'error', text: 'Category aur Subject select karein' }); return }
    setSaving(true); setMessage(null)
    try {
      const res = await api.post('/api/questions/upload', {
        raw_text: rawText, category, subject, sthan, chapter,
        range_start: rangeStart || null, range_end: rangeEnd || null
      })
      setMessage({ type: 'success', text: `✅ ${res.data.saved} questions save ho gaye!` })
      setRawText(''); setParsed(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Save error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>📤 Question Upload</h1>
        <p>Bulk paste karein — Hindi, Sanskrit, Devanagari sab supported hai</p>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Left: Taxonomy */}
        <div className="card">
          <div className="card-title">📂 Subject Select करें</div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={category} onChange={e => { setCategory(e.target.value); setSubject(''); setSthan(''); setChapter('') }}>
              <option value="">-- Select --</option>
              <option value="samhita">संहिता</option>
              <option value="short_subject">लघु विषय</option>
              <option value="modern">आधुनिक विषय</option>
            </select>
          </div>

          {category && (
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-control" value={subject} onChange={e => { setSubject(e.target.value); setSthan(''); setChapter('') }}>
                <option value="">-- Select --</option>
                {subjects.map(s => <option key={s} value={s}>{taxonomy[category].subjects[s].label} ({s})</option>)}
              </select>
            </div>
          )}

          {subject && sthans.length > 0 && (
            <div className="form-group">
              <label className="form-label">स्थान / भाग</label>
              <select className="form-control" value={sthan} onChange={e => { setSthan(e.target.value); setChapter('') }}>
                <option value="">-- Select --</option>
                {sthans.map(s => <option key={s} value={s}>{taxonomy[category].subjects[subject].sthan[s].label} ({s})</option>)}
              </select>
            </div>
          )}

          {sthan && (
            <div className="form-group">
              <label className="form-label">Chapter (Optional)</label>
              <input className="form-control" placeholder="e.g. Ch.1 - Deerghanjivitiya" value={chapter} onChange={e => setChapter(e.target.value)} />
              {chapCount > 0 && <small style={{color:'var(--text-muted)'}}>Total chapters: {chapCount}</small>}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Range From</label>
              <input type="number" className="form-control" placeholder="1" value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Range To</label>
              <input type="number" className="form-control" placeholder="10" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} />
            </div>
          </div>

          {/* Summary */}
          {subject && (
            <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', marginTop: '8px' }}>
              <strong>Selected:</strong><br />
              {category && <span>📁 {category}<br /></span>}
              {subject  && <span>📚 {subject}<br /></span>}
              {sthan    && <span>📖 {sthan}<br /></span>}
              {chapter  && <span>📄 {chapter}<br /></span>}
              {rangeStart && rangeEnd && <span>🔢 Range: {rangeStart}–{rangeEnd}</span>}
            </div>
          )}
        </div>

        {/* Right: Paste Area */}
        <div className="card">
          <div className="card-title">📝 Questions Paste करें</div>

          <div className="form-group">
            <label className="form-label">Bulk Question Text</label>
            <textarea
              className="form-control deva"
              style={{ minHeight: '260px', fontSize: '0.88rem' }}
              placeholder={`यहाँ questions paste करें...\n\nFormat:\nप्रश्न का text यहाँ\nA. पहला विकल्प\nB. दूसरा विकल्प\nC. तीसरा विकल्प\nD. चौथा विकल्प\nAnswer: A\nExplanation: व्याख्या यहाँ`}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={handleParse} disabled={loading || !rawText.trim()}>
              {loading ? '⏳ Parsing...' : '👁️ Preview'}
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !parsed || parsed.total === 0}>
              {saving ? '💾 Saving...' : `💾 Save (${parsed?.total || 0} Qs)`}
            </button>
          </div>
        </div>
      </div>

      {/* Parse Preview */}
      {parsed && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-title">
            👁️ Preview — {parsed.total} questions parsed
            {parsed.errors?.length > 0 && <span style={{color:'var(--error)',marginLeft:'12px'}}>⚠️ {parsed.errors.length} errors</span>}
          </div>

          {parsed.errors?.length > 0 && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <strong>Errors:</strong>
              {parsed.errors.map((e, i) => (
                <div key={i}>Block {e.block_index}: {e.error}</div>
              ))}
            </div>
          )}

          {parsed.questions.map((q, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge" style={{ background: '#E8F4FD', color: '#1565C0' }}>Q{i + 1}</span>
                <span className="badge" style={{ background: '#FFF3CD', color: '#856404' }}>{q.type}</span>
              </div>
              <p className="deva" style={{ marginBottom: '8px', fontSize: '0.92rem' }}>{q.text}</p>
              {Object.entries(q.options).map(([k, v]) => (
                <div key={k} style={{ fontSize: '0.85rem', padding: '3px 0', color: k === q.correct_answer ? 'var(--success)' : 'var(--text)', fontWeight: k === q.correct_answer ? '700' : '400' }} className="deva">
                  {k === q.correct_answer ? '✅' : '○'} <strong>{k}.</strong> {v}
                </div>
              ))}
              {q.explanation && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>💡 {q.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
