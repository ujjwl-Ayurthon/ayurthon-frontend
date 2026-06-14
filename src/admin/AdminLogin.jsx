import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Lock, Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — sirf yeh ek line change karo agar API URL alag ho
// ─────────────────────────────────────────────────────────────────────────────
var API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "https://ayurthon-backend.onrender.com";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — sab inline, koi external import nahi
// Admin auth: localStorage key "admin_token", header "x-admin-token"
// NO JWT, NO Bearer — custom token as per PROJECT_HANDOFF.md
// ─────────────────────────────────────────────────────────────────────────────
function saveAdminToken(token) {
  try { localStorage.setItem("admin_token", token); } catch (e) {}
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

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN LOGIN
// ─────────────────────────────────────────────────────────────────────────────
function AdminLogin() {
  var navigate = useNavigate();

  var pwArr = useState("");
  var password = pwArr[0];
  var setPassword = pwArr[1];

  var showArr = useState(false);
  var showPass = showArr[0];
  var setShowPass = showArr[1];

  var loadArr = useState(false);
  var loading = loadArr[0];
  var setLoading = loadArr[1];

  var errArr = useState("");
  var error = errArr[0];
  var setError = errArr[1];

  function handleLogin() {
    if (!password.trim()) { setError("Password required hai."); return; }
    setLoading(true);
    setError("");

    apiFetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password }),
    }).then(function (result) {
      setLoading(false);

      if (result.status === 0) {
        setError("Server se connect nahi ho pa raha. Internet check karo ya Render backend wake-up ka wait karo (~30 sec), phir retry karo.");
        return;
      }

      // Token extraction — handles { token }, { data: { token } }, { adminToken }
      var token = result.data.token
        || result.data.adminToken
        || (result.data.data && result.data.data.token)
        || "";

      if (token && token.length > 3) {
        saveAdminToken(token);
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      // No token — show backend message or map HTTP status
      var msg = result.data.message || result.data.error || result.data.msg || "";
      if (!msg) {
        if (result.status === 401 || result.status === 403) msg = "Password galat hai.";
        else if (result.status === 404) msg = "Login route nahi mila (HTTP 404). Backend check karo.";
        else msg = "Login fail ho gaya (HTTP " + result.status + "). Dobara try karo.";
      }
      setError(msg);
    });
  }

  function onKey(e) {
    if (e.key === "Enter" && !loading) handleLogin();
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  var pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(145deg,#F1F5F9 0%,#e8f4f1 40%,#F1F5F9 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  };

  var cardStyle = {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.65)",
    borderRadius: "24px",
    boxShadow: "0 24px 64px rgba(13,148,136,0.12), 0 1px 0 rgba(255,255,255,0.9) inset",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "400px",
    position: "relative",
    zIndex: 1,
  };

  var inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid rgba(13,148,136,0.20)",
    background: "rgba(255,255,255,0.65)",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  var btnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    marginTop: "24px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: loading ? "#94a3b8" : "linear-gradient(135deg,#0D9488,#0f766e)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: loading ? "none" : "0 8px 24px rgba(13,148,136,0.30)",
    transition: "all 0.2s",
  };

  return (
    <div style={pageStyle}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", top: "-100px", left: "-100px", width: "450px", height: "450px", borderRadius: "50%", background: "radial-gradient(circle,rgba(13,148,136,0.10) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-80px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle,rgba(212,175,55,0.09) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg,#0D9488,#0f766e)", marginBottom: "14px", boxShadow: "0 8px 24px rgba(13,148,136,0.30)" }}>
            <BookOpen size={24} color="white" />
          </div>
          <div style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: "700", fontSize: "20px", color: "#0f172a", letterSpacing: "-0.3px" }}>AYURTHON</div>
          <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "3px" }}>Admin Panel</div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Lock size={16} color="#0D9488" />
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0" }}>Admin Login</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>Apna admin password enter karo.</p>
        </div>

        {/* Password field */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "6px", display: "block", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Admin Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={function (e) { setPassword(e.target.value); if (error) setError(""); }}
              onKeyDown={onKey}
              placeholder="••••••••••••"
              style={Object.assign({}, inputStyle, { paddingRight: "44px" })}
              autoComplete="current-password"
              autoFocus
            />
            <button
              onClick={function () { setShowPass(!showPass); }}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: "0" }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "10px", background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.20)", color: "#be123c", fontSize: "13px", lineHeight: "1.55" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleLogin} disabled={loading} style={btnStyle}>
          {loading ? (
            <span>Logging in...</span>
          ) : (
            <>
              <Zap size={16} />
              Login to Admin Panel
            </>
          )}
        </button>

        {/* Footer note */}
        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#94a3b8" }}>
          Students ke liye:{" "}
          <span
            onClick={function () { navigate("/student/login"); }}
            style={{ color: "#0D9488", fontWeight: "600", cursor: "pointer" }}
          >
            Student Login →
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
