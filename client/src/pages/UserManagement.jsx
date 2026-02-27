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
    { icon: FaUsers, value: totalUsers, label: 'Total Users', color: '#6366f1', bg: '#eef2ff' },
    { icon: FaCheckCircle, value: activeUsersCount, label: 'Active Now', color: '#22c55e', bg: '#f0fdf4' },
    { icon: FaUserGraduate, value: studentsCount, label: 'Students', color: '#3b82f6', bg: '#eff6ff' },
    { icon: FaBuilding, value: companiesCount, label: 'Companies', color: '#10b981', bg: '#ecfdf5' },
    { icon: FaBan, value: blockedUsersCount, label: 'Blocked', color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <div className="usm-page">
      {/* ══════════ Header ══════════ */}
      <div className="usm-header">
        <div className="usm-header-left">
          <div className="usm-header-icon">
            <FaUsers size={22} />
          </div>
          <div>
            <h2 className="usm-header-title">User Management</h2>
            <p className="usm-header-sub">Manage all platform users, roles & access</p>
          </div>
        </div>
        <div className="usm-header-right">
          <button
            className="usm-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh users"
          >
            <FaSyncAlt size={14} className={refreshing ? 'usm-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ══════════ Stats Row ══════════ */}
      <div className="usm-stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="usm-stat-card">
            <div className="usm-stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={18} />
            </div>
            <div className="usm-stat-info">
              <div className="usm-stat-value">{s.value}</div>
              <div className="usm-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ Users Section ══════════ */}
      <div className="usm-section">
        <div className="usm-section-header">
          <div>
            <h5 className="usm-section-title">
              <FaShieldAlt className="text-primary" /> All Users
            </h5>
            <p className="usm-section-sub">{filteredUsers.length} users found</p>
          </div>
          <div className="usm-user-controls">
            <div className="usm-search-box">
              <FaSearch size={13} className="usm-search-icon" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="usm-filter-select">
              <FaFilter size={11} className="usm-filter-icon" />
              <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
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
          <div className="usm-empty-state">
            <div className="usm-empty-icon">
              <FaSearch size={40} />
            </div>
            <h6>No Users Found</h6>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="usm-users-table-wrap">
            <table className="usm-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className={u.isBlocked ? 'usm-row-blocked' : ''}>
                    <td>
                      <div className="usm-user-cell">
                        <div
                          className="usm-user-avatar"
                          style={{
                            background: u.isBlocked
                              ? '#fecaca'
                              : u.role === 'admin'
                                ? '#ede9fe'
                                : u.role === 'placementHead'
                                  ? '#fff7ed'
                                  : u.role === 'company'
                                    ? '#d1fae5'
                                    : '#dbeafe',
                            color: u.isBlocked
                              ? '#dc2626'
                              : u.role === 'admin'
                                ? '#7c3aed'
                                : u.role === 'placementHead'
                                  ? '#ea580c'
                                  : u.role === 'company'
                                    ? '#059669'
                                    : '#2563eb',
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="usm-user-name">{u.name}</div>
                          <div className="usm-user-email">{u.email}</div>
                          {u.companyName && <div className="usm-user-company">{u.companyName}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      {u.isBlocked ? (
                        <span className="usm-status-badge usm-status-blocked">
                          <FaBan size={10} /> Blocked
                        </span>
                      ) : u.lastActive && new Date() - new Date(u.lastActive) < 5 * 60 * 1000 ? (
                        <span className="usm-status-badge usm-status-active">
                          <FaCheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="usm-status-badge usm-status-inactive">
                          <FaClock size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="usm-date">{formatDate(u.createdAt)}</span>
                    </td>
                    <td>
                      {u.role !== 'admin' && u.role !== 'placementHead' && (
                        <div className="usm-action-btns">
                          <button
                            className={`usm-action-btn ${u.isBlocked ? 'usm-act-unblock' : 'usm-act-block'}`}
                            onClick={() => handleToggleBlock(u._id)}
                            disabled={!!actionLoading[u._id]}
                            title={u.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {actionLoading[u._id] === 'block' ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : u.isBlocked ? (
                              <FaUnlock size={13} />
                            ) : (
                              <FaBan size={13} />
                            )}
                          </button>
                          <button
                            className="usm-action-btn usm-act-delete"
                            onClick={() => handleDelete(u._id)}
                            disabled={!!actionLoading[u._id]}
                            title="Delete user"
                          >
                            {actionLoading[u._id] === 'delete' ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <FaTrash size={13} />
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
  );
};

export default UserManagement;
