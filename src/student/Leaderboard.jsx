import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

export default function Leaderboard() {
  const { test_id } = useParams()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get(`/api/results/leaderboard/${test_id}?limit=100`)
      .then(r => setData(r.data))
      .catch(() => setError('Leaderboard load nahi hua'))
      .finally(() => setLoading(false))
  }, [test_id])

  function formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D6A4F)', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem' }}>🏆</div>
        <h1 style={{ color: '#E8750A', fontSize: '1.8rem', fontWeight: 900, marginTop: '8px' }}>Leaderboard</h1>
        {data && <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{data.total_students} students ne attempt kiya</p>}
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {data.leaderboard.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: '28px' }}>
                {/* 2nd */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px 12px 0 0', padding: '16px 8px', borderBottom: '4px solid #C0C0C0' }}>
                    <div style={{ fontSize: '1.5rem' }}>🥈</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }}>{data.leaderboard[1]?.name}</div>
                    <div style={{ color: '#C0C0C0', fontWeight: 800, fontSize: '1.1rem' }}>{data.leaderboard[1]?.score}</div>
                  </div>
                </div>
                {/* 1st */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ background: 'rgba(232,117,10,0.2)', borderRadius: '12px 12px 0 0', padding: '24px 8px', borderBottom: '4px solid #FFD700' }}>
                    <div style={{ fontSize: '2rem' }}>🥇</div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', marginTop: '4px' }}>{data.leaderboard[0]?.name}</div>
                    <div style={{ color: '#FFD700', fontWeight: 900, fontSize: '1.3rem' }}>{data.leaderboard[0]?.score}</div>
                  </div>
                </div>
                {/* 3rd */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px 12px 0 0', padding: '12px 8px', borderBottom: '4px solid #CD7F32' }}>
                    <div style={{ fontSize: '1.3rem' }}>🥉</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }}>{data.leaderboard[2]?.name}</div>
                    <div style={{ color: '#CD7F32', fontWeight: 800, fontSize: '1rem' }}>{data.leaderboard[2]?.score}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {data.leaderboard.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  borderBottom: i < data.leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i < 3 ? `rgba(232,117,10,${0.05 - i * 0.01})` : 'white'
                }}>
                  <span className={`rank-badge rank-${i < 3 ? i + 1 : 'other'}`}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                    {s.telegram_username && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{s.telegram_username}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--saffron)', fontSize: '1rem' }}>{s.score}/{s.total}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.accuracy}% • {formatTime(s.time_taken)}</div>
                  </div>
                </div>
              ))}
              {data.leaderboard.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Abhi koi result nahi</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
