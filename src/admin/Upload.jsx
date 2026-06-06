import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Upload() {
  var [taxonomy,    setTaxonomy]   = useState(null)
  var [category,    setCategory]   = useState('')
  var [subject,     setSubject]    = useState('')
  var [sthan,       setSthan]      = useState('')
  var [chapter,     setChapter]    = useState('')
  var [rangeStart,  setRangeStart] = useState('')
  var [rangeEnd,    setRangeEnd]   = useState('')
  var [rawText,     setRawText]    = useState('')
  var [parsed,      setParsed]     = useState(null)
  var [loading,     setLoading]    = useState(false)
  var [saving,      setSaving]     = useState(false)
  var [message,     setMessage]    = useState(null)
  var [skipDup,     setSkipDup]    = useState(true)

  // AI Prompt Creator
  var [showPrompt,  setShowPrompt] = useState(false)
  var [promptSubj,  setPromptSubj] = useState('')
  var [promptChap,  setPromptChap] = useState('')
  var [promptRows,  setPromptRows] = useState([{ topic: '', count: '10' }])
  var [generatedPrompt, setGeneratedPrompt] = useState('')
  var [promptCopied,    setPromptCopied]    = useState(false)

  useEffect(function() {
    api.get('/api/questions/taxonomy').then(function(r) { setTaxonomy(r.data.taxonomy) })
  }, [])

  var subjects = taxonomy && category ? Object.keys(taxonomy[category] ? (taxonomy[category].subjects || {}) : {}) : []
  var sthans   = taxonomy && category && subject && taxonomy[category] && taxonomy[category].subjects[subject]
    ? Object.keys(taxonomy[category].subjects[subject].sthan || {}) : []
  var chapCount = taxonomy && category && subject && sthan && taxonomy[category] && taxonomy[category].subjects[subject] && taxonomy[category].subjects[subject].sthan[sthan]
    ? taxonomy[category].subjects[subject].sthan[sthan].chapters : 0

  async function handleParse() {
    if (!rawText.trim()) return
    setLoading(true); setParsed(null); setMessage(null)
    try {
      var res = await api.post('/api/questions/parse', { raw_text: rawText })
      setParsed(res.data)
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Parse error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!parsed || parsed.total === 0) return
    if (!category || !subject) { setMessage({ type: 'error', text: 'Category aur Subject select karein' }); return }
    setSaving(true); setMessage(null)
    try {
      var res = await api.post('/api/questions/upload', {
        raw_text:        rawText,
        category:        category,
        subject:         subject,
        sthan:           sthan,
        chapter:         chapter,
        range_start:     rangeStart || null,
        range_end:       rangeEnd   || null,
        skip_duplicates: skipDup
      })
      setMessage({ type: 'success', text: '✅ ' + res.data.saved + ' questions saved! ' + (res.data.skipped > 0 ? res.data.skipped + ' duplicates skipped.' : '') })
      setRawText(''); setParsed(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Save error' })
    } finally {
      setSaving(false)
    }
  }

  // ── AI Prompt Creator ─────────────────────────────────────
  function addPromptRow() {
    setPromptRows(function(prev) { return prev.concat([{ topic: '', count: '10' }]) })
  }

  function removePromptRow(i) {
    setPromptRows(function(prev) { return prev.filter(function(_, idx) { return idx !== i }) })
  }

  function updatePromptRow(i, key, val) {
    setPromptRows(function(prev) {
      var next = prev.map(function(r, idx) {
        if (idx !== i) return r
        var updated = Object.assign({}, r)
        updated[key] = val
        return updated
      })
      return next
    })
  }

  function generatePrompt() {
    if (!promptSubj.trim()) { setMessage({ type: 'error', text: 'Subject name daalo' }); return }

    var totalQ = promptRows.reduce(function(sum, r) { return sum + (parseInt(r.count) || 0) }, 0)

    var topicLines = promptRows
      .filter(function(r) { return r.topic.trim() })
      .map(function(r) { return '   - ' + r.topic.trim() + ': ' + (r.count || '10') + ' questions' })
      .join('\n')

    var prompt =
'Generate ' + totalQ + ' high-quality MCQ questions from ' + promptSubj.trim() +
(promptChap.trim() ? ', Chapter/Section: ' + promptChap.trim() : '') + '.\n\n' +
'Topic-wise distribution:\n' + topicLines + '\n\n' +
'STRICT FORMAT — follow exactly for every question, no deviation:\n\n' +
'Question: [Full question text in Hindi/Sanskrit/Devanagari as required]\n' +
'A. [Option A]\n' +
'B. [Option B]\n' +
'C. [Option C]\n' +
'D. [Option D]\n' +
'Answer: [A or B or C or D]\n' +
'Explanation: Ans-[Letter] [Reference like Ch.Su.1/42 or similar]. [Brief explanation in same language as question.]\n\n' +
'RULES:\n' +
'1. Start DIRECTLY with "Question:" — no serial numbers, no Q1/Q2 prefix\n' +
'2. Options use DOT delimiter: "A." not "A)" or "(A)"\n' +
'3. Answer line: only "Answer: A" — single letter, nothing else\n' +
'4. Explanation: always start with "Ans-[Letter]" then reference then explanation\n' +
'5. Reference must be inside Explanation only — never as a separate line\n' +
'6. Blank line between each question block\n' +
'7. For Assertion-Reason: use अभिकथन (A) and तर्क (R) format in question text\n' +
'8. For Match the Following: write columns clearly in question text, options as combinations\n' +
'9. Questions must be exam-level, factually accurate, from standard Ayurveda texts\n' +
'10. Do NOT add any intro, outro, numbering, or metadata outside the format\n\n' +
'Example:\n\n' +
'Question: चरक संहिता के अनुसार आयुर्वेद की परिभाषा क्या है?\n' +
'A. हिताहित सुखदुःखम् आयुस्तस्य...\n' +
'B. स्वस्थस्य स्वास्थ्यरक्षणम्\n' +
'C. रोगनाशनाय औषधम्\n' +
'D. त्रिदोष सिद्धान्त\n' +
'Answer: A\n' +
'Explanation: Ans-A Ch.Su.1/41. आयुर्वेद की परिभाषा चरक संहिता सूत्र स्थान के प्रथम अध्याय में दी गई है।\n\n' +
'Now generate all ' + totalQ + ' questions in this exact format.'

    setGeneratedPrompt(prompt)
    setPromptCopied(false)
  }

  function copyPrompt() {
    navigator.clipboard.writeText(generatedPrompt).then(function() {
      setPromptCopied(true)
      setTimeout(function() { setPromptCopied(false) }, 3000)
    })
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>📤 Question Upload</h1>
            <p>Bulk paste karein — Hindi, Sanskrit, Devanagari sab supported</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={function() { setShowPrompt(true) }}
            style={{ whiteSpace: 'nowrap' }}
          >
            ✨ AI Prompt Creator
          </button>
        </div>
      </div>

      {message && (
        <div className={'alert alert-' + message.type} style={{ cursor: 'pointer' }} onClick={function() { setMessage(null) }}>
          {message.text} <span style={{ float: 'right' }}>✕</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Left: Taxonomy */}
        <div className="card">
          <div className="card-title">📂 Subject Select करें</div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={category} onChange={function(e) { setCategory(e.target.value); setSubject(''); setSthan(''); setChapter('') }}>
              <option value="">-- Select --</option>
              <option value="samhita">संहिता</option>
              <option value="short_subject">लघु विषय</option>
              <option value="modern">आधुनिक विषय</option>
            </select>
          </div>

          {category && (
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-control" value={subject} onChange={function(e) { setSubject(e.target.value); setSthan(''); setChapter('') }}>
                <option value="">-- Select --</option>
                {subjects.map(function(s) {
                  var label = taxonomy[category].subjects[s] ? taxonomy[category].subjects[s].label : s
                  return <option key={s} value={s}>{label} ({s})</option>
                })}
              </select>
            </div>
          )}

          {subject && sthans.length > 0 && (
            <div className="form-group">
              <label className="form-label">स्थान / भाग</label>
              <select className="form-control" value={sthan} onChange={function(e) { setSthan(e.target.value); setChapter('') }}>
                <option value="">-- Select --</option>
                {sthans.map(function(s) {
                  var label = taxonomy[category].subjects[subject].sthan[s] ? taxonomy[category].subjects[subject].sthan[s].label : s
                  return <option key={s} value={s}>{label} ({s})</option>
                })}
              </select>
            </div>
          )}

          {sthan && (
            <div className="form-group">
              <label className="form-label">Chapter (optional)</label>
              <input className="form-control" placeholder="e.g. Ch.1 - Deerghanjivitiya" value={chapter} onChange={function(e) { setChapter(e.target.value) }} />
              {chapCount > 0 && <small style={{ color: 'var(--text-muted)' }}>Total chapters: {chapCount}</small>}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Range From</label>
              <input type="number" className="form-control" placeholder="1" value={rangeStart} onChange={function(e) { setRangeStart(e.target.value) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Range To</label>
              <input type="number" className="form-control" placeholder="10" value={rangeEnd} onChange={function(e) { setRangeEnd(e.target.value) }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input type="checkbox" id="skipDup" checked={skipDup} onChange={function(e) { setSkipDup(e.target.checked) }} />
            <label htmlFor="skipDup" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
              Duplicate questions skip karo
            </label>
          </div>

          {subject && (
            <div style={{ background: 'var(--saffron-light)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', marginTop: '12px' }}>
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
              placeholder={'यहाँ questions paste करें...\n\nFormat:\nQuestion text\nA. Option\nB. Option\nC. Option\nD. Option\nAnswer: A\nExplanation: Ans-A Ref. Explanation text'}
              value={rawText}
              onChange={function(e) { setRawText(e.target.value) }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={handleParse} disabled={loading || !rawText.trim()}>
              {loading ? '⏳ Parsing...' : '👁️ Preview'}
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !parsed || parsed.total === 0}>
              {saving ? '💾 Saving...' : '💾 Save (' + (parsed ? parsed.total : 0) + ' Qs)'}
            </button>
          </div>
        </div>
      </div>

      {/* Parse Preview */}
      {parsed && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-title">
            👁️ Preview — {parsed.total} questions parsed
            {parsed.errors && parsed.errors.length > 0 && (
              <span style={{ color: 'var(--error)', marginLeft: '12px' }}>⚠️ {parsed.errors.length} errors</span>
            )}
          </div>

          {parsed.errors && parsed.errors.length > 0 && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <strong>Parse Errors:</strong>
              {parsed.errors.map(function(e, i) {
                return <div key={i}>Block {e.block_index}: {e.error}</div>
              })}
            </div>
          )}

          {parsed.questions && parsed.questions.map(function(q, i) {
            return (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge" style={{ background: '#E8F4FD', color: '#1565C0' }}>Q{i + 1}</span>
                  <span className="badge" style={{ background: '#FFF3CD', color: '#856404' }}>{q.type}</span>
                </div>
                <p className="deva" style={{ marginBottom: '8px', fontSize: '0.92rem' }}>{q.text}</p>
                {q.options && Object.entries(q.options).map(function(entry) {
                  var k = entry[0], v = entry[1]
                  return (
                    <div key={k} style={{ fontSize: '0.85rem', padding: '3px 0', color: k === q.correct_answer ? 'var(--success)' : 'var(--text)', fontWeight: k === q.correct_answer ? 700 : 400 }} className="deva">
                      {k === q.correct_answer ? '✅' : '○'} <strong>{k}.</strong> {v}
                    </div>
                  )
                })}
                {q.explanation && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>💡 {q.explanation}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── AI Prompt Creator Modal ───────────────────────── */}
      {showPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={function() { setShowPrompt(false); setGeneratedPrompt('') }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>

            <div className="card-title">✨ AI Prompt Creator</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              NotebookLM / Gemini ke liye structured prompt generate karo — exact format jo parser samjhe
            </p>

            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input className="form-control" placeholder="e.g. Charak Samhita, Rasashastra, Physiology" value={promptSubj} onChange={function(e) { setPromptSubj(e.target.value) }} />
            </div>

            <div className="form-group">
              <label className="form-label">Chapter / Section (optional)</label>
              <input className="form-control" placeholder="e.g. Sutra Sthan Ch.1-5, Part A" value={promptChap} onChange={function(e) { setPromptChap(e.target.value) }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Topics & Question Count</label>
                <button className="btn btn-outline btn-sm" onClick={addPromptRow}>+ Add Topic</button>
              </div>

              {promptRows.map(function(row, i) {
                return (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      className="form-control deva"
                      placeholder={'Topic ' + (i + 1) + ' (e.g. Dravyaguna, Ashtang Hridayam)'}
                      value={row.topic}
                      onChange={function(e) { updatePromptRow(i, 'topic', e.target.value) }}
                      style={{ flex: 3 }}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Qs"
                      value={row.count}
                      onChange={function(e) { updatePromptRow(i, 'count', e.target.value) }}
                      style={{ flex: 1, minWidth: '70px' }}
                      min="1"
                      max="50"
                    />
                    {promptRows.length > 1 && (
                      <button className="btn btn-danger btn-sm" onClick={function() { removePromptRow(i) }}>✕</button>
                    )}
                  </div>
                )
              })}

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total: <strong>{promptRows.reduce(function(s, r) { return s + (parseInt(r.count) || 0) }, 0)}</strong> questions
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={generatePrompt} style={{ marginBottom: '16px' }}>
              ✨ Generate Prompt
            </button>

            {generatedPrompt && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Generated Prompt</label>
                  <button
                    className={'btn btn-sm ' + (promptCopied ? 'btn-success' : 'btn-outline')}
                    onClick={copyPrompt}
                  >
                    {promptCopied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <textarea
                  className="form-control"
                  style={{ minHeight: '220px', fontSize: '0.78rem', fontFamily: 'monospace', lineHeight: '1.6', background: '#1A1A2E', color: '#E0E0E0', border: '1px solid #444' }}
                  value={generatedPrompt}
                  readOnly
                />
                <div style={{ marginTop: '10px', padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px', fontSize: '0.82rem', color: '#856404' }}>
                  💡 Yeh prompt copy karo → NotebookLM / Gemini mein paste karo → generated questions copy karke Upload box mein paste karo → Parse & Save!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
