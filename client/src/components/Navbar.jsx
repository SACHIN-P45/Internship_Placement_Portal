// Navbar component — transparent glass header on home, solid on other pages
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaBriefcase,
  FaSignOutAlt,
  FaChevronDown,
  FaRocket,
  FaTachometerAlt,
  FaFileAlt,
  FaHome,
  FaSearch,
  FaSignInAlt,
} from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isHome = location.pathname === '/';

  /* Scroll tracking */
  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      setScrollProgress(0);
      return;
    }
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, location.pathname]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'company': return '/company/dashboard';
      case 'placementHead': return '/placement-head/dashboard';
      default: return '/student/dashboard';
    }
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const noSidebarRoutes = ['/', '/login', '/register'];
  const showFullBrand = noSidebarRoutes.includes(location.pathname);

  const navClass = [
    'hdr-navbar',
    isHome && !scrolled ? 'hdr-transparent' : '',
    isHome && scrolled ? 'hdr-glass' : '',
    !isHome ? 'hdr-solid' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <nav className={navClass}>
        {/* Scroll progress — home only */}
        {isHome && (
          <div className="hdr-progress">
            <div className="hdr-progress-bar" style={{ width: `${scrollProgress}%` }} />
          </div>
        )}

        <div className={showFullBrand ? 'container hdr-inner' : 'container-fluid px-3 px-lg-4 hdr-inner'}>
          {/* Brand */}
          <Link className={`hdr-brand ${showFullBrand ? '' : 'd-lg-none ms-5'}`} to="/">
            <img src="/logo.png" alt="PlacementPortal" className="hdr-brand-logo" />
            <span className="hdr-brand-text">
              Placement<span className="hdr-brand-accent">Portal</span>
            </span>
          </Link>

          {/* Desktop nav pill */}
          <div className="hdr-nav d-none d-lg-flex">
            <div className="hdr-pill">
              <Link className={`hdr-link ${isActive('/') ? 'hdr-active' : ''}`} to="/">
                <FaHome size={13} /> <span>Home</span>
              </Link>
              <Link className={`hdr-link ${isActive('/jobs') ? 'hdr-active' : ''}`} to="/jobs">
                <FaSearch size={13} /> <span>Jobs</span>
              </Link>
              {user && user.role === 'student' && (
                <Link className={`hdr-link ${isActive('/applications') ? 'hdr-active' : ''}`} to="/applications">
                  <FaFileAlt size={13} /> <span>My Apps</span>
                </Link>
              )}
              {user && (
                <Link className={`hdr-link ${isActive(getDashboardLink()) ? 'hdr-active' : ''}`} to={getDashboardLink()}>
                  <FaTachometerAlt size={13} /> <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="hdr-right d-none d-lg-flex">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <NotificationDropdown />
                <div className="hdr-user-menu" ref={dropdownRef}>
                  <button className="hdr-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div className="hdr-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <span className="hdr-user-name">{user.name}</span>
                    <FaChevronDown size={10} className={`hdr-chevron ${dropdownOpen ? 'open' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="hdr-dropdown">
                      <div className="hdr-dropdown-header">
                        <div className="hdr-dropdown-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="fw-bold small">{user.name}</div>
                          <span className="hdr-role-badge">{user.role}</span>
                        </div>
                      </div>
                      <div className="hdr-dropdown-divider" />
                      <Link className="hdr-dropdown-item" to={getDashboardLink()} onClick={() => setDropdownOpen(false)}>
                        <FaTachometerAlt size={14} /> <span>Dashboard</span>
                      </Link>
                      <button className="hdr-dropdown-item text-danger" onClick={handleLogout}>
                        <FaSignOutAlt size={14} /> <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="hdr-login-btn" to="/login">
                  <FaSignInAlt size={13} /> <span>Login</span>
                </Link>
                <Link className="hdr-register-btn" to="/register">
                  <FaRocket size={13} /> <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`hdr-hamburger d-lg-none ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`hdr-mobile-menu d-lg-none ${mobileOpen ? 'open' : ''}`}>
          <div className="hdr-mobile-inner">
            <Link className={`hdr-mobile-link ${isActive('/') ? 'active' : ''}`} to="/">
              <FaHome /> Home
            </Link>
            <Link className={`hdr-mobile-link ${isActive('/jobs') ? 'active' : ''}`} to="/jobs">
              <FaSearch /> Jobs
            </Link>
            {user && user.role === 'student' && (
              <Link className={`hdr-mobile-link ${isActive('/applications') ? 'active' : ''}`} to="/applications">
                <FaFileAlt /> My Apps
              </Link>
            )}
            {user && (
              <Link className={`hdr-mobile-link ${isActive(getDashboardLink()) ? 'active' : ''}`} to={getDashboardLink()}>
                <FaTachometerAlt /> Dashboard
              </Link>
            )}
            <div className="hdr-mobile-divider" />
            {user ? (
              <>
                <div className="hdr-mobile-user">
                  <div className="hdr-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="fw-bold small text-white">{user.name}</div>
                    <span className="hdr-role-badge">{user.role}</span>
                  </div>
                </div>
                <button className="hdr-mobile-link text-danger" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link className="hdr-mobile-link" to="/login">
                  <FaSignInAlt /> Login
                </Link>
                <Link className="hdr-register-btn w-100 text-center mt-2" to="/register">
                  <FaRocket size={13} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for non-home pages */}
      {!isHome && <div style={{ height: 64 }} />}
    </>
  );
};

export default Navbar;
