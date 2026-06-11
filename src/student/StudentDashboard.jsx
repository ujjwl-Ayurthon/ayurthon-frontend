import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { getStudentToken, getStudentData, clearStudentSession, getInitials } from '../utils/studentAuth'

export default function StudentDashboard() {
  var [stats,   setStats]   = useState(null)
  var [tests,   setTests]   = useState([])
  var [loading, setLoading] = useState(true)
  var [tab,     setTab]     = useState('home')
  var navigate = useNavigate()
  var student  = getStudentData()

  useEffect(function() {
    if (!getStudentToken()) { navigate('/student/login'); return }
    loadData()
  }, [])

  async function loadData() {
    try {
      var headers = { 'x-student-token': getStudentToken() }
      var [statsRes, testsRes] = await Promise.all([
        api.get('/api/student/dashboard/stats',           { headers }),
        api.get('/api/student/dashboard/available-tests', { headers })
      ])
      setStats(statsRes.data)
      setTests(testsRes.data.tests || [])
    } catch (err) {
      if (err.response && err.response.status === 401) {
        clearStudentSession()
        navigate('/student/login')
      }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    clearStudentSession()
    navigate('/student/login')
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60
    return m + ':' + (s < 10 ? '0' : '') + s
  }

  function timeAgo(date) {
    var diff = Date.now() - new Date(date).getTime()
    var days = Math.floor(diff / 86400000)
    if (days === 0) return 'Aaj'
    if (days === 1) return 'Kal'
    return days + ' din pehle'
  }

  var TYPE_EMOJI = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }
  var TYPE_LABEL = { daily: 'Daily', diagnostic: 'Diagnostic', weekly: 'Weekly', grand: 'Grand' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(232,117,10,0.3)', borderTop: '3px solid #E8750A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  var s = stats ? stats.stats : {}
  var liveTests = tests.filter(function(t) { return !t.already_attempted })
  var doneTests = tests.filter(function(t) { return t.already_attempted })

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', fontFamily: 'Inter, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
        padding: '16px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: student ? student.avatar_color : '#E8750A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: 'white', fontSize: '1rem'
            }}>
              {student ? getInitials(student.name) : '?'}
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>नमस्ते 👋</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                {student ? student.name : 'Student'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {s.streak > 0 && (
              <div style={{ background: 'rgba(232,117,10,0.2)', border: '1px solid rgba(232,117,10,0.4)', borderRadius: '20px', padding: '4px 10px', fontSize: '0.78rem', color: '#E8750A', fontWeight: 600 }}>
                🔥 {s.streak} day streak
              </div>
            )}
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Best Rank',    value: s.best_rank ? '#' + s.best_rank : '—', icon: '🏆', color: '#FFD700' },
            { label: 'Avg Score',    value: (s.avg_score_pct || 0) + '%',           icon: '📊', color: '#E8750A' },
            { label: 'Tests Diye',   value: s.total_tests || 0,                     icon: '📝', color: '#4CAF50' },
            { label: 'Accuracy',     value: (s.accuracy   || 0) + '%',              icon: '🎯', color: '#2196F3' }
          ].map(function(card) {
            return (
              <div key={card.label} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '14px',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{ fontSize: '1.6rem' }}>{card.icon}</div>
                <div>
                  <div style={{ color: card.color, fontWeight: 800, fontSize: '1.3rem', lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: '3px' }}>
                    {card.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live Tests */}
        {liveTests.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F44336', animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Live Tests</span>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            </div>

            {liveTests.map(function(t) {
              return (
                <div key={t._id} style={{
                  background: 'linear-gradient(135deg, rgba(232,117,10,0.15), rgba(232,117,10,0.05))',
                  border: '1px solid rgba(232,117,10,0.3)',
                  borderRadius: '14px', padding: '16px', marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span style={{ background: 'rgba(232,117,10,0.2)', color: '#E8750A', fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>
                        {TYPE_EMOJI[t.type]} {TYPE_LABEL[t.type]}
                      </span>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginTop: '6px' }}>{t.title}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>⏱ {t.duration} min</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>❓ {Math.round((t.total_marks || 0) / (t.correct_marks || 4))} Qs</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>🏆 {t.total_marks} marks</span>
                  </div>
                  <Link to={'/test/' + t.link_token} style={{
                    display: 'block', textAlign: 'center', padding: '11px',
                    background: '#E8750A', borderRadius: '10px',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(232,117,10,0.4)'
                  }}>
                    🚀 अभी Attempt करें
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Completed Tests */}
        {doneTests.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '10px' }}>
              ✅ Completed Tests
            </div>
            {doneTests.slice(0, 3).map(function(t) {
              return (
                <div key={t._id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', padding: '12px 14px', marginBottom: '8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontWeight: 600 }}>{t.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: '3px' }}>
                      {TYPE_EMOJI[t.type]} Attempted
                    </div>
                  </div>
                  <span style={{ background: 'rgba(76,175,80,0.2)', color: '#4CAF50', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                    Done ✓
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Recent Results */}
        {stats && stats.recent && stats.recent.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.88rem' }}>📋 Recent Results</span>
              <Link to="/student/history" style={{ color: '#E8750A', fontSize: '0.78rem', textDecoration: 'none' }}>Sab dekhen →</Link>
            </div>
            {stats.recent.map(function(r) {
              var pct = r.total_marks > 0 ? Math.round((r.score / r.total_marks) * 100) : 0
              return (
                <Link key={r._id} to={'/result/' + r._id} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px', padding: '14px', marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem' }}>{r.title}</div>
                      <div style={{ color: '#E8750A', fontWeight: 800, fontSize: '1rem' }}>
                        {r.score}<span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: '0.8rem' }}>/{r.total_marks}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ color: '#4CAF50', fontSize: '0.75rem' }}>✅ {r.correct}</span>
                        <span style={{ color: '#F44336', fontSize: '0.75rem' }}>❌ {r.incorrect}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Rank #{r.rank}</span>
                      </div>
                      <span style={{
                        background: pct >= 60 ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
                        color: pct >= 60 ? '#4CAF50' : '#F44336',
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600
                      }}>{pct}%</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '4px', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ width: pct + '%', background: pct >= 60 ? '#4CAF50' : '#E8750A', height: '100%', borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {(!stats || !stats.recent || stats.recent.length === 0) && liveTests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📚</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '8px' }}>
              Koi test abhi available nahi hai
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
              Telegram channel join karein — test launch hone pe notification milega
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(15,15,26,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', backdropFilter: 'blur(10px)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {[
          { key: 'home',     icon: '🏠', label: 'Home',     path: '/student/dashboard' },
          { key: 'tests',    icon: '📝', label: 'Tests',    path: '/student/tests' },
          { key: 'progress', icon: '📊', label: 'Progress', path: '/student/progress' },
          { key: 'profile',  icon: '👤', label: 'Profile',  path: '/student/profile' }
        ].map(function(item) {
          var isActive = tab === item.key
          return (
            <Link key={item.key} to={item.path}
              onClick={function() { setTab(item.key) }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '10px 4px', textDecoration: 'none',
                color: isActive ? '#E8750A' : 'rgba(255,255,255,0.3)',
                transition: 'color 0.2s'
              }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 400, marginTop: '3px' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
