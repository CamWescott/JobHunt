import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TailorPage from './pages/TailorPage'
import ApplicationsPage from './pages/ApplicationsPage'
import InterviewPrepPage from './pages/InterviewPrepPage'
import LinkedInPage from './pages/LinkedInPage'
import PricingPage from './pages/PricingPage'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tailor"
        element={
          <ProtectedRoute>
            <Layout><TailorPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Layout><ApplicationsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview-prep"
        element={
          <ProtectedRoute>
            <Layout><InterviewPrepPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/linkedin"
        element={
          <ProtectedRoute>
            <Layout><LinkedInPage /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
