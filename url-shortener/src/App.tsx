import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import RedirectPage from './pages/RedirectPage'
import ErrorBoundary from './components/ErrorBoundary'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import { LoadingPage } from './components/LoadingSpinner'

function AuthenticatedLogin() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return <Login />;
}

function AuthenticatedSignUp() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return <SignUp />;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      <Route path="/:shortCode" element={<RedirectPage />} />

      <Route path="/*" element={
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthenticatedLogin />} />
            <Route path="/signup" element={<AuthenticatedSignUp />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
                      <p className="text-gray-600">Dashboard coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
