import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TestList() {
  const [tests,   setTests]   = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [modal,   setModal]   = useState(null)   // test object for preview
  const [publishing, setPublishing] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{ fetchTests() },[])

  async function fetchTests() {
    try {
      const res = await api.get('/api/tests')
      setTests(res.data.tests)
    } finally { setLoading(false) }
  }

  async function confirmPublish() {
    setPublishing(true)
    try {
      const res = await api.post(`/api/tests/${modal._id}/publish`)
      setMessage({ type:'success', text:`✅ Published! Telegram: ${res.data.telegram_sent?'✅ Sent':'⚠️ Failed'}` })
      setModal(null)
      fetchTests()
    } catch(err) {
      setMessage({ type:'error', text: err.response?.data?.error||'Error publishing' })
    } finally { setPublishing(false) }
  }

  async function closeTest(id) {
    if(!confirm('Test close karna chahte ho?')) return
    await api.post(`/api/tests/${id}/close`)
    fetchTests()
  }

  async function deleteTest(id) {
    if(!confirm('Test delete karna chahte ho?')) return
    await api.delete(`/api/tests/${id}`)
    fetchTests()
  }

  function copyLink(token) {
    const link = `${window.location.origin}/test/${token}`
    navigator.clipboard.writeText(link)
    setMessage({ type:'success', text:'📋 Link copied!' })
  }

  const typeEmoji = { daily:'📅', diagnostic:'🩺', weekly:'📆', grand:'🏆' }
  const typeLabel = { daily:'Daily CBT', diagnostic:'Diagnostic Test', weekly:'Weekly CBT', grand:'Grand Test' }

  return (
    <div>
      <div className="page-header">
        <h1>📋 All Tests</h1>
        <p>Sabhi tests ki list aur status</p>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner"/></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Type</th><th>Questions</th><th>Duration</th><th>Status</th><th>Telegram</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tests.map(t=>(
                  <tr key={t._id}>
                    <td><strong>{t.title}</strong></td>
                    <td><span className={`badge badge-${t.type}`}>{typeEmoji[t.type]} {t.type}</span></td>
                    <td>{t.questions?.length||'—'}</td>
                    <td>{t.duration_minutes} min</td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    <td>{t.telegram_sent?'✅':'—'}</td>
                    <td>
                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                        {t.status==='draft' && (
                          <button className="btn btn-success btn-sm" onClick={()=>setModal(t)}>🚀 Publish</button>
                        )}
                        {t.status==='published' && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={()=>copyLink(t.link_token)}>🔗 Link</button>
                            <button className="btn btn-sm" style={{background:'#6c757d',color:'white'}} onClick={()=>closeTest(t._id)}>🔒 Close</button>
                          </>
                        )}
                        <button className="btn btn-sm btn-outline" onClick={()=>navigate(`/admin/results/${t._id}`)}>📊 Results</button>
                        <button className="btn btn-sm btn-danger" onClick={()=>deleteTest(t._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tests.length===0 && (
                  <tr><td colSpan="7" style={{textAlign:'center',color:'var(--text-muted)',padding:'40px'}}>Koi test nahi mila</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Publish Preview Modal ── */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div className="card" style={{maxWidth:'480px',width:'100%',position:'relative'}}>
            <button onClick={()=>setModal(null)} style={{position:'absolute',top:'12px',right:'12px',background:'none',border:'none',fontSize:'1.3rem',cursor:'pointer',color:'var(--text-muted)'}}>✕</button>

            <div className="card-title">🚀 Publish Preview</div>

            {/* Test Details */}
            <div style={{background:'var(--saffron-light)',borderRadius:'8px',padding:'14px',marginBottom:'16px',fontSize:'0.88rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <div><span style={{color:'var(--text-muted)'}}>Title:</span><br/><strong>{modal.title}</strong></div>
                <div><span style={{color:'var(--text-muted)'}}>Type:</span><br/><strong>{typeLabel[modal.type]}</strong></div>
                <div><span style={{color:'var(--text-muted)'}}>Questions:</span><br/><strong>{modal.questions?.length||modal.total_marks}</strong></div>
                <div><span style={{color:'var(--text-muted)'}}>Duration:</span><br/><strong>{modal.duration_minutes} min</strong></div>
              </div>
            </div>

            {/* Telegram Preview */}
            <div style={{background:'#1A1A2E',borderRadius:'10px',padding:'16px',marginBottom:'20px'}}>
              <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.72rem',marginBottom:'8px'}}>📱 Telegram Preview</div>
              <div style={{color:'white',fontSize:'0.88rem',lineHeight:'1.8',fontFamily:'monospace',whiteSpace:'pre-wrap'}}>
{`${typeEmoji[modal.type]} Ayurthon — ${typeLabel[modal.type]}

📚 ${modal.title}
━━━━━━━━━━━━━━
❓ Questions: ${modal.questions?.length||modal.total_marks}
⏱ Duration: ${modal.duration_minutes} Minutes
🏆 Total Marks: ${modal.total_marks}
✅ No Negative Marking
━━━━━━━━━━━━━━
📊 Result & Leaderboard milega!`}
              </div>
              <div style={{marginTop:'10px',background:'#2D6A4F',borderRadius:'6px',padding:'8px 14px',textAlign:'center',color:'white',fontSize:'0.85rem',fontWeight:600}}>
                🚀 Launch CBT Test — अभी Attempt करें
              </div>
            </div>

            <div style={{display:'flex',gap:'10px'}}>
              <button className="btn btn-outline btn-full" onClick={()=>setModal(null)} disabled={publishing}>Cancel</button>
              <button className="btn btn-success btn-full btn-lg" onClick={confirmPublish} disabled={publishing}>
                {publishing ? '⏳ Publishing...' : '✅ Confirm & Launch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
