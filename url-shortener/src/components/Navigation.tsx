import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import Button from './Button';

export default function Navigation() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              URL Shortener
            </Link>
            
            {currentUser && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <div className="hidden sm:flex sm:items-center sm:space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, <span className="font-medium">{currentUser.email?.split('@')[0]}</span>
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                  >
                    Logout
                  </Button>
                </div>
                
                {/* Mobile menu */}
                <div className="sm:hidden">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/login') 
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation menu */}
        {currentUser && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <div className="pl-3 pr-4 py-2 text-sm text-gray-500">
                Signed in as <span className="font-medium">{currentUser.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
