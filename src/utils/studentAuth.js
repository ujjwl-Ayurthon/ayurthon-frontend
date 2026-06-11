// Student auth utilities

export function getStudentToken() {
  return localStorage.getItem('ayurthon_student_token');
}

export function getStudentData() {
  var d = localStorage.getItem('ayurthon_student_data');
  try { return d ? JSON.parse(d) : null; } catch(e) { return null; }
}

export function saveStudentSession(token, student) {
  localStorage.setItem('ayurthon_student_token', token);
  localStorage.setItem('ayurthon_student_data', JSON.stringify(student));
}

export function clearStudentSession() {
  localStorage.removeItem('ayurthon_student_token');
  localStorage.removeItem('ayurthon_student_data');
}

export function isStudentLoggedIn() {
  return !!getStudentToken();
}

// Get avatar initials
export function getInitials(name) {
  if (!name) return '?';
  var parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}
