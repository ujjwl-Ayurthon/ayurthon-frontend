import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

export default function ResultsAdmin() {
  // Dono params ko handle kar lete hain taaki router kisi bhi naam se param bheje, code na fate
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

    // Parallel network requests to fetch test data
    Promise.all([
      api.get('/api/results/leaderboard/' + id + '?limit=200'),
      api.get('/api/results/analytics/' + id),
      api.get('/api/results/sheet/' + id)
    ])
    .then(function(responses) {
      var lb = responses[0]
      var an = responses[1]
      var sh = responses[2]

      setLeaderboard(lb.data.leaderboard || [])
      setAnalytics(an.data.analytics || null)
      setSheet(sh.data || null)
    })
    .catch(function(err) {
      console.error("Error fetching results:", err)
      setErrorMsg("Data load nahi ho paya. Prabandhak check karein ki kya ye ID sahi hai?")
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
    
    var header = [
      'Rank', 'Name', 'Telegram', 'Score', 'Total', 
      'Correct', 'Incorrect', 'Skipped', 'Accuracy%', 'Time(sec)'
    ]
    
    if (sheet.questions) {
      sheet.questions.forEach(function(_, i) {
        header.push('Q' + (i + 1) + '_Selected')
        header.push('Q' + (i + 1) + '_Correct')
      })
    }

    var rows = sheet.sheet.map(function(s) {
      var baseRow = [
        s.rank, s.name, s.telegram_username, s.score, 
        (s.correct + s.incorrect + s.unattempted), 
        s.correct, s.incorrect, s.unattempted, s.accuracy, s.time_taken
      ]
      
      if (s.responses) {
        s.responses.forEach(function(r) {
          baseRow.push(r.selected || '')
          baseRow.push(r.correct || '')
        })
      }
      return baseRow
    })

    var csvContent = [header].concat(rows).map(function(r) {
      return r.join(',')
    }).join('\n')

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
            <button className="btn btn-outline" onClick={exportCSV} style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid #BDC3C7' }}>
              ⬇️ Export CSV
            </button>
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
                      <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>Koi result nahi mila.</td>
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
              <p style={{ fontSize: '0.85rem', color: '#7F8C8D', marginBottom: '16px' }}>Kisi bhi student par click karein uski full response dekhne ke liye</p>
              
              {sheet.sheet?.map(function(s, i) {
                return (
                  <div key={i} style={{ border: '1px solid #BDC3C7', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                    <div 
                      style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedRow === i ? '#FEF9E7' : 'white' }} 
                      onClick={function() { setExpandedRow(expandedRow === i ? null : i) }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className={`rank-badge rank-${s.rank <= 3 ? s.rank : 'other'}`}>{s.rank}</span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#95A5A6' }}>@{s.telegram_username || '—'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', alignItems: 'center' }}>
                        <span style={{ color: '#E67E22', fontWeight: 700 }}>{s.score} marks</span>
                        <span style={{ color: '#2ECC71' }}>✅{s.correct}</span>
                        <span style={{ color: '#E74C3C' }}>❌{s.incorrect}</span>
                        <span style={{ color: '#E67E22' }}>⬜{s.unattempted}</span>
                        <span style={{ color: '#7F8C8D' }}>{formatTime(s.time_taken)}</span>
                        <span>{expandedRow === i ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    
                    {expandedRow === i && (
                      <div style={{ padding: '12px 16px', background: '#F8F9FA', borderTop: '1px solid #BDC3C7' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '6px' }}>
                          {s.responses?.map(function(r, j) {
                            return (
                              <div key={j} style={{ padding: '6px', borderRadius: '6px', textAlign: 'center', fontSize: '0.75rem', background: r.is_correct ? '#E8F8F5' : r.is_skipped ? '#EAEDED' : '#FADBD8', border: '1px solid ' + (r.is_correct ? '#2ECC71' : r.is_skipped ? '#BDC3C7' : '#E74C3C') }}>
                                <div style={{ fontWeight: 700, color: '#7F8C8D' }}>Q{j + 1}</div>
                                <div style={{ fontWeight: 700, color: r.is_correct ? '#2ECC71' : r.is_skipped ? '#7F8C8D' : '#E74C3C' }}>{r.selected || '⬜'}</div>
                                <div style={{ color: '#2ECC71', fontSize: '0.68rem' }}>✓ {r.correct}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Distribution Tab */}
          {tab === 'distribution' && analytics && (
            <div className="card" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px' }}>Score Distribution</div>
              {analytics.score_distribution && Object.entries(analytics.score_distribution).map(function([range, count]) {
                var percentage = analytics.total_students > 0 ? (count / analytics.total_students) * 100 : 0
                return (
                  <div key={range} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                      <span>{range}% Score Range</span>
                      <span>{count} students</span>
                    </div>
                    <div style={{ background: '#EAEDED', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                      <div style={{ width: percentage + '%', background: 'var(--saffron, #E67E22)', height: '100%', transition: 'width 0.5s' }} />
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
