import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

function ResultsAdmin() {
  var params = useParams()
  var id = params.test_id || params.result_id || params.id

  var lbS  = useState([]);    var leaderboard = lbS[0];  var setLeaderboard = lbS[1];
  var anS  = useState(null);  var analytics   = anS[0];  var setAnalytics   = anS[1];
  var shS  = useState(null);  var sheet       = shS[0];  var setSheet       = shS[1];
  var ldS  = useState(true);  var loading     = ldS[0];  var setLoading     = ldS[1];
  var tbS  = useState('leaderboard'); var tab  = tbS[0]; var setTab         = tbS[1];
  var exS  = useState(null);  var expandedRow = exS[0];  var setExpandedRow = exS[1];
  var erS  = useState('');    var errorMsg    = erS[0];  var setErrorMsg    = erS[1];

  useEffect(function() {
    if (!id) {
      setErrorMsg('Test ID missing hai. URL check karo.')
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMsg('')

    var done = 0
    function checkDone() { done++; if (done >= 3) setLoading(false) }

    api.get('/api/results/leaderboard/' + id + '?limit=200')
      .then(function(res) {
        var d = res && res.data ? res.data : {}
        var lb = d.leaderboard || d.results || d.data || d
        setLeaderboard(Array.isArray(lb) ? lb : [])
      })
      .catch(function(err) { console.error('Leaderboard error:', err) })
      .finally(checkDone)

    api.get('/api/results/analytics/' + id)
      .then(function(res) {
        var d = res && res.data ? res.data : {}
        setAnalytics(d.analytics || d.data || d || null)
      })
      .catch(function(err) { console.error('Analytics error:', err) })
      .finally(checkDone)

    api.get('/api/results/sheet/' + id)
      .then(function(res) {
        var d = res && res.data ? res.data : null
        setSheet(d)
      })
      .catch(function(err) { console.error('Sheet error:', err) })
      .finally(checkDone)

  }, [id])

  function formatTime(sec) {
    if (!sec && sec !== 0) return '0:00'
    var s = Number(sec) || 0
    var m = Math.floor(s / 60)
    var r = s % 60
    return m + ':' + String(r).padStart(2, '0')
  }

  function exportCSV() {
    var sheetData = sheet && sheet.sheet ? sheet.sheet : []
    var questions = sheet && sheet.questions ? sheet.questions : []
    if (sheetData.length === 0) return

    var header = ['Rank','Name','Telegram','Score','Total','Correct','Incorrect','Skipped','Accuracy%','Time(sec)']
    questions.forEach(function(_, i) {
      header.push('Q' + (i+1) + '_Selected')
      header.push('Q' + (i+1) + '_Correct')
    })

    var rows = sheetData.map(function(s) {
      var base = [
        s.rank || '', s.name || '', s.telegram_username || '',
        s.score || 0,
        (Number(s.correct||0) + Number(s.incorrect||0) + Number(s.unattempted||0)),
        s.correct || 0, s.incorrect || 0, s.unattempted || 0,
        s.accuracy || 0, s.time_taken || 0
      ]
      var responses = Array.isArray(s.responses) ? s.responses : []
      responses.forEach(function(r) {
        base.push(r && r.selected ? r.selected : '')
        base.push(r && r.correct  ? r.correct  : '')
      })
      return base
    })

    var csv = [header].concat(rows).map(function(r) { return r.join(',') }).join('\n')
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = 'ayurthon_results_' + id + '.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  var cardStyle = { background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '20px', marginBottom: '16px' }
  var thStyle   = { padding: '12px', textAlign: 'left', color: '#7F8C8D', borderBottom: '2px solid #ECF0F1', whiteSpace: 'nowrap' }
  var tdStyle   = { padding: '12px', borderBottom: '1px solid #ECF0F1', verticalAlign: 'middle' }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #E67E22', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', color: '#7F8C8D' }}>Results load ho rahe hain...</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '16px', border: '1px solid #FADBD8', background: '#FDEDEC', borderRadius: '8px', color: '#C0392B' }}>
          ⚠️ {errorMsg}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2C3E50', margin: '0 0 4px' }}>📊 Test Results</h1>
        <p style={{ color: '#7F8C8D', margin: 0 }}>Leaderboard, analytics aur complete response sheet</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Students', value: analytics.total_students || 0 },
            { label: 'Avg Score',      value: analytics.average_score  || 0 },
            { label: 'Highest Score',  value: analytics.highest_score  || 0 },
            { label: 'Avg Accuracy',   value: (analytics.average_accuracy || 0) + '%' },
          ].map(function(stat) {
            return (
              <div key={stat.label} style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2C3E50' }}>{stat.value}</div>
                <div style={{ color: '#7F8C8D', fontSize: '0.9rem', marginTop: '4px' }}>{stat.label}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { id: 'leaderboard', label: '🏆 Leaderboard' },
          { id: 'sheet',       label: '📋 Response Sheet' },
          { id: 'distribution',label: '📊 Distribution' },
        ].map(function(t) {
          return (
            <button key={t.id} onClick={function() { setTab(t.id) }} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #BDC3C7', background: tab === t.id ? '#E67E22' : 'transparent', color: tab === t.id ? 'white' : '#34495E', fontWeight: tab === t.id ? '700' : '400', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          )
        })}
        {sheet && (
          <button onClick={exportCSV} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #27AE60', background: '#27AE60', color: 'white', fontWeight: '600', marginLeft: 'auto' }}>
            ⬇️ Export CSV
          </button>
        )}
      </div>

      {/* ── LEADERBOARD TAB ── */}
      {tab === 'leaderboard' && (
        <div style={cardStyle}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>
              Abhi tak is test mein koi submission nahi aaya.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Rank</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Telegram</th>
                    <th style={thStyle}>Score</th>
                    <th style={thStyle}>✅ Correct</th>
                    <th style={thStyle}>❌ Wrong</th>
                    <th style={thStyle}>⬜ Skip</th>
                    <th style={thStyle}>Accuracy</th>
                    <th style={thStyle}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(function(s, idx) {
                    var rank = s.rank || (idx + 1)
                    var medalColors = { 1: '#F1C40F', 2: '#BDC3C7', 3: '#CD7F32' }
                    return (
                      <tr key={s._id || idx} style={{ borderBottom: '1px solid #ECF0F1' }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = '#FAFAFA' }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent' }}>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: medalColors[rank] || '#ECF0F1', fontWeight: '700', fontSize: '12px' }}>
                            {rank}
                          </span>
                        </td>
                        <td style={tdStyle}><strong>{s.name || '—'}</strong></td>
                        <td style={Object.assign({}, tdStyle, { color: '#95A5A6' })}>@{s.telegram_username || '—'}</td>
                        <td style={tdStyle}><strong style={{ color: '#E67E22' }}>{s.score || 0}/{s.total || 0}</strong></td>
                        <td style={Object.assign({}, tdStyle, { color: '#27AE60' })}>{s.correct || 0}</td>
                        <td style={Object.assign({}, tdStyle, { color: '#E74C3C' })}>{s.incorrect || 0}</td>
                        <td style={Object.assign({}, tdStyle, { color: '#E67E22' })}>{s.unattempted || 0}</td>
                        <td style={tdStyle}>{s.accuracy || 0}%</td>
                        <td style={tdStyle}>{formatTime(s.time_taken)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── RESPONSE SHEET TAB ── */}
      {tab === 'sheet' && (
        <div style={cardStyle}>
          {!sheet || !Array.isArray(sheet.sheet) || sheet.sheet.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>Response sheet available nahi hai.</div>
          ) : (
            <div>
              {sheet.sheet.map(function(s, i) {
                var isExpanded = expandedRow === i
                return (
                  <div key={i} style={{ border: '1px solid #BDC3C7', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpanded ? '#FEF9E7' : 'white' }}
                      onClick={function() { setExpandedRow(isExpanded ? null : i) }}>
                      <div>
                        <strong>{s.name || '—'}</strong>
                        <span style={{ marginLeft: '12px', color: '#7F8C8D', fontSize: '0.9rem' }}>@{s.telegram_username || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '700', color: '#E67E22' }}>{s.score || 0} marks</span>
                        <span>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '16px', background: '#FDFEFE', borderTop: '1px solid #ECF0F1' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                          {[
                            { label: 'Score',    value: (s.score || 0) + '/' + (s.total || 0) },
                            { label: 'Correct',  value: s.correct  || 0 },
                            { label: 'Wrong',    value: s.incorrect|| 0 },
                            { label: 'Skipped',  value: s.unattempted || 0 },
                            { label: 'Accuracy', value: (s.accuracy || 0) + '%' },
                            { label: 'Time',     value: formatTime(s.time_taken) },
                          ].map(function(item) {
                            return (
                              <div key={item.label} style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid #ECF0F1' }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#7F8C8D' }}>{item.label}</div>
                              </div>
                            )
                          })}
                        </div>
                        {Array.isArray(s.responses) && s.responses.length > 0 && (
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                              <thead>
                                <tr style={{ background: '#F8F9FA' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ECF0F1' }}>Q#</th>
                                  <th style={{ padding: '8px', border: '1px solid #ECF0F1' }}>Selected</th>
                                  <th style={{ padding: '8px', border: '1px solid #ECF0F1' }}>Correct</th>
                                  <th style={{ padding: '8px', border: '1px solid #ECF0F1' }}>Result</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.responses.map(function(r, ri) {
                                  var isCorrect = r && r.is_correct
                                  var isSkipped = r && r.is_skipped
                                  return (
                                    <tr key={ri} style={{ background: isCorrect ? '#EAFAF1' : isSkipped ? '#FDFEFE' : '#FDEDEC' }}>
                                      <td style={{ padding: '8px', border: '1px solid #ECF0F1' }}>Q{ri + 1}</td>
                                      <td style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>{r && r.selected_option !== undefined ? r.selected_option : '—'}</td>
                                      <td style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>{r && r.correct_option !== undefined ? r.correct_option : '—'}</td>
                                      <td style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>{isSkipped ? '⬜' : isCorrect ? '✅' : '❌'}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── DISTRIBUTION TAB ── */}
      {tab === 'distribution' && (
        <div style={cardStyle}>
          {!analytics || !Array.isArray(analytics.score_distribution) || analytics.score_distribution.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>Distribution data available nahi hai.</div>
          ) : (
            <div>
              <h3 style={{ marginBottom: '16px', color: '#2C3E50' }}>Score Distribution</h3>
              {analytics.score_distribution.map(function(d, i) {
                var pct = analytics.total_students > 0 ? Math.round((d.count / analytics.total_students) * 100) : 0
                return (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                      <span>{d.range || d.label || ('Range ' + (i+1))}</span>
                      <span style={{ fontWeight: '700' }}>{d.count || 0} students ({pct}%)</span>
                    </div>
                    <div style={{ background: '#ECF0F1', borderRadius: '4px', height: '10px' }}>
                      <div style={{ width: pct + '%', height: '100%', background: '#E67E22', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResultsAdmin
