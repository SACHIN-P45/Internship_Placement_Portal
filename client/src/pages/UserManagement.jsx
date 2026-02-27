// User Management — dedicated page for managing all platform users
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaUserGraduate,
  FaBuilding,
  FaBan,
  FaUnlock,
  FaTrash,
  FaSearch,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaUserShield,
  FaFilter,
  FaSyncAlt,
  FaUserPlus,
  FaShieldAlt,
  FaChartBar,
  FaEnvelope,
} from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await adminService.getUsers(userFilter);
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [userFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast.success('User list refreshed');
  };

  const filteredUsers = users.filter(
    (u) =>
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.companyName?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const setActionLoad = (id, val) => setActionLoading((p) => ({ ...p, [id]: val }));

  const handleToggleBlock = async (id) => {
    setActionLoad(id, 'block');
    try {
      const { data } = await adminService.toggleBlockUser(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoad(id, null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    setActionLoad(id, 'delete');
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoad(id, null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getRoleBadge = (role) => {
    const map = {
      admin: { bg: 'usm-badge-purple', icon: FaUserShield, label: 'Admin' },
      company: { bg: 'usm-badge-green', icon: FaBuilding, label: 'Company' },
      student: { bg: 'usm-badge-blue', icon: FaUserGraduate, label: 'Student' },
      placementHead: { bg: 'usm-badge-orange', icon: FaChartBar, label: 'Placement' },
    };
    const r = map[role] || map.student;
    return (
      <span className={`usm-role-badge ${r.bg}`}>
        <r.icon size={11} /> {r.label}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  // Stats
  const totalUsers = users.length;
  const activeUsersCount = users.filter(
    (u) => u.lastActive && new Date() - new Date(u.lastActive) < 5 * 60 * 1000
  ).length;
  const blockedUsersCount = users.filter((u) => u.isBlocked).length;
  const studentsCount = users.filter((u) => u.role === 'student').length;
  const companiesCount = users.filter((u) => u.role === 'company').length;

  const statCards = [
    { icon: FaUsers, value: totalUsers, label: 'Total Users', variant: 'blue' },
    { icon: FaCheckCircle, value: activeUsersCount, label: 'Active Now', variant: 'emerald' },
    { icon: FaUserGraduate, value: studentsCount, label: 'Students', variant: 'cyan' },
    { icon: FaBuilding, value: companiesCount, label: 'Companies', variant: 'violet' },
    { icon: FaBan, value: blockedUsersCount, label: 'Blocked', variant: 'red' },
  ];

  return (
    <div className="phd-page">
      {/* Hero Header */}
      <div className="phd-hero">
        <div className="phd-hero-bg" />
        <div className="phd-hero-content">
          <div className="phd-hero-left">
            <div className="phd-hero-icon">
              <FaUserShield size={26} />
            </div>
            <div>
              <h1 className="phd-hero-title">User Management</h1>
              <p className="phd-hero-sub">Manage all platform users, roles & access</p>
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
          </div>
        </div>
      </div>

      <div className="phd-stats-row" style={{ flexWrap: 'wrap' }}>
        {statCards.map((stat, i) => (
          <div key={i} className={`phd-stat-card phd-stat-${stat.variant}`} style={{ animationDelay: `${i * 0.05}s`, minWidth: '180px', flex: 1 }}>
            <div className="phd-stat-icon-wrap"><stat.icon size={20} /></div>
            <div className="phd-stat-content">
              <span className="phd-stat-number">{stat.value}</span>
              <span className="phd-stat-text">{stat.label}</span>
            </div>
            <div className="phd-stat-glow" />
          </div>
        ))}
      </div>

      <div className="phd-content">
        <div className="phd-card phd-card-full">
          <div className="phd-card-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="phd-card-icon phd-card-icon-indigo"><FaShieldAlt size={16} /></div>
              <div>
                <h3 className="phd-card-title">All Users</h3>
                <p className="phd-card-sub">{filteredUsers.length} users found</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '250px' }}>
                <FaSearch size={14} style={{ color: '#94a3b8', marginRight: '10px' }} />
                <input
                  type="text"
                  placeholder="Search name, email, company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#334155' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <FaFilter size={14} style={{ color: '#94a3b8', marginRight: '10px' }} />
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="company">Companies</option>
                  <option value="admin">Admins</option>
                  <option value="placementHead">Placement Heads</option>
                </select>
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="adm-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="adm-empty-icon adm-empty-primary" style={{
                margin: '0 auto 16px',
                width: '64px',
                height: '64px',
                background: '#eff6ff',
                color: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaSearch size={28} />
              </div>
              <h6 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>No Users Found</h6>
              <p style={{ color: '#64748b' }}>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', padding: '10px 5px', minHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', minWidth: '950px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 24px 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>Profile & Identity</th>
                    <th style={{ padding: '0 24px 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>Account Role</th>
                    <th style={{ padding: '0 24px 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>Activity Status</th>
                    <th style={{ padding: '0 24px 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>Registration Date</th>
                    <th style={{ padding: '0 24px 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => {
                    const isBlocked = u.isBlocked;
                    const rBase = u.role === 'admin' ? '#8b5cf6' : u.role === 'placementHead' ? '#f97316' : u.role === 'company' ? '#10b981' : '#3b82f6';
                    const rBg = u.role === 'admin' ? '#ede9fe' : u.role === 'placementHead' ? '#ffedd5' : u.role === 'company' ? '#d1fae5' : '#dbeafe';
                    const isActive = u.lastActive && new Date() - new Date(u.lastActive) < 5 * 60 * 1000;

                    return (
                      <tr
                        key={u._id}
                        style={{
                          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards',
                          animationDelay: `${i * 0.05}s`,
                          background: isBlocked ? '#fffbfb' : '#ffffff',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.01)',
                          transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(0,0,0,0.08), 0 4px 6px -3px rgba(0,0,0,0.04)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.01)';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '20px 24px', borderRadius: '16px 0 0 16px', border: '1px solid #f1f5f9', borderRight: 'none', background: 'inherit' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                              width: '44px', height: '44px', borderRadius: '12px',
                              background: isBlocked ? '#fee2e2' : rBg,
                              color: isBlocked ? '#ef4444' : rBase,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.25rem', fontWeight: 700, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                            }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 600, color: isBlocked ? '#94a3b8' : '#1e293b', fontSize: '1.05rem', letterSpacing: '-0.2px' }}>
                                {u.name}
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                  <FaEnvelope size={10} style={{ marginRight: '6px', opacity: 0.7 }} />
                                  {u.email}
                                </span>
                                {u.companyName && (
                                  <span style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#475569', fontWeight: 500, border: '1px solid #e2e8f0' }}>
                                    <FaBuilding size={10} style={{ marginRight: '5px', color: '#64748b' }} />
                                    {u.companyName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: 'inherit' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: isBlocked ? '#f1f5f9' : rBg,
                            color: isBlocked ? '#94a3b8' : rBase,
                            padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                            letterSpacing: '0.3px'
                          }}>
                            {u.role === 'admin' ? <><FaUserShield size={12} style={{ marginRight: '6px' }} /> Admin</> :
                              u.role === 'placementHead' ? <><FaChartBar size={12} style={{ marginRight: '6px' }} /> Placement Head</> :
                                u.role === 'company' ? <><FaBuilding size={12} style={{ marginRight: '6px' }} /> Employer</> :
                                  <><FaUserGraduate size={12} style={{ marginRight: '6px' }} /> Student</>}
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: 'inherit' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isBlocked ? (
                              <>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 3px #fee2e2' }} />
                                <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>Blocked</span>
                              </>
                            ) : isActive ? (
                              <>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px #d1fae5', animation: 'pulse 2s infinite' }} />
                                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Active Now</span>
                              </>
                            ) : (
                              <>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1', boxShadow: '0 0 0 3px #f1f5f9' }} />
                                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>Offline</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: 'inherit' }}>
                          <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                            <FaClock size={12} style={{ marginRight: '8px', color: '#94a3b8' }} />
                            {formatDate(u.createdAt)}
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px', borderRadius: '0 16px 16px 0', border: '1px solid #f1f5f9', borderLeft: 'none', background: 'inherit' }}>
                          {u.role !== 'admin' && u.role !== 'placementHead' ? (
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleToggleBlock(u._id)}
                                disabled={!!actionLoading[u._id]}
                                title={isBlocked ? 'Restore Access' : 'Suspend User'}
                                style={{
                                  width: '38px', height: '38px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                  background: isBlocked ? '#ecfdf5' : '#fff1f2',
                                  color: isBlocked ? '#10b981' : '#e11d48',
                                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                                  transition: 'all 0.2s', opacity: actionLoading[u._id] ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                {actionLoading[u._id] === 'block' ? (
                                  <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }} />
                                ) : isBlocked ? (
                                  <FaUnlock size={15} />
                                ) : (
                                  <FaBan size={15} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(u._id)}
                                disabled={!!actionLoading[u._id]}
                                title="Delete permanently"
                                style={{
                                  width: '38px', height: '38px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                  background: '#f8fafc', color: '#64748b',
                                  boxShadow: 'inset 0 0 0 1px #e2e8f0',
                                  transition: 'all 0.2s', opacity: actionLoading[u._id] ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #fecaca'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #e2e8f0'; e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                {actionLoading[u._id] === 'delete' ? (
                                  <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }} />
                                ) : (
                                  <FaTrash size={15} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div style={{ color: '#cbd5e1', fontSize: '0.8rem', textAlign: 'right', fontWeight: 500, paddingRight: '10px' }}>
                              Protected
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
