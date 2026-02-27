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
            <div className="phd-table-wrap">
              <table className="phd-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="phd-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u._id} className="phd-tr" style={{ animationDelay: `${i * 0.05}s`, opacity: u.isBlocked ? 0.7 : 1 }}>
                      <td>
                        <div className="phd-company-cell">
                          <div className="phd-company-dot" style={{
                            background: u.isBlocked ? '#fee2e2' : u.role === 'admin' ? '#ede9fe' : u.role === 'placementHead' ? '#ffedd5' : u.role === 'company' ? '#d1fae5' : '#dbeafe',
                            color: u.isBlocked ? '#ef4444' : u.role === 'admin' ? '#8b5cf6' : u.role === 'placementHead' ? '#f97316' : u.role === 'company' ? '#10b981' : '#3b82f6',
                            fontSize: '1.1rem',
                            fontWeight: 600
                          }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: u.isBlocked ? '#94a3b8' : '#334155' }}>
                              {u.name}
                            </span>
                            <span className="phd-student-email text-muted" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center' }}>
                                <FaEnvelope size={10} style={{ marginRight: '4px' }} />
                                {u.email}
                              </span>
                              {u.companyName && (
                                <span style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  <FaBuilding size={10} style={{ marginRight: '4px' }} />
                                  {u.companyName}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="phd-type-badge" style={{
                          background: u.role === 'admin' ? '#ede9fe' : u.role === 'placementHead' ? '#ffedd5' : u.role === 'company' ? '#d1fae5' : '#dbeafe',
                          color: u.role === 'admin' ? '#8b5cf6' : u.role === 'placementHead' ? '#f97316' : u.role === 'company' ? '#10b981' : '#3b82f6',
                        }}>
                          {u.role === 'admin' ? <><FaUserShield size={10} style={{ marginRight: '4px' }} /> Admin</> :
                            u.role === 'placementHead' ? <><FaChartBar size={10} style={{ marginRight: '4px' }} /> Placement</> :
                              u.role === 'company' ? <><FaBuilding size={10} style={{ marginRight: '4px' }} /> Company</> :
                                <><FaUserGraduate size={10} style={{ marginRight: '4px' }} /> Student</>}
                        </span>
                      </td>
                      <td>
                        {u.isBlocked ? (
                          <span className="phd-type-badge" style={{ background: '#fee2e2', color: '#ef4444' }}>
                            <FaBan size={10} style={{ marginRight: '4px' }} /> Blocked
                          </span>
                        ) : u.lastActive && new Date() - new Date(u.lastActive) < 5 * 60 * 1000 ? (
                          <span className="phd-type-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>
                            <FaCheckCircle size={10} style={{ marginRight: '4px' }} /> Active
                          </span>
                        ) : (
                          <span className="phd-type-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            <FaClock size={10} style={{ marginRight: '4px' }} /> Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="phd-dept-badge" style={{ background: '#f8fafc', color: '#475569' }}>
                          {formatDate(u.createdAt)}
                        </span>
                      </td>
                      <td className="phd-td-right">
                        {u.role !== 'admin' && u.role !== 'placementHead' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleToggleBlock(u._id)}
                              disabled={!!actionLoading[u._id]}
                              title={u.isBlocked ? 'Unblock' : 'Block'}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                background: u.isBlocked ? '#dcfce7' : '#fee2e2',
                                color: u.isBlocked ? '#16a34a' : '#ef4444',
                                transition: 'all 0.2s', opacity: actionLoading[u._id] ? 0.7 : 1
                              }}
                            >
                              {actionLoading[u._id] === 'block' ? (
                                <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} />
                              ) : u.isBlocked ? (
                                <FaUnlock size={14} />
                              ) : (
                                <FaBan size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(u._id)}
                              disabled={!!actionLoading[u._id]}
                              title="Delete user"
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                background: '#f1f5f9', color: '#64748b',
                                transition: 'all 0.2s', opacity: actionLoading[u._id] ? 0.7 : 1
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                            >
                              {actionLoading[u._id] === 'delete' ? (
                                <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} />
                              ) : (
                                <FaTrash size={14} />
                              )}
                            </button>
                          </div>
                        )}
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

export default UserManagement;
