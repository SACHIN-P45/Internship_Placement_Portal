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

  // Show full-page loader while auth context validates the JWT
  if (loading || settingsLoading) return <PageLoader />;

  const isMaintenanceMode = appSettings?.maintenanceMode && user?.role !== 'admin' && location.pathname !== '/login';
  const hideSidebar = NO_SIDEBAR_ROUTES.includes(location.pathname) || isMaintenanceMode;

  if (isMaintenanceMode) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '24px', 
          padding: '60px 40px',
          maxWidth: '600px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ 
            fontSize: '80px', 
            marginBottom: '30px', 
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
          }}>
            🚧
          </div>
          <h1 style={{ 
            color: 'white', 
            fontWeight: '800', 
            fontSize: '3rem', 
            marginBottom: '20px',
            letterSpacing: '-0.025em'
          }}>
            Systems Offline
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.25rem', 
            lineHeight: '1.7', 
            marginBottom: '40px',
            fontWeight: '400'
          }}>
            We're currently fine-tuning our platform to provide you with a even better experience. We'll be back online shortly.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                padding: '14px 32px', 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Check Status
            </button>
            {!user && (
              <button 
                onClick={() => window.location.href = '/login'} 
                style={{ 
                  padding: '14px 32px', 
                  background: 'transparent', 
                  color: 'white', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: '12px', 
                  fontWeight: '600', 
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Admin Gateway
              </button>
            )}
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
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
