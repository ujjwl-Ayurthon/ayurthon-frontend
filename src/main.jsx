import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Admin
import AdminLogin     from './admin/AdminLogin'
import AdminLayout    from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import Upload         from './admin/Upload'
import QuestionBank   from './admin/QuestionBank'
import TestBuilder    from './admin/TestBuilder'
import TestList       from './admin/TestList'
import ResultsAdmin   from './admin/ResultsAdmin'

// Student
import StudentLogin     from './student/StudentLogin'
import StudentDashboard from './student/StudentDashboard'
import StudentProgress  from './student/StudentProgress'
import StudentProfile   from './student/StudentProfile'
import TestAttempt      from './student/TestAttempt'
import ResultPage       from './student/ResultPage'
import Leaderboard      from './student/Leaderboard'

function AdminRoute({ children }) {
  var token = localStorage.getItem('ayurthon_admin_token')
  return token ? children : <Navigate to="/admin/login" />
}

function StudentRoute({ children }) {
  var token = localStorage.getItem('ayurthon_student_token')
  return token ? children : <Navigate to="/student/login" />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/student/login" />} />

        {/* Student Auth */}
        <Route path="/student/login" element={<StudentLogin />} />

        {/* Student App */}
        <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/progress"  element={<StudentRoute><StudentProgress /></StudentRoute>} />
        <Route path="/student/profile"   element={<StudentRoute><StudentProfile /></StudentRoute>} />
        <Route path="/student/tests"     element={<StudentRoute><StudentDashboard /></StudentRoute>} />

        {/* Test Flow */}
        <Route path="/test/:token"          element={<TestAttempt />} />
        <Route path="/result/:result_id"    element={<ResultPage />} />
        <Route path="/leaderboard/:test_id" element={<Leaderboard />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index                   element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard"        element={<AdminDashboard />} />
          <Route path="upload"           element={<Upload />} />
          <Route path="questions"        element={<QuestionBank />} />
          <Route path="builder"          element={<TestBuilder />} />
          <Route path="tests"            element={<TestList />} />
          <Route path="results/:test_id" element={<ResultsAdmin />} />
        </Route>

        <Route path="*" element={<Navigate to="/student/login" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
