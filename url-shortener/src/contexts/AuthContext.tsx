import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function signup(email: string, password: string) {
    try {
      return createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  function login(email: string, password: string) {
    try {
      return signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  function logout() {
    try {
      return signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  useEffect(() => {
    console.log('AuthProvider useEffect running');

    // Check if we're using demo Firebase config
    const isDemoConfig = auth.app.options.apiKey === "demo-api-key";

    if (isDemoConfig) {
      console.warn('⚠️ Using demo Firebase configuration - authentication disabled');
      setError('Firebase configuration required for authentication features.');
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user);
        setCurrentUser(user);
        setLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Firebase auth initialization error:', error);
      setError('Failed to initialize authentication. Please check Firebase configuration.');
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    error,
    loading
  };

  // Don't block the app if Firebase isn't configured - just log the warning
  if (error && error.includes('Firebase configuration')) {
    console.warn('⚠️ Firebase not configured - authentication features disabled');
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
