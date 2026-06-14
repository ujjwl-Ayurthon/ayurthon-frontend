import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, ClipboardList, BarChart2,
  RefreshCw, Eye, EyeOff, Copy, CheckCircle,
  Search, X, AlertTriangle, TrendingUp, Activity,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// INLINE CONFIG — zero local imports
// ─────────────────────────────────────────────────────────────────────────────
var API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "https://ayurthon-backend.onrender.com";

function getAdminToken() {
  try { return localStorage.getItem("admin_token") || ""; } catch (e) { return ""; }
}
function adminHeaders() {
  return { "Content-Type": "application/json", "x-admin-token": getAdminToken() };
}
function isAdminLoggedIn() {
  var t = getAdminToken(); return !!(t && t.length > 0);
}
function clearAdmin() {
  try { localStorage.removeItem("admin_token"); } catch (e) {}
}
function formatDate(str) {
  if (!str) return "—";
  try { return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }); }
  catch (e) { return "—"; }
}
function apiFetch(path, options) {
  return fetch(API_BASE + path, options || {})
    .then(function (res) {
      var status = res.status;
      return res.json()
        .then(function (data) { return { ok: res.ok, status: status, data: data }; })
        .catch(function () { return { ok: res.ok, status: status, data: {} }; });
    })
    .catch(function (err) {
      return { ok: false, status: 0, data: { message: "Network error: " + (err.message || "Server unreachable") } };
    });
}
function extractArray(data, keys) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  var ks = keys || ["students", "data", "result", "users", "tests", "list"];
  for (var i = 0; i < ks.length; i++) {
    if (data[ks[i]] && Array.isArray(data[ks[i]])) return data[ks[i]];
  }
  var all = Object.keys(data);
  for (var j = 0; j < all.length; j++) {
    if (Array.isArray(data[all[j]])) return data[all[j]];
  }
  return [];
}
function classifyError(result) {
  if (result.status === 0) return { isAuthError: false, message: "Server unreachable. Internet check karo ya Render cold start (~30 sec) ka wait karke Refresh karo." };
  if (result.status === 401 || result.status === 403) return { isAuthError: true, message: "Admin token invalid ya expire ho gaya. Logout karke dobara login karo." };
  if (result.status === 404) return { isAuthError: false, message: "API route nahi mila (HTTP 404). Backend mein route check karo." };
  var msg = (result.data && (result.data.message || result.data.error || result.data.msg)) || ("Server error HTTP " + result.status);
  return { isAuthError: false, message: msg };
}

