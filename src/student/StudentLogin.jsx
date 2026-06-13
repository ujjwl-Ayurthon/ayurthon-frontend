import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, MessageCircle, Mail, X, HelpCircle, Zap, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT CONFIG
// ─────────────────────────────────────────────────────────────────────────────
var SUPPORT_WHATSAPP = "916394099898";
var SUPPORT_EMAIL    = "ujjawal9431@gmail.com";
var API_URL          = import.meta.env.VITE_API_URL || "https://ayurthon-backend.onrender.com";

// ─────────────────────────────────────────────────────────────────────────────
// HELP WIDGET — same as LandingPage
// ─────────────────────────────────────────────────────────────────────────────
function HelpWidget() {
  var open = useState(false);
  var isOpen = open[0];
  var setIsOpen = open[1];

  function openWhatsApp() {
    var msg = encodeURIComponent("Namaste! Ayurthon login mein madad chahiye.");
    window.open("https://wa.me/" + SUPPORT_WHATSAPP + "?text=" + msg, "_blank");
  }
  function openEmail() {
    window.open("mailto:" + SUPPORT_EMAIL + "?subject=Ayurthon%20Login%20Help", "_blank");
  }

  return (
    <div style={{ position: "fixed", bottom: "28px", right: "24px", zIndex: 999 }}>
      {isOpen && (
        <div style={{ position: "absolute", bottom: "64px", right: "0", width: "260px", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.70)", borderRadius: "18px", boxShadow: "0 20px 60px rgba(15,23,42,0.14)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", fontFamily: "Georgia,serif" }}>Need Help?</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>We reply within 2 hours</div>
            </div>
            <button onClick={function() { setIsOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={16} /></button>
          </div>
          <button onClick={openWhatsApp} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(37,211,102,0.25)", background: "rgba(37,211,102,0.08)", cursor: "pointer", marginBottom: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageCircle size={18} color="white" fill="white" /></div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>WhatsApp</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Chat with Dr. Ujjawal</div>
            </div>
          </button>
          <button onClick={openEmail} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(13,148,136,0.22)", background: "rgba(13,148,136,0.07)", cursor: "pointer" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #0D9488, #0f766e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Mail size={18} color="white" /></div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Email Support</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>ujjawal9431@gmail.com</div>
            </div>
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
// STUDENT LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function StudentLogin() {
  var navigate = useNavigate();

  var modeState = useState("login");
  var mode = modeState[0];
  var setMode = modeState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];

  var showPassState = useState(false);
  var showPass = showPassState[0];
  var setShowPass = showPassState[1];

  var formState = useState({ name: "", telegram_username: "", password: "", confirm_password: "" });
  var form = formState[0];
  var setForm = formState[1];

  function handleChange(field) {
    return function(e) {
      setForm(Object.assign({}, form, { [field]: e.target.value }));
      setError("");
    };
  }

  function handleSubmit() {
    setError("");

    if (!form.telegram_username.trim() || !form.password.trim()) {
      setError("Username aur password dono required hain.");
      return;
    }
    if (mode === "register") {
      if (!form.name.trim()) { setError("Naam required hai."); return; }
      if (form.password !== form.confirm_password) { setError("Passwords match nahi kar rahe."); return; }
      if (form.password.length < 6) { setError("Password kam se kam 6 characters ka hona chahiye."); return; }
    }

    setLoading(true);

    var endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    var body = mode === "login"
      ? { telegram_username: form.telegram_username.toLowerCase().trim(), password: form.password }
      : { name: form.name.trim(), telegram_username: form.telegram_username.toLowerCase().trim(), password: form.password };

    fetch(API_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setLoading(false);
        if (data.token) {
          localStorage.setItem("student_token", data.token);
          localStorage.setItem("student_user", JSON.stringify(data.student || data.user || {}));
          navigate("/student/dashboard");
        } else {
          setError(data.message || data.error || "Kuch galat ho gaya. Dobara try karo.");
        }
      })
      .catch(function() {
        setLoading(false);
        setError("Server se connect nahi ho pa raha. Please try again.");
      });
  }

  var inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid rgba(13,148,136,0.18)",
    background: "rgba(255,255,255,0.60)",
    backdropFilter: "blur(8px)",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  var labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "6px",
    display: "block",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #F1F5F9 0%, #e8f4f1 40%, #F1F5F9 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: "24px", position: "relative" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", top: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(13,148,136,0.10) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-60px", right: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle,rgba(212,175,55,0.09) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div onClick={function() { navigate("/"); }} style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "8px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg,#0D9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={20} color="white" />
            </div>
            <span style={{ fontFamily: "Georgia,serif", fontWeight: "700", fontSize: "22px", color: "#0f172a" }}>AYURTHON</span>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>by Dr. Ujjawal Pratap Singh</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.65)", borderRadius: "24px", boxShadow: "0 24px 64px rgba(13,148,136,0.12), 0 1px 0 rgba(255,255,255,0.9) inset", padding: "36px 32px" }}>

          {/* Mode Toggle */}
          <div style={{ display: "flex", background: "rgba(241,245,249,0.80)", borderRadius: "12px", padding: "4px", marginBottom: "28px" }}>
            {["login","register"].map(function(m) {
              return (
                <button key={m} onClick={function() { setMode(m); setError(""); setForm({ name: "", telegram_username: "", password: "", confirm_password: "" }); }} style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "none", background: mode === m ? "white" : "transparent", color: mode === m ? "#0D9488" : "#64748b", fontWeight: mode === m ? "700" : "500", fontSize: "13px", cursor: "pointer", boxShadow: mode === m ? "0 2px 8px rgba(15,23,42,0.08)" : "none", transition: "all 0.2s", textTransform: "capitalize" }}>
                  {m === "login" ? "Login" : "Register"}
                </button>
              );
            })}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>
              {mode === "login" ? "Welcome Back 👋" : "Join Ayurthon 🚀"}
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>
              {mode === "login" ? "Apne Telegram username se login karo." : "Free account banao aur practice shuru karo."}
            </p>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "register" && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={form.name} onChange={handleChange("name")} placeholder="Dr. Aapka Naam" style={inputStyle} />
              </div>
            )}

            <div>
              <label style={labelStyle}>Telegram Username</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>@</span>
                <input value={form.telegram_username} onChange={handleChange("telegram_username")} placeholder="your_username" style={Object.assign({}, inputStyle, { paddingLeft: "30px" })} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password} onChange={handleChange("password")} placeholder="••••••••" style={Object.assign({}, inputStyle, { paddingRight: "44px" })} />
                <button onClick={function() { setShowPass(!showPass); }} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={form.confirm_password} onChange={handleChange("confirm_password")} placeholder="••••••••" style={inputStyle} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "10px", background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.18)", color: "#be123c", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", marginTop: "24px", padding: "14px", borderRadius: "12px", border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 8px 24px rgba(13,148,136,0.30)", transition: "all 0.2s" }}
          >
            {loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <Zap size={16} />
                {mode === "login" ? "Login" : "Create Account"}
                <ChevronRight size={16} />
              </>
            )}
          </button>

          {/* Switch mode */}
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
            {mode === "login" ? (
              <span>Account nahi hai? <button onClick={function() { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: "#0D9488", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Register karo</button></span>
            ) : (
              <span>Pehle se account hai? <button onClick={function() { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "#0D9488", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Login karo</button></span>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={function() { navigate("/"); }} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>← Wapas Home par jaao</button>
        </div>
      </div>

      <HelpWidget />
    </div>
  );
}

export default StudentLogin;
