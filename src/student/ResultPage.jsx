import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ResultPage() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const [tab, setTab] = useState('summary')

  if (!state?.result && !state?.alreadyAttempted) {
    return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="alert alert-error">Result nahi mila.</div></div>
  }

  if (state?.alreadyAttempted) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--dark)'}}>
        <div className="card" style={{maxWidth:'400px',width:'100%',margin:'20px',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'12px'}}>🚫</div>
          <h2 style={{color:'var(--error)',marginBottom:'8px'}}>Already Attempted!</h2>
          <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>Aapne <strong>{state.testTitle}</strong> pehle hi attempt kar liya hai.</p>
          <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginTop:'8px'}}>Ek username se sirf ek baar attempt allowed hai.</p>
        </div>
      </div>
    )
  }

  const { result, testTitle, testId } = state
  const { score, total, correct, incorrect, unattempted, accuracy, rank, time_taken_seconds, wrong_questions, skipped_questions, answers } = result

  function formatTime(sec) {
    const m = Math.floor(sec/60), s = sec%60
    return `${m} min ${s} sec`
  }

  function getGrade() {
    if (accuracy >= 90) return { label: 'Excellent! 🏆', color: '#FFD700' }
    if (accuracy >= 75) return { label: 'Very Good! 🌟', color: 'var(--success)' }
    if (accuracy >= 60) return { label: 'Good 👍',        color: 'var(--saffron)' }
    if (accuracy >= 40) return { label: 'Average 📚',     color: '#E67E22' }
    return { label: 'Need Practice 💪', color: 'var(--error)' }
  }

  const grade = getGrade()

  function QuestionCard({ q, index, studentAns, label, labelColor, labelBg }) {
    return (
      <div className="card" style={{marginBottom:'12px'}}>
        <div style={{display:'flex',gap:'8px',marginBottom:'10px',flexWrap:'wrap'}}>
          <span className="badge" style={{background:labelBg,color:labelColor}}>{label} Q{index+1}</span>
          <span className="badge" style={{background:'#FFF3CD',color:'#856404',fontSize:'0.7rem'}}>{q.type?.replace('_',' ')}</span>
        </div>
        <p className="deva" style={{fontSize:'0.95rem',lineHeight:'1.9',marginBottom:'12px',fontWeight:'500'}}>{q.text}</p>
        {Object.entries(q.options).map(([key,val])=>{
          const isCorrect  = key === q.correct_answer
          const isSelected = key === studentAns
          return (
            <div key={key} style={{
              padding:'8px 14px',marginBottom:'6px',borderRadius:'8px',fontSize:'0.9rem',
              border:`2px solid ${isCorrect?'var(--success)':isSelected?'var(--error)':'var(--border)'}`,
              background:isCorrect?'var(--green-light)':isSelected?'#FDE8E8':'white',
              fontWeight:isCorrect||isSelected?'600':'400'
            }} className="deva">
              {isCorrect?'✅':isSelected?'❌':'○'} <strong>{key}.</strong> {val}
              {isCorrect  && <span style={{fontSize:'0.75rem',color:'var(--success)',marginLeft:'8px'}}>(सही उत्तर)</span>}
              {isSelected && !isCorrect && <span style={{fontSize:'0.75rem',color:'var(--error)',marginLeft:'8px'}}>(आपका उत्तर)</span>}
            </div>
          )
        })}
        {q.explanation && <div style={{marginTop:'10px',padding:'10px',background:'var(--saffron-light)',borderRadius:'8px',fontSize:'0.85rem'}}>💡 <strong>व्याख्या:</strong> {q.explanation}</div>}
        {q.reference   && <div style={{marginTop:'6px',fontSize:'0.78rem',color:'var(--text-muted)'}}>📖 {q.reference}</div>}
      </div>
    )
  }

  // Build answer map: question_id → selected_option
  const answerMap = {}
  if (answers) answers.forEach(a => { answerMap[a.question_id] = a.selected_option })

  return (
    <div style={{minHeight:'100vh',background:'#F8F9FA'}}>
      <div style={{background:'var(--dark)',color:'white',padding:'14px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{fontSize:'1.2rem'}}>🌿</div>
        <div>
          <div style={{fontWeight:700,color:'var(--saffron)'}}>Ayurthon</div>
          <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.6)'}}>{testTitle}</div>
        </div>
      </div>

      <div style={{maxWidth:'720px',margin:'0 auto',padding:'20px 16px'}}>

        {/* Hero */}
        <div className="result-hero">
          <div style={{fontSize:'0.9rem',color:'rgba(255,255,255,0.7)',marginBottom:'8px'}}>आपका Result</div>
          <div className="result-score">{score}<span style={{fontSize:'1.5rem',color:'rgba(255,255,255,0.7)'}}>/{total}</span></div>
          <div className="result-rank">🏆 Rank: #{rank}</div>
          <div style={{marginTop:'12px',fontSize:'1.1rem',color:grade.color,fontWeight:700}}>{grade.label}</div>
          <div style={{marginTop:'8px',fontSize:'0.85rem',color:'rgba(255,255,255,0.6)'}}>⏱ {formatTime(time_taken_seconds)}</div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{marginBottom:'20px'}}>
          <div className="stat-card"><div className="stat-number" style={{color:'var(--success)'}}>{correct}</div><div className="stat-label">✅ Correct</div></div>
          <div className="stat-card"><div className="stat-number" style={{color:'var(--error)'}}>{incorrect}</div><div className="stat-label">❌ Incorrect</div></div>
          <div className="stat-card"><div className="stat-number" style={{color:'#E67E22'}}>{unattempted}</div><div className="stat-label">⬜ Skipped</div></div>
          <div className="stat-card"><div className="stat-number">{accuracy}%</div><div className="stat-label">🎯 Accuracy</div></div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'6px',marginBottom:'16px',flexWrap:'wrap'}}>
          {[
            {key:'summary',  label:'📊 Summary'},
            {key:'wrong',    label:`❌ Wrong (${wrong_questions?.length||0})`},
            {key:'skipped',  label:`⬜ Skipped (${skipped_questions?.length||0})`},
            {key:'all',      label:'📋 All Answers'},
          ].map(t=>(
            <button key={t.key} className={`btn btn-sm ${tab===t.key?'btn-primary':'btn-outline'}`} onClick={()=>setTab(t.key)}>{t.label}</button>
          ))}
          {testId && (
            <button className="btn btn-outline btn-sm" style={{marginLeft:'auto'}} onClick={()=>navigate(`/leaderboard/${testId}`)}>🏆 Leaderboard</button>
          )}
        </div>

        {/* Summary */}
        {tab==='summary' && (
          <div className="card">
            <div className="card-title">📊 Performance Summary</div>
            <div style={{marginBottom:'20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:'6px'}}><span>Accuracy</span><span>{accuracy}%</span></div>
              <div style={{background:'var(--border)',borderRadius:'8px',height:'12px',overflow:'hidden'}}>
                <div style={{width:`${accuracy}%`,background:accuracy>=60?'var(--success)':'var(--error)',height:'100%',borderRadius:'8px',transition:'width 1s'}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',fontSize:'0.88rem'}}>
              <div style={{padding:'10px',background:'var(--saffron-light)',borderRadius:'8px'}}>
                <div style={{color:'var(--text-muted)'}}>Score</div>
                <div style={{fontWeight:700,fontSize:'1.1rem',color:'var(--saffron)'}}>{score} / {total}</div>
              </div>
              <div style={{padding:'10px',background:'var(--green-light)',borderRadius:'8px'}}>
                <div style={{color:'var(--text-muted)'}}>Your Rank</div>
                <div style={{fontWeight:700,fontSize:'1.1rem',color:'var(--green)'}}>#{rank}</div>
              </div>
              <div style={{padding:'10px',background:'#F0F4FF',borderRadius:'8px'}}>
                <div style={{color:'var(--text-muted)'}}>Time Taken</div>
                <div style={{fontWeight:700,color:'#3730A3'}}>{formatTime(time_taken_seconds)}</div>
              </div>
              <div style={{padding:'10px',background:'#FDE8E8',borderRadius:'8px'}}>
                <div style={{color:'var(--text-muted)'}}>Wrong + Skipped</div>
                <div style={{fontWeight:700,color:'var(--error)'}}>{incorrect + unattempted} questions</div>
              </div>
            </div>
            {(wrong_questions?.length>0||skipped_questions?.length>0) && (
              <div style={{marginTop:'16px',padding:'12px',background:'#FFF3CD',borderRadius:'8px',fontSize:'0.85rem',color:'#856404'}}>
                💡 <strong>{wrong_questions?.length} galat</strong> aur <strong>{skipped_questions?.length} skip</strong> — review karein!
              </div>
            )}
          </div>
        )}

        {/* Wrong */}
        {tab==='wrong' && (
          wrong_questions?.length===0 ? (
            <div className="card" style={{textAlign:'center',padding:'40px'}}>
              <div style={{fontSize:'3rem'}}>🎉</div>
              <p style={{fontWeight:700,color:'var(--success)',marginTop:'8px'}}>Koi galat jawab nahi!</p>
            </div>
          ) : wrong_questions?.map((q,i)=>(
            <QuestionCard key={q._id} q={q} index={i}
              studentAns={answerMap[q._id]}
              label="❌" labelColor="var(--error)" labelBg="#FDE8E8"
            />
          ))
        )}

        {/* Skipped */}
        {tab==='skipped' && (
          skipped_questions?.length===0 ? (
            <div className="card" style={{textAlign:'center',padding:'40px'}}>
              <div style={{fontSize:'3rem'}}>💯</div>
              <p style={{fontWeight:700,color:'var(--success)',marginTop:'8px'}}>Koi question skip nahi kiya!</p>
            </div>
          ) : skipped_questions?.map((q,i)=>(
            <QuestionCard key={q._id} q={q} index={i}
              studentAns={null}
              label="⬜ Skipped" labelColor="#856404" labelBg="#FFF3CD"
            />
          ))
        )}

        {/* All Answers */}
        {tab==='all' && answers && (
          <div className="card">
            <div className="card-title">📋 All Answers</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:'8px'}}>
              {answers.map((a,i)=>(
                <div key={i} style={{
                  padding:'8px',borderRadius:'8px',textAlign:'center',fontSize:'0.82rem',
                  background:a.is_correct?'var(--green-light)':a.is_skipped?'var(--border)':'#FDE8E8',
                  border:`1px solid ${a.is_correct?'var(--success)':a.is_skipped?'#ccc':'var(--error)'}`
                }}>
                  <div style={{fontWeight:700}}>Q{i+1}</div>
                  <div style={{color:'var(--text-muted)'}}>You: <strong>{a.selected_option||'—'}</strong></div>
                  <div style={{color:'var(--success)'}}>Ans: <strong>{a.correct_option}</strong></div>
                  <div style={{fontSize:'0.68rem',marginTop:'2px',color:a.is_correct?'var(--success)':a.is_skipped?'var(--text-muted)':'var(--error)'}}>
                    {a.is_correct?'✅ Correct':a.is_skipped?'⬜ Skip':'❌ Wrong'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
