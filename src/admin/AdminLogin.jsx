import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Zap, ChevronRight, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  var navigate = useNavigate();
  var [password, setPassword] = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [showPass, setShowPass] = useState(false);

  var API_BASE = "https://ayurthon-backend.onrender.com";

  useEffect(function() {
    var token = localStorage.getItem("admin_token");
    if (token && token.length > 0) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, []);

  function handleSubmit() {
    if (!password) {
      setError("Password required hai bhai.");
      return;
    }
    setLoading(true);
    setError("");

    // 💡 FIXED FULL ROUTE: Correctly routing to /api/admin/login to hit the router post handler
    fetch(API_BASE + "/api/admin/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ password: password })
    })
    .then(function(res) {
      return res.json().then(function(data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    })
    .then(function(result) {
      setLoading(false);
      if (result.ok) {
        var token = result.data.token || "0604";
        localStorage.setItem("admin_token", token);
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(result.data.message || "Galat password enter kiya hai.");
      }
    })
    .catch(function() {
      setLoading(false);
      setError("Backend se connectivity issue hai bhai.");
    });
  }

  function onKey(e) {
    if (e.key === "Enter" && !loading) handleSubmit();
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#F1F5F9 0%,#e2f2ee 50%,#F1F5F9 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "24px", boxShadow: "0 24px 64px rgba(13,148,136,0.1)", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#0D9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={18} color="white" />
          </div>
          <span style={{ fontFamily: "Georgia,serif", fontWeight: "700", fontSize: "20px", color: "#0f172a" }}>AYURTHON</span>
        </div>
        <p style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", margin: "0 0 28px" }}>Admin Panel</p>
        
        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>🔒 Admin Login</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>Apna admin password enter karo.</p>
        </div>

        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "6px", display: "block", textTransform: "uppercase" }}>Admin Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={password} onChange={function(e) { setPassword(e.target.value); if(error) setError(""); }} onKeyDown={onKey} placeholder="••••••••••••" style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: "12px", border: "1.5px solid rgba(13,148,136,0.18)", background: "rgba(255,255,255,0.65)", fontSize: "14px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
            <button onClick={function() { setShowPass(!showPass); }} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: "0" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <div style={{ marginBottom: "20px", padding: "12px", borderRadius: "10px", background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.2)", color: "#be123c", fontSize: "13px", textAlign: "left" }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0D9488,#0f766e)", color: "white", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 8px 24px rgba(13,148,136,0.25)" }}>
          {loading ? "Verifying..." : <><Zap size={15} /> Login to Admin Panel <ChevronRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}
