import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

export default function ResultsAdmin() {
  const { test_id } = useParams()
  const [leaderboard, setLeaderboard] = useState([])
  const [analytics,   setAnalytics]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState('leaderboard')

  useEffect(() => {
    Promise.all([
      api.get(`/api/results/leaderboard/${test_id}?limit=100`),
      api.get(`/api/results/analytics/${test_id}`)
    ]).then(([lb, an]) => {
      setLeaderboard(lb.data.leaderboard)
      setAnalytics(an.data.analytics)
    }).finally(() => setLoading(false))
  }, [test_id])

  function exportCSV() {
    const rows = [['Rank','Name','Telegram','Score','Total','Correct','Incorrect','Accuracy%','Time(sec)']]
    leaderboard.forEach(s => rows.push([s.rank, s.name, s.telegram_username, s.score, s.total, s.correct, s.incorrect, s.accuracy, s.time_taken]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = `ayurthon_results_${test_id}.csv`
    a.click()
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60
    return `${m}:${String(s).padStart(2,'0')}`
  }

  return (
    <div>
      <div className="page-header">
        <h1>📊 Test Results</h1>
        <p>Leaderboard aur analytics</p>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {/* Analytics Cards */}
          {analytics && (
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-card"><div className="stat-number">{analytics.total_students}</div><div className="stat-label">Total Students</div></div>
              <div className="stat-card"><div className="stat-number">{analytics.average_score}</div><div className="stat-label">Avg Score</div></div>
              <div className="stat-card"><div className="stat-number">{analytics.highest_score}</div><div className="stat-label">Highest Score</div></div>
              <div className="stat-card"><div className="stat-number">{analytics.average_accuracy}%</div><div className="stat-label">Avg Accuracy</div></div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button className={`btn ${tab === 'leaderboard' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('leaderboard')}>🏆 Leaderboard</button>
            {analytics && <button className={`btn ${tab === 'distribution' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('distribution')}>📊 Distribution</button>}
            <button className="btn btn-outline" onClick={exportCSV} style={{ marginLeft: 'auto' }}>⬇️ Export CSV</button>
          </div>

          {tab === 'leaderboard' && (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Rank</th><th>Name</th><th>Telegram</th><th>Score</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(s => (
                      <tr key={s.rank}>
                        <td>
                          <span className={`rank-badge rank-${s.rank <= 3 ? s.rank : 'other'}`}>{s.rank}</span>
                        </td>
                        <td><strong>{s.name}</strong></td>
                        <td style={{ color: 'var(--text-muted)' }}>@{s.telegram_username || '—'}</td>
                        <td><strong style={{ color: 'var(--saffron)' }}>{s.score}/{s.total}</strong></td>
                        <td style={{ color: 'var(--success)' }}>{s.correct}</td>
                        <td style={{ color: 'var(--error)' }}>{s.incorrect}</td>
                        <td>{s.accuracy}%</td>
                        <td>{formatTime(s.time_taken)}</td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Abhi koi result nahi</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'distribution' && analytics && (
            <div className="card">
              <div className="card-title">Score Distribution</div>
              {Object.entries(analytics.score_distribution).map(([range, count]) => (
                <div key={range} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                    <span>{range}%</span><span>{count} students</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                    <div style={{ width: `${analytics.total_students > 0 ? (count / analytics.total_students) * 100 : 0}%`, background: 'var(--saffron)', height: '100%', transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
