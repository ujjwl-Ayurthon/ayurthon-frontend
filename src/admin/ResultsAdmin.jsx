import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

export default function ResultsAdmin() {
  var params = useParams()
  var id = params.test_id || params.result_id || params.id

  var [leaderboard, setLeaderboard] = useState([])
  var [analytics, setAnalytics] = useState(null)
  var [sheet, setSheet] = useState(null)
  var [loading, setLoading] = useState(true)
  var [tab, setTab] = useState('leaderboard')
  var [expandedRow, setExpandedRow] = useState(null)
  var [errorMsg, setErrorMsg] = useState(null)

  useEffect(function() {
    if (!id) {
      setErrorMsg("Invalid URL: Test ID ya Result ID missing hai.")
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMsg(null)

    // Alag-alag fetch karenge taaki ek fail ho toh baaki chalte rahein
    api.get('/api/results/leaderboard/' + id + '?limit=200')
      .then(function(res) {
        setLeaderboard(res.data.leaderboard || [])
      })
      .catch(function(err) {
        console.error("Leaderboard fetch error:", err)
      })

    api.get('/api/results/analytics/' + id)
      .then(function(res) {
        setAnalytics(res.data.analytics || null)
      })
      .catch(function(err) {
        console.error("Analytics fetch error:", err)
      })

    api.get('/api/results/sheet/' + id)
      .then(function(res) {
        setSheet(res.data || null)
      })
      .catch(function(err) {
        console.error("Sheet fetch error:", err)
      })
      .finally(function() {
        setLoading(false)
      })

  }, [id])

  function formatTime(sec) {
    if (!sec) return "0:00"
    var m = Math.floor(sec / 60)
    var s = sec % 60
    return m + ":" + String(s).padStart(2, '0')
  }

  function exportCSV() {
    if (!sheet || !sheet.sheet) return
    var header = ['Rank', 'Name', 'Telegram', 'Score', 'Total', 'Correct', 'Incorrect', 'Skipped', 'Accuracy%', 'Time(sec)']
    if (sheet.questions) {
      sheet.questions.forEach(function(_, i) {
        header.push('Q' + (i + 1) + '_Selected')
        header.push('Q' + (i + 1) + '_Correct')
      })
    }
    var rows = sheet.sheet.map(function(s) {
      var baseRow = [s.rank, s.name, s.telegram_username, s.score, (s.correct + s.incorrect + s.unattempted), s.correct, s.incorrect, s.unattempted, s.accuracy, s.time_taken]
      if (s.responses) {
        s.responses.forEach(function(r) {
          baseRow.push(r.selected || '')
          baseRow.push(r.correct || '')
        })
      }
      return baseRow
    })
    var csvContent = [header].concat(rows).map(function(r) { return r.join(',') }).join('\n')
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = 'ayurthon_results_' + id + '.csv'
    a.click()
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main, #2C3E50)' }}>📊 Test Results</h1>
        <p style={{ color: 'var(--text-muted, #7F8C8D)' }}>Leaderboard, analytics aur complete response sheet</p>
      </div>

      {loading ? (
        <div className="loading-wrap" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--saffron, #E67E22)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading results...</p>
        </div>
      ) : errorMsg ? (
        <div className="card" style={{ padding: '20px', border: '1px solid #FADBD8', background: '#FDEDEC', borderRadius: '8px', color: '#C0392B' }}>
          ⚠️ {errorMsg}
        </div>
      ) : (
        <>
          {analytics && (
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="stat-card" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div className="stat-number" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{analytics.total_students}</div>
                <div className="stat-label" style={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Total Students</div>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div className="stat-number" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{analytics.average_score}</div>
                <div className="stat-label" style={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Avg Score</div>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div className="stat-number" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{analytics.highest_score}</div>
                <div className="stat-label" style={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Highest</div>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div className="stat-number" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{analytics.average_accuracy}%</div>
                <div className="stat-label" style={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Avg Accuracy</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['leaderboard', 'sheet', 'distribution'].map(function(t) {
              return (
                <button 
                  key={t} 
                  className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} 
                  style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: tab === t ? 'var(--saffron, #E67E22)' : 'transparent', color: tab === t ? 'white' : '#34495E', border: '1px solid #BDC3C7' }}
                  onClick={function() { setTab(t) }}
                >
                  {t === 'leaderboard' ? '🏆 Leaderboard' : t === 'sheet' ? '📋 Response Sheet' : '📊 Distribution'}
                </button>
              )
            })}
          </div>

          {/* Leaderboard Tab */}
          {tab === 'leaderboard' && (
            <div className="card" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ECF0F1', color: '#7F8C8D' }}>
                    <th style={{ padding: '12px' }}>Rank</th>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Telegram</th>
                    <th style={{ padding: '12px' }}>Score</th>
                    <th style={{ padding: '12px' }}>✅</th>
                    <th style={{ padding: '12px' }}>❌</th>
                    <th style={{ padding: '12px' }}>⬜</th>
                    <th style={{ padding: '12px' }}>Accuracy</th>
                    <th style={{ padding: '12px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(function(s) {
                    return (
                      <tr key={s.rank} style={{ borderBottom: '1px solid #ECF0F1' }}>
                        <td style={{ padding: '12px' }}><span className={`rank-badge rank-${s.rank <= 3 ? s.rank : 'other'}`}>{s.rank}</span></td>
                        <td style={{ padding: '12px' }}><strong>{s.name}</strong></td>
                        <td style={{ padding: '12px', color: '#95A5A6' }}>@{s.telegram_username || '—'}</td>
                        <td style={{ padding: '12px' }}><strong style={{ color: 'var(--saffron, #E67E22)' }}>{s.score}/{s.total}</strong></td>
                        <td style={{ padding: '12px', color: '#2ECC71' }}>{s.correct}</td>
                        <td style={{ padding: '12px', color: '#E74C3C' }}>{s.incorrect}</td>
                        <td style={{ padding: '12px', color: '#E67E22' }}>{s.unattempted}</td>
                        <td style={{ padding: '12px' }}>{s.accuracy}%</td>
                        <td style={{ padding: '12px' }}>{formatTime(s.time_taken)}</td>
                      </tr>
                    )
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>Abhi tak is test ka koi submission nahi aaya hai ya backend connectivity bachi hai.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Response Sheet Tab */}
          {tab === 'sheet' && sheet && (
            <div className="card" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '4px' }}>📋 Complete Response Sheet</div>
              {sheet.sheet?.map(function(s, i) {
                return (
                  <div key={i} style={{ border: '1px solid #BDC3C7', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={function() { setExpandedRow(expandedRow === i ? null : i) }}>
                      <div><strong>{s.name}</strong></div>
                      <div>{s.score} marks <span>{expandedRow === i ? '▲' : '▼'}</span></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
