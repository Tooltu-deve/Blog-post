import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="navbar-wrap">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          Personal Blog
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="navbar-toggle-bar" aria-hidden />
        </button>

        <div className={`navbar-actions ${menuOpen ? 'is-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                {user?.firstName} {user?.lastName}
                {user?.role === 'ADMIN' && (
                  <span className="badge-admin">Admin</span>
                )}
              </span>
              <Link to="/posts/new" className="btn btn-primary">
                New Post
              </Link>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
