import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Centralizado from './pages/Centralizado';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-raised rounded-full animate-spin"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {children}
    </Link>
  );
}

function Layout({ children }) {
  const { logout, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-raised rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-inverse">Viáticos FNC</h1>
                <p className="text-xs text-gray-500">Federación Nacional de Cafeteros</p>
              </div>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/">Centralizado</NavLink>
              <NavLink to="/upload">Subir Excel</NavLink>
            </nav>
            
            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-inverse">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.rol?.toLowerCase()}</p>
              </div>
              <button 
                onClick={logout} 
                className="btn btn-ghost p-2"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-default">
          <div className="flex">
            <Link to="/" className={`flex-1 py-3 text-center text-sm font-medium ${useLocation().pathname === '/' ? 'text-raised' : 'text-gray-500'}`}>
              Centralizado
            </Link>
            <Link to="/upload" className={`flex-1 py-3 text-center text-sm font-medium ${useLocation().pathname === '/upload' ? 'text-raised' : 'text-gray-500'}`}>
              Subir Excel
            </Link>
          </div>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><Layout><Upload /></Layout></PrivateRoute>} />
      <Route path="/centralizado" element={<PrivateRoute><Layout><Centralizado /></Layout></PrivateRoute>} />
    </Routes>
  );
}