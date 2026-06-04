import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TestList() {
  const [tests,   setTests]   = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchTests() }, [])

  async function fetchTests() {
    try {
      const res = await api.get('/api/tests')
      setTests(res.data.tests)
    } finally {
      setLoading(false)
    }
  }

  async function publish(id) {
    try {
      const res = await api.post(`/api/tests/${id}/publish`)
      setMessage({ type: 'success', text: `✅ Published! ${res.data.link}` })
      fetchTests()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' })
    }
  }

  async function closeTest(id) {
    if (!confirm('Test close karna chahte ho?')) return
    await api.post(`/api/tests/${id}/close`)
    fetchTests()
  }

  async function deleteTest(id) {
    if (!confirm('Test delete karna chahte ho?')) return
    await api.delete(`/api/tests/${id}`)
    fetchTests()
  }

  function copyLink(token) {
    const link = `${window.location.origin}/test/${token}`
    navigator.clipboard.writeText(link)
    setMessage({ type: 'success', text: '📋 Link copied!' })
  }

  const frontendBase = window.location.origin

  return (
    <div>
      <div className="page-header">
        <h1>📋 All Tests</h1>
        <p>Sabhi tests ki list aur status</p>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Telegram</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t._id}>
                    <td><strong>{t.title}</strong></td>
                    <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                    <td>{t.questions?.length || '—'}</td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    <td>{t.telegram_sent ? '✅' : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {t.status === 'draft' && (
                          <button className="btn btn-success btn-sm" onClick={() => publish(t._id)}>🚀 Publish</button>
                        )}
                        {t.status === 'published' && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => copyLink(t.link_token)}>🔗 Link</button>
                            <button className="btn btn-sm" style={{ background: '#6c757d', color: 'white' }} onClick={() => closeTest(t._id)}>🔒 Close</button>
                          </>
                        )}
                        <button className="btn btn-sm btn-outline" onClick={() => navigate(`/admin/results/${t._id}`)}>📊 Results</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteTest(t._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Koi test nahi mila</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
