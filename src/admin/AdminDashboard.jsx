import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, ClipboardList, BarChart2, RefreshCw,
  Eye, EyeOff, Copy, CheckCircle, Search, X, AlertTriangle,
  TrendingUp, Activity,
} from "lucide-react";

var API_URL = import.meta.env.VITE_API_URL || "https://ayurthon-backend.onrender.com";

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function getAdminToken() {
  return localStorage.getItem("admin_token") || "";
}

function adminHeaders() {
  return { "Content-Type": "application/json", "x-admin-token": getAdminToken() };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

// ─────────────────────────────────────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard(props) {
  return (
    <div style={Object.assign({
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.62)",
      borderRadius: "18px",
      boxShadow: "0 8px 32px rgba(15,23,42,0.07), 0 1px 0 rgba(255,255,255,0.85) inset",
      padding: "24px",
    }, props.style || {})}>
      {props.children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ResetPasswordModal(props) {
  var student = props.student;
  var onClose = props.onClose;

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var resultState = useState(null);
  var result = resultState[0];
  var setResult = resultState[1];

  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];

  var copiedState = useState(false);
  var copied = copiedState[0];
  var setCopied = copiedState[1];

  var showPassState = useState(false);
  var showPass = showPassState[0];
  var setShowPass = showPassState[1];

  function handleReset() {
    setLoading(true);
    setError("");
    fetch(API_URL + "/api/students/" + student._id + "/reset-password", {
      method: "POST",
      headers: adminHeaders(),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setLoading(false);
        if (data.new_password) {
          setResult(data.new_password);
        } else {
          setError(data.message || data.error || "Reset failed. Try again.");
        }
      })
      .catch(function() {
        setLoading(false);
        setError("Server error. Try again.");
      });
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(function() {
      setCopied(true);
      setTimeout(function() { setCopied(false); }, 2000);
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
      <div style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.70)", borderRadius: "22px", boxShadow: "0 32px 80px rgba(15,23,42,0.18)", padding: "32px", width: "100%", maxWidth: "400px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(241,245,249,0.80)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><X size={16} /></button>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
            <RefreshCw size={22} color="#92700a" />
          </div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>Reset Password</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>
            Student: <strong style={{ color: "#0f172a" }}>@{student.telegram_username}</strong> ({student.name})
          </p>
        </div>

        {!result ? (
          <>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)", borderRadius: "12px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "24px" }}>
              <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "12px", color: "#92400e", margin: "0", lineHeight: "1.6" }}>Ek random password generate hoga. Purana password immediately invalid ho jaega. Yeh password student ko share karna hoga.</p>
            </div>
            {error && (
              <div style={{ background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.18)", borderRadius: "10px", padding: "10px 14px", color: "#be123c", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "11px", border: "1.5px solid #e2e8f0", background: "transparent", color: "#475569", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleReset} disabled={loading} style={{ flex: 1, padding: "12px", borderRadius: "11px", border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#D4AF37,#b8941f)", color: "#0f172a", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 18px rgba(212,175,55,0.35)" }}>
                {loading ? "Generating..." : "Generate New Password"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(13,148,136,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <CheckCircle size={24} color="#0D9488" />
              </div>
              <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 16px" }}>Password successfully reset! Yeh student ko share karo:</p>
            </div>

            <div style={{ background: "rgba(13,148,136,0.06)", border: "1.5px solid rgba(13,148,136,0.22)", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700", color: "#0f172a", letterSpacing: "1px", flex: 1 }}>
                {showPass ? result : "•".repeat(result.length)}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={function() { setShowPass(!showPass); }} style={{ background: "rgba(241,245,249,0.80)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={handleCopy} style={{ background: copied ? "rgba(13,148,136,0.12)" : "rgba(241,245,249,0.80)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copied ? "#0D9488" : "#64748b" }}>
                  {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: "11px", border: "none", background: "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 6px 18px rgba(13,148,136,0.30)" }}>Done</button>
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
  var studentsState = useState([]);
  var students = studentsState[0];
  var setStudents = studentsState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];

  var searchState = useState("");
  var search = searchState[0];
  var setSearch = searchState[1];

  var resetStudentState = useState(null);
  var resetStudent = resetStudentState[0];
  var setResetStudent = resetStudentState[1];

  function fetchStudents() {
    setLoading(true);
    setError("");
    fetch(API_URL + "/api/students", { headers: adminHeaders() })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setLoading(false);
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (data.students) {
          setStudents(data.students);
        } else {
          setError(data.message || "Students fetch nahi ho sakey.");
        }
      })
      .catch(function() {
        setLoading(false);
        setError("Server error. Retry karo.");
      });
  }

  useEffect(function() { fetchStudents(); }, []);

  var filtered = students.filter(function(s) {
    if (!search.trim()) return true;
    var q = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.telegram_username || "").toLowerCase().includes(q)
    );
  });

  var thStyle = {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(226,232,240,0.80)",
    background: "rgba(248,250,252,0.60)",
    whiteSpace: "nowrap",
  };

  var tdStyle = {
    padding: "12px 14px",
    fontSize: "13px",
    color: "#0f172a",
    borderBottom: "1px solid rgba(226,232,240,0.60)",
    verticalAlign: "middle",
  };

  return (
    <GlassCard style={{ padding: "0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid rgba(226,232,240,0.60)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(13,148,136,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={18} color="#0D9488" />
          </div>
          <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Student Management</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>{students.length} registered students</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={function(e) { setSearch(e.target.value); }}
              placeholder="Name ya username..."
              style={{ paddingLeft: "34px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px", borderRadius: "10px", border: "1.5px solid rgba(226,232,240,0.80)", background: "rgba(248,250,252,0.70)", fontSize: "13px", color: "#0f172a", outline: "none", width: "180px" }}
            />
          </div>
          {/* Refresh */}
          <button onClick={fetchStudents} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", border: "1.5px solid rgba(13,148,136,0.22)", background: "rgba(13,148,136,0.07)", color: "#0D9488", fontSize: "13px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "12px", color: "#0D9488" }} />
          <br />Students load ho rahe hain...
        </div>
      ) : error ? (
        <div style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ color: "#be123c", fontSize: "14px", marginBottom: "12px" }}>{error}</div>
          <button onClick={fetchStudents} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", fontSize: "13px", cursor: "pointer" }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
          {search ? "Koi student nahi mila is search ke liye." : "Abhi tak koi student register nahi hua."}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Telegram Username</th>
                <th style={thStyle}>Registered On</th>
                <th style={thStyle}>Tests</th>
                <th style={thStyle}>Status</th>
                <th style={Object.assign({}, thStyle, { textAlign: "center" })}>Reset Password</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(function(student, idx) {
                return (
                  <tr key={student._id} style={{ transition: "background 0.1s" }}
                    onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(13,148,136,0.03)"; }}
                    onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={Object.assign({}, tdStyle, { color: "#94a3b8", fontWeight: "600", width: "40px" })}>{idx + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: student.avatar_color || "linear-gradient(135deg,#0D9488,#D4AF37)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
                          {(student.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: "600", color: "#0f172a" }}>{student.name || "—"}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: "monospace", background: "rgba(13,148,136,0.08)", color: "#0D9488", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                        @{student.telegram_username}
                      </span>
                    </td>
                    <td style={Object.assign({}, tdStyle, { color: "#64748b" })}>{formatDate(student.createdAt)}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>
                        {(student.attempts && student.attempts.length) || 0}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "700",
                        background: student.is_active !== false ? "rgba(13,148,136,0.10)" : "rgba(225,29,72,0.08)",
                        color: student.is_active !== false ? "#0D9488" : "#be123c",
                        border: "1px solid",
                        borderColor: student.is_active !== false ? "rgba(13,148,136,0.22)" : "rgba(225,29,72,0.18)",
                      }}>
                        {student.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={Object.assign({}, tdStyle, { textAlign: "center" })}>
                      <button
                        onClick={function() { setResetStudent(student); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "8px", border: "1.5px solid rgba(212,175,55,0.30)", background: "rgba(212,175,55,0.08)", color: "#92700a", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(212,175,55,0.18)"; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = "rgba(212,175,55,0.08)"; }}
                      >
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

      {/* Footer count */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(226,232,240,0.60)", fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>
          Showing {filtered.length} of {students.length} students
        </div>
      )}

      {/* Reset Modal */}
      {resetStudent && (
        <ResetPasswordModal
          student={resetStudent}
          onClose={function() { setResetStudent(null); }}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard(props) {
  return (
    <GlassCard style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>{props.label}</div>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: props.iconBg || "rgba(13,148,136,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <props.icon size={17} color={props.iconColor || "#0D9488"} />
        </div>
      </div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: "28px", fontWeight: "700", color: "#0f172a", lineHeight: "1" }}>
        {props.loading ? <span style={{ fontSize: "16px", color: "#94a3b8" }}>Loading...</span> : props.value}
      </div>
      {props.sub && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>{props.sub}</div>}
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  var navigate = useNavigate();

  var statsState = useState(null);
  var stats = statsState[0];
  var setStats = statsState[1];

  var statsLoadingState = useState(true);
  var statsLoading = statsLoadingState[0];
  var setStatsLoading = statsLoadingState[1];

  var activeTabState = useState("overview");
  var activeTab = activeTabState[0];
  var setActiveTab = activeTabState[1];

  var liveTestsState = useState([]);
  var liveTests = liveTestsState[0];
  var setLiveTests = liveTestsState[1];

  useEffect(function() {
    // Fetch question count stats
    fetch(API_URL + "/api/questions/stats/count", { headers: adminHeaders() })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(function() { setStatsLoading(false); });

    // Fetch live tests
    fetch(API_URL + "/api/tests", { headers: adminHeaders() })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var arr = Array.isArray(data) ? data : (data.tests || []);
        setLiveTests(arr.filter(function(t) { return t.status === "published"; }));
      })
      .catch(function() {});
  }, []);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  var tabs = [
    { id: "overview",  label: "Overview",           icon: BarChart2 },
    { id: "students",  label: "Student Management", icon: Users },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#F1F5F9 0%,#e8f4f1 40%,#F1F5F9 100%)", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      {/* Top Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(226,232,240,0.70)", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#0D9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={16} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>AYURTHON</div>
              <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.5px" }}>ADMIN PANEL</div>
            </div>
          </div>

          {/* Tab Nav */}
          <div style={{ display: "flex", gap: "4px" }}>
            {tabs.map(function(tab) {
              var Icon = tab.icon;
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", border: "none", background: activeTab === tab.id ? "rgba(13,148,136,0.12)" : "transparent", color: activeTab === tab.id ? "#0D9488" : "#64748b", fontSize: "13px", fontWeight: activeTab === tab.id ? "700" : "500", cursor: "pointer", transition: "all 0.15s" }}>
                  <Icon size={14} />{tab.label}
                </button>
              );
            })}
          </div>

          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: "9px", border: "1.5px solid #e2e8f0", background: "transparent", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 20px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>Dashboard Overview</h1>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>Platform ka ek nazar mein status.</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "28px" }}>
              <StatCard label="Total Questions" value={stats ? (stats.total || "—") : "—"} loading={statsLoading} icon={ClipboardList} />
              <StatCard label="Live Tests" value={liveTests.length} loading={false} icon={Activity} iconBg="rgba(212,175,55,0.12)" iconColor="#92700a" />
              <StatCard label="MCQ Questions" value={stats ? (stats.mcq || "—") : "—"} loading={statsLoading} icon={BookOpen} sub="Standard MCQs" />
              <StatCard label="Platform Health" value="99.9%" loading={false} icon={TrendingUp} iconBg="rgba(34,197,94,0.10)" iconColor="#16a34a" sub="Uptime" />
            </div>

            {/* Live Tests */}
            <GlassCard style={{ padding: "0", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(226,232,240,0.60)" }}>
                <div style={{ fontFamily: "Georgia,serif", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Live Tests Right Now</div>
              </div>
              {liveTests.length === 0 ? (
                <div style={{ padding: "36px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Abhi koi test published nahi hai.</div>
              ) : (
                <div style={{ padding: "12px 0" }}>
                  {liveTests.map(function(test) {
                    return (
                      <div key={test._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid rgba(226,232,240,0.40)", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{test.title}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{test.questions ? test.questions.length : "?"} Questions · {test.duration_minutes} min · +{test.correct_marks}/−{test.negative_marks}</div>
                        </div>
                        <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: "700", background: "rgba(13,148,136,0.10)", color: "#0D9488", border: "1px solid rgba(13,148,136,0.22)" }}>
                          🟢 Published
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>Student Management</h1>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>Saare registered students — password reset aur status dekho.</p>
            </div>
            <StudentManagement />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
