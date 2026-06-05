import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TestAttempt() {
  const { token } = useParams()
  const navigate  = useNavigate()

  const SESSION_KEY = `ayurthon_session_${token}`

  const [stage,    setStage]    = useState('register')
  const [test,     setTest]     = useState(null)
  const [name,     setName]     = useState('')
  const [tgUser,   setTgUser]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [timeLeft, setTimeLeft] = useState(0)

  const timerRef     = useRef(null)
  const startTimeRef = useRef(null)
  const answersRef   = useRef({})

  useEffect(() => { answersRef.current = answers }, [answers])

  useEffect(() => {
    api.get(`/api/tests/attempt/${token}`)
      .then(r => {
        setTest(r.data.test)
        const saved = localStorage.getItem(SESSION_KEY)
        if (saved) {
          try {
            const session = JSON.parse(saved)
            const elapsed   = Math.floor((Date.now() - session.startTime) / 1000)
            const remaining = (r.data.test.duration_minutes * 60) - elapsed
            setName(session.name || '')
            setTgUser(session.tgUser || '')
            setAnswers(session.answers || {})
            answersRef.current = session.answers || {}
            setCurrentQ(session.currentQ || 0)
            if (remaining <= 0) {
              doSubmit(session.name, session.tgUser, session.answers, r.data.test)
            } else {
              setTimeLeft(remaining)
              startTimeRef.current = session.startTime
              setStage('test')
              beginTimer(remaining, r.data.test, session.name, session.tgUser)
            }
          } catch { localStorage.removeItem(SESSION_KEY) }
        }
        setLoading(false)
      })
      .catch(() => { setError('Test nahi mila ya abhi live nahi hai'); setLoading(false) })
  }, [token])

  function saveSession(extraAnswers, extraQ) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      name, tgUser,
      answers:   extraAnswers ?? answersRef.current,
      currentQ:  extraQ      ?? 0,
      startTime: startTimeRef.current
    }))
  }

  function beginTimer(seconds, testData, sName, sTg) {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          doSubmit(sName, sTg, answersRef.current, testData)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleRegister(e) {
    e.preventDefault()
    const tg = tgUser.replace('@', '').toLowerCase()
    if (tg) {
      try {
        const check = await api.get(`/api/results/check/${token}/${tg}`)
        if (check.data.attempted) {
          navigate(`/result/${check.data.result_id}`, {
            state: { alreadyAttempted: true, testTitle: test.title }
          })
          return
        }
      } catch {}
    }
    const now = Date.now()
    startTimeRef.current = now
    const total = test.duration_minutes * 60
    setTimeLeft(total)
    setStage('test')
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name, tgUser: tg, answers: {}, currentQ: 0, startTime: now }))
    beginTimer(total, test, name, tg)
  }

  async function doSubmit(sName, sTg, currentAnswers, testData) {
    setStage('submitting')
    clearInterval(timerRef.current)
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    try {
      const res = await api.post('/api/results/submit', {
        test_token:         token,
        student_name:       sName || name,
        telegram_username:  (sTg || tgUser).replace('@', ''),
        answers:            currentAnswers || answersRef.current,
        time_taken_seconds: elapsed
      })
      localStorage.removeItem(SESSION_KEY)
      navigate(`/result/${res.data.result._id}`, {
        state: { result: res.data.result, testTitle: (testData || test)?.title, testId: (testData || test)?._id }
      })
    } catch (err) {
      const errData = err.response?.data
      if (errData?.already_attempted) {
        localStorage.removeItem(SESSION_KEY)
        navigate(`/result/${errData.result_id}`, { state: { alreadyAttempted: true, testTitle: test?.title } })
        return
      }
      setError(errData?.error || 'Submit error')
      setStage('test')
    }
  }

  function handleSubmit() {
    if (!confirm('Test submit karna chahte ho?')) return
    doSubmit(name, tgUser, answersRef.current, test)
  }

  function setAnswer(qId, key) {
    const updated = { ...answersRef.current, [qId]: key }
    setAnswers(updated)
    answersRef.current = updated
  }

  function clearAnswer(qId) {
    const updated = { ...answersRef.current }
    delete updated[qId]
    setAnswers(updated)
    answersRef.current = updated
  }

  function handleQChange(i) {
    saveSession(answersRef.current, i)
    setCurrentQ(i)
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  if (loading) return <div className="loading-wrap" style={{minHeight:'100vh'}}><div className="spinner"/></div>
  if (error)   return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}><div className="alert alert-error" style={{maxWidth:'400px',width:'100%'}}>{error}</div></div>

  if (stage === 'register') return (
    <div style={{minHeight:'100vh',background:'var(--dark)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{fontSize:'2.5rem'}}>🌿</div>
          <h1 style={{color:'#E8750A',fontSize:'1.6rem',fontWeight:800}}>Ayurthon</h1>
          <p style={{color:'rgba(255,255,255,0.7)',fontSize:'0.9rem',marginTop:'4px'}}>{test?.title}</p>
        </div>
        <div className="card">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px',textAlign:'center'}}>
            <div style={{background:'var(--saffron-light)',borderRadius:'8px',padding:'12px'}}>
              <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--saffron)'}}>{test?.questions?.length}</div>
              <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Questions</div>
            </div>
            <div style={{background:'var(--green-light)',borderRadius:'8px',padding:'12px'}}>
              <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--green)'}}>{test?.duration_minutes}</div>
              <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Minutes</div>
            </div>
            <div style={{background:'#F0F4FF',borderRadius:'8px',padding:'12px'}}>
              <div style={{fontSize:'1.4rem',fontWeight:800,color:'#3730A3'}}>{test?.total_marks}</div>
              <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Marks</div>
            </div>
          </div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">आपका नाम *</label>
              <input className="form-control" placeholder="Pura naam likhein" value={name} onChange={e=>setName(e.target.value)} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Telegram Username *</label>
              <input className="form-control" placeholder="@username" value={tgUser} onChange={e=>setTgUser(e.target.value)} required/>
              <small style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>⚠️ Ek username se sirf ek baar attempt allowed hai</small>
            </div>
            <div style={{background:'#FFF3CD',borderRadius:'8px',padding:'10px 14px',fontSize:'0.82rem',color:'#856404',marginBottom:'16px'}}>
              ⚠️ Tab band mat karein — progress save hoti rahegi aur timer chalte rahega.
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">🚀 Test Start करें</button>
          </form>
        </div>
      </div>
    </div>
  )

  if (stage === 'submitting') return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'16px'}}>
      <div className="spinner" style={{margin:0}}/>
      <p style={{color:'var(--text-muted)'}}>Result calculate ho raha hai...</p>
    </div>
  )

  const q = test.questions[currentQ]
  const isWarning = timeLeft < 300

  return (
    <div style={{minHeight:'100vh',background:'#F8F9FA'}}>
      <div className="cbt-header">
        <div>
          <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.6)'}}>{test.title}</div>
          <div style={{fontSize:'0.9rem',color:'rgba(255,255,255,0.9)'}}>Q {currentQ+1} / {test.questions.length}</div>
        </div>
        <div className={`timer ${isWarning?'warning':''}`}>⏱ {formatTime(timeLeft)}</div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.6)'}}>Attempted</div>
          <div style={{fontSize:'0.9rem',color:'var(--saffron)'}}>{Object.keys(answers).length}/{test.questions.length}</div>
        </div>
      </div>

      <div style={{maxWidth:'720px',margin:'0 auto',padding:'20px 16px'}}>
        <div className="card" style={{marginBottom:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
            <span className="badge" style={{background:'var(--saffron-light)',color:'var(--saffron)'}}>Question {currentQ+1}</span>
            <span className="badge" style={{background:'#F0F4FF',color:'#3730A3'}}>{q.type?.replace('_',' ')}</span>
          </div>
          <p className="deva" style={{fontSize:'1.05rem',lineHeight:'1.9',marginBottom:'20px',fontWeight:'500'}}>{q.text}</p>
          {Object.entries(q.options).map(([key,val])=>(
            <button key={key} className={`option-btn ${answers[q._id]===key?'selected':''}`} onClick={()=>setAnswer(q._id,key)}>
              <strong>{key}.</strong> {val}
            </button>
          ))}
          {answers[q._id] && (
            <button style={{fontSize:'0.8rem',color:'var(--text-muted)',background:'none',border:'none',cursor:'pointer',padding:'4px',marginTop:'4px'}} onClick={()=>clearAnswer(q._id)}>
              ✕ Clear selection
            </button>
          )}
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <button className="btn btn-outline" onClick={()=>handleQChange(Math.max(0,currentQ-1))} disabled={currentQ===0}>← Prev</button>
          <button className="btn btn-danger" onClick={handleSubmit}>📤 Submit Test</button>
          <button className="btn btn-outline" onClick={()=>handleQChange(Math.min(test.questions.length-1,currentQ+1))} disabled={currentQ===test.questions.length-1}>Next →</button>
        </div>

        <div className="card">
          <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'10px'}}>🟧 Attempted &nbsp; ⬜ Not attempted</div>
          <div className="question-nav">
            {test.questions.map((_,i)=>(
              <button key={i} className={`q-nav-btn ${answers[test.questions[i]._id]?'answered':''} ${i===currentQ?'current':''}`} onClick={()=>handleQChange(i)}>{i+1}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
