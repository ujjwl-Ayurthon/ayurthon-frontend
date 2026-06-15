// ─────────────────────────────────────────────────────────────────────────────
// studentAuth.js — Student auth utilities
// Place at: src/utils/studentAuth.js
// ─────────────────────────────────────────────────────────────────────────────

var BACKEND = "https://ayurthon-backend.onrender.com";
var TOKEN_KEY = "ayurthon_student_token";
var USER_KEY  = "student_user";

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch(e) { return ""; }
}

function clearSession() {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch(e) {}
}

function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "{}"); } catch(e) { return {}; }
}

// Call this in useEffect on every protected page
// onValid: callback when token is valid (receives user object)
// onInvalid: callback when token is missing/expired (redirect to login)
function validateSession(onValid, onInvalid) {
  var token = getToken();
  if (!token) { onInvalid(); return; }

  fetch(BACKEND + "/api/auth/me", {
    headers: { "Content-Type": "application/json", "x-student-token": token }
  })
    .then(function(res) {
      if (res.ok) {
        return res.json().then(function(data) {
          onValid(data.student || data.user || data || {});
        });
      } else {
        clearSession();
        onInvalid();
      }
    })
    .catch(function() {
      // Network error — use cached user, don't logout
      var cached = getUser();
      if (cached && cached._id) { onValid(cached); }
      else { onInvalid(); }
    });
}

export { getToken, clearSession, getUser, validateSession, TOKEN_KEY, BACKEND };
