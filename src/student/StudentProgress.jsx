import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { getStudentToken, clearStudentSession } from '../utils/studentAuth'

export default function StudentProgress() {
  var [stats,   setStats]   = useState(null)
  var [history, setHistory] = useState([])
  var [loading, setLoading] = useState(true)
  var navigate = useNavigate()

  useEffect(function() {
    if (!getStudentToken()) { navigate('/student/login'); return }
    loadData()
  }, [])

  async function loadData() {
    try {
      var headers = { 'x-student-token': getStudentToken() }
      var [statsRes, histRes] = await Promise.all([
        api.get('/api/student/dashboard/stats',   { headers }),
        api.get('/api/student/dashboard/history', { headers })
      ])
      setStats(statsRes.data)
      setHistory(histRes.data.results || [])
    } catch (err) {
      if (err.response && err.response.status === 401) {
        clearStudentSession(); navigate('/student/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(232,117,10,0.3)', borderTop: '3px solid #E8750A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  var s = stats ? stats.stats : {}
  var subjectAcc = stats ? (stats.subject_accuracy || []) : []

  var TYPE_EMOJI = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', fontFamily: 'Inter, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E, #16213E)', padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/student/dashboard" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>← Back</Link>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>📊 मेरी Progress</h1>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* Overall Stats */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,117,10,0.15), rgba(232,117,10,0.05))', border: '1px solid rgba(232,117,10,0.25)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Performance</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <div>
              <div style={{ color: '#E8750A', fontWeight: 900, fontSize: '1.8rem' }}>{s.total_tests || 0}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Tests</div>
            </div>
            <div>
              <div style={{ color: '#FFD700', fontWeight: 900, fontSize: '1.8rem' }}>{s.best_rank ? '#' + s.best_rank : '—'}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Best Rank</div>
            </div>
            <div>
              <div style={{ color: '#4CAF50', fontWeight: 900, fontSize: '1.8rem' }}>{s.accuracy || 0}%</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Accuracy</div>
            </div>
          </div>

          {/* Accuracy bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
              <span>Overall Accuracy</span><span>{s.accuracy || 0}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: (s.accuracy || 0) + '%', background: (s.accuracy || 0) >= 60 ? '#4CAF50' : '#E8750A', height: '100%', borderRadius: '8px', transition: 'width 1s' }} />
            </div>
          </div>
        </div>

        {/* Subject-wise Accuracy */}
        {subjectAcc.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
              📚 Subject-wise Performance
            </div>
            {subjectAcc.map(function(item) {
              var pct   = item.accuracy
              var color = pct >= 70 ? '#4CAF50' : pct >= 50 ? '#E8750A' : '#F44336'
              var label = pct >= 70 ? '✅ Good' : pct >= 50 ? '⚠️ Average' : '🔴 Weak'
              return (
                <div key={item.subject} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <span style={{ color: 'white', fontSize: '0.88rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {TYPE_EMOJI[item.subject] || '📖'} {item.subject}
                      </span>
                      <span style={{ color: color, fontSize: '0.72rem', marginLeft: '8px', fontWeight: 600 }}>{label}</span>
                    </div>
                    <span style={{ color: color, fontWeight: 800, fontSize: '1rem' }}>{pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', background: color, height: '100%', borderRadius: '8px', transition: 'width 1s' }} />
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '3px' }}>
                    {item.correct}/{item.attempted} correct
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Test History */}
        <div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
            📋 Test History ({history.length})
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
              Abhi koi test attempt nahi kiya
            </div>
          ) : (
            history.map(function(r) {
              var pct = r.total_marks > 0 ? Math.round((r.score / r.total_marks) * 100) : 0
              return (
                <Link key={r._id} to={'/result/' + r._id} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px', padding: '14px', marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem' }}>{TYPE_EMOJI[r.test_type] || '📝'}</span>
                          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem' }}>{r.test_title}</span>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                          {formatDate(r.submitted_at)} • Rank #{r.rank}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#E8750A', fontWeight: 800, fontSize: '1.1rem' }}>
                          {r.score}<span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: '0.78rem' }}>/{r.total_marks}</span>
                        </div>
                        <div style={{
                          background: pct >= 60 ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
                          color: pct >= 60 ? '#4CAF50' : '#F44336',
                          padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, marginTop: '3px'
                        }}>{pct}%</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <span style={{ color: '#4CAF50', fontSize: '0.72rem' }}>✅ {r.correct}</span>
                      <span style={{ color: '#F44336', fontSize: '0.72rem' }}>❌ {r.incorrect}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>⬜ {r.unattempted}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>🎯 {r.accuracy}%</span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,15,26,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', backdropFilter: 'blur(10px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: '🏠', label: 'Home',     path: '/student/dashboard' },
          { icon: '📝', label: 'Tests',    path: '/student/tests' },
          { icon: '📊', label: 'Progress', path: '/student/progress', active: true },
          { icon: '👤', label: 'Profile',  path: '/student/profile' }
        ].map(function(item) {
          return (
            <Link key={item.label} to={item.path} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px', textDecoration: 'none', color: item.active ? '#E8750A' : 'rgba(255,255,255,0.3)' }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: item.active ? 700 : 400, marginTop: '3px' }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
