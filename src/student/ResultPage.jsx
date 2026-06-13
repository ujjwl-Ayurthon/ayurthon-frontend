import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'

export default function ResultPage() {
  var location = useLocation()
  var navigate = useNavigate()
  var params   = useParams()
  var state    = location.state

  var [tab,        setTab]        = useState('all')
  var [result,     setResult]     = useState(state && state.result ? state.result : null)
  var [testTitle,  setTestTitle]  = useState(state ? (state.testTitle || '') : '')
  var [testId,     setTestId]     = useState(state ? (state.testId    || '') : '')
  var [loadingRes, setLoadingRes] = useState(false)
  var [loadErr,    setLoadErr]    = useState('')

  useEffect(function() {
    if (!result && params.result_id) {
      setLoadingRes(true)
      api.get('/api/results/' + params.result_id)
        .then(function(r) {
          var data = r.data.result
          setResult({
            _id:                data._id,
            score:              data.score,
            total_marks:        data.total_marks,
            total:              data.total_marks,
            correct:            data.correct,
            incorrect:          data.incorrect,
            unattempted:        data.unattempted,
            accuracy:           data.accuracy,
            rank:               data.rank,
            correct_marks:      data.test_id ? (data.test_id.correct_marks  || 4) : 4,
            negative_marks:     data.test_id ? (data.test_id.negative_marks || 1) : 1,
            time_taken_seconds: data.time_taken_seconds,
            wrong_questions:    data.wrong_questions    || [],
            skipped_questions:  data.skipped_questions  || [],
            correct_questions:  data.correct_questions  || [],
            answers:            data.answers            || []
          })
          if (data.test_id) {
            setTestTitle(data.test_id.title || '')
            setTestId(data.test_id._id     || '')
          }
        })
        .catch(function() { setLoadErr('Result load nahi hua. Dobara try karein.') })
        .finally(function() { setLoadingRes(false) })
    }
  }, [params.result_id])

  if (loadingRes) return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(232,117,10,0.3)', borderTop: '3px solid #E8750A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Result load ho raha hai...</p>
    </div>
  )

  if (loadErr) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="alert alert-error" style={{ maxWidth: '400px' }}>{loadErr}</div>
    </div>
  )

  if (state && state.alreadyAttempted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚫</div>
        <h2 style={{ color: 'var(--error)', marginBottom: '8px' }}>Already Attempted!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ek username se sirf ek baar attempt allowed hai.</p>
        <button onClick={function() { navigate('/student/dashboard') }}
          className="btn btn-primary btn-full" style={{ marginTop: '16px' }}>
          Dashboard pe Jao
        </button>
      </div>
    </div>
  )

  if (!result) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="alert alert-error">Result nahi mila.</div>
    </div>
  )

  var score      = result.score              || 0
  var totalMarks = result.total_marks        || 0
  var correct    = result.correct            || 0
  var incorrect  = result.incorrect          || 0
  var unattempt  = result.unattempted        || 0
  var accuracy   = result.accuracy           || 0
  var rank       = result.rank               || 0
  var timeSec    = result.time_taken_seconds || 0
  var cm         = result.correct_marks      || 4
  var nm         = result.negative_marks     || 1
  var answers    = result.answers            || []
  var wrongQs    = result.wrong_questions    || []
  var skippedQs  = result.skipped_questions  || []
  var correctQs  = result.correct_questions  || []

  function formatTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60
    return m + ' min ' + s + ' sec'
  }

  function getGrade() {
    if (accuracy >= 90) return { label: 'Excellent! 🏆', color: '#FFD700' }
    if (accuracy >= 75) return { label: 'Very Good! 🌟', color: '#4CAF50' }
    if (accuracy >= 60) return { label: 'Good 👍',        color: 'var(--saffron)' }
    if (accuracy >= 40) return { label: 'Average 📚',     color: '#E67E22' }
    return { label: 'Need Practice 💪', color: 'var(--error)' }
  }
  var grade = getGrade()

  // Build question detail map from all 3 arrays
  var qDetailMap = {}
  wrongQs.forEach(function(q)   { if (q && q._id) qDetailMap[String(q._id)] = q })
  skippedQs.forEach(function(q) { if (q && q._id) qDetailMap[String(q._id)] = q })
  correctQs.forEach(function(q) { if (q && q._id) qDetailMap[String(q._id)] = q })

  // Build display lists from answers array
  var allItems     = []
  var correctItems = []
  var wrongItems   = []
  var skippedItems = []

  answers.forEach(function(a, idx) {
    var qId     = String(a.question_id)
    var qDetail = qDetailMap[qId] || null
    var item    = { idx: idx, answer: a, qDetail: qDetail, qId: qId }
    allItems.push(item)
    if      (a.is_skipped)  skippedItems.push(item)
    else if (a.is_correct)  correctItems.push(item)
    else                    wrongItems.push(item)
  })

  var tabList = [
    { key: 'all',     label: 'All ('          + answers.length      + ')', color: '#1A1A2E' },
    { key: 'correct', label: '✅ Correct ('   + correctItems.length + ')', color: 'var(--success)' },
    { key: 'wrong',   label: '❌ Wrong ('     + wrongItems.length   + ')', color: 'var(--error)' },
    { key: 'skipped', label: '⬜ Skipped ('   + skippedItems.length + ')', color: '#E67E22' }
  ]

  var displayItems = tab === 'correct' ? correctItems
                   : tab === 'wrong'   ? wrongItems
                   : tab === 'skipped' ? skippedItems
                   : allItems

  function QuestionCard(props) {
    var item      = props.item
    var a         = item.answer
    var q         = item.qDetail
    var num       = item.idx + 1
    var isSkipped = a.is_skipped
    var isCorrect = a.is_correct
    var borderCol = isSkipped ? '#F0C040' : isCorrect ? '#4CAF50' : '#F44336'
    var bgCol     = isSkipped ? '#FFFDF0' : isCorrect ? '#F0FFF4' : '#FFF5F5'

    return (
      <div style={{ border: '1.5px solid ' + borderCol, borderRadius: '12px', padding: '16px', marginBottom: '12px', background: bgCol }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            background: isSkipped ? '#FFF3CD' : isCorrect ? '#D4EDDA' : '#FDE8E8',
            color:      isSkipped ? '#856404' : isCorrect ? '#155724' : '#721C24',
            fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px'
          }}>
            {isSkipped ? '⬜ Skipped' : isCorrect ? '✅ Correct' : '❌ Wrong'}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Q{num}</span>
          {q && q.type && (
            <span style={{ background: '#F0F4FF', color: '#3730A3', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px' }}>
              {q.type.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {q ? (
          <>
            <p className="deva" style={{ fontSize: '0.95rem', lineHeight: '1.9', marginBottom: '14px', fontWeight: 500, color: '#1A1A2E' }}>
              {q.text}
            </p>
            {q.options && Object.entries(q.options).map(function(entry) {
              var key = entry[0], val = entry[1]
              var isRight  = key === a.correct_option
              var isChosen = key === a.selected_option
              return (
                <div key={key} className="deva" style={{
                  padding: '9px 14px', marginBottom: '7px', borderRadius: '9px', fontSize: '0.9rem',
                  border:     '2px solid ' + (isRight ? '#4CAF50' : isChosen ? '#F44336' : '#E5E5E0'),
                  background: isRight ? '#D4EDDA' : isChosen ? '#FDE8E8' : 'white',
                  fontWeight: (isRight || isChosen) ? 600 : 400
                }}>
                  {isRight && isChosen  ? '✅ ' : ''}
                  {isRight && !isChosen ? '✅ ' : ''}
                  {!isRight && isChosen ? '❌ ' : ''}
                  {!isRight && !isChosen ? '○ ' : ''}
                  <strong>{key}.</strong> {val}
                  {isRight && !isChosen  && <span style={{ fontSize: '0.7rem', color: '#155724', marginLeft: '8px' }}>(सही उत्तर)</span>}
                  {isChosen && !isRight  && <span style={{ fontSize: '0.7rem', color: '#721C24', marginLeft: '8px' }}>(आपका उत्तर)</span>}
                  {isRight  && isChosen  && <span style={{ fontSize: '0.7rem', color: '#155724', marginLeft: '8px' }}>(सही ✓)</span>}
                </div>
              )
            })}
            {q.explanation && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(232,117,10,0.08)', borderRadius: '8px', fontSize: '0.85rem', borderLeft: '3px solid var(--saffron)' }}>
                💡 <strong>व्याख्या:</strong> <span className="deva">{q.explanation}</span>
              </div>
            )}
            {q.reference && (
              <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>📖 {q.reference}</div>
            )}
          </>
        ) : (
          <div style={{ padding: '10px', background: 'white', borderRadius: '8px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Your answer: <strong style={{ color: isCorrect ? '#4CAF50' : isSkipped ? '#E67E22' : '#F44336' }}>{a.selected_option || '— (Skipped)'}</strong></span>
              <span>Correct: <strong style={{ color: '#4CAF50' }}>{a.correct_option}</strong></span>
            </div>
          </div>
        )}
      </div>
    )
  }

  var isStudentLoggedIn = !!localStorage.getItem('ayurthon_student_token')

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>

      {/* Header */}
      <div style={{ background: 'var(--dark)', color: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: '1.1rem' }}>🌿</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--saffron)', fontSize: '0.9rem' }}>Ayurthon — Result</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{testTitle}</div>
        </div>
        {isStudentLoggedIn && (
          <button onClick={function() { navigate('/student/dashboard') }}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.78rem' }}>
            🏠 Home
          </button>
        )}
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Hero */}
        <div className="result-hero" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>आपका Result</div>
          <div className="result-score">
            {score}
            <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.4)' }}>/{totalMarks}</span>
          </div>
          <div className="result-rank">🏆 Rank: #{rank}</div>
          <div style={{ marginTop: '8px', fontSize: '0.95rem', color: grade.color, fontWeight: 700 }}>{grade.label}</div>
          <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
            ⏱ {formatTime(timeSec)} &nbsp;|&nbsp; +{cm} correct / −{nm} wrong
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '16px' }}>
          <div className="stat-card"><div className="stat-number" style={{ color: '#4CAF50' }}>{correct}</div><div className="stat-label">✅ Correct</div></div>
          <div className="stat-card"><div className="stat-number" style={{ color: '#F44336' }}>{incorrect}</div><div className="stat-label">❌ Wrong</div></div>
          <div className="stat-card"><div className="stat-number" style={{ color: '#E67E22' }}>{unattempt}</div><div className="stat-label">⬜ Skipped</div></div>
          <div className="stat-card"><div className="stat-number">{accuracy}%</div><div className="stat-label">🎯 Accuracy</div></div>
        </div>

        {/* Score breakdown */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Score Formula</div>
              <div style={{ fontWeight: 800, color: 'var(--saffron)', fontSize: '1rem', marginTop: '2px' }}>{score} / {totalMarks}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>({correct}×{cm}) − ({incorrect}×{nm}) = {score}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--green-light)', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Rank</div>
              <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: '1rem', marginTop: '2px' }}>#{rank}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Time: {formatTime(timeSec)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '5px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Accuracy (attempted only)</span>
            <span style={{ fontWeight: 700 }}>{accuracy}%</span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: accuracy + '%', background: accuracy >= 60 ? '#4CAF50' : '#F44336', height: '100%', borderRadius: '6px', transition: 'width 1s' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tabList.map(function(t) {
            var isActive = tab === t.key
            return (
              <button key={t.key} onClick={function() { setTab(t.key) }} style={{
                padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: isActive ? 700 : 500,
                background: isActive ? t.color : 'var(--border)',
                color:      isActive ? 'white'  : 'var(--text)',
                transition: 'all 0.15s'
              }}>
                {t.label}
              </button>
            )
          })}
          {testId && (
            <button onClick={function() { navigate('/leaderboard/' + testId) }} style={{
              marginLeft: 'auto', padding: '8px 12px', borderRadius: '8px',
              border: '2px solid var(--saffron)', background: 'white',
              color: 'var(--saffron)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
            }}>
              🏆 Leaderboard
            </button>
          )}
        </div>

        {/* Question Cards */}
        {displayItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
              {tab === 'wrong' ? '🎉' : tab === 'skipped' ? '💯' : tab === 'correct' ? '🌟' : '📋'}
            </div>
            <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
              {tab === 'correct' ? 'Is test mein koi correct answer nahi' :
               tab === 'wrong'   ? 'Koi galat jawab nahi! 🎉' :
               tab === 'skipped' ? 'Koi question skip nahi kiya! 💯' : 'Koi data nahi'}
            </p>
          </div>
        ) : (
          displayItems.map(function(item) {
            return <QuestionCard key={item.qId + '_' + item.idx} item={item} />
          })
        )}

      </div>
    </div>
  )
}
