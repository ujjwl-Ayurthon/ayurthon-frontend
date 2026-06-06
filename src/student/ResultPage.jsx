import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ResultPage() {
  var location = useLocation()
  var navigate = useNavigate()
  var state    = location.state
  var [tab, setTab] = useState('all')

  if (state && state.alreadyAttempted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚫</div>
          <h2 style={{ color: 'var(--error)', marginBottom: '8px' }}>Already Attempted!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Aapne pehle hi yeh test attempt kar liya hai.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
            Ek username se sirf ek baar attempt allowed hai.
          </p>
        </div>
      </div>
    )
  }

  if (!state || !state.result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="alert alert-error">Result nahi mila.</div>
      </div>
    )
  }

  var result    = state.result
  var testTitle = state.testTitle || ''
  var testId    = state.testId    || ''

  var score              = result.score              || 0
  var totalMarks         = result.total_marks        || result.total || 0
  var totalQ             = result.total              || 0
  var correct            = result.correct            || 0
  var incorrect          = result.incorrect          || 0
  var unattempted        = result.unattempted        || 0
  var accuracy           = result.accuracy           || 0
  var rank               = result.rank               || 0
  var timeSec            = result.time_taken_seconds || 0
  var wrongQuestions     = result.wrong_questions    || []
  var skippedQuestions   = result.skipped_questions  || []
  var answers            = result.answers            || []

  function formatTime(sec) {
    var m = Math.floor(sec / 60)
    var s = sec % 60
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

  // Build full question data map from answers array
  // answers = [{ question_id, selected_option, correct_option, is_correct, is_skipped }]
  var answerMap = {}
  answers.forEach(function(a) {
    answerMap[String(a.question_id)] = a
  })

  // Merge wrong/skipped question details with answer data
  var wrongMap   = {}
  var skippedMap = {}
  wrongQuestions.forEach(function(q)   { wrongMap[String(q._id)]   = q })
  skippedQuestions.forEach(function(q) { skippedMap[String(q._id)] = q })

  // Build display lists from answers array (preserves order)
  var allItems      = []
  var correctItems  = []
  var wrongItems    = []
  var skippedItems  = []

  answers.forEach(function(a, idx) {
    var qId = String(a.question_id)
    var qDetail = wrongMap[qId] || skippedMap[qId] || null
    var item = { idx: idx, answer: a, qDetail: qDetail, qId: qId }
    allItems.push(item)
    if (a.is_skipped)       skippedItems.push(item)
    else if (a.is_correct)  correctItems.push(item)
    else                    wrongItems.push(item)
  })

  var tabList = [
    { key: 'all',     label: 'All (' + answers.length + ')',        color: 'var(--dark)' },
    { key: 'correct', label: 'Correct (' + correctItems.length + ')', color: 'var(--success)' },
    { key: 'wrong',   label: 'Wrong (' + wrongItems.length + ')',     color: 'var(--error)' },
    { key: 'skipped', label: 'Skipped (' + skippedItems.length + ')', color: '#E67E22' }
  ]

  var displayItems = tab === 'all'     ? allItems
                   : tab === 'correct' ? correctItems
                   : tab === 'wrong'   ? wrongItems
                   : skippedItems

  function QuestionCard(props) {
    var item     = props.item
    var a        = item.answer
    var q        = item.qDetail
    var num      = item.idx + 1
    var isSkipped = a.is_skipped
    var isCorrect = a.is_correct

    var labelText = isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'
    var labelBg   = isSkipped ? '#FFF3CD' : isCorrect ? 'var(--green-light)' : '#FDE8E8'
    var labelCol  = isSkipped ? '#856404' : isCorrect ? 'var(--success)'     : 'var(--error)'
    var borderCol = isSkipped ? '#F0C040' : isCorrect ? 'var(--success)'     : 'var(--error)'

    return (
      <div style={{ border: '1.5px solid ' + borderCol, borderRadius: '10px', padding: '14px', marginBottom: '12px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge" style={{ background: labelBg, color: labelCol }}>
            {isSkipped ? '⬜' : isCorrect ? '✅' : '❌'} {labelText}
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
            <p className="deva" style={{ fontSize: '0.95rem', lineHeight: '1.9', marginBottom: '12px', fontWeight: 500 }}>
              {q.text}
            </p>

            {q.options && Object.entries(q.options).map(function(entry) {
              var key = entry[0]
              var val = entry[1]
              var isRightAns  = key === a.correct_option
              var isChosen    = key === a.selected_option
              var bg     = isRightAns ? 'var(--green-light)' : isChosen ? '#FDE8E8' : 'white'
              var border = isRightAns ? 'var(--success)'     : isChosen ? 'var(--error)' : 'var(--border)'
              var fw     = (isRightAns || isChosen) ? 600 : 400
              return (
                <div key={key} style={{ padding: '8px 14px', marginBottom: '6px', borderRadius: '8px', fontSize: '0.9rem', border: '2px solid ' + border, background: bg, fontWeight: fw }} className="deva">
                  {isRightAns ? '✅' : isChosen ? '❌' : '○'} <strong>{key}.</strong> {val}
                  {isRightAns && !isChosen && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginLeft: '8px' }}>(सही उत्तर)</span>
                  )}
                  {isChosen && !isRightAns && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--error)', marginLeft: '8px' }}>(आपका उत्तर)</span>
                  )}
                  {isChosen && isRightAns && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginLeft: '8px' }}>(सही ✓)</span>
                  )}
                </div>
              )
            })}

            {q.explanation && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px', fontSize: '0.85rem' }}>
                💡 <strong>व्याख्या:</strong> {q.explanation}
              </div>
            )}
            {q.reference && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                📖 {q.reference}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: '6px' }}>
              Your answer: <strong style={{ color: a.selected_option ? (a.is_correct ? 'var(--success)' : 'var(--error)') : '#E67E22' }}>
                {a.selected_option || '— (Skipped)'}
              </strong>
              {' '} | Correct: <strong style={{ color: 'var(--success)' }}>{a.correct_option}</strong>
            </div>
            <small>Question details load nahi hue</small>
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
          <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>⏱ {formatTime(timeSec)}</div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--success)' }}>{correct}</div>
            <div className="stat-label">✅ Correct</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--error)' }}>{incorrect}</div>
            <div className="stat-label">❌ Wrong</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#E67E22' }}>{unattempted}</div>
            <div className="stat-label">⬜ Skipped</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{accuracy}%</div>
            <div className="stat-label">🎯 Accuracy</div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem' }}>
            <div style={{ padding: '10px', background: 'var(--saffron-light)', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Score</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--saffron)' }}>{score} / {totalMarks}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+4 per correct, -{(Number(result.negative_marks) || 1)} per wrong</div>
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
              <div style={{ fontWeight: 700, color: 'var(--error)' }}>{incorrect + unattempted}</div>
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '5px' }}>
              <span>Accuracy (attempted only)</span><span style={{ fontWeight: 700 }}>{accuracy}%</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
              <div style={{ width: accuracy + '%', background: accuracy >= 60 ? 'var(--success)' : 'var(--error)', height: '100%', borderRadius: '8px', transition: 'width 1s' }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tabList.map(function(t) {
            return (
              <button
                key={t.key}
                onClick={function() { setTab(t.key) }}
                style={{
                  padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: tab === t.key ? 700 : 500,
                  background: tab === t.key ? t.color : 'var(--border)',
                  color:      tab === t.key ? 'white'  : 'var(--text)'
                }}
              >
                {t.label}
              </button>
            )
          })}
          {testId && (
            <button
              onClick={function() { navigate('/leaderboard/' + testId) }}
              style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: '8px', border: '2px solid var(--saffron)', background: 'white', color: 'var(--saffron)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              🏆 Leaderboard
            </button>
          )}
        </div>

        {/* Question Cards */}
        {displayItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3rem' }}>
              {tab === 'correct' ? '🎉' : tab === 'skipped' ? '💯' : '✅'}
            </div>
            <p style={{ fontWeight: 700, color: 'var(--success)', marginTop: '8px' }}>
              {tab === 'correct' ? 'Is section mein koi correct nahi' :
               tab === 'wrong'   ? 'Koi galat jawab nahi!' :
               tab === 'skipped' ? 'Koi skip nahi kiya!' : 'Koi data nahi'}
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
