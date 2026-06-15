// =============================================================================
// src/utils/api.js — Ayurthon Frontend Network Layer
// Auth: x-admin-token (admin) | x-student-token (student)
// NO JWT, NO Bearer — custom Base64 token (PROJECT_HANDOFF.md)
// localStorage keys: "admin_token" | "ayurthon_student_token"
// =============================================================================

var BACKEND_URL = "https://ayurthon-backend.onrender.com";
var API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== "")
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "https://ayurthon-backend.onrender.com";

// ── Token getters ─────────────────────────────────────────────────────────────
function getAdminToken() {
  try { return localStorage.getItem("admin_token") || ""; } catch (e) { return ""; }
}
function getStudentToken() {
  try { return localStorage.getItem("ayurthon_student_token") || ""; } catch (e) { return ""; }
}

// ── Header builders ───────────────────────────────────────────────────────────
function adminHeaders() {
  return { "Content-Type": "application/json", "x-admin-token": getAdminToken() };
}
function studentHeaders() {
  return { "Content-Type": "application/json", "x-student-token": getStudentToken() };
}
function publicHeaders() {
  return { "Content-Type": "application/json" };
}

// ── Core fetch — never throws, always resolves ────────────────────────────────
function apiFetch(path, options) {
  var url = API_BASE + path;
  return fetch(url, options || {})
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

// ── Token extractor — handles all backend response shapes ─────────────────────
function extractToken(data) {
  if (!data) return "";
  return data.token
    || data.adminToken
    || data.admin_token
    || (data.data && data.data.token)
    || (data.result && data.result.token)
    || "";
}

function extractStudent(data) {
  if (!data) return {};
  return data.student || data.user || data.data || {};
}

// ── Array extractor — handles [], {key:[]}, nested shapes ────────────────────
function extractArray(data, preferredKeys) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  var keys = preferredKeys || ["data", "result", "students", "tests", "questions", "list", "users"];
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]] && Array.isArray(data[keys[i]])) return data[keys[i]];
  }
  var allKeys = Object.keys(data);
  for (var j = 0; j < allKeys.length; j++) {
    if (Array.isArray(data[allKeys[j]])) return data[allKeys[j]];
  }
  return [];
}

// ── Session helpers ───────────────────────────────────────────────────────────
var session = {
  // Admin
  saveAdmin: function (token) {
    try { localStorage.setItem("admin_token", token); } catch (e) {}
  },
  getAdminToken: getAdminToken,
  isAdminLoggedIn: function () {
    var t = getAdminToken();
    return !!(t && t.length > 0);
  },
  clearAdmin: function () {
    try { localStorage.removeItem("admin_token"); } catch (e) {}
  },
  // Student
  saveStudent: function (token, user) {
    try {
      localStorage.setItem("ayurthon_student_token", token);
      localStorage.setItem("student_user", JSON.stringify(user || {}));
    } catch (e) {}
  },
  getStudentToken: getStudentToken,
  isStudentLoggedIn: function () {
    var t = getStudentToken();
    return !!(t && t.length > 0);
  },
  clearStudent: function () {
    try {
      localStorage.removeItem("ayurthon_student_token");
      localStorage.removeItem("student_user");
    } catch (e) {}
  },
  getStudentUser: function () {
    try { return JSON.parse(localStorage.getItem("student_user") || "{}"); } catch (e) { return {}; }
  },
};

