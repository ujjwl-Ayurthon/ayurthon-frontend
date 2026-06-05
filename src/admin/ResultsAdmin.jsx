import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

export default function ResultsAdmin() {
  const { test_id } = useParams()
  const [leaderboard, setLeaderboard] = useState([])
  const [analytics,   setAnalytics]   = useState(null)
  const [sheet,       setSheet]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState('leaderboard')
  const [expandedRow, setExpandedRow] = useState(null)

  useEffect(()=>{
    Promise.all([
      api.get(`/api/results/leaderboard/${test_id}?limit=200`),
      api.get(`/api/results/analytics/${test_id}`),
      api.get(`/api/results/sheet/${test_id}`)
    ]).then(([lb,an,sh])=>{
      setLeaderboard(lb.data.leaderboard)
      setAnalytics(an.data.analytics)
      setSheet(sh.data)
    }).finally(()=>setLoading(false))
  },[test_id])

  function formatTime(sec) {
    const m=Math.floor(sec/60),s=sec%60
    return `${m}:${String(s).padStart(2,'0')}`
  }

  function exportCSV() {
    if (!sheet) return
    const header = ['Rank','Name','Telegram','Score','Total','Correct','Incorrect','Skipped','Accuracy%','Time(sec)',
      ...(sheet.questions||[]).map((_,i)=>`Q${i+1}_Selected`),
      ...(sheet.questions||[]).map((_,i)=>`Q${i+1}_Correct`),
    ]
    const rows = sheet.sheet.map(s=>[
      s.rank, s.name, s.telegram_username, s.score, s.correct+s.incorrect+s.unattempted,
      s.correct, s.incorrect, s.unattempted, s.accuracy, s.time_taken,
      ...(s.responses||[]).map(r=>r.selected),
      ...(s.responses||[]).map(r=>r.correct),
    ])
    const csv = [header,...rows].map(r=>r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,'+encodeURIComponent(csv)
    a.download = `ayurthon_results_${test_id}.csv`
    a.click()
  }

  return (
    <div>
      <div className="page-header">
        <h1>📊 Test Results</h1>
        <p>Leaderboard, analytics aur complete response sheet</p>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner"/></div>
      ) : (
        <>
          {analytics && (
            <div className="stats-grid" style={{marginBottom:'24px'}}>
              <div className="stat-card"><div className="stat-number">{analytics.total_students}</div><div className="stat-label">Total Students</div></div>
              <div className="stat-card"><div className="stat-number">{analytics.average_score}</div><div className="stat-label">Avg Score</div></div>
              <div className="stat-card"><div className="stat-number">{analytics.highest_score}</div><div className="stat-label">Highest</div></div>
              <div className="stat-card"><div className="stat-number">{analytics.average_accuracy}%</div><div className="stat-label">Avg Accuracy</div></div>
            </div>
          )}

          <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
            {['leaderboard','sheet','distribution'].map(t=>(
              <button key={t} className={`btn ${tab===t?'btn-primary':'btn-outline'}`} onClick={()=>setTab(t)}>
                {t==='leaderboard'?'🏆 Leaderboard':t==='sheet'?'📋 Response Sheet':'📊 Distribution'}
              </button>
            ))}
            <button className="btn btn-outline" onClick={exportCSV} style={{marginLeft:'auto'}}>⬇️ Export CSV</button>
          </div>

          {/* Leaderboard */}
          {tab==='leaderboard' && (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Rank</th><th>Name</th><th>Telegram</th><th>Score</th><th>✅</th><th>❌</th><th>⬜</th><th>Accuracy</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(s=>(
                      <tr key={s.rank}>
                        <td><span className={`rank-badge rank-${s.rank<=3?s.rank:'other'}`}>{s.rank}</span></td>
                        <td><strong>{s.name}</strong></td>
                        <td style={{color:'var(--text-muted)'}}>@{s.telegram_username||'—'}</td>
                        <td><strong style={{color:'var(--saffron)'}}>{s.score}/{s.total}</strong></td>
                        <td style={{color:'var(--success)'}}>{s.correct}</td>
                        <td style={{color:'var(--error)'}}>{s.incorrect}</td>
                        <td style={{color:'#E67E22'}}>{s.unattempted}</td>
                        <td>{s.accuracy}%</td>
                        <td>{formatTime(s.time_taken)}</td>
                      </tr>
                    ))}
                    {leaderboard.length===0 && <tr><td colSpan="9" style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>Koi result nahi</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Response Sheet */}
          {tab==='sheet' && sheet && (
            <div className="card">
              <div className="card-title">📋 Complete Response Sheet</div>
              <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'16px'}}>Kisi bhi student par click karein uski full response dekhne ke liye</p>
              {sheet.sheet?.map((s,i)=>(
                <div key={i} style={{border:'1px solid var(--border)',borderRadius:'8px',marginBottom:'8px',overflow:'hidden'}}>
                  <div
                    style={{padding:'12px 16px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',background:expandedRow===i?'var(--saffron-light)':'white'}}
                    onClick={()=>setExpandedRow(expandedRow===i?null:i)}
                  >
                    <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                      <span className={`rank-badge rank-${s.rank<=3?s.rank:'other'}`}>{s.rank}</span>
                      <div>
                        <div style={{fontWeight:700}}>{s.name}</div>
                        <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>@{s.telegram_username||'—'}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'16px',fontSize:'0.85rem',alignItems:'center'}}>
                      <span style={{color:'var(--saffron)',fontWeight:700}}>{s.score} marks</span>
                      <span style={{color:'var(--success)'}}>✅{s.correct}</span>
                      <span style={{color:'var(--error)'}}>❌{s.incorrect}</span>
                      <span style={{color:'#E67E22'}}>⬜{s.unattempted}</span>
                      <span style={{color:'var(--text-muted)'}}>{formatTime(s.time_taken)}</span>
                      <span>{expandedRow===i?'▲':'▼'}</span>
                    </div>
                  </div>

                  {expandedRow===i && (
                    <div style={{padding:'12px 16px',background:'#F8F9FA',borderTop:'1px solid var(--border)'}}>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:'6px'}}>
                        {s.responses?.map((r,j)=>(
                          <div key={j} style={{
                            padding:'6px',borderRadius:'6px',textAlign:'center',fontSize:'0.75rem',
                            background:r.is_correct?'var(--green-light)':r.is_skipped?'var(--border)':'#FDE8E8',
                            border:`1px solid ${r.is_correct?'var(--success)':r.is_skipped?'#ccc':'var(--error)'}`
                          }}>
                            <div style={{fontWeight:700,color:'var(--text-muted)'}}>Q{j+1}</div>
                            <div style={{fontWeight:700,color:r.is_correct?'var(--success)':r.is_skipped?'var(--text-muted)':'var(--error)'}}>{r.selected}</div>
                            <div style={{color:'var(--success)',fontSize:'0.68rem'}}>✓{r.correct}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Distribution */}
          {tab==='distribution' && analytics && (
            <div className="card">
              <div className="card-title">Score Distribution</div>
              {Object.entries(analytics.score_distribution).map(([range,count])=>(
                <div key={range} style={{marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.88rem',marginBottom:'4px'}}>
                    <span>{range}%</span><span>{count} students</span>
                  </div>
                  <div style={{background:'var(--border)',borderRadius:'4px',height:'20px',overflow:'hidden'}}>
                    <div style={{width:`${analytics.total_students>0?(count/analytics.total_students)*100:0}%`,background:'var(--saffron)',height:'100%',transition:'width 0.5s'}}/>
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
