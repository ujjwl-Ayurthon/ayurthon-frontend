import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Admin Pages
import AdminLogin    from './admin/AdminLogin'
import AdminLayout   from './admin/AdminLayout'
import Upload        from './admin/Upload'
import QuestionBank  from './admin/QuestionBank'
import TestBuilder   from './admin/TestBuilder'
import TestList      from './admin/TestList'
import ResultsAdmin  from './admin/ResultsAdmin'

// Student Pages
import TestAttempt   from './student/TestAttempt'
import ResultPage    from './student/ResultPage'
import Leaderboard   from './student/Leaderboard'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('ayurthon_admin_token')
  return token ? children : <Navigate to="/admin/login" />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/admin/upload" />} />
          <Route path="upload"    element={<Upload />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="builder"   element={<TestBuilder />} />
          <Route path="tests"     element={<TestList />} />
          <Route path="results/:test_id" element={<ResultsAdmin />} />
        </Route>

        {/* Student */}
        <Route path="/test/:token"          element={<TestAttempt />} />
        <Route path="/result/:result_id"    element={<ResultPage />} />
        <Route path="/leaderboard/:test_id" element={<Leaderboard />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
