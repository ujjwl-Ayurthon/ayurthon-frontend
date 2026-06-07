import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'

export default function ResultPage() {
  var location = useLocation()
  var navigate = useNavigate()
  var params   = useParams()
  var state    = location.state

  var [tab,        setTab]        = useState('all')
  var [result,     setResult]     = useState(state ? state.result : null)
  var [testTitle,  setTestTitle]  = useState(state ? (state.testTitle || '') : '')
  var [testId,     setTestId]     = useState(state ? (state.testId || '') : '')
  var [loadingRes, setLoadingRes] = useState(false)
  var [loadErr,    setLoadErr]    = useState('')

  // Re-entry: fetch result from backend if only result_id available
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
            correct_marks:      data.test_id ? data.test_id.correct_marks : 4,
            negative_marks:     data.test_id ? data.test_id.negative_marks : 1,
            time_taken_seconds: data.time_taken_seconds,
            wrong_questions:    data.wrong_questions   || [],
            skipped_questions:  data.skipped_questions || [],
            answers:            data.answers           || []
          })
          if (data.test_id) {
            setTestTitle(data.test_id.title || '')
            setTestId(data.test_id._id || '')
          }
        })
        .catch(function() { setLoadErr('Result load nahi hua') })
        .finally(function() { setLoadingRes(false) })
    }
  }, [params.result_id])

  if (loadingRes) return <div className="loading-wrap" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (loadErr)    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="alert alert-error">{loadErr}</div></div>

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="alert alert-error">Result nahi mila.</div>
      </div>
    )
  }

  var score      = result.score              || 0
  var totalMarks = result.total_marks        || 0
  var totalQ     = result.total              || 0
  var correct    = result.correct            || 0
  var incorrect  = result.incorrect          || 0
  var unattempt  = result.unattempted        || 0
  var accuracy   = result.accuracy           || 0
  var rank       = result.rank               || 0
  var timeSec    = result.time_taken_seconds || 0
  var cm         = result.correct_marks      || 4
  var nm         = result.negative_marks     || 1

  var wrongQs   = result.wrong_questions   || []
  var skippedQs = result.skipped_questions || []
  var answers   = result.answers           || []

  function formatTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60
    return m + ' min ' + s + ' sec'
  }

  function getGrade() {
    if (accuracy >= 90) return { label: 'Excellent! 🏆', color: '#FFD700' }
    if (accuracy >= 75) return { label: 'Very Good! 🌟', color: 'var(--success)' }
    if (accuracy >= 60) return { label: 'Good 👍',        color: 'var(--saffron)' }
    if (accuracy >= 40) return { label: 'Average 📚',     color: '#E67E22' }
    return { label: 'Need Practice 💪', color: 'var(--error)' }
  }
  var grade = getGrade()

  // Build lookup maps from wrong/skipped details
  var wrongMap   = {}
  var skippedMap = {}
  wrongQs.forEach(function(q)   { wrongMap[String(q._id)]   = q })
  skippedQs.forEach(function(q) { skippedMap[String(q._id)] = q })

  // Build display items from answers array (preserves order, has all questions)
  var allItems      = []
  var correctItems  = []
  var wrongItems    = []
  var skippedItems  = []

  answers.forEach(function(a, idx) {
    var qId     = String(a.question_id)
    var qDetail = wrongMap[qId] || skippedMap[qId] || null
    var item    = { idx: idx, answer: a, qDetail: qDetail, qId: qId }
    allItems.push(item)
    if      (a.is_skipped)  skippedItems.push(item)
    else if (a.is_correct)  correctItems.push(item)
    else                    wrongItems.push(item)
  })

  var tabList = [
    { key: 'all',     label: 'All ('     + answers.length      + ')', bg: 'var(--dark)',    fg: 'white' },
    { key: 'correct', label: 'Correct (' + correctItems.length + ')', bg: 'var(--success)', fg: 'white' },
    { key: 'wrong',   label: 'Wrong ('   + wrongItems.length   + ')', bg: 'var(--error)',   fg: 'white' },
    { key: 'skipped', label: 'Skipped (' + skippedItems.length + ')', bg: '#E67E22',        fg: 'white' }
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
    var borderCol = isSkipped ? '#F0C040' : isCorrect ? 'var(--success)' : 'var(--error)'

    return (
      <div style={{ border: '1.5px solid ' + borderCol, borderRadius: '10px', padding: '14px', marginBottom: '12px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge" style={{
            background: isSkipped ? '#FFF3CD' : isCorrect ? 'var(--green-light)' : '#FDE8E8',
            color:      isSkipped ? '#856404' : isCorrect ? 'var(--success)'     : 'var(--error)'
          }}>
            {isSkipped ? '⬜ Skipped' : isCorrect ? '✅ Correct' : '❌ Wrong'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Q{num}</span>
          {q && q.type && (
            <span className="badge" style={{ background: '#F0F4FF', color: '#3730A3', fontSize: '0.7rem' }}>
              {q.type.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {q ? (
          <>
            <p className="deva" style={{ fontSize: '0.95rem', lineHeight: '1.9', marginBottom: '12px', fontWeight: 500 }}>{q.text}</p>
            {q.options && Object.entries(q.options).map(function(entry) {
              var key = entry[0], val = entry[1]
              var isRight    = key === a.correct_option
              var isChosen   = key === a.selected_option
              return (
                <div key={key} className="deva" style={{
                  padding: '8px 14px', marginBottom: '6px', borderRadius: '8px', fontSize: '0.9rem',
                  border:     '2px solid ' + (isRight ? 'var(--success)' : isChosen ? 'var(--error)' : 'var(--border)'),
                  background: isRight ? 'var(--green-light)' : isChosen ? '#FDE8E8' : 'white',
                  fontWeight: (isRight || isChosen) ? 600 : 400
                }}>
                  {isRight ? '✅' : isChosen ? '❌' : '○'} <strong>{key}.</strong> {val}
                  {isRight && !isChosen && <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginLeft: '8px' }}>(सही उत्तर)</span>}
                  {isChosen && !isRight  && <span style={{ fontSize: '0.72rem', color: 'var(--error)',   marginLeft: '8px' }}>(आपका उत्तर)</span>}
                  {isRight && isChosen   && <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginLeft: '8px' }}>(सही ✓)</span>}
                </div>
              )
            })}
            {q.explanation && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px', fontSize: '0.85rem' }}>
                💡 <strong>व्याख्या:</strong> {q.explanation}
              </div>
            )}
            {q.reference && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>📖 {q.reference}</div>
            )}
          </>
        ) : (
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Your answer: <strong style={{ color: a.is_correct ? 'var(--success)' : a.is_skipped ? '#E67E22' : 'var(--error)' }}>
              {a.selected_option || '— (Skipped)'}
            </strong>
            &nbsp;| Correct: <strong style={{ color: 'var(--success)' }}>{a.correct_option}</strong>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <div style={{ background: 'var(--dark)', color: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.2rem' }}>🌿</div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--saffron)' }}>Ayurthon</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{testTitle}</div>
        </div>
        {(state && state.reEntry) && (
          <div style={{ marginLeft: 'auto', background: '#E67E22', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
            Re-entry — Previous Result
          </div>
        )}
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Hero */}
        <div className="result-hero">
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>आपका Result</div>
          <div className="result-score">
            {score}
            <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.6)' }}>/{totalMarks}</span>
          </div>
          <div className="result-rank">🏆 Rank: #{rank}</div>
          <div style={{ marginTop: '10px', fontSize: '1rem', color: grade.color, fontWeight: 700 }}>{grade.label}</div>
          <div style={{ marginTop: '6px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
            ⏱ {formatTime(timeSec)} &nbsp;|&nbsp; +{cm} / -{nm}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '16px' }}>
          <div className="stat-card"><div className="stat-number" style={{ color: 'var(--success)' }}>{correct}</div><div className="stat-label">✅ Correct</div></div>
          <div className="stat-card"><div className="stat-number" style={{ color: 'var(--error)'   }}>{incorrect}</div><div className="stat-label">❌ Wrong</div></div>
          <div className="stat-card"><div className="stat-number" style={{ color: '#E67E22'        }}>{unattempt}</div><div className="stat-label">⬜ Skipped</div></div>
          <div className="stat-card"><div className="stat-number">{accuracy}%</div><div className="stat-label">🎯 Accuracy</div></div>
        </div>

        {/* Score breakdown */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem', marginBottom: '14px' }}>
            <div style={{ padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Score</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--saffron)' }}>{score} / {totalMarks}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({correct}×{cm}) - ({incorrect}×{nm}) = {score}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--green-light)', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Rank</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green)' }}>#{rank}</div>
            </div>
            <div style={{ padding: '10px', background: '#F0F4FF', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Time</div>
              <div style={{ fontWeight: 700, color: '#3730A3' }}>{formatTime(timeSec)}</div>
            </div>
            <div style={{ padding: '10px', background: '#FDE8E8', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Wrong + Skipped</div>
              <div style={{ fontWeight: 700, color: 'var(--error)' }}>{incorrect + unattempt}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '5px' }}>
            <span>Accuracy (attempted only)</span>
            <span style={{ fontWeight: 700 }}>{accuracy}%</span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
            <div style={{ width: accuracy + '%', background: accuracy >= 60 ? 'var(--success)' : 'var(--error)', height: '100%', borderRadius: '8px', transition: 'width 1s' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tabList.map(function(t) {
            return (
              <button key={t.key} onClick={function() { setTab(t.key) }} style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: tab === t.key ? 700 : 500,
                background: tab === t.key ? t.bg    : 'var(--border)',
                color:      tab === t.key ? t.fg    : 'var(--text)'
              }}>
                {t.label}
              </button>
            )
          })}
          {testId && (
            <button onClick={function() { navigate('/leaderboard/' + testId) }} style={{
              marginLeft: 'auto', padding: '8px 14px', borderRadius: '8px',
              border: '2px solid var(--saffron)', background: 'white',
              color: 'var(--saffron)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
            }}>
              🏆 Leaderboard
            </button>
          )}
        </div>

        {/* Cards */}
        {displayItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3rem' }}>{tab === 'wrong' ? '🎉' : tab === 'skipped' ? '💯' : tab === 'correct' ? '📝' : '📋'}</div>
            <p style={{ fontWeight: 700, color: 'var(--success)', marginTop: '8px' }}>
              {tab === 'correct' ? 'Koi correct answer nahi' :
               tab === 'wrong'   ? 'Koi galat jawab nahi!' :
               tab === 'skipped' ? 'Koi question skip nahi kiya!' : 'Koi data nahi'}
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
