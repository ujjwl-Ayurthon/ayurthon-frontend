import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

// Force correct backend URL — never use relative path
var BACKEND = "https://ayurthon-backend.onrender.com";

function ResultsAdmin() {
  var params   = useParams()
  var navigate = useNavigate()

  // Route must be: /admin/results/:test_id
  var id = params.test_id || params.id || params.result_id || ''

  var lbS = useState([]);    var leaderboard = lbS[0]; var setLeaderboard = lbS[1];
  var anS = useState(null);  var analytics   = anS[0]; var setAnalytics   = anS[1];
  var shS = useState(null);  var sheet       = shS[0]; var setSheet       = shS[1];
  var ldS = useState(true);  var loading     = ldS[0]; var setLoading     = ldS[1];
  var tbS = useState('leaderboard'); var tab  = tbS[0]; var setTab        = tbS[1];
  var exS = useState(null);  var expandedRow = exS[0]; var setExpandedRow = exS[1];
  var erS = useState('');    var errorMsg    = erS[0]; var setErrorMsg    = erS[1];

  function adminFetch(path) {
    var token = localStorage.getItem('ayurthon_admin_token') || localStorage.getItem('admin_token') || '';
    var url = BACKEND + path;
    return fetch(url, {
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token }
    }).then(function(res) {
      var contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // HTML response = wrong URL or 404 from Vercel
        throw new Error('Backend URL galat hai ya endpoint exist nahi karta. Status: ' + res.status);
      }
      return res.json().then(function(data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    });
  }

  useEffect(function() {
    if (!id || id === 'undefined') {
      setErrorMsg('Test ID missing hai. TestList se "Results" button click karke aao.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    var pending = 3;
    function done() { pending--; if (pending <= 0) setLoading(false); }

    // Leaderboard
    adminFetch('/api/results/leaderboard/' + id + '?limit=200')
      .then(function(r) {
        var d = r.data || {};
        var lb = d.leaderboard || d.results || d.data || d;
        setLeaderboard(Array.isArray(lb) ? lb : []);
      })
      .catch(function(err) { console.error('Leaderboard:', err.message); })
      .finally(done);

    // Analytics
    adminFetch('/api/results/analytics/' + id)
      .then(function(r) {
        var d = r.data || {};
        setAnalytics(d.analytics || d.data || d || null);
      })
      .catch(function(err) { console.error('Analytics:', err.message); })
      .finally(done);

    // Sheet
    adminFetch('/api/results/sheet/' + id)
      .then(function(r) {
        setSheet(r.data || null);
      })
      .catch(function(err) { console.error('Sheet:', err.message); })
      .finally(done);

  }, [id]);

  function formatTime(sec) {
    var s = Number(sec) || 0;
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function exportCSV() {
    var rows = sheet && Array.isArray(sheet.sheet) ? sheet.sheet : [];
    var qs   = sheet && Array.isArray(sheet.questions) ? sheet.questions : [];
    if (!rows.length) return;

    var header = ['Rank','Name','Telegram','Score','Correct','Wrong','Skipped','Accuracy%','Time(sec)'];
    qs.forEach(function(_, i) { header.push('Q'+(i+1)+'_Sel'); header.push('Q'+(i+1)+'_Ans'); });

    var csv = [header].concat(rows.map(function(s) {
      var base = [s.rank||'', s.name||'', s.telegram_username||'', s.score||0, s.correct||0, s.incorrect||0, s.unattempted||0, s.accuracy||0, s.time_taken||0];
      (Array.isArray(s.responses) ? s.responses : []).forEach(function(r) {
        base.push(r && r.selected_option !== undefined ? r.selected_option : '');
        base.push(r && r.correct_option  !== undefined ? r.correct_option  : '');
      });
      return base;
    })).map(function(r) { return r.join(','); }).join('\n');

    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'results_' + id + '.csv';
    a.click();
  }

  var card = { background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '20px', marginBottom: '16px' };
  var th = { padding: '12px', textAlign: 'left', color: '#7F8C8D', borderBottom: '2px solid #ECF0F1', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.85rem' };
  var td = { padding: '12px', borderBottom: '1px solid #ECF0F1', verticalAlign: 'middle', fontSize: '0.9rem' };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #ECF0F1', borderTop: '4px solid #E67E22', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: '#7F8C8D' }}>Results load ho rahe hain...</p>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (errorMsg) return (
    <div style={{ padding: '24px' }}>
      <div style={{ padding: '16px 20px', background: '#FDEDEC', border: '1px solid #FADBD8', borderRadius: '8px', color: '#C0392B' }}>
        ⚠️ {errorMsg}
      </div>
      <button onClick={function() { navigate('/admin/tests'); }} style={{ marginTop: '16px', padding: '10px 20px', background: '#2C3E50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        ← Tests par wapas jao
      </button>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={function() { navigate(-1); }} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #BDC3C7', borderRadius: '6px', cursor: 'pointer', color: '#7F8C8D' }}>← Back</button>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2C3E50', margin: '0 0 2px' }}>📊 Test Results</h1>
          <p style={{ color: '#7F8C8D', margin: 0, fontSize: '0.85rem' }}>ID: {id}</p>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Students',     val: analytics.total_students || 0 },
            { label: 'Avg Score',    val: analytics.average_score  || 0 },
            { label: 'Highest',      val: analytics.highest_score  || 0 },
            { label: 'Avg Accuracy', val: (analytics.average_accuracy || 0) + '%' },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: 'white', borderRadius: '8px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2C3E50' }}>{s.val}</div>
                <div style={{ color: '#7F8C8D', fontSize: '0.85rem', marginTop: '4px' }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[['leaderboard','🏆 Leaderboard'],['sheet','📋 Response Sheet'],['distribution','📊 Distribution']].map(function(t) {
          return (
            <button key={t[0]} onClick={function() { setTab(t[0]); }} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #BDC3C7', background: tab === t[0] ? '#E67E22' : 'transparent', color: tab === t[0] ? 'white' : '#34495E', fontWeight: tab === t[0] ? '700' : '400' }}>
              {t[1]}
            </button>
          );
        })}
        <button onClick={exportCSV} disabled={!sheet || !Array.isArray(sheet.sheet) || sheet.sheet.length === 0} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: '#27AE60', color: 'white', fontWeight: '600', marginLeft: 'auto', opacity: (!sheet || !Array.isArray(sheet.sheet) || sheet.sheet.length === 0) ? 0.5 : 1 }}>
          ⬇️ Export CSV
        </button>
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div style={card}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>Koi submission nahi mili abhi tak.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Rank','Name','Telegram','Score','✅','❌','⬜','Accuracy','Time'].map(function(h) {
                      return <th key={h} style={th}>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(function(s, i) {
                    var rank = s.rank || (i + 1);
                    var medal = { 1: '#F1C40F', 2: '#BDC3C7', 3: '#CD7F32' };
                    return (
                      <tr key={s._id || i} onMouseEnter={function(e) { e.currentTarget.style.background = '#FAFAFA'; }} onMouseLeave={function(e) { e.currentTarget.style.background = ''; }}>
                        <td style={td}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: medal[rank] || '#ECF0F1', fontWeight: '700', fontSize: '12px' }}>{rank}</span>
                        </td>
                        <td style={td}><strong>{s.name || '—'}</strong></td>
                        <td style={Object.assign({}, td, { color: '#95A5A6' })}>@{s.telegram_username || '—'}</td>
                        <td style={td}><strong style={{ color: '#E67E22' }}>{s.score || 0}/{s.total || 0}</strong></td>
                        <td style={Object.assign({}, td, { color: '#27AE60' })}>{s.correct || 0}</td>
                        <td style={Object.assign({}, td, { color: '#E74C3C' })}>{s.incorrect || 0}</td>
                        <td style={Object.assign({}, td, { color: '#E67E22' })}>{s.unattempted || 0}</td>
                        <td style={td}>{s.accuracy || 0}%</td>
                        <td style={td}>{formatTime(s.time_taken)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Response Sheet */}
      {tab === 'sheet' && (
        <div style={card}>
          {!sheet || !Array.isArray(sheet.sheet) || sheet.sheet.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>Response sheet available nahi hai.</div>
          ) : (
            sheet.sheet.map(function(s, i) {
              var open = expandedRow === i;
              return (
                <div key={i} style={{ border: '1px solid #BDC3C7', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                  <div onClick={function() { setExpandedRow(open ? null : i); }} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: open ? '#FEF9E7' : 'white' }}>
                    <div><strong>{s.name || '—'}</strong><span style={{ marginLeft: '10px', color: '#95A5A6', fontSize: '0.9rem' }}>@{s.telegram_username || '—'}</span></div>
                    <div><strong style={{ color: '#E67E22' }}>{s.score || 0} marks</strong> <span style={{ marginLeft: '8px' }}>{open ? '▲' : '▼'}</span></div>
                  </div>
                  {open && (
                    <div style={{ padding: '16px', borderTop: '1px solid #ECF0F1' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '8px', marginBottom: '12px' }}>
                        {[['Score', (s.score||0)+'/'+(s.total||0)], ['Correct', s.correct||0], ['Wrong', s.incorrect||0], ['Skipped', s.unattempted||0], ['Accuracy', (s.accuracy||0)+'%'], ['Time', formatTime(s.time_taken)]].map(function(item) {
                          return (
                            <div key={item[0]} style={{ textAlign: 'center', padding: '8px', background: '#F8F9FA', borderRadius: '6px' }}>
                              <div style={{ fontWeight: '700' }}>{item[1]}</div>
                              <div style={{ fontSize: '0.78rem', color: '#7F8C8D' }}>{item[0]}</div>
                            </div>
                          );
                        })}
                      </div>
                      {Array.isArray(s.responses) && s.responses.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead><tr style={{ background: '#F8F9FA' }}>
                              {['Q#','Selected','Correct','Result'].map(function(h) { return <th key={h} style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>{h}</th>; })}
                            </tr></thead>
                            <tbody>
                              {s.responses.map(function(r, ri) {
                                var ok = r && r.is_correct;
                                var sk = r && r.is_skipped;
                                return (
                                  <tr key={ri} style={{ background: ok ? '#EAFAF1' : sk ? '#FDFEFE' : '#FDEDEC' }}>
                                    <td style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>Q{ri+1}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>{r && r.selected_option !== undefined ? r.selected_option : '—'}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>{r && r.correct_option  !== undefined ? r.correct_option  : '—'}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ECF0F1', textAlign: 'center' }}>{sk ? '⬜' : ok ? '✅' : '❌'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Distribution */}
      {tab === 'distribution' && (
        <div style={card}>
          {!analytics || !Array.isArray(analytics.score_distribution) || analytics.score_distribution.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#95A5A6' }}>Distribution data nahi hai.</div>
          ) : (
            <div>
              <h3 style={{ marginBottom: '16px', color: '#2C3E50' }}>Score Distribution</h3>
              {analytics.score_distribution.map(function(d, i) {
                var pct = analytics.total_students > 0 ? Math.round((d.count / analytics.total_students) * 100) : 0;
                return (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                      <span>{d.range || d.label || 'Range '+(i+1)}</span>
                      <span style={{ fontWeight: '700' }}>{d.count||0} students ({pct}%)</span>
                    </div>
                    <div style={{ background: '#ECF0F1', borderRadius: '4px', height: '10px' }}>
                      <div style={{ width: pct+'%', height: '100%', background: '#E67E22', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultsAdmin;
