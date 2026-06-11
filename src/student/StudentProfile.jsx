import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { getStudentToken, getStudentData, saveStudentSession, clearStudentSession, getInitials } from '../utils/studentAuth'

export default function StudentProfile() {
  var [student,  setStudent]  = useState(getStudentData())
  var [editing,  setEditing]  = useState(false)
  var [changing, setChanging] = useState(false)
  var [loading,  setLoading]  = useState(false)
  var [message,  setMessage]  = useState(null)
  var [form,     setForm]     = useState({ name: '', phone: '', college: '', graduation_year: '' })
  var [pwForm,   setPwForm]   = useState({ old_password: '', new_password: '', confirm: '' })
  var navigate = useNavigate()

  useEffect(function() {
    if (!getStudentToken()) { navigate('/student/login'); return }
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      var res = await api.get('/api/auth/me', { headers: { 'x-student-token': getStudentToken() } })
      setStudent(res.data.student)
      setForm({
        name:            res.data.student.name            || '',
        phone:           res.data.student.phone           || '',
        college:         res.data.student.college         || '',
        graduation_year: res.data.student.graduation_year || ''
      })
    } catch (err) {
      if (err.response && err.response.status === 401) { clearStudentSession(); navigate('/student/login') }
    }
  }

  async function saveProfile() {
    setLoading(true)
    try {
      var res = await api.put('/api/auth/profile', form, { headers: { 'x-student-token': getStudentToken() } })
      setStudent(res.data.student)
      var token = getStudentToken()
      saveStudentSession(token, res.data.student)
      setEditing(false)
      setMessage({ type: 'success', text: '✅ Profile update ho gaya!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Update failed' })
    } finally { setLoading(false) }
  }

  async function changePassword() {
    if (pwForm.new_password !== pwForm.confirm) {
      return setMessage({ type: 'error', text: 'Naye passwords match nahi kar rahe' })
    }
    setLoading(true)
    try {
      await api.put('/api/auth/change-password', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password
      }, { headers: { 'x-student-token': getStudentToken() } })
      setChanging(false)
      setPwForm({ old_password: '', new_password: '', confirm: '' })
      setMessage({ type: 'success', text: '✅ Password change ho gaya!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response ? err.response.data.error : 'Error' })
    } finally { setLoading(false) }
  }

  function updatePw(k, v) { setPwForm(function(p) { var n=Object.assign({},p); n[k]=v; return n }) }
  function updateForm(k, v) { setForm(function(p) { var n=Object.assign({},p); n[k]=v; return n }) }

  var inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)', color: 'white',
    fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
    fontFamily: 'Inter, sans-serif'
  }
  var labelStyle = { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', fontFamily: 'Inter, sans-serif', paddingBottom: '80px' }}>

      <div style={{ background: 'linear-gradient(135deg, #1A1A2E, #16213E)', padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/student/dashboard" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>← Back</Link>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>👤 My Profile</h1>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {message && (
          <div style={{
            background: message.type === 'success' ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
            border: '1px solid ' + (message.type === 'success' ? 'rgba(76,175,80,0.4)' : 'rgba(244,67,54,0.4)'),
            borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
            color: message.type === 'success' ? '#4CAF50' : '#F44336',
            fontSize: '0.88rem', cursor: 'pointer'
          }} onClick={function() { setMessage(null) }}>
            {message.text}
          </div>
        )}

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: student ? student.avatar_color : '#E8750A',
            margin: '0 auto 12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 900, color: 'white',
            fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            {student ? getInitials(student.name) : '?'}
          </div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{student ? student.name : ''}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '3px' }}>
            @{student ? student.telegram_username : ''}
          </div>
          {student && student.joined_at && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '4px' }}>
              Joined: {new Date(student.joined_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Profile Details</span>
            {!editing && (
              <button onClick={function() { setEditing(true) }} style={{ background: 'rgba(232,117,10,0.2)', border: '1px solid rgba(232,117,10,0.4)', borderRadius: '8px', padding: '6px 14px', color: '#E8750A', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                ✏️ Edit
              </button>
            )}
          </div>

          {editing ? (
            <>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Full Name</label><input style={inputStyle} value={form.name} onChange={function(e){updateForm('name',e.target.value)}} /></div>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Phone</label><input style={inputStyle} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={function(e){updateForm('phone',e.target.value)}} /></div>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>College</label><input style={inputStyle} placeholder="e.g. IMS BHU" value={form.college} onChange={function(e){updateForm('college',e.target.value)}} /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Graduation Year</label><input style={inputStyle} placeholder="e.g. 2023" value={form.graduation_year} onChange={function(e){updateForm('graduation_year',e.target.value)}} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={function(){setEditing(false)}} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={saveProfile} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: '#E8750A', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  {loading ? '⏳...' : '💾 Save'}
                </button>
              </div>
            </>
          ) : (
            [
              { label: 'Phone',           value: student ? student.phone           : '—' },
              { label: 'College',         value: student ? student.college         : '—' },
              { label: 'Graduation Year', value: student ? student.graduation_year : '—' }
            ].map(function(item) {
              return (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{item.label}</span>
                  <span style={{ color: item.value ? 'white' : 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 600 }}>{item.value || 'Not set'}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Change Password */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: changing ? '16px' : '0' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>🔒 Password</span>
            <button onClick={function(){setChanging(function(p){return !p})}} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px 14px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.82rem' }}>
              {changing ? 'Cancel' : 'Change'}
            </button>
          </div>
          {changing && (
            <>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Current Password</label><input type="password" style={inputStyle} value={pwForm.old_password} onChange={function(e){updatePw('old_password',e.target.value)}} /></div>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>New Password</label><input type="password" style={inputStyle} value={pwForm.new_password} onChange={function(e){updatePw('new_password',e.target.value)}} /></div>
              <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Confirm New Password</label><input type="password" style={inputStyle} value={pwForm.confirm} onChange={function(e){updatePw('confirm',e.target.value)}} /></div>
              <button onClick={changePassword} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: 'none', background: '#E8750A', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳...' : '🔒 Update Password'}
              </button>
            </>
          )}
        </div>

        {/* Logout */}
        <button onClick={function(){ clearStudentSession(); navigate('/student/login') }}
          style={{ width: '100%', padding: '13px', borderRadius: '10px', border: '1px solid rgba(244,67,54,0.3)', background: 'rgba(244,67,54,0.1)', color: '#F44336', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          🚪 Logout
        </button>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,15,26,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', backdropFilter: 'blur(10px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: '🏠', label: 'Home',     path: '/student/dashboard' },
          { icon: '📝', label: 'Tests',    path: '/student/tests' },
          { icon: '📊', label: 'Progress', path: '/student/progress' },
          { icon: '👤', label: 'Profile',  path: '/student/profile', active: true }
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
