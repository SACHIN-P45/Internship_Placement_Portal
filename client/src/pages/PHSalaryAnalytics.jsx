// PHSalaryAnalytics — Premium Salary Analytics page for Placement Head
import { useState, useEffect, useCallback } from 'react';
import placementHeadService from '../services/placementHeadService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    FaUsers,
    FaBuilding,
    FaCrown,
    FaTrophy,
    FaMedal,
    FaGraduationCap,
    FaChartLine,
    FaArrowDown,
    FaArrowUp,
    FaStar,
    FaRupeeSign,
    FaChartBar,
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
    Area,
    AreaChart,
    Legend,
    LineChart,
    Line,
} from 'recharts';

const MEDAL_ICONS = [FaTrophy, FaMedal, FaCrown, FaStar, FaStar];
const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32', '#3b82f6', '#8b5cf6'];
const MEDAL_BG = ['linear-gradient(135deg, #fffbeb, #fef3c7)', '#f8fafc', '#fefce8', '#f0f9ff', '#faf5ff'];
const MEDAL_BORDER = ['#fde68a', '#e2e8f0', '#fde68a', '#bae6fd', '#e9d5ff'];

const PHSalaryAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [salaryAnalytics, setSalaryAnalytics] = useState(null);

    const fetchSalaryAnalytics = useCallback(async () => {
        try {
            const { data } = await placementHeadService.getSalaryAnalytics();
            setSalaryAnalytics(data);
        } catch (err) {
            console.error('Salary analytics fetch error:', err);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchSalaryAnalytics();
            setLoading(false);
        };
        load();
    }, [fetchSalaryAnalytics]);

    if (loading) return <LoadingSpinner />;
    if (!salaryAnalytics) return (
        <div className="phsa-page">
            <div className="phs-empty-state">
                <div className="phs-empty-icon"><FaChartLine size={40} /></div>
                <h3>No Salary Data Available</h3>
                <p>Salary analytics will appear once students have been placed.</p>
            </div>
        </div>
    );

    const spread = (salaryAnalytics.overall.highest || 0) - (salaryAnalytics.overall.lowest || 0);

    return (
        <div className="phsa-page">
            {/* Hero Header */}
            <div className="phsa-hero">
                <div className="phsa-hero-bg" />
                <div className="phsa-hero-content">
                    <div className="phsa-hero-left">
                        <div className="phsa-hero-icon">
                            <FaChartLine size={26} />
                        </div>
                        <div>
                            <h1 className="phsa-hero-title">Salary Analytics</h1>
                            <p className="phsa-hero-sub">Comprehensive salary insights, top earners, and department-wise distribution</p>
                        </div>
                    </div>
                    <div className="phsa-hero-date">
                        <FaCalendarAlt size={12} />
                        <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="phsa-stats-row">
                <div className="phsa-stat-card phsa-stat-amber">
                    <div className="phsa-stat-icon-wrap"><FaCrown size={20} /></div>
                    <div className="phsa-stat-content">
                        <span className="phsa-stat-number">₹{salaryAnalytics.overall.highest || 0}</span>
                        <span className="phsa-stat-unit">LPA</span>
                    </div>
                    <span className="phsa-stat-text">Highest Package</span>
                    <div className="phsa-stat-glow" />
                </div>
                <div className="phsa-stat-card phsa-stat-emerald">
                    <div className="phsa-stat-icon-wrap"><FaChartLine size={20} /></div>
                    <div className="phsa-stat-content">
                        <span className="phsa-stat-number">₹{Math.round(salaryAnalytics.overall.average || 0)}</span>
                        <span className="phsa-stat-unit">LPA</span>
                    </div>
                    <span className="phsa-stat-text">Average Package</span>
                    <div className="phsa-stat-glow" />
                </div>
                <div className="phsa-stat-card phsa-stat-blue">
                    <div className="phsa-stat-icon-wrap"><FaArrowDown size={20} /></div>
                    <div className="phsa-stat-content">
                        <span className="phsa-stat-number">₹{salaryAnalytics.overall.lowest || 0}</span>
                        <span className="phsa-stat-unit">LPA</span>
                    </div>
                    <span className="phsa-stat-text">Lowest Package</span>
                    <div className="phsa-stat-glow" />
                </div>
                <div className="phsa-stat-card phsa-stat-violet">
                    <div className="phsa-stat-icon-wrap"><FaUsers size={20} /></div>
                    <div className="phsa-stat-content">
                        <span className="phsa-stat-number">{salaryAnalytics.overall.total || 0}</span>
                        <span className="phsa-stat-unit">students</span>
                    </div>
                    <span className="phsa-stat-text">Total Placed</span>
                    <div className="phsa-stat-glow" />
                </div>
            </div>

            {/* Salary Spread Indicator */}
            <div className="phsa-spread-bar-section">
                <div className="phsa-spread-card">
                    <div className="phsa-spread-header">
                        <div className="phsa-spread-title-row">
                            <div className="phsa-spread-icon"><FaRupeeSign size={14} /></div>
                            <span className="phsa-spread-title">Salary Range Distribution</span>
                        </div>
                        <span className="phsa-spread-range">₹{salaryAnalytics.overall.lowest || 0} – ₹{salaryAnalytics.overall.highest || 0} LPA</span>
                    </div>
                    <div className="phsa-spread-vis">
                        <div className="phsa-spread-track">
                            <div className="phsa-spread-fill" style={{
                                left: '0%',
                                width: '100%'
                            }} />
                            <div className="phsa-spread-avg" style={{
                                left: spread > 0
                                    ? `${((salaryAnalytics.overall.average - salaryAnalytics.overall.lowest) / spread) * 100}%`
                                    : '50%'
                            }}>
                                <div className="phsa-spread-avg-dot" />
                                <span className="phsa-spread-avg-label">Avg ₹{Math.round(salaryAnalytics.overall.average || 0)} LPA</span>
                            </div>
                        </div>
                        <div className="phsa-spread-labels">
                            <span>₹{salaryAnalytics.overall.lowest || 0} LPA</span>
                            <span>₹{salaryAnalytics.overall.highest || 0} LPA</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Earners + Company Chart */}
            <div className="phsa-content">
                <div className="phsa-charts-grid">
                    {/* Top 5 Highest Salary Students */}
                    <div className="phsa-card">
                        <div className="phsa-card-header">
                            <div className="phsa-card-icon phsa-card-icon-gold">
                                <FaTrophy size={16} />
                            </div>
                            <div>
                                <h3 className="phsa-card-title">Top Earners</h3>
                                <p className="phsa-card-sub">Highest placed students</p>
                            </div>
                        </div>
                        {salaryAnalytics.top5Students.length === 0 ? (
                            <div className="phsa-empty-mini">No placement data yet</div>
                        ) : (
                            <div className="phsa-leaderboard">
                                {salaryAnalytics.top5Students.map((s, i) => {
                                    const MedalIcon = MEDAL_ICONS[i] || FaStar;
                                    const pkg = s.selectedPackage || s.job?.package || null;
                                    const salaryDisplay = pkg ? `₹${pkg} LPA` : (s.job?.salary || '—');

                                    return (
                                        <div
                                            key={s._id}
                                            className="phsa-leader-row"
                                            style={{
                                                background: MEDAL_BG[i],
                                                borderColor: MEDAL_BORDER[i],
                                                animationDelay: `${i * 0.08}s`
                                            }}
                                        >
                                            <div className="phsa-leader-rank" style={{ color: MEDAL_COLORS[i] }}>
                                                <MedalIcon size={22} />
                                            </div>
                                            <div className="phsa-leader-avatar" style={{
                                                background: `hsl(${(s.student?.name?.charCodeAt(0) || 65) * 5 % 360}, 65%, 92%)`,
                                                color: `hsl(${(s.student?.name?.charCodeAt(0) || 65) * 5 % 360}, 65%, 35%)`
                                            }}>
                                                {s.student?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="phsa-leader-info">
                                                <span className="phsa-leader-name">{s.student?.name || 'Unknown'}</span>
                                                <span className="phsa-leader-meta">
                                                    {s.student?.department || '—'} • {s.job?.companyName || '—'}
                                                </span>
                                            </div>
                                            <div className={`phsa-leader-pkg ${i === 0 ? 'phsa-leader-pkg-gold' : ''}`}>
                                                {salaryDisplay}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Top Companies by Package */}
                    {salaryAnalytics.topCompanies.length > 0 && (
                        <div className="phsa-card">
                            <div className="phsa-card-header">
                                <div className="phsa-card-icon phsa-card-icon-blue">
                                    <FaBuilding size={16} />
                                </div>
                                <div>
                                    <h3 className="phsa-card-title">Top Companies</h3>
                                    <p className="phsa-card-sub">By salary package offered</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={salaryAnalytics.topCompanies} margin={{ top: 10, right: 10, left: -10, bottom: 45 }}>
                                    <defs>
                                        <linearGradient id="saColorMax" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                                        </linearGradient>
                                        <linearGradient id="saColorAvg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#4338ca" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                        axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                        tickLine={false}
                                        dy={10}
                                        interval={0}
                                        angle={-15}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(241, 245, 249, 0.5)', radius: 4 }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                                            background: 'rgba(255,255,255,0.98)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '14px 18px',
                                        }}
                                        formatter={(value, name) => [
                                            <span key="v" style={{ color: '#0f172a', fontWeight: 700 }}>₹{value} LPA</span>,
                                            <span key="n" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{name}</span>
                                        ]}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '16px' }}
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                    <Bar dataKey="maxPackage" name="Max Package" fill="url(#saColorMax)" radius={[8, 8, 0, 0]} barSize={20} />
                                    <Bar dataKey="avgPackage" name="Avg Package" fill="url(#saColorAvg)" radius={[8, 8, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Department-wise Salary Chart */}
                {salaryAnalytics.departmentWise.length > 0 && (
                    <div className="phsa-card phsa-card-full">
                        <div className="phsa-card-header">
                            <div className="phsa-card-icon phsa-card-icon-indigo">
                                <FaGraduationCap size={16} />
                            </div>
                            <div>
                                <h3 className="phsa-card-title">Department-wise Salary Distribution</h3>
                                <p className="phsa-card-sub">Max, average, and min packages across departments</p>
                            </div>
                            <div className="phsa-card-badge">LPA Overview</div>
                        </div>
                        <div className="phsa-legend-row">
                            <span className="phsa-legend-item"><span className="phsa-legend-dot" style={{ background: '#f59e0b' }} /> Maximum</span>
                            <span className="phsa-legend-item"><span className="phsa-legend-dot" style={{ background: '#6366f1' }} /> Average</span>
                            <span className="phsa-legend-item"><span className="phsa-legend-dot" style={{ background: '#10b981' }} /> Minimum</span>
                        </div>
                        <ResponsiveContainer width="100%" height={360}>
                            <LineChart data={salaryAnalytics.departmentWise.filter(d => d._id)} margin={{ top: 20, right: 30, left: -10, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="_id"
                                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                                    axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                    tickLine={false}
                                    dy={10}
                                    padding={{ left: 30, right: 30 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `₹${v}`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.98)',
                                        borderRadius: '14px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '16px 20px',
                                    }}
                                    itemStyle={{ fontWeight: 'bold', padding: '4px 0' }}
                                    labelStyle={{ color: '#0f172a', fontWeight: '800', marginBottom: '12px', fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}
                                    formatter={(value, name) => [
                                        <span key="v" style={{ color: '#0f172a', fontWeight: 700, marginLeft: '8px' }}>₹{Math.round(value * 10) / 10} LPA</span>,
                                        <span key="n" style={{ color: '#64748b', fontSize: '0.85rem' }}>{name}</span>
                                    ]}
                                />
                                <Line type="monotone" dataKey="maxPackage" name="Maximum" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#f59e0b' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#f59e0b' }} />
                                <Line type="monotone" dataKey="avgPackage" name="Average" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#6366f1' }} />
                                <Line type="monotone" dataKey="minPackage" name="Minimum" stroke="#10b981" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#10b981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PHSalaryAnalytics;
