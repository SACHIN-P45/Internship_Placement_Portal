// PlacementHeadDashboard — Premium Overview page for Placement Head
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import placementHeadService from '../services/placementHeadService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    FaUsers,
    FaBuilding,
    FaBriefcase,
    FaCheckCircle,
    FaChartLine,
    FaChartBar,
    FaToggleOn,
    FaCrown,
    FaGraduationCap,
    FaRupeeSign,
    FaTachometerAlt,
    FaCalendarAlt,
} from 'react-icons/fa';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

const PlacementHeadDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState(null);
    const [deptStats, setDeptStats] = useState([]);
    const [reports, setReports] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            const { data } = await placementHeadService.getDashboard();
            setDashboard(data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        }
    }, []);

    const fetchDeptStats = useCallback(async () => {
        try {
            const { data } = await placementHeadService.getDepartmentStats();
            setDeptStats(data);
        } catch (err) {
            console.error('Dept stats fetch error:', err);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        try {
            const { data } = await placementHeadService.getReports();
            setReports(data);
        } catch (err) {
            console.error('Reports fetch error:', err);
        }
    }, []);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchDashboard(), fetchDeptStats(), fetchReports()]);
            setLoading(false);
        };
        loadAll();
    }, [fetchDashboard, fetchDeptStats, fetchReports]);

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    if (loading) return <LoadingSpinner />;

    return (
        <div className="phd-page">
            {/* Hero Header */}
            <div className="phd-hero">
                <div className="phd-hero-bg" />
                <div className="phd-hero-content">
                    <div className="phd-hero-left">
                        <div className="phd-hero-icon">
                            <FaTachometerAlt size={26} />
                        </div>
                        <div>
                            <h1 className="phd-hero-title">{greeting}, {user?.name?.split(' ')[1] + " Team" || 'Admin'}👋</h1>
                            <p className="phd-hero-sub">Here's what's happening with placements today</p>
                        </div>
                    </div>
                    <div className="phd-hero-date">
                        <FaCalendarAlt size={12} />
                        <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {dashboard && (
                <>
                    {/* Stat Cards — 2 rows */}
                    <div className="phd-stats-row">
                        {[
                            { label: 'Total Students', value: dashboard.totalStudents, icon: FaUsers, variant: 'blue' },
                            { label: 'Total Companies', value: dashboard.totalCompanies, icon: FaBuilding, variant: 'emerald' },
                            { label: 'Total Jobs', value: dashboard.totalJobs, icon: FaBriefcase, variant: 'violet' },
                            { label: 'Active Jobs', value: dashboard.activeJobs, icon: FaToggleOn, variant: 'cyan' },
                        ].map((stat, i) => (
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
                        {[
                            { label: 'Selected Students', value: dashboard.totalSelected, icon: FaCheckCircle, variant: 'green' },
                            { label: 'Highest Package', value: `₹${dashboard.highestSalary} LPA`, icon: FaCrown, variant: 'amber' },
                            { label: 'Average Package', value: `₹${dashboard.avgSalary} LPA`, icon: FaChartLine, variant: 'pink' },
                        ].map((stat, i) => (
                            <div key={i} className={`phd-stat-card phd-stat-${stat.variant}`} style={{ animationDelay: `${(i + 4) * 0.05}s` }}>
                                <div className="phd-stat-icon-wrap"><stat.icon size={20} /></div>
                                <div className="phd-stat-content">
                                    <span className="phd-stat-number">{stat.value}</span>
                                    <span className="phd-stat-text">{stat.label}</span>
                                </div>
                                <div className="phd-stat-glow" />
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="phd-content">
                        <div className="phd-charts-grid">
                            {/* Department Placement Chart */}
                            {deptStats.length > 0 && (
                                <div className="phd-card">
                                    <div className="phd-card-header">
                                        <div className="phd-card-icon phd-card-icon-blue"><FaChartBar size={16} /></div>
                                        <div>
                                            <h3 className="phd-card-title">Department Placement Rate</h3>
                                            <p className="phd-card-sub">Percentage of students placed per department</p>
                                        </div>
                                        <span className="phd-card-badge">Placement %</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={deptStats.filter(d => d.department)} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                                            <defs>
                                                <linearGradient id="dashGradBar" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} dy={10} angle={0} interval={0} />
                                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(241,245,249,0.5)', radius: 4 }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)', padding: '12px 16px' }}
                                                formatter={(val) => [`${val}%`, 'Placement Rate']}
                                            />
                                            <Bar dataKey="placementPercentage" name="Placement %" radius={[8, 8, 0, 0]} barSize={28} animationDuration={1200}>
                                                {deptStats.filter(d => d.department).map((_, idx) => (
                                                    <Cell key={idx} fill="url(#dashGradBar)" />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Application Status Pie */}
                            {reports && (
                                <div className="phd-card">
                                    <div className="phd-card-header">
                                        <div className="phd-card-icon phd-card-icon-indigo"><FaChartLine size={16} /></div>
                                        <div>
                                            <h3 className="phd-card-title">Application Status</h3>
                                            <p className="phd-card-sub">Breakdown of all applications</p>
                                        </div>
                                        <span className="phd-card-badge">{reports.summary.totalApplications} total</span>
                                    </div>
                                    <div className="phd-pie-container">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Applied', value: reports.summary.totalApplied, color: PIE_COLORS[0] },
                                                        { name: 'Shortlisted', value: reports.summary.totalShortlisted, color: PIE_COLORS[1] },
                                                        { name: 'Selected', value: reports.summary.totalSelected, color: PIE_COLORS[2] },
                                                        { name: 'Rejected', value: reports.summary.totalRejected, color: PIE_COLORS[3] },
                                                    ].filter(d => d.value > 0)}
                                                    cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4}
                                                    dataKey="value" stroke="none"
                                                >
                                                    {[
                                                        { name: 'Applied', value: reports.summary.totalApplied, color: PIE_COLORS[0] },
                                                        { name: 'Shortlisted', value: reports.summary.totalShortlisted, color: PIE_COLORS[1] },
                                                        { name: 'Selected', value: reports.summary.totalSelected, color: PIE_COLORS[2] },
                                                        { name: 'Rejected', value: reports.summary.totalRejected, color: PIE_COLORS[3] },
                                                    ].filter(d => d.value > 0).map((entry, index) => (
                                                        <Cell key={index} fill={entry.color} style={{ outline: 'none' }} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)', padding: '12px 16px' }}
                                                    formatter={(value, name) => [value, name]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Custom Legend */}
                                        <div className="phd-pie-legend">
                                            {[
                                                { name: 'Applied', value: reports.summary.totalApplied, color: PIE_COLORS[0] },
                                                { name: 'Shortlisted', value: reports.summary.totalShortlisted, color: PIE_COLORS[1] },
                                                { name: 'Selected', value: reports.summary.totalSelected, color: PIE_COLORS[2] },
                                                { name: 'Rejected', value: reports.summary.totalRejected, color: PIE_COLORS[3] },
                                            ].filter(d => d.value > 0).map((item, i) => (
                                                <div key={i} className="phd-pie-legend-item">
                                                    <span className="phd-pie-dot" style={{ background: item.color }} />
                                                    <span className="phd-pie-label">{item.name}</span>
                                                    <span className="phd-pie-value">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Selections */}
                        {dashboard.recentSelections?.length > 0 && (
                            <div className="phd-card phd-card-full">
                                <div className="phd-card-header">
                                    <div className="phd-card-icon phd-card-icon-green"><FaCheckCircle size={16} /></div>
                                    <div>
                                        <h3 className="phd-card-title">Recent Selections</h3>
                                        <p className="phd-card-sub">Latest students who got placed</p>
                                    </div>
                                    <span className="phd-card-badge">{dashboard.recentSelections.length} recent</span>
                                </div>
                                <div className="phd-table-wrap">
                                    <table className="phd-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Student</th>
                                                <th>Department</th>
                                                <th>Company</th>
                                                <th>Position</th>
                                                <th className="phd-th-right">Package</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboard.recentSelections.map((sel, i) => {
                                                const pkg = sel.selectedPackage
                                                    ? `₹${sel.selectedPackage} LPA`
                                                    : (sel.job?.package ? `₹${sel.job.package} LPA` : (sel.job?.salary || '—'));
                                                const isIntern = sel.job?.type === 'internship';

                                                return (
                                                    <tr key={sel._id} className="phd-tr" style={{ animationDelay: `${i * 0.03}s` }}>
                                                        <td className="phd-td-rank">
                                                            <span className="phd-rank-num">{i + 1}</span>
                                                        </td>
                                                        <td>
                                                            <div className="phd-student-cell">
                                                                <div className="phd-avatar" style={{
                                                                    background: `hsl(${(sel.student?.name?.charCodeAt(0) || 65) * 5 % 360}, 65%, 92%)`,
                                                                    color: `hsl(${(sel.student?.name?.charCodeAt(0) || 65) * 5 % 360}, 65%, 35%)`
                                                                }}>
                                                                    {sel.student?.name?.[0]?.toUpperCase() || '?'}
                                                                </div>
                                                                <div className="phd-student-info">
                                                                    <span className="phd-student-name">{sel.student?.name || 'Unknown'}</span>
                                                                    <span className="phd-student-email">{sel.student?.email || '—'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><span className="phd-dept-badge">{sel.student?.department || '—'}</span></td>
                                                        <td>
                                                            <div className="phd-company-cell">
                                                                <div className="phd-company-dot" style={{
                                                                    background: `hsl(${(sel.job?.companyName?.charCodeAt(0) || 65) * 9 % 360}, 55%, 92%)`,
                                                                    color: `hsl(${(sel.job?.companyName?.charCodeAt(0) || 65) * 9 % 360}, 55%, 35%)`
                                                                }}>
                                                                    {sel.job?.companyName?.[0]?.toUpperCase() || '?'}
                                                                </div>
                                                                <span>{sel.job?.companyName || '—'}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="phd-position-cell">
                                                                <span className="phd-position-title">{sel.job?.title || '—'}</span>
                                                                <span className={`phd-type-badge ${isIntern ? 'intern' : 'ft'}`}>
                                                                    {isIntern ? '🎓 Internship' : '💼 Full-time'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="phd-td-right">
                                                            <span className="phd-pkg-badge">{pkg}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PlacementHeadDashboard;
