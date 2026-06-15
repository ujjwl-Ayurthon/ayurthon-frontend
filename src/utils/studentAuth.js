// src/utils/studentAuth.js

var BACKEND   = "https://ayurthon-backend.onrender.com";
var TOKEN_KEY = "ayurthon_student_token";
var USER_KEY  = "student_user";

function getStudentToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch(e) { return ""; }
}

function getStudentData() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "{}"); } catch(e) { return {}; }
}

function clearStudentSession() {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch(e) {}
}

function getInitials(name) {
  if (!name) return "?";
  var parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function validateSession(onValid, onInvalid) {
  var token = getStudentToken();
  if (!token) { onInvalid(); return; }
  fetch(BACKEND + "/api/auth/me", {
    headers: { "Content-Type": "application/json", "x-student-token": token }
  })
    .then(function(res) {
      if (res.ok) {
        return res.json().then(function(data) {
          onValid(data.student || data.user || data || {});
        });
      }
      clearStudentSession();
      onInvalid();
    })
    .catch(function() {
      var cached = getStudentData();
      if (cached && cached._id) { onValid(cached); } else { onInvalid(); }
    });
}

export { getStudentToken, getStudentData, clearStudentSession, getInitials, validateSession, TOKEN_KEY, BACKEND };
