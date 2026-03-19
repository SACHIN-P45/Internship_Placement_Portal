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
  FaDownload,
  FaDatabase,
  FaBullhorn,
  FaChartLine,
  FaCogs,
} from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, pendingRes, settingsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingCompanies(),
        adminService.getPublicSettings(),
      ]);
      setStats(statsRes.data);
      setPendingCompanies(pendingRes.data);
      setPlatformSettings(settingsRes.data.settings || { maintenanceMode: false, autoApproveCompanies: false });
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportReport = () => {
    if (!stats) return;
    try {
      const doc = new jsPDF();
      
      // Premium Header
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('Platform Analytics Report', 14, 26);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Internship Placement Portal', 14, 34);
      
      // Timestamp
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 56);

      // --- Table 1: Overall Stats ---
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Platform Statistics', 14, 70);
      
      autoTable(doc, {
        startY: 76,
        head: [['Metric', 'Total Count']],
        body: [
          ['Total Registered Students', stats.totalStudents || 0],
          ['Total Registered Companies', stats.totalCompanies || 0],
          ['Total Job & Internship Posts', stats.totalJobs || 0],
          ['Total Job Applications', stats.totalApplications || 0],
          ['Students Successfully Placed', stats.totalSelected || 0],
          ['Companies Pending Approval', stats.pendingCompanies || 0]
        ],
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 8, textColor: [51, 65, 85] },
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', lineWidth: 0.1, lineColor: [226, 232, 240] },
        bodyStyles: { borderBottomWidth: 0.1, borderBottomColor: [226, 232, 240] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 120, fontStyle: 'bold' },
          1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] }
        }
      });

      // --- Table 2: Monthly Timeline (if available) ---
      if (stats.monthlyStats && stats.monthlyStats.length > 0) {
        let finalY = doc.lastAutoTable.finalY || 70;
        
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('Activity Over Last 6 Months', 14, finalY + 20);
        
        const monthlyBody = stats.monthlyStats.map(m => [m.name, m.applications, m.jobs]);
        
        autoTable(doc, {
          startY: finalY + 26,
          head: [['Month', 'Applications', 'Job Posts']],
          body: monthlyBody,
          theme: 'plain',
          styles: { font: 'helvetica', fontSize: 10, cellPadding: 7, textColor: [51, 65, 85], halign: 'center' },
          headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', lineWidth: 0.1, lineColor: [226, 232, 240] },
          bodyStyles: { borderBottomWidth: 0.1, borderBottomColor: [226, 232, 240] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: {
            0: { halign: 'left', fontStyle: 'bold' }
          }
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount} — Internship Placement Portal Platform Analytics`, 105, 285, { align: 'center' });
      }
      
      doc.save('Platform_Analytics_Report_Premium.pdf');
      toast.success('Report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report: ' + err.message);
    }
  };
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ subject: '', message: '', audience: 'all' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({ maintenanceMode: false, autoApproveCompanies: false });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await adminService.updateSettings(platformSettings);
      toast.success('Settings saved successfully! 🎉');
      setSettingsModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleBackup = async () => {
    try {
      toast.info('Initiating secure database backup...');
      const response = await adminService.backupDatabase();
      const backupStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([backupStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `platform_backup_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Backup downloaded successfully!');
    } catch (err) {
      toast.error('Backup failed. Check connection.');
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastData.subject || !broadcastData.message) {
      return toast.error('Subject and message are required.');
    }
    setIsBroadcasting(true);
    try {
      const res = await adminService.broadcastMessage(broadcastData);
      toast.success(res.data.message || 'Broadcast sent successfully!');
      setBroadcastModal(false);
      setBroadcastData({ subject: '', message: '', audience: 'all' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSimulateAction = (actionName) => {
    toast.info(`${actionName} initiated. (Premium simulated feature)`);
  };

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
      {/* New Analytics & Quick Actions Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', margin: '0 24px 24px 24px', animation: 'fadeIn 0.5s ease-in-out' }}>
        
        {/* Chart Card */}
        <div className="phd-card" style={{ flex: '1 1 500px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="phd-card-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <FaChartLine size={16} />
            </div>
            <div>
              <h3 className="phd-card-title" style={{ margin: 0 }}>Platform Growth Analytics</h3>
              <p className="phd-card-sub" style={{ margin: 0 }}>Applications vs Job Posts (Last 6 Months)</p>
            </div>
          </div>
          
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyStats || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 500 }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="jobs" name="Job Posts" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorJobs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="phd-card" style={{ flex: '1 1 300px', maxWidth: '500px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="phd-card-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <FaBolt size={16} />
            </div>
            <div>
              <h3 className="phd-card-title" style={{ margin: 0 }}>Quick Actions</h3>
              <p className="phd-card-sub" style={{ margin: 0 }}>Essential platform controls</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleExportReport}
              className="phd-action-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 600, textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '10px', borderRadius: '8px' }}><FaDownload size={16} /></div>
              <div style={{ flex: 1 }}>Export PDF Report<div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Download current stats</div></div>
            </button>

            <button 
              onClick={handleBackup}
              className="phd-action-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 600, textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '8px' }}><FaDatabase size={16} /></div>
              <div style={{ flex: 1 }}>Backup Database<div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Securely store records</div></div>
            </button>

            <button 
              onClick={() => setBroadcastModal(true)}
              className="phd-action-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 600, textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ background: '#fef08a', color: '#ca8a04', padding: '10px', borderRadius: '8px' }}><FaBullhorn size={16} /></div>
              <div style={{ flex: 1 }}>Broadcast Message<div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Notify all active users</div></div>
            </button>
            
            <button 
              onClick={() => setSettingsModal(true)}
              className="phd-action-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 600, textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '10px', borderRadius: '8px' }}><FaCogs size={16} /></div>
              <div style={{ flex: 1 }}>Platform Settings<div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Manage system configs</div></div>
            </button>
          </div>
        </div>
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

      {/* Broadcast Modal */}
      {broadcastModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #fef08a, #eab308)', padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.3)', padding: '10px', borderRadius: '50%', color: '#854d0e' }}><FaBullhorn size={20} /></div>
                <h3 style={{ margin: 0, color: '#422006', fontSize: '1.25rem' }}>Send Platform Broadcast</h3>
              </div>
              <button 
                onClick={() => setBroadcastModal(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#713f12', cursor: 'pointer', padding: '4px' }}
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            <form onSubmit={handleBroadcastSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Target Audience</label>
                <select 
                  className="form-control" 
                  value={broadcastData.audience} 
                  onChange={(e) => setBroadcastData({...broadcastData, audience: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                >
                  <option value="all">Every Active User</option>
                  <option value="students">Students Only</option>
                  <option value="companies">Companies Only</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Message Subject</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Platform update scheduled for this weekend"
                  value={broadcastData.subject}
                  onChange={(e) => setBroadcastData({...broadcastData, subject: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Broadcast Message</label>
                <textarea 
                  className="form-control"
                  rows="4"
                  placeholder="Type your detailed message here..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setBroadcastModal(false)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isBroadcasting} style={{ padding: '10px 24px', background: '#ca8a04', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isBroadcasting ? <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }}></span> : <FaBullhorn size={14} />}
                  {isBroadcasting ? 'Sending...' : 'Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal (Simulated UI) */}
      {settingsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '10px', borderRadius: '50%' }}><FaCogs size={18} /></div>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Platform Config</h3>
              </div>
              <button onClick={() => setSettingsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><FaTimes size={16} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h6 style={{ margin: '0 0 4px 0', color: '#334155' }}>Maintenance Mode</h6>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Temporarily disable user access</p>
                </div>
                <div 
                  onClick={() => setPlatformSettings(p => ({...p, maintenanceMode: !p.maintenanceMode}))}
                  style={{ width: '44px', height: '24px', background: platformSettings.maintenanceMode ? '#9333ea' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: platformSettings.maintenanceMode ? '22px' : '2px', transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h6 style={{ margin: '0 0 4px 0', color: '#334155' }}>Auto-Approve Companies</h6>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Skip manual admin review</p>
                </div>
                <div 
                  onClick={() => setPlatformSettings(p => ({...p, autoApprove: !p.autoApprove}))}
                  style={{ width: '44px', height: '24px', background: platformSettings.autoApprove ? '#9333ea' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: platformSettings.autoApprove ? '22px' : '2px', transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)' }}></div>
                </div>
              </div>
              <button 
                onClick={handleSaveSettings} 
                style={{ width: '100%', padding: '12px', background: '#9333ea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, marginTop: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#7e22ce'}
                onMouseLeave={e => e.currentTarget.style.background = '#9333ea'}
              >
                Save Configurations
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
