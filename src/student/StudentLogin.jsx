import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { saveStudentSession } from '../utils/studentAuth'

export default function StudentLogin() {
  var [mode,     setMode]     = useState('login') // login | register
  var [loading,  setLoading]  = useState(false)
  var [error,    setError]    = useState('')
  var [form,     setForm]     = useState({
    name: '', telegram_username: '', password: '', confirm_password: '',
    phone: '', college: '', graduation_year: ''
  })
  var [showPass, setShowPass] = useState(false)
  var navigate = useNavigate()

  function update(key, val) {
    setForm(function(p) { var n = Object.assign({}, p); n[key] = val; return n })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (!form.name.trim())             return setError('Apna naam likhein')
      if (!form.telegram_username.trim())return setError('Telegram username likhein')
      if (form.password.length < 6)     return setError('Password kam se kam 6 characters ka hona chahiye')
      if (form.password !== form.confirm_password) return setError('Dono passwords match nahi kar rahe')
    }

    setLoading(true)
    try {
      var endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      var payload  = mode === 'login'
        ? { telegram_username: form.telegram_username, password: form.password }
        : { name: form.name, telegram_username: form.telegram_username,
            password: form.password, phone: form.phone,
            college: form.college, graduation_year: form.graduation_year }

      var res = await api.post(endpoint, payload)
      saveStudentSession(res.data.token, res.data.student)
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Kuch error hua, dobara try karein')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '18px',
            background: '#E8750A', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 8px 24px rgba(232,117,10,0.4)'
          }}>🌿</div>
          <h1 style={{ color: '#E8750A', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Ayurthon</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '4px' }}>
            AIAPGET Marathon Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '28px',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Mode Toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
            padding: '4px', marginBottom: '24px'
          }}>
            {['login','register'].map(function(m) {
              return (
                <button key={m} onClick={function() { setMode(m); setError('') }}
                  style={{
                    padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                    background: mode === m ? '#E8750A' : 'transparent',
                    color:      mode === m ? 'white'   : 'rgba(255,255,255,0.5)'
                  }}>
                  {m === 'login' ? 'Login' : 'Register'}
                </button>
              )
            })}
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.5)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              color: '#FF6B6B', fontSize: '0.85rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>
                  पूरा नाम *
                </label>
                <input
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)', color: 'white',
                    fontSize: '0.9rem', boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="Dr. Rahul Kumar"
                  value={form.name}
                  onChange={function(e) { update('name', e.target.value) }}
                />
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>
                Telegram Username *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  color: '#E8750A', fontWeight: 700, fontSize: '1rem'
                }}>@</span>
                <input
                  style={{
                    width: '100%', padding: '11px 14px 11px 28px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)', color: 'white',
                    fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
                  }}
                  placeholder="your_username"
                  value={form.telegram_username}
                  onChange={function(e) { update('telegram_username', e.target.value) }}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  style={{
                    width: '100%', padding: '11px 40px 11px 14px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)', color: 'white',
                    fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
                  }}
                  placeholder="Kam se kam 6 characters"
                  value={form.password}
                  onChange={function(e) { update('password', e.target.value) }}
                />
                <button type="button" onClick={function() { setShowPass(function(p) { return !p }) }}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1rem' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.08)', color: 'white',
                      fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
                    }}
                    placeholder="Password dobara likhein"
                    value={form.confirm_password}
                    onChange={function(e) { update('confirm_password', e.target.value) }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>
                    College (optional)
                  </label>
                  <input
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.08)', color: 'white',
                      fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
                    }}
                    placeholder="e.g. IMS BHU, Varanasi"
                    value={form.college}
                    onChange={function(e) { update('college', e.target.value) }}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                background: loading ? 'rgba(232,117,10,0.5)' : '#E8750A',
                color: 'white', fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(232,117,10,0.3)'
              }}>
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Login करें' : '✨ Register करें'}
            </button>
          </form>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
              Password bhool gaye? Admin se contact karein
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
          Admin? <Link to="/admin/login" style={{ color: '#E8750A' }}>Admin Panel</Link>
        </p>
      </div>
    </div>
  )
}
