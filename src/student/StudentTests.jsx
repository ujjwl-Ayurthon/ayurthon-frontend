import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { getStudentToken, clearStudentSession } from '../utils/studentAuth'

export default function StudentTests() {
  var [tests,   setTests]   = useState([])
  var [loading, setLoading] = useState(true)
  var [tab,     setTab]     = useState('live')
  var navigate = useNavigate()

  useEffect(function() {
    if (!getStudentToken()) { navigate('/student/login'); return }
    loadTests()
  }, [])

  async function loadTests() {
    try {
      var res = await api.get('/api/student/dashboard/available-tests', {
        headers: { 'x-student-token': getStudentToken() }
      })
      setTests(res.data.tests || [])
    } catch (err) {
      if (err.response && err.response.status === 401) {
        clearStudentSession(); navigate('/student/login')
      }
    } finally {
      setLoading(false)
    }
  }

  var TYPE_EMOJI = { daily: '📅', diagnostic: '🩺', weekly: '📆', grand: '🏆' }
  var TYPE_LABEL = { daily: 'Daily CBT', diagnostic: 'Diagnostic', weekly: 'Weekly CBT', grand: 'Grand Test' }
  var TYPE_COLOR = { daily: '#E8750A', diagnostic: '#2D6A4F', weekly: '#1565C0', grand: '#6A1B9A' }

  var liveTests = tests.filter(function(t) { return !t.already_attempted })
  var doneTests = tests.filter(function(t) { return t.already_attempted })

  function toIST(d) {
    if (!d) return null
    return new Date(d).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  function timeLeft(expiresAt) {
    if (!expiresAt) return null
    var diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    var h = Math.floor(diff / 3600000)
    var m = Math.floor((diff % 3600000) / 60000)
    if (h > 24) return Math.floor(h / 24) + ' days left'
    if (h > 0)  return h + 'h ' + m + 'm left'
    return m + ' min left'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', fontFamily: 'Inter, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E, #16213E)', padding: '20px 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <button onClick={function() { navigate('/student/dashboard') }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>
            ←
          </button>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>📝 Tests</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { key: 'live', label: 'Available (' + liveTests.length + ')' },
            { key: 'done', label: 'Completed (' + doneTests.length + ')' }
          ].map(function(t) {
            var isActive = tab === t.key
            return (
              <button key={t.key} onClick={function() { setTab(t.key) }} style={{
                flex: 1, padding: '12px', border: 'none', background: 'transparent',
                color: isActive ? '#E8750A' : 'rgba(255,255,255,0.4)',
                fontWeight: isActive ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer',
                borderBottom: isActive ? '2px solid #E8750A' : '2px solid transparent',
                transition: 'all 0.2s'
              }}>
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(232,117,10,0.3)', borderTop: '3px solid #E8750A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : tab === 'live' ? (

          // ── Available Tests ─────────────────────────────────
          liveTests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '8px' }}>
                Abhi koi test available nahi hai
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Telegram channel join karein — test launch hone pe notification milega
              </div>
            </div>
          ) : (
            liveTests.map(function(t) {
              var tLeft  = timeLeft(t.expires_at)
              var color  = TYPE_COLOR[t.type] || '#E8750A'
              var qCount = Math.round((t.total_marks || 0) / (t.correct_marks || 4))
              return (
                <div key={t._id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '18px', marginBottom: '12px',
                  borderLeft: '3px solid ' + color
                }}>
                  {/* Type badge + expiry */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      background: color + '22', color: color,
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '20px'
                    }}>
                      {TYPE_EMOJI[t.type]} {TYPE_LABEL[t.type]}
                    </span>
                    {tLeft && (
                      <span style={{ color: tLeft === 'Expired' ? '#F44336' : 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                        ⏰ {tLeft}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '10px', lineHeight: '1.4' }}>
                    {t.title}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: '0', marginBottom: '14px' }}>
                    {[
                      { icon: '❓', val: qCount + ' Qs' },
                      { icon: '⏱', val: t.duration + ' min' },
                      { icon: '🏆', val: t.total_marks + ' marks' },
                      { icon: '➕', val: '+' + (t.correct_marks || 4) + ' / -' + (t.negative_marks || 1) }
                    ].map(function(s, i) {
                      return (
                        <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', background: 'rgba(255,255,255,0.04)', borderRadius: i === 0 ? '8px 0 0 8px' : i === 3 ? '0 8px 8px 0' : '0', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                          <div style={{ fontSize: '0.9rem' }}>{s.icon}</div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', marginTop: '3px', fontWeight: 600 }}>{s.val}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Published time */}
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginBottom: '12px' }}>
                    Published: {toIST(t.published_at)}
                  </div>

                  {/* Attempt button */}
                  <Link to={'/test/' + t.link_token} style={{
                    display: 'block', textAlign: 'center',
                    padding: '13px', borderRadius: '10px',
                    background: color, color: 'white',
                    fontWeight: 700, fontSize: '0.95rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px ' + color + '44'
                  }}>
                    🚀 अभी Attempt करें
                  </Link>
                </div>
              )
            })
          )

        ) : (

          // ── Completed Tests ─────────────────────────────────
          doneTests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                Abhi koi test complete nahi kiya
              </div>
            </div>
          ) : (
            doneTests.map(function(t) {
              var color  = TYPE_COLOR[t.type] || '#E8750A'
              var qCount = Math.round((t.total_marks || 0) / (t.correct_marks || 4))
              return (
                <div key={t._id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '16px', marginBottom: '10px',
                  borderLeft: '3px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ background: color + '22', color: color, fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                        {TYPE_EMOJI[t.type]} {TYPE_LABEL[t.type]}
                      </span>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.9rem', marginTop: '6px' }}>
                        {t.title}
                      </div>
                    </div>
                    <span style={{ background: 'rgba(76,175,80,0.15)', color: '#4CAF50', fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', flexShrink: 0 }}>
                      ✅ Done
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    <span>{qCount} Qs</span>
                    <span>{t.duration} min</span>
                    <span>{t.total_marks} marks</span>
                  </div>
                </div>
              )
            })
          )
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,15,26,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', backdropFilter: 'blur(10px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: '🏠', label: 'Home',     path: '/student/dashboard' },
          { icon: '📝', label: 'Tests',    path: '/student/tests',    active: true },
          { icon: '📊', label: 'Progress', path: '/student/progress' },
          { icon: '👤', label: 'Profile',  path: '/student/profile'  }
        ].map(function(item) {
          return (
            <Link key={item.label} to={item.path} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 4px', textDecoration: 'none',
              color: item.active ? '#E8750A' : 'rgba(255,255,255,0.3)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: item.active ? 700 : 400, marginTop: '3px' }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
