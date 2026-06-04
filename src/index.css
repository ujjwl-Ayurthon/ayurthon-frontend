:root {
  --saffron:    #E8750A;
  --saffron-light: #FFF3E0;
  --green:      #2D6A4F;
  --green-light: #D8F3DC;
  --gold:       #B7950B;
  --dark:       #1A1A2E;
  --text:       #2C2C2C;
  --text-muted: #666;
  --bg:         #FAFAF7;
  --white:      #FFFFFF;
  --border:     #E5E5E0;
  --error:      #C0392B;
  --success:    #27AE60;
  --radius:     12px;
  --shadow:     0 2px 12px rgba(0,0,0,0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

/* Devanagari text */
.deva {
  font-family: 'Noto Sans Devanagari', 'Tiro Devanagari Sanskrit', serif;
  line-height: 1.8;
}

/* ── Layout ─────────────────────────────── */
.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.page { min-height: 100vh; padding: 24px 0; }

/* ── Navbar ─────────────────────────────── */
.navbar {
  background: var(--dark);
  color: white;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.navbar-brand {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--saffron);
  text-decoration: none;
}
.navbar-brand span { color: white; }
.navbar-links { display: flex; gap: 8px; }
.nav-link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.nav-link:hover, .nav-link.active {
  background: var(--saffron);
  color: white;
}

/* ── Cards ──────────────────────────────── */
.card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 24px;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--saffron-light);
}

/* ── Buttons ────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary  { background: var(--saffron); color: white; }
.btn-primary:hover:not(:disabled) { background: #c96a09; }
.btn-success  { background: var(--success); color: white; }
.btn-success:hover:not(:disabled) { background: #219a52; }
.btn-danger   { background: var(--error); color: white; }
.btn-outline  { background: transparent; border: 2px solid var(--saffron); color: var(--saffron); }
.btn-outline:hover { background: var(--saffron); color: white; }
.btn-sm { padding: 6px 14px; font-size: 0.82rem; }
.btn-lg { padding: 14px 28px; font-size: 1rem; }
.btn-full { width: 100%; justify-content: center; }

/* ── Form Elements ──────────────────────── */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 6px; }
.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border 0.2s;
  background: white;
}
.form-control:focus { outline: none; border-color: var(--saffron); }
textarea.form-control { resize: vertical; min-height: 180px; font-family: 'Noto Sans Devanagari', monospace; }
select.form-control { cursor: pointer; }

/* ── Badges ─────────────────────────────── */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-daily      { background: #FFF3CD; color: #856404; }
.badge-weekly     { background: #D1ECF1; color: #0C5460; }
.badge-diagnostic { background: #D4EDDA; color: #155724; }
.badge-grand      { background: #F8D7DA; color: #721C24; }
.badge-draft      { background: #E2E3E5; color: #383D41; }
.badge-published  { background: #D4EDDA; color: #155724; }
.badge-closed     { background: #F8D7DA; color: #721C24; }

/* ── Alerts ─────────────────────────────── */
.alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
.alert-error   { background: #FDE8E8; color: var(--error); border: 1px solid #f5c6cb; }
.alert-success { background: #D4EDDA; color: #155724; border: 1px solid #c3e6cb; }
.alert-info    { background: #D1ECF1; color: #0C5460; border: 1px solid #bee5eb; }

/* ── Tables ─────────────────────────────── */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { background: var(--dark); color: white; padding: 10px 14px; text-align: left; font-weight: 600; }
td { padding: 10px 14px; border-bottom: 1px solid var(--border); }
tr:hover td { background: var(--saffron-light); }

/* ── Stats grid ─────────────────────────── */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: var(--radius); border: 1px solid var(--border); padding: 16px; text-align: center; }
.stat-number { font-size: 2rem; font-weight: 800; color: var(--saffron); }
.stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }

/* ── Page header ────────────────────────── */
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--dark); }
.page-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 4px; }

/* ── Checkbox list ──────────────────────── */
.question-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.question-item:hover { border-color: var(--saffron); background: var(--saffron-light); }
.question-item.selected { border-color: var(--saffron); background: var(--saffron-light); }
.question-item input[type="checkbox"] { margin-top: 3px; width: 16px; height: 16px; accent-color: var(--saffron); }
.question-text { font-size: 0.92rem; font-family: 'Noto Sans Devanagari', sans-serif; line-height: 1.7; }

/* ── Loading ────────────────────────────── */
.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--saffron);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 40px auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-wrap { text-align: center; padding: 40px; color: var(--text-muted); }

/* ── CBT specific ───────────────────────── */
.cbt-header {
  background: var(--dark);
  color: white;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
}
.timer {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--saffron);
  font-variant-numeric: tabular-nums;
}
.timer.warning { color: #E74C3C; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0.5; } }

.option-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 18px;
  margin-bottom: 10px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: 'Noto Sans Devanagari', sans-serif;
  line-height: 1.7;
  transition: all 0.15s;
}
.option-btn:hover { border-color: var(--saffron); background: var(--saffron-light); }
.option-btn.selected { border-color: var(--saffron); background: var(--saffron-light); font-weight: 600; }
.option-btn.correct { border-color: var(--success); background: var(--green-light); }
.option-btn.incorrect { border-color: var(--error); background: #FDE8E8; }

.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 16px 0;
}
.q-nav-btn {
  width: 36px; height: 36px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.15s;
}
.q-nav-btn.answered { background: var(--saffron); color: white; border-color: var(--saffron); }
.q-nav-btn.current { border-color: var(--dark); border-width: 2.5px; }

/* ── Result page ────────────────────────── */
.result-hero {
  background: linear-gradient(135deg, var(--dark) 0%, #2D6A4F 100%);
  color: white;
  padding: 40px 24px;
  text-align: center;
  border-radius: var(--radius);
  margin-bottom: 24px;
}
.result-score { font-size: 3.5rem; font-weight: 900; color: var(--saffron); }
.result-rank  { font-size: 1.5rem; font-weight: 700; color: white; margin-top: 8px; }

/* ── Leaderboard ────────────────────────── */
.rank-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 50%;
  font-weight: 800; font-size: 0.85rem;
}
.rank-1 { background: #FFD700; color: #333; }
.rank-2 { background: #C0C0C0; color: #333; }
.rank-3 { background: #CD7F32; color: white; }
.rank-other { background: var(--border); color: var(--text-muted); }

/* ── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .navbar-links { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .card { padding: 16px; }
  .result-score { font-size: 2.5rem; }
}
