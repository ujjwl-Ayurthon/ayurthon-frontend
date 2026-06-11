import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminDashboard() {
  var [stats,    setStats]    = useState(null)
  var [tests,    setTests]    = useState([])
  var [loading,  setLoading]  = useState(true)
  var navigate = useNavigate()

  useEffect(function() { loadData() }, [])

  async function loadData() {
    try {
      var [qStats, testsRes] = await Promise.all([
        api.get('/api/questions/stats/count'),
        api.get('/api/tests')
      ])
      setStats(qStats.data)
      setTests(testsRes.data.tests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function quickClose(id) {
    await api.post('/api/tests/' + id + '/close')
    loadData()
  }

  function toIST(d) {
    if (!d) return '—'
    return new Date(d).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit',
      month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  var liveTests      = tests.filter(function(t) { return t.status === 'published' })
  var draftTests     = tests.filter(function(t) { return t.status === 'draft' })
  var totalStudents  = 0 // will come from results later
  var TYPE_EMOJI     = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }

  return (
    <div>
      <div className="page-header">
        <h1>🏠 Admin Dashboard</h1>
        <p>Ayurthon platform ka pura overview</p>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={function() { navigate('/admin/questions') }}>
              <div className="stat-number" style={{ color: 'var(--saffron)' }}>
                {stats ? stats.total : 0}
              </div>
              <div className="stat-label">📚 Total Questions</div>
            </div>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={function() { navigate('/admin/tests') }}>
              <div className="stat-number" style={{ color: 'var(--green)' }}>
                {tests.length}
              </div>
              <div className="stat-label">📋 Total Tests</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#E74C3C' }}>
                {liveTests.length}
              </div>
              <div className="stat-label">🔴 Live Now</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#3498DB' }}>
                {draftTests.length}
              </div>
              <div className="stat-label">📝 Drafts</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">⚡ Quick Actions</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/admin/upload" className="btn btn-primary">
                📤 Questions Upload
              </Link>
              <Link to="/admin/questions" className="btn btn-outline">
                📚 Question Bank
              </Link>
              <Link to="/admin/builder" className="btn btn-outline">
                🏗️ New Test
              </Link>
              <Link to="/admin/tests" className="btn btn-outline">
                📋 All Tests
              </Link>
            </div>
          </div>

          {/* Live Tests */}
          {liveTests.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  🔴 Live Tests
                  <span style={{ background: '#E74C3C', color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', marginLeft: '8px' }}>
                    {liveTests.length}
                  </span>
                </span>
                <Link to="/admin/tests" style={{ fontSize: '0.82rem', color: 'var(--saffron)', textDecoration: 'none' }}>Sab dekhen →</Link>
              </div>
              {liveTests.map(function(t) {
                var qCount = t.questions ? t.questions.length : Math.round((t.total_marks || 0) / (t.correct_marks || 4))
                return (
                  <div key={t._id} style={{
                    border: '1.5px solid rgba(231,76,60,0.3)',
                    background: 'rgba(231,76,60,0.05)',
                    borderRadius: '10px', padding: '14px', marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem' }}>{TYPE_EMOJI[t.type]}</span>
                        <strong style={{ marginLeft: '6px' }}>{t.title}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link to={'/admin/results/' + t._id} className="btn btn-outline btn-sm">📊 Results</Link>
                        <button className="btn btn-sm" style={{ background: '#6c757d', color: 'white' }}
                          onClick={function() { quickClose(t._id) }}>
                          🔒 Close
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>❓ {qCount} Qs</span>
                      <span>🏆 {t.total_marks} marks</span>
                      <span>⏱ {t.duration_minutes} min</span>
                      <span>📅 {toIST(t.published_at)}</span>
                    </div>
                    {t.expires_at && (
                      <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#E67E22' }}>
                        ⏰ Expires: {toIST(t.expires_at)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Draft Tests */}
          {draftTests.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📝 Draft Tests</span>
                <Link to="/admin/tests" style={{ fontSize: '0.82rem', color: 'var(--saffron)', textDecoration: 'none' }}>Manage →</Link>
              </div>
              {draftTests.slice(0, 3).map(function(t) {
                var qCount = t.questions ? t.questions.length : Math.round((t.total_marks || 0) / (t.correct_marks || 4))
                return (
                  <div key={t._id} style={{
                    border: '1px solid var(--border)', borderRadius: '10px',
                    padding: '12px 14px', marginBottom: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {TYPE_EMOJI[t.type]} {t.type} • {qCount} Qs • {t.total_marks} marks
                      </div>
                    </div>
                    <Link to="/admin/tests" className="btn btn-success btn-sm">🚀 Publish</Link>
                  </div>
                )
              })}
              {draftTests.length > 3 && (
                <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                  <Link to="/admin/tests" style={{ color: 'var(--saffron)', fontSize: '0.85rem', textDecoration: 'none' }}>
                    +{draftTests.length - 3} more drafts →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Question Bank Breakdown */}
          {stats && stats.bySubject && stats.bySubject.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📚 Question Bank Breakdown</span>
                <Link to="/admin/upload" style={{ fontSize: '0.82rem', color: 'var(--saffron)', textDecoration: 'none' }}>+ Upload →</Link>
              </div>

              {/* Category summary */}
              {stats.byCategory && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {stats.byCategory.map(function(c) {
                    var label = c._id === 'samhita' ? '📖 Samhita' : c._id === 'short_subject' ? '📗 Short' : '🔬 Modern'
                    return (
                      <div key={c._id} style={{
                        background: 'var(--saffron-light)', borderRadius: '8px',
                        padding: '8px 14px', fontSize: '0.82rem'
                      }}>
                        {label}: <strong>{c.count}</strong>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Top subjects */}
              {stats.bySubject.slice(0, 8).map(function(s) {
                var pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0
                return (
                  <div key={s._id} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text)' }}>{s._id}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{s.count} Qs</span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: pct + '%', background: 'var(--saffron)', height: '100%', borderRadius: '4px' }} />
                    </div>
                  </div>
                )
              })}
              {stats.bySubject.length > 8 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  +{stats.bySubject.length - 8} more subjects
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {tests.length === 0 && (!stats || stats.total === 0) && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌿</div>
              <h3 style={{ color: 'var(--dark)', marginBottom: '8px' }}>Ayurthon Platform Ready!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                Pehle questions upload karo, phir test banao aur students ko invite karo.
              </p>
              <Link to="/admin/upload" className="btn btn-primary btn-lg">
                📤 Questions Upload Karo
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
