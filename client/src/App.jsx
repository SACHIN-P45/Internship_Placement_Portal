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

  const isMaintenanceMode = appSettings?.maintenanceMode && user?.role !== 'admin';
  const hideSidebar = NO_SIDEBAR_ROUTES.includes(location.pathname) || isMaintenanceMode;

  if (isMaintenanceMode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🚧</div>
        <h1 style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '2.5rem', marginBottom: '16px' }}>Platform Under Maintenance</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '32px' }}>
          We are currently performing scheduled maintenance to improve the platform infrastructure. 
          Please check back later. We apologize for the inconvenience!
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Try Again
          </button>
          {!user && (
            <button onClick={() => window.location.href = '/login'} style={{ padding: '12px 24px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Admin Login
            </button>
          )}
        </div>
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