// ─────────────────────────────────────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard(props) {
  return (
    <div style={Object.assign({ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.62)", borderRadius: "18px", boxShadow: "0 8px 32px rgba(15,23,42,0.07), 0 1px 0 rgba(255,255,255,0.85) inset", padding: "24px" }, props.style || {})}>
      {props.children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ResetPasswordModal(props) {
  var student = props.student; var onClose = props.onClose;
  var loadS = useState(false);  var loading  = loadS[0];  var setLoading  = loadS[1];
  var resS  = useState(null);   var result   = resS[0];   var setResult   = resS[1];
  var errS  = useState("");     var error    = errS[0];   var setError    = errS[1];
  var copS  = useState(false);  var copied   = copS[0];   var setCopied   = copS[1];
  var showS = useState(false);  var showPass = showS[0];  var setShowPass = showS[1];

  function handleReset() {
    setLoading(true); setError("");
    apiFetch("/api/students/" + student._id + "/reset-password", { method: "POST", headers: adminHeaders() })
      .then(function (r) {
        setLoading(false);
        var pw = r.data.new_password || r.data.newPassword || r.data.password || "";
        if (pw) { setResult(pw); }
        else { setError(classifyError(r).message); }
      });
  }
  function handleCopy() {
    if (!result) return;
    try { navigator.clipboard.writeText(result).then(function () { setCopied(true); setTimeout(function () { setCopied(false); }, 2200); }); }
    catch (e) { var el = document.createElement("textarea"); el.value = result; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); setCopied(true); setTimeout(function () { setCopied(false); }, 2200); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
      <div style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.72)", borderRadius: "22px", boxShadow: "0 32px 80px rgba(15,23,42,0.18)", padding: "32px", width: "100%", maxWidth: "400px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(241,245,249,0.80)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><X size={16} /></button>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}><RefreshCw size={22} color="#92700a" /></div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>Reset Password</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>Student: <strong style={{ color: "#0f172a" }}>@{student.telegram_username}</strong> ({student.name || "—"})</p>
        </div>
        {!result ? (
          <>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)", borderRadius: "12px", padding: "12px 16px", display: "flex", gap: "10px", marginBottom: "24px" }}>
              <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "12px", color: "#92400e", margin: "0", lineHeight: "1.6" }}>Ek random password generate hoga. Purana password turant invalid ho jaega.</p>
            </div>
            {error && <div style={{ background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.18)", borderRadius: "10px", padding: "10px 14px", color: "#be123c", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "11px", border: "1.5px solid #e2e8f0", background: "transparent", color: "#475569", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleReset} disabled={loading} style={{ flex: 1, padding: "12px", borderRadius: "11px", border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#D4AF37,#b8941f)", color: "#0f172a", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Generating..." : "Generate Password"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(13,148,136,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><CheckCircle size={24} color="#0D9488" /></div>
              <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 4px" }}>Password reset ho gaya! Student ko share karo:</p>
            </div>
            <div style={{ background: "rgba(13,148,136,0.06)", border: "1.5px solid rgba(13,148,136,0.22)", borderRadius: "12px", padding: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700", color: "#0f172a", letterSpacing: "2px", flex: 1, wordBreak: "break-all" }}>{showPass ? result : "•".repeat(result.length)}</span>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button onClick={function () { setShowPass(!showPass); }} style={{ background: "rgba(241,245,249,0.80)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button onClick={handleCopy} style={{ background: copied ? "rgba(13,148,136,0.12)" : "rgba(241,245,249,0.80)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copied ? "#0D9488" : "#64748b" }}>{copied ? <CheckCircle size={15} /> : <Copy size={15} />}</button>
              </div>
            </div>
            {copied && <div style={{ textAlign: "center", fontSize: "12px", color: "#0D9488", marginBottom: "14px", fontWeight: "600" }}>✓ Copied!</div>}
            <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: "11px", border: "none", background: "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Done</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT MANAGEMENT TABLE
// ─────────────────────────────────────────────────────────────────────────────
function StudentManagement() {
  var studS = useState([]);   var students = studS[0]; var setStudents = studS[1];
  var loadS = useState(true); var loading = loadS[0];  var setLoading  = loadS[1];
  var errS  = useState(null); var errInfo = errS[0];   var setErrInfo  = errS[1];
  var srchS = useState("");   var search  = srchS[0];  var setSearch   = srchS[1];
  var rstS  = useState(null); var resetSt = rstS[0];   var setResetSt  = rstS[1];

  function fetchStudents() {
    setLoading(true); setErrInfo(null);
    apiFetch("/api/students", { headers: adminHeaders() }).then(function (r) {
      setLoading(false);
      if (!r.ok) { setErrInfo(classifyError(r)); return; }
      var arr = extractArray(r.data, ["students", "data", "result", "users", "list"]);
      setStudents(arr);
    });
  }
  useEffect(function () { fetchStudents(); }, []);

  var filtered = students.filter(function (s) {
    if (!search.trim()) return true;
    var q = search.toLowerCase();
    return (s.name || "").toLowerCase().includes(q) || (s.telegram_username || "").toLowerCase().includes(q);
  });

  var th = { padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.6px", textTransform: "uppercase", borderBottom: "1px solid rgba(226,232,240,0.80)", background: "rgba(248,250,252,0.60)", whiteSpace: "nowrap" };
  var td = { padding: "12px 14px", fontSize: "13px", color: "#0f172a", borderBottom: "1px solid rgba(226,232,240,0.50)", verticalAlign: "middle" };

  return (
    <GlassCard style={{ padding: "0", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid rgba(226,232,240,0.60)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(13,148,136,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={18} color="#0D9488" /></div>
          <div><div style={{ fontFamily: "Georgia,serif", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Student Management</div><div style={{ fontSize: "11px", color: "#64748b" }}>{loading ? "Loading..." : students.length + " registered students"}</div></div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
            <input value={search} onChange={function (e) { setSearch(e.target.value); }} placeholder="Name ya username..." style={{ paddingLeft: "34px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px", borderRadius: "10px", border: "1.5px solid rgba(226,232,240,0.80)", background: "rgba(248,250,252,0.70)", fontSize: "13px", color: "#0f172a", outline: "none", width: "180px", boxSizing: "border-box" }} />
          </div>
          <button onClick={fetchStudents} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", border: "1.5px solid rgba(13,148,136,0.22)", background: "rgba(13,148,136,0.07)", color: "#0D9488", fontSize: "13px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "56px", textAlign: "center" }}><RefreshCw size={28} color="#0D9488" style={{ animation: "spin 1s linear infinite", marginBottom: "14px" }} /><div style={{ color: "#64748b", fontSize: "14px" }}>Students load ho rahe hain...</div></div>
      ) : errInfo ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <AlertTriangle size={28} color={errInfo.isAuthError ? "#be123c" : "#d97706"} style={{ marginBottom: "12px" }} />
          <div style={{ padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", background: errInfo.isAuthError ? "rgba(225,29,72,0.08)" : "rgba(245,158,11,0.08)", border: "1px solid " + (errInfo.isAuthError ? "rgba(225,29,72,0.20)" : "rgba(245,158,11,0.25)"), color: errInfo.isAuthError ? "#be123c" : "#92400e", fontSize: "13px", lineHeight: "1.6", textAlign: "left" }}>{errInfo.message}</div>
          {!errInfo.isAuthError && <button onClick={fetchStudents} style={{ padding: "9px 22px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Retry</button>}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "56px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>{search ? '"' + search + '" ke liye koi student nahi mila.' : "Abhi tak koi student register nahi hua."}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr><th style={th}>#</th><th style={th}>Name</th><th style={th}>Telegram Username</th><th style={th}>Registered On</th><th style={th}>Tests</th><th style={th}>Status</th><th style={Object.assign({}, th, { textAlign: "center" })}>Password Reset</th></tr>
            </thead>
            <tbody>
              {filtered.map(function (s, idx) {
                var attempts = Array.isArray(s.attempts) ? s.attempts.length : (s.attempts || 0);
                var active = s.is_active !== false;
                return (
                  <tr key={s._id || idx} onMouseEnter={function (e) { e.currentTarget.style.background = "rgba(13,148,136,0.03)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                    <td style={Object.assign({}, td, { color: "#94a3b8", fontWeight: "600", width: "36px" })}>{idx + 1}</td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: s.avatar_color || "linear-gradient(135deg,#0D9488,#D4AF37)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>{(s.name || s.telegram_username || "?").charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: "600" }}>{s.name || "—"}</span>
                      </div>
                    </td>
                    <td style={td}><span style={{ fontFamily: "monospace", background: "rgba(13,148,136,0.08)", color: "#0D9488", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>@{s.telegram_username}</span></td>
                    <td style={Object.assign({}, td, { color: "#64748b" })}>{formatDate(s.createdAt)}</td>
                    <td style={Object.assign({}, td, { fontWeight: "700" })}>{attempts}</td>
                    <td style={td}><span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "700", background: active ? "rgba(13,148,136,0.10)" : "rgba(225,29,72,0.08)", color: active ? "#0D9488" : "#be123c", border: "1px solid " + (active ? "rgba(13,148,136,0.22)" : "rgba(225,29,72,0.18)") }}>{active ? "Active" : "Inactive"}</span></td>
                    <td style={Object.assign({}, td, { textAlign: "center" })}>
                      <button onClick={function () { setResetSt(s); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "8px", border: "1.5px solid rgba(212,175,55,0.30)", background: "rgba(212,175,55,0.08)", color: "#92700a", fontSize: "12px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={function (e) { e.currentTarget.style.background = "rgba(212,175,55,0.18)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "rgba(212,175,55,0.08)"; }}>
                        <RefreshCw size={12} /> Reset
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !errInfo && filtered.length > 0 && <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(226,232,240,0.60)", fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{filtered.length} / {students.length} shown</div>}
      {resetSt && <ResetPasswordModal student={resetSt} onClose={function () { setResetSt(null); }} />}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard(props) {
  var Icon = props.icon;
  return (
    <GlassCard style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>{props.label}</div>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: props.iconBg || "rgba(13,148,136,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={17} color={props.iconColor || "#0D9488"} /></div>
      </div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: "28px", fontWeight: "700", color: "#0f172a", lineHeight: "1" }}>
        {props.loading ? <span style={{ fontSize: "16px", color: "#94a3b8" }}>—</span> : props.value}
      </div>
      {props.sub && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>{props.sub}</div>}
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — with auth guard on mount
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  var navigate = useNavigate();

  var authS  = useState("checking"); var authState = authS[0]; var setAuthState = authS[1];
  var statsS = useState(null);       var stats = statsS[0];    var setStats = statsS[1];
  var slS    = useState(true);       var statsLoading = slS[0]; var setStatsLoading = slS[1];
  var liveS  = useState([]);         var liveTests = liveS[0]; var setLiveTests = liveS[1];
  var tabS   = useState("overview"); var activeTab = tabS[0];  var setActiveTab = tabS[1];

  useEffect(function () {
    // ── Auth guard — runs ONCE on mount ──────────────────────────────────────
    // Check localStorage first (instant)
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    // Verify token with backend (confirms token is still valid)
    apiFetch("/api/questions/stats/count", { headers: adminHeaders() })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) {
          // Token expired on backend — clear and redirect
          clearAdmin();
          navigate("/admin/login", { replace: true });
          return;
        }
        // status 0 = network error — don't redirect, let dashboard show
        setAuthState("ok");
        if (r.ok) setStats(r.data);
        setStatsLoading(false);
      });

    // Fetch live tests (parallel)
    apiFetch("/api/tests", { headers: adminHeaders() })
      .then(function (r) {
        if (r.ok) {
          var arr = extractArray(r.data, ["tests", "data", "result"]);
          setLiveTests(arr.filter(function (t) { return t.status === "published"; }));
        }
      });
  }, []);

  function handleLogout() { clearAdmin(); navigate("/admin/login", { replace: true }); }

  var tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "students", label: "Student Management", icon: Users },
  ];

  // Show spinner while auth check runs
  if (authState === "checking") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#F1F5F9 0%,#e8f4f1 40%,#F1F5F9 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <RefreshCw size={32} color="#0D9488" style={{ animation: "spin 1s linear infinite", marginBottom: "16px" }} />
          <div style={{ color: "#64748b", fontSize: "14px" }}>Authenticating...</div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#F1F5F9 0%,#e8f4f1 40%,#F1F5F9 100%)", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      {/* Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(226,232,240,0.70)", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#0D9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={16} color="white" /></div>
            <div><div style={{ fontFamily: "Georgia,serif", fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>AYURTHON</div><div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.5px" }}>ADMIN PANEL</div></div>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {tabs.map(function (tab) {
              var Icon = tab.icon;
              return (<button key={tab.id} onClick={function () { setActiveTab(tab.id); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", border: "none", background: activeTab === tab.id ? "rgba(13,148,136,0.12)" : "transparent", color: activeTab === tab.id ? "#0D9488" : "#64748b", fontSize: "13px", fontWeight: activeTab === tab.id ? "700" : "500", cursor: "pointer" }}><Icon size={14} />{tab.label}</button>);
            })}
          </div>
          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: "9px", border: "1.5px solid #e2e8f0", background: "transparent", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 20px" }}>
        {activeTab === "overview" && (
          <div>
            <div style={{ marginBottom: "24px" }}><h1 style={{ fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>Dashboard Overview</h1><p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>Platform ka ek nazar mein status.</p></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "28px" }}>
              <StatCard label="Total Questions" value={stats ? (stats.total || 0) : 0} loading={statsLoading} icon={ClipboardList} />
              <StatCard label="Live Tests" value={liveTests.length} loading={false} icon={Activity} iconBg="rgba(212,175,55,0.12)" iconColor="#92700a" />
              <StatCard label="MCQ Questions" value={stats ? (stats.mcq || 0) : 0} loading={statsLoading} icon={BookOpen} sub="Standard MCQs" />
              <StatCard label="Platform Uptime" value="99.9%" loading={false} icon={TrendingUp} iconBg="rgba(34,197,94,0.10)" iconColor="#16a34a" sub="All systems go" />
            </div>
            <GlassCard style={{ padding: "0", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(226,232,240,0.60)" }}><div style={{ fontFamily: "Georgia,serif", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Live Tests Right Now</div></div>
              {liveTests.length === 0
                ? <div style={{ padding: "36px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Abhi koi test published nahi hai.</div>
                : <div style={{ padding: "8px 0" }}>{liveTests.map(function (test) {
                    return (<div key={test._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid rgba(226,232,240,0.40)", gap: "12px", flexWrap: "wrap" }}>
                      <div><div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{test.title}</div><div style={{ fontSize: "12px", color: "#64748b" }}>{Array.isArray(test.questions) ? test.questions.length : "?"} Qs · {test.duration_minutes} min · +{test.correct_marks}/−{test.negative_marks}</div></div>
                      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: "700", background: "rgba(13,148,136,0.10)", color: "#0D9488", border: "1px solid rgba(13,148,136,0.22)" }}>🟢 Published</span>
                    </div>);
                  })}</div>
              }
            </GlassCard>
          </div>
        )}
        {activeTab === "students" && (
          <div>
            <div style={{ marginBottom: "24px" }}><h1 style={{ fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>Student Management</h1><p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>Saare registered students — profile, status, password reset.</p></div>
            <StudentManagement />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
