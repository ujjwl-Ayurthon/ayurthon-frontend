import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, MessageCircle, Mail, X, HelpCircle, Zap, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — change only these two lines if needed
// ─────────────────────────────────────────────────────────────────────────────
var SUPPORT_WHATSAPP = "916394099898";
var SUPPORT_EMAIL    = "ujjawal9431@gmail.com";
var API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "https://ayurthon-backend.onrender.com";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS — localStorage keys match backend expectations exactly
// Admin  header: x-admin-token   | key: admin_token
// Student header: x-student-token | key: student_token  (NO JWT, NO Bearer)
// ─────────────────────────────────────────────────────────────────────────────
function getStudentToken() {
  try { return localStorage.getItem("ayurthon_student_token") || ""; } catch(e) { return ""; }
}
function saveStudentSession(token, user) {
  try { localStorage.setItem("ayurthon_student_token", token); localStorage.setItem("student_user", JSON.stringify(user || {})); } catch(e) {}
}
function isStudentLoggedIn() {
  var t = getStudentToken(); return !!(t && t.length > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// API FETCH — returns { ok, status, data } — never throws
// ─────────────────────────────────────────────────────────────────────────────
function apiFetch(path, options) {
  return fetch(API_BASE + path, options || {})
    .then(function(res) {
      var status = res.status;
      return res.json()
        .then(function(data) { return { ok: res.ok, status: status, data: data }; })
        .catch(function() { return { ok: res.ok, status: status, data: {} }; });
    })
    .catch(function(err) {
      return { ok: false, status: 0, data: { message: "Network error: " + (err.message || "Server unreachable") } };
    });
}

// Extract token from various backend response shapes
function extractToken(data) {
  return data.token || (data.data && data.data.token) || (data.result && data.result.token) || "";
}
function extractStudentObj(data) {
  return data.student || data.user || data.data || {};
}

// ─────────────────────────────────────────────────────────────────────────────
// HELP WIDGET
// ─────────────────────────────────────────────────────────────────────────────
function HelpWidget() {
  var s = useState(false); var isOpen = s[0]; var setIsOpen = s[1];
  function openWA() { window.open("https://wa.me/" + SUPPORT_WHATSAPP + "?text=" + encodeURIComponent("Namaste! Ayurthon login mein madad chahiye."), "_blank"); }
  function openMail() { window.open("mailto:" + SUPPORT_EMAIL + "?subject=Ayurthon%20Login%20Help", "_blank"); }

  return (
    <div style={{ position: "fixed", bottom: "28px", right: "24px", zIndex: 999 }}>
      {isOpen && (
        <div style={{ position: "absolute", bottom: "64px", right: "0", width: "262px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.72)", borderRadius: "18px", boxShadow: "0 20px 60px rgba(15,23,42,0.14)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div><div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", fontFamily: "Georgia,serif" }}>Need Help?</div><div style={{ fontSize: "11px", color: "#64748b" }}>2 ghante mein reply milega</div></div>
            <button onClick={function() { setIsOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={16} /></button>
          </div>
          <button onClick={openWA} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(37,211,102,0.25)", background: "rgba(37,211,102,0.08)", cursor: "pointer", marginBottom: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageCircle size={18} color="white" fill="white" /></div>
            <div style={{ textAlign: "left" }}><div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>WhatsApp</div><div style={{ fontSize: "11px", color: "#64748b" }}>Dr. Ujjawal se baat karo</div></div>
          </button>
          <button onClick={openMail} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(13,148,136,0.22)", background: "rgba(13,148,136,0.07)", cursor: "pointer" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#0D9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Mail size={18} color="white" /></div>
            <div style={{ textAlign: "left" }}><div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Email Support</div><div style={{ fontSize: "11px", color: "#64748b" }}>ujjawal9431@gmail.com</div></div>
          </button>
          <div style={{ marginTop: "14px", textAlign: "center", fontSize: "11px", color: "#94a3b8" }}>Powered by Ayurthon ✦</div>
        </div>
      )}
      <button onClick={function() { setIsOpen(!isOpen); }} style={{ width: "52px", height: "52px", borderRadius: "50%", border: "none", background: isOpen ? "linear-gradient(135deg,#475569,#334155)" : "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", cursor: "pointer", boxShadow: "0 8px 24px rgba(13,148,136,0.40)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isOpen ? <X size={20} /> : <HelpCircle size={22} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT LOGIN
// ─────────────────────────────────────────────────────────────────────────────
function StudentLogin() {
  var navigate = useNavigate();
  var modeS = useState("login");    var mode = modeS[0]; var setMode = modeS[1];
  var loadS = useState(false);      var loading = loadS[0]; var setLoading = loadS[1];
  var errS  = useState("");         var error = errS[0]; var setError = errS[1];
  var showS = useState(false);      var showPass = showS[0]; var setShowPass = showS[1];
  var formS = useState({ name: "", telegram_username: "", password: "", confirm_password: "" });
  var form = formS[0]; var setForm = formS[1];

  useEffect(function() {
    var token = getStudentToken();
    if (!token) return;
    // Validate token with backend — never redirect on stale/empty token
    fetch(API_BASE + "/api/auth/me", {
      headers: { "Content-Type": "application/json", "x-student-token": token }
    })
      .then(function(res) {
        if (res.ok) {
          navigate("/student/dashboard", { replace: true });
        } else {
          try { localStorage.removeItem("ayurthon_student_token"); localStorage.removeItem("student_user"); } catch(e) {}
        }
      })
      .catch(function() { /* network error - stay on login */ });
  }, []);

  function resetForm() {
    setForm({ name: "", telegram_username: "", password: "", confirm_password: "" });
    setError(""); setShowPass(false);
  }

  function setField(field) {
    return function(e) { setForm(Object.assign({}, form, { [field]: e.target.value })); if (error) setError(""); };
  }

  function validate() {
    if (!form.telegram_username.trim()) { setError("Telegram username required hai."); return false; }
    if (!form.password)                 { setError("Password required hai."); return false; }
    if (mode === "register") {
      if (!form.name.trim())            { setError("Apna naam required hai."); return false; }
      if (form.password.length < 6)     { setError("Password minimum 6 characters hona chahiye."); return false; }
      if (form.password !== form.confirm_password) { setError("Dono passwords match nahi kar rahe."); return false; }
    }
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;
    setLoading(true); setError("");
    var username = form.telegram_username.toLowerCase().trim().replace(/^@/, "");
    var endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    var body = mode === "login"
      ? { telegram_username: username, password: form.password }
      : { name: form.name.trim(), telegram_username: username, password: form.password };

    apiFetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function(result) {
        setLoading(false);
        if (result.status === 0) {
          setError("Server se connect nahi ho pa raha. Internet check karo. (Render cold start mein 30 sec lag sakta hai — dobara try karo.)");
          return;
        }
        var token = extractToken(result.data);
        if (token && token.length > 0) {
          saveStudentSession(token, extractStudentObj(result.data));
          navigate("/student/dashboard", { replace: true });
        } else {
          var msg = result.data.message || result.data.error || result.data.msg || "";
          if (!msg) {
            if (result.status === 401) msg = "Username ya password galat hai. Dobara check karo.";
            else if (result.status === 404) msg = "Yeh username registered nahi hai. Pehle register karo.";
            else if (result.status === 409) msg = "Yeh username pehle se registered hai. Login karo ya alag username try karo.";
            else msg = "Kuch galat ho gaya (HTTP " + result.status + "). Thodi der baad retry karo.";
          }
          setError(msg);
        }
      });
  }

  function onKey(e) { if (e.key === "Enter" && !loading) handleSubmit(); }

  var inp = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid rgba(13,148,136,0.18)", background: "rgba(255,255,255,0.65)", fontSize: "14px", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  var lbl = { fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "6px", display: "block", letterSpacing: "0.5px", textTransform: "uppercase" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#F1F5F9 0%,#e8f4f1 40%,#F1F5F9 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: "24px" }}>
      <div style={{ position: "fixed", top: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(13,148,136,0.10) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-60px", right: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle,rgba(212,175,55,0.09) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div onClick={function() { navigate("/"); }} style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "8px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg,#0D9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={20} color="white" /></div>
            <span style={{ fontFamily: "Georgia,serif", fontWeight: "700", fontSize: "22px", color: "#0f172a" }}>AYURTHON</span>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>by Dr. Ujjawal Pratap Singh</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.65)", borderRadius: "24px", boxShadow: "0 24px 64px rgba(13,148,136,0.12), 0 1px 0 rgba(255,255,255,0.9) inset", padding: "36px 32px" }}>
          <div style={{ display: "flex", background: "rgba(241,245,249,0.80)", borderRadius: "12px", padding: "4px", marginBottom: "28px" }}>
            {["login","register"].map(function(m) {
              return (<button key={m} onClick={function() { setMode(m); resetForm(); }} style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "none", background: mode === m ? "white" : "transparent", color: mode === m ? "#0D9488" : "#64748b", fontWeight: mode === m ? "700" : "500", fontSize: "13px", cursor: "pointer", boxShadow: mode === m ? "0 2px 8px rgba(15,23,42,0.08)" : "none", transition: "all 0.2s" }}>
                {m === "login" ? "Login" : "Register"}
              </button>);
            })}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>{mode === "login" ? "Welcome Back 👋" : "Join Ayurthon 🚀"}</h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>{mode === "login" ? "Apne Telegram username se login karo." : "Free account banao, practice shuru karo."}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "register" && (
              <div><label style={lbl}>Full Name</label><input value={form.name} onChange={setField("name")} onKeyDown={onKey} placeholder="Dr. Aapka Naam" style={inp} autoComplete="name" /></div>
            )}
            <div>
              <label style={lbl}>Telegram Username</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px", fontWeight: "600", pointerEvents: "none" }}>@</span>
                <input value={form.telegram_username} onChange={setField("telegram_username")} onKeyDown={onKey} placeholder="your_username" style={Object.assign({}, inp, { paddingLeft: "30px" })} autoComplete="username" autoCapitalize="none" spellCheck={false} />
              </div>
            </div>
            <div>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password} onChange={setField("password")} onKeyDown={onKey} placeholder="••••••••" style={Object.assign({}, inp, { paddingRight: "44px" })} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                <button onClick={function() { setShowPass(!showPass); }} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: "0" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div><label style={lbl}>Confirm Password</label><input type="password" value={form.confirm_password} onChange={setField("confirm_password")} onKeyDown={onKey} placeholder="••••••••" style={inp} autoComplete="new-password" /></div>
            )}
          </div>

          {error && (
            <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "10px", background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.20)", color: "#be123c", fontSize: "13px", lineHeight: "1.55" }}>{error}</div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", marginTop: "24px", padding: "14px", borderRadius: "12px", border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 8px 24px rgba(13,148,136,0.30)" }}>
            {loading ? "Please wait..." : (<><Zap size={16} />{mode === "login" ? "Login" : "Create Account"}<ChevronRight size={16} /></>)}
          </button>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
            {mode === "login"
              ? (<span>Account nahi hai?{" "}<button onClick={function() { setMode("register"); resetForm(); }} style={{ background: "none", border: "none", color: "#0D9488", fontWeight: "700", cursor: "pointer", fontSize: "13px", padding: "0" }}>Register karo</button></span>)
              : (<span>Pehle se account hai?{" "}<button onClick={function() { setMode("login"); resetForm(); }} style={{ background: "none", border: "none", color: "#0D9488", fontWeight: "700", cursor: "pointer", fontSize: "13px", padding: "0" }}>Login karo</button></span>)
            }
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={function() { navigate("/"); }} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>← Wapas Home par jaao</button>
        </div>
      </div>
      <HelpWidget />
    </div>
  );
}

export default StudentLogin;
