// Admin Dashboard — premium management centre with approvals and overview
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaUserGraduate,
  FaBuilding,
  FaBriefcase,
  FaTrophy,
  FaClock,
  FaCheck,
  FaTimes,
  FaUsers,
  FaArrowUp,
  FaShieldAlt,
  FaGlobe,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaServer,
  FaBolt,
  FaRegLightbulb,
  FaSyncAlt,
  FaArrowRight,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingCompanies(),
      ]);
      setStats(statsRes.data);
      setPendingCompanies(pendingRes.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const setActionLoad = (id, val) => setActionLoading((p) => ({ ...p, [id]: val }));

  const handleApprove = async (id) => {
    setActionLoad(id, 'approve');
    try {
      await adminService.approveCompany(id);
      setPendingCompanies((p) => p.filter((c) => c._id !== id));
      toast.success('Company approved successfully!');
      const { data } = await adminService.getStats();
      setStats(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoad(id, null); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and remove this company registration?')) return;
    setActionLoad(id, 'reject');
    try {
      await adminService.rejectCompany(id);
      setPendingCompanies((p) => p.filter((c) => c._id !== id));
      toast.success('Company rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoad(id, null); }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  if (loading) return <LoadingSpinner />;

  const statCards = stats ? [
    { icon: FaUserGraduate, value: stats.totalStudents, label: 'Students', color: '#3b82f6', bg: '#eff6ff', trend: '+12%' },
    { icon: FaBuilding, value: stats.totalCompanies, label: 'Companies', color: '#10b981', bg: '#ecfdf5', trend: '+8%' },
    { icon: FaBriefcase, value: stats.totalJobs, label: 'Job Posts', color: '#f59e0b', bg: '#fffbeb', trend: '+24%' },
    { icon: FaUsers, value: stats.totalApplications || 0, label: 'Applications', color: '#6366f1', bg: '#eef2ff', trend: '+31%' },
    { icon: FaTrophy, value: stats.totalSelected, label: 'Placed', color: '#22c55e', bg: '#f0fdf4', trend: '+5%' },
    { icon: FaClock, value: stats.pendingCompanies, label: 'Pending', color: '#ef4444', bg: '#fef2f2', trend: null },
  ] : [];

  return (
    <div className="adm-dashboard">
      {/* ══════════ Header ══════════ */}
      <div className="adm-header">
        <div className="adm-header-left">
          <div className="adm-header-icon">
            <FaShieldAlt size={22} />
          </div>
          <div>
            <h2 className="adm-header-title">Admin Dashboard</h2>
            <p className="adm-header-sub">Platform management & analytics centre</p>
          </div>
        </div>
        <div className="adm-header-right">
          <button
            className="adm-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <FaSyncAlt size={14} className={refreshing ? 'adm-spin' : ''} />
          </button>
          {pendingCompanies.length > 0 && (
            <div className="adm-pending-badge">
              <FaExclamationTriangle size={14} />
              <span>{pendingCompanies.length} Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ Stats Grid ══════════ */}
      <div className="adm-stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="adm-stat-card">
            <div className="adm-stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="adm-stat-info">
              <div className="adm-stat-value">{s.value}</div>
              <div className="adm-stat-label">{s.label}</div>
            </div>
            {s.trend && (
              <div className="adm-stat-trend">
                <FaArrowUp size={9} /> {s.trend}
              </div>
            )}
            <div className="adm-stat-decoration" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* ══════════ Quick Overview Row ══════════ */}
      <div className="adm-overview-row">
        {/* Platform Stats */}
        <div className="adm-overview-card">
          <div className="adm-overview-header">
            <FaServer size={14} className="text-success" />
            <span>Platform Status</span>
          </div>
          <div className="adm-health-grid">
            <div className="adm-health-item">
              <span className="adm-health-dot adm-health-green" />
              <span>System Online</span>
            </div>
            <div className="adm-health-item">
              <span className="adm-health-value">{stats?.totalStudents || 0}</span>
              <span>Students</span>
            </div>
            <div className="adm-health-item">
              <span className="adm-health-value">{stats?.totalCompanies || 0}</span>
              <span>Companies</span>
            </div>
            <div className="adm-health-item">
              <span className="adm-health-value">{stats?.totalJobs || 0}</span>
              <span>Jobs</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="adm-overview-card">
          <div className="adm-overview-header">
            <FaBolt size={14} className="text-warning" />
            <span>Quick Actions</span>
          </div>
          <div className="adm-quick-actions">
            <Link to="/admin/users" className="adm-quick-btn">
              <FaUsers size={12} />
              <span>Manage Users</span>
              <FaArrowRight size={10} className="ms-auto" />
            </Link>
          </div>
        </div>

        {/* Admin Tip */}
        <div className="adm-overview-card adm-tip-card">
          <div className="adm-overview-header">
            <FaRegLightbulb size={14} className="text-primary" />
            <span>Admin Tip</span>
          </div>
          <p className="adm-tip-text">Review pending company registrations promptly to help employers start posting jobs quickly.</p>
        </div>
      </div>

      {/* ══════════ PENDING APPROVALS SECTION ══════════ */}
      <div id="approvals" className="adm-section">
        <div className="adm-section-header">
          <div>
            <h5 className="adm-section-title">
              <FaClock className="text-warning" /> Pending Company Registrations
            </h5>
            <p className="adm-section-sub">{pendingCompanies.length} companies awaiting your review</p>
          </div>
        </div>

        {pendingCompanies.length === 0 ? (
          <div className="adm-empty-state">
            <div className="adm-empty-icon adm-empty-success">
              <FaCheckCircle size={40} />
            </div>
            <h6>All Caught Up!</h6>
            <p>No pending company registrations to review right now.</p>
          </div>
        ) : (
          <div className="adm-approval-grid">
            {pendingCompanies.map((c) => (
              <div key={c._id} className="adm-approval-card">
                <div className="adm-approval-header">
                  <div className="adm-approval-avatar">
                    {(c.companyName || c.name).charAt(0).toUpperCase()}
                  </div>
                  <div className="adm-approval-meta">
                    <h6 className="mb-0 fw-bold">{c.companyName || '—'}</h6>
                    <span className="adm-approval-date">
                      <FaCalendarAlt size={10} className="me-1" />
                      Registered {formatDate(c.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="adm-approval-details">
                  <div className="adm-detail-row">
                    <FaUsers size={12} />
                    <span>Contact: <strong>{c.name}</strong></span>
                  </div>
                  <div className="adm-detail-row">
                    <FaEnvelope size={12} />
                    <span>{c.email}</span>
                  </div>
                  {c.website && (
                    <div className="adm-detail-row">
                      <FaGlobe size={12} />
                      <a href={c.website} target="_blank" rel="noreferrer">
                        {c.website.replace(/^https?:\/\//, '').slice(0, 30)}
                        <FaExternalLinkAlt size={9} className="ms-1" />
                      </a>
                    </div>
                  )}
                  {c.description && (
                    <p className="adm-approval-desc">{c.description}</p>
                  )}
                </div>

                <div className="adm-approval-actions">
                  <button
                    className="adm-btn adm-btn-approve"
                    onClick={() => handleApprove(c._id)}
                    disabled={!!actionLoading[c._id]}
                  >
                    {actionLoading[c._id] === 'approve' ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <><FaCheck size={12} /> Approve</>
                    )}
                  </button>
                  <button
                    className="adm-btn adm-btn-reject"
                    onClick={() => handleReject(c._id)}
                    disabled={!!actionLoading[c._id]}
                  >
                    {actionLoading[c._id] === 'reject' ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <><FaTimes size={12} /> Reject</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
