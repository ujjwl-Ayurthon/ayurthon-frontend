import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/admin/login', { password })
      localStorage.setItem('ayurthon_admin_token', res.data.token)
      navigate('/admin/upload')
    } catch {
      setError('गलत पासवर्ड है')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1A2E' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '3rem' }}>🌿</div>
          <h1 style={{ color: '#E8750A', fontSize: '1.8rem', fontWeight: 800 }}>Ayurthon</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Admin Panel</p>
        </div>

        <div className="card">
          <div className="card-title">Login करें</div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Admin Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password enter करें"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Login करें'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
