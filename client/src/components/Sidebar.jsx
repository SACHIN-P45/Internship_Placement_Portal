// Sidebar — professional role-based sidebar with widgets & animations
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  FaHome,
  FaBriefcase,
  FaTachometerAlt,
  FaSignOutAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaBars,
  FaBuilding,
  FaShieldAlt,
  FaUserGraduate,
  FaChartBar,
  FaUsers,
  FaClipboardList,
  FaArrowRight,
  FaBookmark,
  FaUserCog,
  FaCheckCircle,
  FaBell,
  FaGraduationCap,
  FaRegCalendarAlt,
  FaHeadset,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaCircle,
  FaClock,
  FaRocket,
  FaStar,
  FaLightbulb,
} from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const avatarInputRef = useRef(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarClick = () => {
    if (!avatarUploading) avatarInputRef.current?.click();
  };

  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = '';
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await authService.uploadAvatar(formData);
      await refreshUser();
    } catch (err) {
      setAvatarError(err?.response?.data?.message || 'Upload failed. Try again.');
      setTimeout(() => setAvatarError(''), 4000);
    } finally {
      setAvatarUploading(false);
    }
  }, [refreshUser]);

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Close sidebar on route change (mobile)
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Close on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const roleConfig = {
    student: { icon: FaUserGraduate, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', label: 'Student' },
    company: { icon: FaBuilding, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)', label: 'Company' },
    admin: { icon: FaShieldAlt, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', label: 'Admin' },
    placementHead: { icon: FaChartBar, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', label: 'Placement Head' },
  };
  const currentRole = roleConfig[user?.role] || roleConfig.student;

  // Navigation items per role
  const navItems = useMemo(() => {
    const common = [
      { path: '/', label: 'Home', icon: FaHome },
      { path: '/jobs', label: 'Browse Jobs', icon: FaBriefcase },
    ];

    if (!user) {
      return [
        ...common,
        { divider: true, label: 'Account' },
        { path: '/login', label: 'Login', icon: FaUser },
        { path: '/register', label: 'Register', icon: FaArrowRight },
      ];
    }

    if (user.role === 'student') {
      return [
        { divider: true, label: 'Main' },
        ...common,
        { divider: true, label: 'My Space' },
        { path: '/student/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { path: '/applications', label: 'My Applications', icon: FaClipboardList },
      ];
    }

    if (user.role === 'company') {
      return [
        { divider: true, label: 'Main' },
        ...common,
        { divider: true, label: 'Management' },
        { path: '/company/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { divider: true, label: 'Quick Access' },
        { path: '/company/dashboard', label: 'Post New Job', icon: FaRocket, hash: '#post' },
      ];
    }

    if (user.role === 'admin') {
      return [
        { divider: true, label: 'Main' },
        ...common,
        { divider: true, label: 'Administration' },
        { path: '/admin/dashboard', label: 'Dashboard', icon: FaChartBar },
        { divider: true, label: 'Quick Access' },
        { path: '/admin/users', label: 'User Management', icon: FaUsers },
        { path: '/admin/dashboard', label: 'Approvals', icon: FaCheckCircle, hash: '#approvals' },
      ];
    }

    if (user.role === 'placementHead') {
      return [
        { divider: true, label: 'Main' },
        ...common,
        { divider: true, label: 'Placement Office' },
        { path: '/placement-head/dashboard', label: 'Dashboard', icon: FaChartBar },
        { path: '/placement-head/selected-students', label: 'Selected Students', icon: FaUserGraduate },
        { path: '/placement-head/salary-analytics', label: 'Salary Analytics', icon: FaChartBar },
        { path: '/placement-head/job-control', label: 'Job Control', icon: FaBriefcase },
        { path: '/placement-head/reports', label: 'Reports', icon: FaClipboardList },
      ];
    }

    return common;
  }, [user]);

  // Greeting based on time
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Quick-tip per role
  const quickTip = useMemo(() => {
    const tips = {
      student: [
        'Keep your profile updated to attract recruiters!',
        'Apply early — first applicants get noticed first.',
        'Check back daily for new job postings.',
      ],
      company: [
        'Detailed job descriptions attract better candidates.',
        'Review applications promptly for top talent.',
        'Keep your company profile updated.',
      ],
      admin: [
        'Approve pending companies to grow the platform.',
        'Monitor user activity for platform health.',
        'Keep blocked accounts under review.',
      ],
      placementHead: [
        'Monitor placement statistics daily.',
        'Review department-wise placement performance.',
        'Use reports to track hiring trends.',
      ],
    };
    const arr = tips[user?.role] || tips.student;
    return arr[Math.floor(Math.random() * arr.length)];
  }, [user?.role]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle-btn d-lg-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <FaBars size={18} />
      </button>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay d-lg-none ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      >
        {/* ---- Header ---- */}
        <div className="sidebar-header">
          {!isCollapsed ? (
            <Link to="/" className="sidebar-brand">
              <img src="/logo.png" alt="PlacementPortal" className="sidebar-brand-logo" />
              <span className="sidebar-brand-text">PlacementPortal</span>
            </Link>
          ) : (
            <Link to="/" className="sidebar-brand-collapsed">
              <img src="/logo.png" alt="PlacementPortal" className="sidebar-brand-logo-sm" />
            </Link>
          )}

          <button className="sidebar-close-btn d-lg-none" onClick={() => setIsOpen(false)}>
            <FaTimes size={16} />
          </button>
          <button
            className="sidebar-collapse-btn d-none d-lg-flex"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
          </button>
        </div>

        {/* ---- Profile Card ---- */}
        {user && (
          <div className="sidebar-profile d-flex justify-content-between align-items-center" style={{ position: 'relative' }}>
            <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
              {/* Clickable Avatar */}
              <div
                className={`sidebar-avatar-wrapper${avatarUploading ? ' uploading' : ''}`}
                onClick={handleAvatarClick}
                title="Click to change profile photo"
                style={{ position: 'relative', minWidth: '36px', width: '36px', height: '36px', cursor: 'pointer', flexShrink: 0 }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.25)' }}
                  />
                ) : (
                  <div className="sidebar-profile-avatar" style={{ background: currentRole.gradient, width: '36px', height: '36px', lineHeight: '36px', textAlign: 'center', borderRadius: '50%', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="sidebar-avatar-overlay">
                  {avatarUploading ? (
                    <div className="sidebar-avatar-spinner" />
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  )}
                </div>
                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              {!isCollapsed && (
                <div className="sidebar-profile-info" style={{ overflow: 'hidden' }}>
                  <div className="sidebar-profile-greeting">{getGreeting()}</div>
                  <div className="sidebar-profile-name text-truncate">{user.name}</div>
                  <div className="sidebar-profile-role">
                    <currentRole.icon size={10} className="me-1" />
                    {currentRole.label}
                  </div>
                  {avatarError && (
                    <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: '2px', lineHeight: '1.2' }}>{avatarError}</div>
                  )}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div style={{ marginLeft: 'auto' }}>
                <NotificationDropdown isSidebar={true} />
              </div>
            )}
          </div>
        )}

        {/* ---- Navigation ---- */}
        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            if (item.divider) {
              return (
                <div key={`div-${index}`} className="sidebar-divider">
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.path) && !item.hash && !item.queryFlag;
            const hovered = hoveredItem === index;

            return (
              <Link
                key={`${item.path}-${index}`}
                to={item.hash ? `${item.path}${item.hash}` : item.path}
                className={`sidebar-nav-item ${active ? 'active' : ''} ${hovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isCollapsed ? item.label : ''}
              >
                <div className="sidebar-nav-icon">
                  <Icon size={16} />
                </div>
                {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                {active && <div className="sidebar-active-indicator" />}
                {isCollapsed && hovered && (
                  <div className="sidebar-tooltip">{item.label}</div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ---- Widgets (only when expanded) ---- */}
        {!isCollapsed && (
          <div className="sidebar-widgets">
            {/* Platform Status */}
            <div className="sidebar-widget sidebar-widget-status">
              <div className="sidebar-widget-header">
                <FaCircle size={7} className="sidebar-status-dot" />
                <span>System Online</span>
              </div>
              <div className="sidebar-widget-meta">
                <FaClock size={9} />
                <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Help Link */}
            <a
              href="mailto:support@placehub.com"
              className="sidebar-widget sidebar-widget-help"
              target="_blank"
              rel="noreferrer"
            >
              <FaHeadset size={14} />
              <span>Need Help?</span>
              <FaExternalLinkAlt size={9} className="ms-auto" />
            </a>
          </div>
        )}

        {/* ---- Footer ---- */}
        <div className="sidebar-footer">
          {user && (
            <button
              className="sidebar-nav-item sidebar-logout"
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : ''}
            >
              <div className="sidebar-nav-icon">
                <FaSignOutAlt size={16} />
              </div>
              {!isCollapsed && <span className="sidebar-nav-label">Logout</span>}
            </button>
          )}
          {!isCollapsed && (
            <div className="sidebar-footer-branding">
              <small>&copy; 2026 PlaceHub</small>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
