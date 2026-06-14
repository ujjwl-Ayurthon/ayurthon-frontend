// =============================================================================
// api.js — Single source of truth for ALL API calls in Ayurthon Frontend
// Place at: src/utils/api.js
//
// Architecture (from PROJECT_HANDOFF.md):
//   Admin auth   → header: "x-admin-token"    (localStorage key: "admin_token")
//   Student auth → header: "x-student-token"  (localStorage key: "student_token")
//   NO JWT, NO Bearer, NO cookies — custom Base64 token
// =============================================================================

var API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : "https://ayurthon-backend.onrender.com";

API_BASE = API_BASE.replace(/\/$/, "");

function getAdminToken() {
  try { return localStorage.getItem("admin_token") || ""; }
  catch (e) { return ""; }
}

function getStudentToken() {
  try { return localStorage.getItem("student_token") || ""; }
  catch (e) { return ""; }
}

function adminHeaders() {
  return { "Content-Type": "application/json", "x-admin-token": getAdminToken() };
}

function studentHeaders() {
  return { "Content-Type": "application/json", "x-student-token": getStudentToken() };
}

function publicHeaders() {
  return { "Content-Type": "application/json" };
}

function apiFetch(path, options) {
  var url = API_BASE + path;
  var opts = options || {};
  return fetch(url, opts)
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

var adminApi = {
  login: function(password) {
    return apiFetch("/api/admin/login", { method: "POST", headers: publicHeaders(), body: JSON.stringify({ password: password }) });
  },
  getQuestionStats: function() { return apiFetch("/api/questions/stats/count", { headers: adminHeaders() }); },
  getTests: function() { return apiFetch("/api/tests", { headers: adminHeaders() }); },
  getStudents: function() { return apiFetch("/api/students", { headers: adminHeaders() }); },
  resetStudentPassword: function(id) {
    return apiFetch("/api/students/" + id + "/reset-password", { method: "POST", headers: adminHeaders() });
  },
  getAnalytics: function(testId) { return apiFetch("/api/results/analytics/" + testId, { headers: adminHeaders() }); },
};

var studentApi = {
  register: function(name, username, password) {
    return apiFetch("/api/auth/register", {
      method: "POST", headers: publicHeaders(),
      body: JSON.stringify({ name: name, telegram_username: username.toLowerCase().replace(/^@/, ""), password: password }),
    });
  },
  login: function(username, password) {
    return apiFetch("/api/auth/login", {
      method: "POST", headers: publicHeaders(),
      body: JSON.stringify({ telegram_username: username.toLowerCase().replace(/^@/, ""), password: password }),
    });
  },
  getMe: function() { return apiFetch("/api/auth/me", { headers: studentHeaders() }); },
  updateProfile: function(payload) {
    return apiFetch("/api/auth/profile", { method: "PUT", headers: studentHeaders(), body: JSON.stringify(payload) });
  },
  changePassword: function(oldPw, newPw) {
    return apiFetch("/api/auth/change-password", { method: "PUT", headers: studentHeaders(), body: JSON.stringify({ old_password: oldPw, new_password: newPw }) });
  },
  getDashboard: function() { return apiFetch("/api/student/dashboard/stats", { headers: studentHeaders() }); },
  getHistory: function() { return apiFetch("/api/student/dashboard/history", { headers: studentHeaders() }); },
  getAvailableTests: function() { return apiFetch("/api/student/dashboard/available-tests", { headers: studentHeaders() }); },
  getResult: function(id) { return apiFetch("/api/results/" + id, { headers: studentHeaders() }); },
};

var session = {
  saveStudent: function(token, user) {
    try { localStorage.setItem("student_token", token); localStorage.setItem("student_user", JSON.stringify(user || {})); } catch (e) {}
  },
  getStudentToken: getStudentToken,
  getStudentUser: function() { try { return JSON.parse(localStorage.getItem("student_user") || "{}"); } catch (e) { return {}; } },
  isStudentLoggedIn: function() { var t = getStudentToken(); return t && t.length > 10; },
  clearStudent: function() { try { localStorage.removeItem("student_token"); localStorage.removeItem("student_user"); } catch (e) {} },
  saveAdmin: function(token) { try { localStorage.setItem("admin_token", token); } catch (e) {} },
  getAdminToken: getAdminToken,
  isAdminLoggedIn: function() { var t = getAdminToken(); return t && t.length > 5; },
  clearAdmin: function() { try { localStorage.removeItem("admin_token"); } catch (e) {} },
};

function extractToken(data) {
  return data.token || (data.data && data.data.token) || (data.result && data.result.token) || "";
}

function extractStudent(data) {
  return data.student || data.user || data.data || {};
}

function extractArray(data, preferredKeys) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  var keys = preferredKeys || ["data","result","students","tests","questions","list","users"];
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]] && Array.isArray(data[keys[i]])) return data[keys[i]];
  }
  var allKeys = Object.keys(data);
  for (var j = 0; j < allKeys.length; j++) {
    if (Array.isArray(data[allKeys[j]])) return data[allKeys[j]];
  }
  return [];
}

function ayurthonDebug() {
  var at = getAdminToken(); var st = getStudentToken();
  console.group("=== AYURTHON AUTH DEBUG ===");
  console.log("API_BASE:", API_BASE);
  console.log("admin_token:", at ? at.substring(0,20)+"..." : "MISSING ❌");
  console.log("student_token:", st ? st.substring(0,20)+"..." : "MISSING ❌");
  console.log("admin headers sent:", adminHeaders());
  console.log("student headers sent:", studentHeaders());
  fetch(API_BASE + "/api/questions/stats/count", { headers: adminHeaders() })
    .then(function(r) { console.log("Admin API ping — HTTP", r.status, r.status===200?"✅":"❌"); })
    .catch(function(e) { console.error("Admin API NETWORK FAIL:", e.message); });
  fetch(API_BASE + "/api/auth/me", { headers: studentHeaders() })
    .then(function(r) { console.log("Student API ping — HTTP", r.status, r.status===200?"✅":"❌"); })
    .catch(function(e) { console.error("Student API NETWORK FAIL:", e.message); });
  console.groupEnd();
}

if (typeof window !== "undefined") { window.ayurthonDebug = ayurthonDebug; }

export { API_BASE, adminApi, studentApi, session, extractToken, extractStudent, extractArray, ayurthonDebug };
