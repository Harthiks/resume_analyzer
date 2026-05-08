import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import DashboardLayout from './components/layout/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import ATSChecker from './pages/ATSChecker'
import JobMatcher from './pages/JobMatcher'
import InterviewGen from './pages/InterviewGen'
import Templates from './pages/Templates'
import Profile from './pages/Profile'
import ChatAssistant from './pages/ChatAssistant'
import AdminPanel from './pages/AdminPanel'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

// Public only route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="builder" element={<ResumeBuilder />} />
        <Route path="builder/:resumeId" element={<ResumeBuilder />} />
        <Route path="analyzer" element={<ResumeAnalyzer />} />
        <Route path="ats" element={<ATSChecker />} />
        <Route path="job-match" element={<JobMatcher />} />
        <Route path="interview" element={<InterviewGen />} />
        <Route path="templates" element={<Templates />} />
        <Route path="chat" element={<ChatAssistant />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
