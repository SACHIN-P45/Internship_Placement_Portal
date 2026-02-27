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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const statCards = stats ? [
    { icon: FaUserGraduate, value: stats.totalStudents, label: 'Students', variant: 'blue' },
    { icon: FaBuilding, value: stats.totalCompanies, label: 'Companies', variant: 'emerald' },
    { icon: FaBriefcase, value: stats.totalJobs, label: 'Job Posts', variant: 'violet' },
    { icon: FaUsers, value: stats.totalApplications || 0, label: 'Applications', variant: 'cyan' },
    { icon: FaTrophy, value: stats.totalSelected, label: 'Placed', variant: 'green' },
    { icon: FaClock, value: stats.pendingCompanies, label: 'Pending', variant: 'amber' },
  ] : [];

  return (
    <div className="phd-page">
      {/* Hero Header */}
      <div className="phd-hero">
        <div className="phd-hero-bg" />
        <div className="phd-hero-content">
          <div className="phd-hero-left">
            <div className="phd-hero-icon">
              <FaShieldAlt size={26} />
            </div>
            <div>
              <h1 className="phd-hero-title">{greeting}, Admin 👋</h1>
              <p className="phd-hero-sub">Platform management & analytics centre</p>
            </div>
          </div>
          <div className="phd-hero-date">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                marginRight: '15px',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <FaSyncAlt size={14} className={refreshing ? 'adm-spin' : ''} />
            </button>
            <FaCalendarAlt size={12} />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="phd-stats-row">
        {statCards.slice(0, 4).map((stat, i) => (
          <div key={i} className={`phd-stat-card phd-stat-${stat.variant}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="phd-stat-icon-wrap"><stat.icon size={20} /></div>
            <div className="phd-stat-content">
              <span className="phd-stat-number">{stat.value}</span>
              <span className="phd-stat-text">{stat.label}</span>
            </div>
            <div className="phd-stat-glow" />
          </div>
        ))}
      </div>

      <div className="phd-stats-row phd-stats-row-2">
        {statCards.slice(4).map((stat, i) => (
          <div key={i + 4} className={`phd-stat-card phd-stat-${stat.variant}`} style={{ animationDelay: `${(i + 4) * 0.05}s` }}>
            <div className="phd-stat-icon-wrap"><stat.icon size={20} /></div>
            <div className="phd-stat-content">
              <span className="phd-stat-number">{stat.value}</span>
              <span className="phd-stat-text">{stat.label}</span>
            </div>
            <div className="phd-stat-glow" />
          </div>
        ))}

        <Link to="/admin/users" style={{ textDecoration: 'none', display: 'block', flex: 1, minWidth: '220px' }}>
          <div className={`phd-stat-card phd-stat-pink`} style={{ animationDelay: `0.3s`, height: '100%', cursor: 'pointer' }}>
            <div className="phd-stat-icon-wrap"><FaUsers size={20} /></div>
            <div className="phd-stat-content">
              <span className="phd-stat-number">Manage Users</span>
              <span className="phd-stat-text">Review platform accounts</span>
            </div>
            <div className="phd-stat-glow" />
          </div>
        </Link>
      </div>

      <div className="phd-content">
        {/* Pending Approvals */}
        <div className="phd-card phd-card-full" id="approvals">
          <div className="phd-card-header">
            <div className="phd-card-icon phd-card-icon-amber"><FaClock size={16} /></div>
            <div>
              <h3 className="phd-card-title">Pending Company Registrations</h3>
              <p className="phd-card-sub">Review and approve new employer accounts</p>
            </div>
            <span className="phd-card-badge">
              {pendingCompanies.length} pending
            </span>
          </div>

          {pendingCompanies.length === 0 ? (
            <div className="adm-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="adm-empty-icon adm-empty-success" style={{
                margin: '0 auto 16px',
                width: '64px',
                height: '64px',
                background: '#ecfdf5',
                color: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaCheckCircle size={32} />
              </div>
              <h6 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>All Caught Up!</h6>
              <p style={{ color: '#64748b' }}>No pending company registrations to review right now.</p>
            </div>
          ) : (
            <div className="phd-table-wrap">
              <table className="phd-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Details</th>
                    <th>Registered On</th>
                    <th className="phd-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCompanies.map((c, i) => (
                    <tr key={c._id} className="phd-tr" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td>
                        <div className="phd-company-cell">
                          <div className="phd-company-dot" style={{
                            background: `hsl(${(c.companyName?.charCodeAt(0) || 65) * 9 % 360}, 55%, 92%)`,
                            color: `hsl(${(c.companyName?.charCodeAt(0) || 65) * 9 % 360}, 55%, 35%)`
                          }}>
                            {(c.companyName || c.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>
                              {c.companyName || '—'}
                            </span>
                            {c.website && (
                              <a href={c.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none' }}>
                                <FaGlobe size={10} style={{ marginRight: '4px' }} />
                                {c.website.replace(/^https?:\/\//, '').slice(0, 25)}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="phd-student-info">
                          <span className="phd-student-name">{c.name}</span>
                          <span className="phd-student-email text-muted">
                            <FaEnvelope size={10} style={{ marginRight: '4px' }} />
                            {c.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="phd-pkg-badge" style={{ whiteSpace: 'normal', maxWidth: '250px', background: 'transparent', color: '#64748b', fontSize: '0.85rem' }}>
                          {c.description ? (c.description.length > 60 ? c.description.slice(0, 60) + '...' : c.description) : 'No description provided'}
                        </span>
                      </td>
                      <td>
                        <span className="phd-dept-badge" style={{ background: '#f8fafc', color: '#475569' }}>
                          {formatDate(c.createdAt)}
                        </span>
                      </td>
                      <td className="phd-td-right">
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleApprove(c._id)}
                            disabled={!!actionLoading[c._id]}
                            style={{
                              background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            {actionLoading[c._id] === 'approve' ? (
                              <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} />
                            ) : (
                              <><FaCheck size={12} /> Approve</>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(c._id)}
                            disabled={!!actionLoading[c._id]}
                            style={{
                              background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            {actionLoading[c._id] === 'reject' ? (
                              <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} />
                            ) : (
                              <><FaTimes size={12} /> Reject</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
