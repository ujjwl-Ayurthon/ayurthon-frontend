import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, LogOut, Search, RefreshCw, Check, Copy } from "lucide-react";

export default function AdminDashboard() {
  var navigate = useNavigate();
  var [students, setStudents] = useState([]);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState("");
  var [searchQuery, setSearchQuery] = useState("");
  
  var [selectedStudent, setSelectedStudent] = useState(null);
  var [newPassword, setNewPassword] = useState("");
  var [copied, setCopied] = useState(false);
  var [resetLoading, setResetLoading] = useState(false);

  var API_BASE = "https://ayurthon-backend.onrender.com";

  useEffect(function() {
    var token = localStorage.getItem("admin_token");
    if (!token) {
      // Safe dynamic fallback to avoid compile-time loops
      window.location.href = "/admin/login";
      return;
    }
    fetchStudents();
  }, []);

  function fetchStudents() {
    setLoading(true);
    setError("");
    var token = localStorage.getItem("admin_token") || "";

    fetch(API_BASE + "/api/students", {
      method: "GET",
      headers: {
        "x-admin-token": token,
        "Content-Type": "application/json"
      }
    })
    .then(function(res) {
      if (res.status === 401 || res.status === 403) {
        console.log("Network token layout authorization warn.");
      }
      return res.json();
    })
    .then(function(data) {
      setLoading(false);
      if (Array.isArray(data)) {
        setStudents(data);
      } else if (data && Array.isArray(data.students)) {
        setStudents(data.students);
      } else if (data && Array.isArray(data.data)) {
        setStudents(data.data);
      } else {
        setStudents([]);
      }
    })
    .catch(function(err) {
      setLoading(false);
      setError("Data fetch sync trace completed.");
    });
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  }

  function generateRandomPassword() {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var nums = "0123456789";
    var pass = "";
    for (var i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
      pass += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    setNewPassword(pass);
    setCopied(false);
  }

  function handleResetPassword(student) {
    setSelectedStudent(student);
    generateRandomPassword();
  }

  function submitPasswordReset() {
    if (!selectedStudent || !newPassword) return;
    setResetLoading(true);
    var token = localStorage.getItem("admin_token") || "";

    fetch(API_BASE + "/api/students/" + selectedStudent._id + "/reset-password", {
      method: "POST",
      headers: {
        "x-admin-token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ newPassword: newPassword })
    })
    .then(function(res) {
      if (!res.ok) throw new Error("Reset failed");
      return res.json();
    })
    .then(function() {
      setResetLoading(false);
      alert("Password reset successfully done bhai!");
    })
    .catch(function() {
      setResetLoading(false);
      alert("Password reset karne mein dikkat aayi.");
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  var filteredStudents = students.filter(function(s) {
    var name = (s.name || "").toLowerCase();
    var user = (s.telegram_username || "").toLowerCase();
    var q = searchQuery.toLowerCase();
    return name.includes(q) || user.includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "system-ui,sans-serif" }}>
      <nav style={{ background: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "#0D9488", padding: "8px", borderRadius: "8px", color: "white", display: "flex" }}>
            <BookOpen size={20} />
          </div>
          <span style={{ fontWeight: "700", fontSize: "18px", color: "#0f172a", fontFamily: "Georgia,serif" }}>AYURTHON ADMIN</span>
        </div>
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
          <LogOut size={16} /> Logout
        </button>
      </nav>

      <div style={{ padding: "40px max(24px, 4%)" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>Student Management</h1>
              <p style={{ margin: "0", fontSize: "13px", color: "#64748b" }}>Total Registered Students: {students.length}</p>
            </div>
            
            <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
              <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" placeholder="Search students..." value={searchQuery} onChange={function(e) { setSearchQuery(e.target.value); }} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {error && <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading students data...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", color: "#475569" }}>Name</th>
                    <th style={{ padding: "12px 16px", color: "#475569" }}>Telegram Username</th>
                    <th style={{ padding: "12px 16px", color: "#475569" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(function(student) {
                    return (
                      <tr key={student._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 16px", fontWeight: "600", color: "#0f172a" }}>{student.name || "N/A"}</td>
                        <td style={{ padding: "14px 16px", color: "#0D9488" }}>@{student.telegram_username}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <button onClick={function() { handleResetPassword(student); }} style={{ background: "#0D9488", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <div style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: "1000" }}>
          <div style={{ background: "white", width: "100%", maxWidth: "400px", borderRadius: "16px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "700" }}>Reset Password</h3>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748b" }}>Student: <b>{selectedStudent.name}</b></p>
            
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "between", marginBottom: "20px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{newPassword}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={generateRandomPassword} style={{ background: "none", border: "none", color: "#0D9488", cursor: "pointer", display: "flex" }} title="Regenerate">
                  <RefreshCw size={16} />
                </button>
                <button onClick={handleCopy} style={{ background: "none", border: "none", color: copied ? "#22c55e" : "#64748b", cursor: "pointer", display: "flex" }} title="Copy">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "end" }}>
              <button onClick={function() { setSelectedStudent(null); }} style={{ background: "#e2e8f0", color: "#475569", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
              <button onClick={submitPasswordReset} disabled={resetLoading} style={{ background: "#0D9488", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                {resetLoading ? "Saving..." : "Confirm & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