// ── Named API groups ──────────────────────────────────────────────────────────
var adminApi = {
  login: function (password) {
    return apiFetch("/api/admin/login", {
      method: "POST", headers: publicHeaders(),
      body: JSON.stringify({ password: password }),
    });
  },
  getQuestionStats: function () { return apiFetch("/api/questions/stats/count", { headers: adminHeaders() }); },
  getTests: function () { return apiFetch("/api/tests", { headers: adminHeaders() }); },
  getStudents: function () { return apiFetch("/api/students", { headers: adminHeaders() }); },
  resetStudentPassword: function (id) {
    return apiFetch("/api/students/" + id + "/reset-password", { method: "POST", headers: adminHeaders() });
  },
  uploadQuestions: function (payload) {
    return apiFetch("/api/questions/upload", { method: "POST", headers: adminHeaders(), body: JSON.stringify(payload) });
  },
  parseQuestions: function (text) {
    return apiFetch("/api/questions/parse", { method: "POST", headers: adminHeaders(), body: JSON.stringify({ text: text }) });
  },
  getQuestions: function (params) {
    var query = params ? ("?" + Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&")) : "";
    return apiFetch("/api/questions" + query, { headers: adminHeaders() });
  },
  updateQuestion: function (id, payload) {
    return apiFetch("/api/questions/" + id, { method: "PUT", headers: adminHeaders(), body: JSON.stringify(payload) });
  },
  deleteQuestion: function (id) {
    return apiFetch("/api/questions/" + id, { method: "DELETE", headers: adminHeaders() });
  },
  bulkDeleteQuestions: function (ids) {
    return apiFetch("/api/questions/bulk-delete", { method: "POST", headers: adminHeaders(), body: JSON.stringify({ ids: ids }) });
  },
  createTest: function (payload) {
    return apiFetch("/api/tests", { method: "POST", headers: adminHeaders(), body: JSON.stringify(payload) });
  },
  updateTest: function (id, payload) {
    return apiFetch("/api/tests/" + id, { method: "PUT", headers: adminHeaders(), body: JSON.stringify(payload) });
  },
  publishTest: function (id, payload) {
    return apiFetch("/api/tests/" + id + "/publish", { method: "POST", headers: adminHeaders(), body: JSON.stringify(payload || {}) });
  },
  deleteTest: function (id) {
    return apiFetch("/api/tests/" + id, { method: "DELETE", headers: adminHeaders() });
  },
  recalculateRanks: function (id) {
    return apiFetch("/api/tests/" + id + "/recalculate-ranks", { method: "POST", headers: adminHeaders() });
  },
  getLeaderboard: function (id) { return apiFetch("/api/results/leaderboard/" + id, { headers: adminHeaders() }); },
  getSheet: function (id) { return apiFetch("/api/results/sheet/" + id, { headers: adminHeaders() }); },
  getAnalytics: function (id) { return apiFetch("/api/results/analytics/" + id, { headers: adminHeaders() }); },
  getChannels: function () { return apiFetch("/api/tests/channels/list", { headers: adminHeaders() }); },
  getTaxonomy: function () { return apiFetch("/api/questions/taxonomy", { headers: adminHeaders() }); },
};

var studentApi = {
  login: function (username, password) {
    return apiFetch("/api/auth/login", {
      method: "POST", headers: publicHeaders(),
      body: JSON.stringify({ telegram_username: username.toLowerCase().replace(/^@/, ""), password: password }),
    });
  },
  register: function (name, username, password) {
    return apiFetch("/api/auth/register", {
      method: "POST", headers: publicHeaders(),
      body: JSON.stringify({ name: name, telegram_username: username.toLowerCase().replace(/^@/, ""), password: password }),
    });
  },
  getMe: function () { return apiFetch("/api/auth/me", { headers: studentHeaders() }); },
  updateProfile: function (payload) {
    return apiFetch("/api/auth/profile", { method: "PUT", headers: studentHeaders(), body: JSON.stringify(payload) });
  },
  changePassword: function (oldPw, newPw) {
    return apiFetch("/api/auth/change-password", { method: "PUT", headers: studentHeaders(), body: JSON.stringify({ old_password: oldPw, new_password: newPw }) });
  },
  getDashboard: function () { return apiFetch("/api/student/dashboard/stats", { headers: studentHeaders() }); },
  getHistory: function () { return apiFetch("/api/student/dashboard/history", { headers: studentHeaders() }); },
  getAvailableTests: function () { return apiFetch("/api/student/dashboard/available-tests", { headers: studentHeaders() }); },
  getResult: function (id) { return apiFetch("/api/results/" + id, { headers: studentHeaders() }); },
  submitResult: function (payload) {
    return apiFetch("/api/results/submit", { method: "POST", headers: studentHeaders(), body: JSON.stringify(payload) });
  },
  checkResult: function (token, username) {
    return apiFetch("/api/results/check/" + token + "/" + username, { headers: studentHeaders() });
  },
  getLeaderboard: function (id) { return apiFetch("/api/results/leaderboard/" + id, { headers: studentHeaders() }); },
  getAttempt: function (token) { return apiFetch("/api/tests/attempt/" + token); },
};

// ── Default export (handles: import api from '../utils/api') ──────────────────
var api = {
  admin: adminApi,
  student: studentApi,
  session: session,
  apiFetch: apiFetch,
  extractToken: extractToken,
  extractStudent: extractStudent,
  extractArray: extractArray,
  adminHeaders: adminHeaders,
  studentHeaders: studentHeaders,
  publicHeaders: publicHeaders,
  getAdminToken: getAdminToken,
  getStudentToken: getStudentToken,
  API_BASE: API_BASE,

  // ── Axios-style methods — used by Upload, QuestionBank, TestBuilder, TestList, ResultsAdmin
  // Header key: "ayurthon_admin_token" (main.jsx AdminRoute uses this key)
  get: function(path, config) {
    var token = localStorage.getItem('ayurthon_admin_token') || localStorage.getItem('admin_token') || '';
    var headers = Object.assign({ 'Content-Type': 'application/json', 'x-admin-token': token }, (config && config.headers) || {});
    return fetch(API_BASE + path, { headers: headers })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok) { var err = new Error(data.message || 'Request failed'); err.response = { data: data, status: res.status }; throw err; }
          return { data: data, status: res.status };
        });
      });
  },

  post: function(path, body, config) {
    var token = localStorage.getItem('ayurthon_admin_token') || localStorage.getItem('admin_token') || '';
    var headers = Object.assign({ 'Content-Type': 'application/json', 'x-admin-token': token }, (config && config.headers) || {});
    return fetch(API_BASE + path, { method: 'POST', headers: headers, body: JSON.stringify(body || {}) })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok) { var err = new Error(data.message || 'Request failed'); err.response = { data: data, status: res.status }; throw err; }
          return { data: data, status: res.status };
        });
      });
  },

  put: function(path, body, config) {
    var token = localStorage.getItem('ayurthon_admin_token') || localStorage.getItem('admin_token') || '';
    var headers = Object.assign({ 'Content-Type': 'application/json', 'x-admin-token': token }, (config && config.headers) || {});
    return fetch(API_BASE + path, { method: 'PUT', headers: headers, body: JSON.stringify(body || {}) })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok) { var err = new Error(data.message || 'Request failed'); err.response = { data: data, status: res.status }; throw err; }
          return { data: data, status: res.status };
        });
      });
  },

  delete: function(path, config) {
    var token = localStorage.getItem('ayurthon_admin_token') || localStorage.getItem('admin_token') || '';
    var headers = Object.assign({ 'Content-Type': 'application/json', 'x-admin-token': token }, (config && config.headers) || {});
    return fetch(API_BASE + path, { method: 'DELETE', headers: headers })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok) { var err = new Error(data.message || 'Request failed'); err.response = { data: data, status: res.status }; throw err; }
          return { data: data, status: res.status };
        });
      });
  },
};

export default api;

export {
  API_BASE,
  apiFetch,
  adminApi,
  studentApi,
  session,
  extractToken,
  extractStudent,
  extractArray,
  adminHeaders,
  studentHeaders,
  publicHeaders,
  getAdminToken,
  getStudentToken,
};
