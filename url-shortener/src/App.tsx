import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import RedirectPage from './pages/RedirectPage'
import Dashboard from './pages/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'
import Navigation from './components/Navigation'

// Simplified AuthContext that won't cause loading issues
import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  currentUser: any | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: false,
  error: null,
  logout: async () => {},
  login: async () => {},
  signup: async () => {}
})

export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser] = useState<any | null>(null)
  const [loading] = useState(false) // Always false to prevent infinite loading
  const [error] = useState<string | null>('Firebase configuration required for authentication features.')

  const logout = async () => {
    console.log('🔧 Demo logout - no actual logout performed')
    // In demo mode, we don't actually log out
  }

  const login = async (email: string, password: string) => {
    console.log('🔧 Demo login attempt:', email)
    throw new Error('Firebase configuration required for authentication features.')
  }

  const signup = async (email: string, password: string) => {
    console.log('🔧 Demo signup attempt:', email)
    throw new Error('Firebase configuration required for authentication features.')
  }

  console.log('✅ AuthProvider working - Demo mode active')

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, logout, login, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

function App() {
  console.log('✅ Full App component rendering successfully!')

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/:shortCode" element={<RedirectPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
