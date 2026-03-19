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
  FaTimes,
} from 'react-icons/fa';

// Custom CSS for premium drawer and inputs
const customStyles = `
  .premium-input {
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    font-size: 0.95rem;
    color: #0f172a;
    background: #f8fafc;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .premium-input:focus {
    background: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    outline: none;
  }
  .premium-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
    display: block;
  }
  .drawer-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1050;
    transition: opacity 0.3s ease;
  }
  .drawer-panel {
    position: fixed; top: 0; right: 0; bottom: 0; 
    width: 100%; max-width: 440px;
    background: #ffffff;
    z-index: 1060;
    box-shadow: -20px 0 50px rgba(15, 23, 42, 0.15);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex; flex-direction: column;
  }
  .seg-control {
    display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; margin: 0 28px 20px;
  }
  .seg-btn {
    flex: 1; padding: 10px 0; border-radius: 8px; border: none; font-weight: 600; font-size: 0.9rem;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .seg-btn[data-active="true"] {
    background: #ffffff; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  }
  .seg-btn[data-active="false"] {
    background: transparent; color: #64748b;
  }
  .seg-btn[data-active="false"]:hover {
    color: #334155;
  }
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('student');
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', department: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', email: '', password: '', companyName: '', website: '', description: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);

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

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      await adminService.addStudent(studentForm);
      toast.success('Student added successfully!');
      setIsDrawerOpen(false);
      setStudentForm({ name: '', email: '', password: '', department: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    } finally { setIsAddingUser(false); }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      await adminService.addCompany(companyForm);
      toast.success('Company added successfully!');
      setIsDrawerOpen(false);
      setCompanyForm({ name: '', email: '', password: '', companyName: '', website: '', description: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add company');
    } finally { setIsAddingUser(false); }
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
      <style>{customStyles}</style>
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

              <button
                onClick={() => setIsDrawerOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: '#fff',
                  border: 'none', padding: '8px 18px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(59, 130, 246, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)'; }}
              >
                <FaUserPlus size={14} /> Add User
              </button>
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
                          e.currentTarget.style.background = isBlocked ? '#fffbfb' : '#f8fafc';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isBlocked ? '#fffbfb' : '#ffffff';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.01)';
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
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleToggleBlock(u._id)}
                                disabled={!!actionLoading[u._id]}
                                title={isBlocked ? 'Restore Access' : 'Suspend User'}
                                style={{
                                  width: '36px', height: '36px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                  background: isBlocked ? '#ecfdf5' : '#fff1f2',
                                  color: isBlocked ? '#10b981' : '#e11d48',
                                  transition: 'all 0.2s ease', opacity: actionLoading[u._id] ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                {actionLoading[u._id] === 'block' ? (
                                  <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }} />
                                ) : isBlocked ? <FaUnlock size={14} /> : <FaBan size={14} />}
                              </button>
                              <button
                                onClick={() => handleDelete(u._id)}
                                disabled={!!actionLoading[u._id]}
                                title="Delete permanently"
                                style={{
                                  width: '36px', height: '36px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                  background: '#f1f5f9', color: '#64748b',
                                  transition: 'all 0.2s ease', opacity: actionLoading[u._id] ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                {actionLoading[u._id] === 'delete' ? (
                                  <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }} />
                                ) : <FaTrash size={14} />}
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

      {/* Side Drawer Overlay */}
      <div 
        className="drawer-overlay" 
        style={{ opacity: isDrawerOpen ? 1 : 0, pointerEvents: isDrawerOpen ? 'auto' : 'none' }} 
        onClick={() => setIsDrawerOpen(false)} 
      />

      {/* Side Drawer */}
      <div 
        className="drawer-panel"
        style={{ transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '32px 28px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.02em' }}>Add New User</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>Create a new account manually bypassing standard registration.</p>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
            <FaTimes size={14} />
          </button>
        </div>

        {/* Drawer Tabs (Segmented Control) */}
        <div className="seg-control">
          <button onClick={() => setDrawerTab('student')} className="seg-btn" data-active={drawerTab === 'student'}>
            <FaUserGraduate /> Student
          </button>
          <button onClick={() => setDrawerTab('company')} className="seg-btn" data-active={drawerTab === 'company'}>
            <FaBuilding /> Company
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 32px' }}>
          {drawerTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="premium-label">Full Name</label>
                <input type="text" required value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="premium-input" placeholder="e.g. Liam Patel" />
              </div>
              <div>
                <label className="premium-label">Email Address</label>
                <input type="email" required value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="premium-input" placeholder="liam@university.edu" />
              </div>
              <div>
                <label className="premium-label">Temporary Password</label>
                <input type="password" required value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} className="premium-input" placeholder="••••••••" minLength={6} />
              </div>
              <div>
                <label className="premium-label">Department (Optional)</label>
                <input type="text" value={studentForm.department} onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })} className="premium-input" placeholder="e.g. Computer Science" />
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <button type="submit" disabled={isAddingUser} style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: isAddingUser ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', opacity: isAddingUser ? 0.7 : 1 }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  {isAddingUser ? 'Creating Account...' : 'Create Student Account'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="premium-label">Company Name</label>
                <input type="text" required value={companyForm.companyName} onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })} className="premium-input" placeholder="e.g. Acme Tech" />
              </div>
              <div>
                <label className="premium-label">Contact Person</label>
                <input type="text" required value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} className="premium-input" placeholder="e.g. Sarah Connor" />
              </div>
              <div>
                <label className="premium-label">Email Address</label>
                <input type="email" required value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} className="premium-input" placeholder="sarah@acme.com" />
              </div>
              <div>
                <label className="premium-label">Temporary Password</label>
                <input type="password" required value={companyForm.password} onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })} className="premium-input" placeholder="••••••••" minLength={6} />
              </div>
              <div>
                <label className="premium-label">Website</label>
                <input type="text" value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} className="premium-input" placeholder="https://acme.com" />
              </div>
              <div>
                <label className="premium-label">Headline / Short Info</label>
                <textarea rows="3" value={companyForm.description} onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })} className="premium-input" style={{ resize: 'none' }} placeholder="Leading cloud solutions provider..." />
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <button type="submit" disabled={isAddingUser} style={{ padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: isAddingUser ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', opacity: isAddingUser ? 0.7 : 1 }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  {isAddingUser ? 'Creating Account...' : 'Create Company Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
