// Main App component — routing configuration
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import { useAuth } from './context/AuthContext';
import adminService from './services/adminService';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import StudentDashboard from './pages/StudentDashboard';
import ApplicationStatus from './pages/ApplicationStatus';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import PlacementHeadDashboard from './pages/PlacementHeadDashboard';
import PHSelectedStudents from './pages/PHSelectedStudents';
import PHSalaryAnalytics from './pages/PHSalaryAnalytics';
import PHJobControl from './pages/PHJobControl';
import PHReports from './pages/PHReports';
import NotFound from './pages/NotFound';

// Pages where sidebar should be hidden
const NO_SIDEBAR_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/oauth/callback'];

function App() {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getPublicSettings();
        setAppSettings(res.data.settings);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Dynamic Maintenance States
  const [progress, setProgress] = useState(0);
  const [tickerLabel, setTickerLabel] = useState('Initialising services…');
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState('just now');
  const [startTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [mountTime] = useState(Date.now());

  const isMaintenanceMode = appSettings?.maintenanceMode && user?.role !== 'admin' && location.pathname !== '/login';

  useEffect(() => {
    if (isMaintenanceMode) {
      const steps = [
        { val: 18, label: 'Syncing database schemas…' },
        { val: 37, label: 'Migrating placement records…' },
        { val: 55, label: 'Rebuilding search indexes…' },
        { val: 71, label: 'Applying security patches…' },
        { val: 86, label: 'Running integration tests…' },
        { val: 94, label: 'Finalising deployments…' },
      ];

      let timeoutIds = [];
      
      // Initial jump
      const t1 = setTimeout(() => {
        setProgress(8);
      }, 700);
      timeoutIds.push(t1);

      // Animate steps
      steps.forEach((step, index) => {
        const t = setTimeout(() => {
          setProgress(step.val);
          setTickerLabel(step.label);
        }, 1500 + index * 2600);
        timeoutIds.push(t);
      });

      // Live clock for "Last checked"
      const interval = setInterval(() => {
        const secs = Math.round((Date.now() - mountTime) / 1000);
        if (!isChecking) {
          setLastChecked(
            secs < 10 ? 'just now' : 
            secs < 60 ? `${secs}s ago` : 
            `${Math.round(secs / 60)}m ago`
          );
        }
      }, 1000);

      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
        clearInterval(interval);
      };
    }
  }, [isMaintenanceMode, mountTime, isChecking]);

  // Show full-page loader while auth context validates the JWT
  if (loading || settingsLoading) return <PageLoader />;

  const hideSidebar = NO_SIDEBAR_ROUTES.includes(location.pathname) || isMaintenanceMode;

  const handleRefresh = () => {
    if (isChecking) return;
    setIsChecking(true);
    setLastChecked('just now');
    setTimeout(() => {
      setIsChecking(false);
    }, 2000);
  };

  if (isMaintenanceMode) {
    return (
      <div className="maintenance-root" style={{ 
        minHeight: '100vh', 
        background: '#05060f',
        color: '#e8eaff',
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Background Canvas */}
        <div className="bg-canvas">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <div className="scene" style={{ 
          position: 'relative', zIndex: 1, height: '100vh', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' 
        }}>
          <div className="card" style={{ 
            background: 'rgba(13, 15, 31, 0.75)', backdropFilter: 'blur(24px)', 
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '28px', 
            padding: '3.5rem 3.5rem 3rem', maxWidth: '560px', width: '100%', position: 'relative',
            boxShadow: '0 0 0 1px rgba(108,99,255,0.12), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(108,99,255,0.35)'
          }}>
            {/* Logo Ring */}
            <div className="icon-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.2rem' }}>
              <div className="icon-ring">
                <img src="/logo.png" alt="Logo" style={{ width: '45px', height: 'auto', borderRadius: '8px' }} />
              </div>
            </div>

            {/* Badge */}
            <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
              <span className="badge">
                <span className="badge-dot" /> Scheduled Maintenance
              </span>
            </div>

            {/* Heading */}
            <h1 style={{ 
              textAlign: 'center', fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 2.8rem)', 
              fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem',
              background: 'linear-gradient(135deg, #e8eaff 30%, #6c63ff 70%, #00d4aa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Upgrading<br />PlacementPortal
            </h1>

            {/* Subtext */}
            <p className="sub" style={{ textAlign: 'center', color: '#7b7f9e', fontSize: '0.97rem', lineHeight: '1.65', fontWeight: 300, marginBottom: '2.2rem' }}>
              We're reinforcing our core infrastructure to bring you a <span style={{ color: '#e8eaff', fontWeight: 500 }}>faster, smarter placement experience</span>. Everything will be back shortly — hang tight.
            </p>

            {/* Progress */}
            <div className="progress-wrap" style={{ marginBottom: '2rem' }}>
              <div className="progress-labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#7b7f9e', marginBottom: '8px' }}>
                <span id="ticker" style={{ transition: 'opacity 0.4s', color: '#00d4aa' }}>{tickerLabel}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track" style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                <div className="progress-fill" style={{ 
                  height: '100%', width: `${progress}%`, borderRadius: '99px', 
                  background: 'linear-gradient(90deg, #6c63ff, #00d4aa)', boxShadow: '0 0 10px rgba(0,212,170,0.4)',
                  transition: 'width 2.5s cubic-bezier(0.4,0,0.2,1)'
                }} />
              </div>
            </div>

            {/* Stats */}
            <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '2rem' }}>
              <div className="stat">
                <span className="stat-val">99.9%</span>
                <span className="stat-label">Uptime SLA</span>
              </div>
              <div className="stat">
                <span className="stat-val">~15m</span>
                <span className="stat-label">Est. Return</span>
              </div>
              <div className="stat">
                <span className="stat-val">v3.0</span>
                <span className="stat-label">New Version</span>
              </div>
            </div>

            {/* Button */}
            <div className="btn-wrap">
              <button 
                className="btn" 
                onClick={handleRefresh}
                style={{
                  width: '100%', padding: '1rem 2rem', borderRadius: '14px', border: 'none',
                  fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em',
                  cursor: 'pointer', background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%)', color: '#fff'
                }}
              >
                <div className="btn-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {isChecking && <div className="spin" />}
                  <span>{isChecking ? 'Checking…' : 'Check Status'}</span>
                </div>
              </button>
            </div>

            {/* ETA Strip */}
            <div className="eta" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: '#7b7f9e' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b7f9e" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Started at <strong style={{ color: '#e8eaff', margin: '0 4px' }}>{startTime}</strong> · Last checked <span style={{ marginLeft: '4px' }}>{lastChecked}</span>
            </div>

            {!user && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a href="/login" style={{ fontSize: '0.75rem', color: '#7b7f9e', textDecoration: 'underline' }}>Admin Gateway</a>
              </div>
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

          .bg-canvas { position: fixed; inset: 0; z-index: 0; overflow: hidden; }
          .bg-canvas::before {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(108,99,255,0.18) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 50% at 80% 85%, rgba(0,212,170,0.12) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 40% at 65% 20%, rgba(108,99,255,0.08) 0%, transparent 50%);
          }
          .bg-canvas::after {
            content: ''; position: absolute; inset: 0;
            background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          }

          .orb { position: fixed; border-radius: 50%; filter: blur(90px); animation: drift 12s ease-in-out infinite alternate; opacity: 0.4; }
          .orb-1 { width: 420px; height: 420px; background: #6c63ff; top: -120px; left: -80px; animation-delay: 0s; }
          .orb-2 { width: 300px; height: 300px; background: #00d4aa; bottom: -100px; right: -60px; animation-delay: -5s; }
          @keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, 40px) scale(1.05); } }

          .icon-ring {
            width: 76px; height: 76px; border-radius: 50%;
            background: linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,170,0.1));
            border: 1.5px solid rgba(108,99,255,0.35);
            display: flex; align-items: center; justify-content: center;
            animation: pulsering 3s ease-in-out infinite;
          }
          @keyframes pulsering {
            0%,100% { box-shadow: 0 0 0 0 rgba(108,99,255,0.4), 0 0 0 12px rgba(108,99,255,0.0); }
            50% { box-shadow: 0 0 0 8px rgba(108,99,255,0.15), 0 0 0 20px rgba(108,99,255,0.05); }
          }

          .badge {
            display: inline-flex; align-items: center; gap: 7px;
            background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.25);
            border-radius: 100px; padding: 5px 14px; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: #a09af0;
          }
          .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #00d4aa; box-shadow: 0 0 6px #00d4aa; animation: blink 1.4s ease-in-out infinite; }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

          .stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 14px 10px; text-align: center; }
          .stat-val { font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 700; color: #e8eaff; display: block; }
          .stat-label { font-size: 0.68rem; color: #7b7f9e; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 2px; }

          .spin {
            width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25);
            border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div className={hideSidebar ? '' : 'app-layout'}>
      {!hideSidebar && (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <div className={!hideSidebar ? `app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}` : 'd-flex flex-column min-vh-100'}>
        {location.pathname === '/' && <Navbar />}

        <main className="flex-grow-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute roles={['student']}>
                  <ApplicationStatus />
                </ProtectedRoute>
              }
            />

            {/* Company routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute roles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Placement Head routes */}
            <Route
              path="/placement-head/dashboard"
              element={
                <ProtectedRoute roles={['placementHead']}>
                  <PlacementHeadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-head/selected-students"
              element={
                <ProtectedRoute roles={['placementHead']}>
                  <PHSelectedStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-head/salary-analytics"
              element={
                <ProtectedRoute roles={['placementHead']}>
                  <PHSalaryAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-head/job-control"
              element={
                <ProtectedRoute roles={['placementHead']}>
                  <PHJobControl />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-head/reports"
              element={
                <ProtectedRoute roles={['placementHead']}>
                  <PHReports />
                </ProtectedRoute>
              }
            />

            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {location.pathname === '/' && <Footer />}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default App;
