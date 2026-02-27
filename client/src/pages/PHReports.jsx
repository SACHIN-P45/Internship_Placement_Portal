// PHReports — Redesigned Unique Reports page for Placement Head
import { useState, useEffect, useCallback } from 'react';
import placementHeadService from '../services/placementHeadService';
import LoadingSpinner from '../components/LoadingSpinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    FaDownload,
    FaGraduationCap,
    FaFileAlt,
    FaUsers,
    FaCheckCircle,
    FaClipboardList,
    FaPercentage,
    FaTrophy,
    FaRupeeSign,
    FaBuilding,
    FaBriefcase,
    FaTimesCircle,
    FaChartBar,
    FaCalendarAlt,
    FaArrowRight,
    FaArrowDown,
    FaChartLine,
    FaFilter,
    FaStar,
    FaMedal,
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
    RadialBarChart,
    RadialBar,
    Legend,
} from 'recharts';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEPT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

const PHReports = () => {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState(null);

    const fetchReports = useCallback(async () => {
        try {
            const { data } = await placementHeadService.getReports();
            setReports(data);
        } catch (err) {
            console.error('Reports fetch error:', err);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchReports();
            setLoading(false);
        };
        load();
    }, [fetchReports]);

    const downloadPDF = () => {
        if (!reports) return;
        const s = reports.summary;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 18;
        let y = 15;

        // ── Header Band ──
        doc.setFillColor(15, 118, 110); // teal-700
        doc.rect(0, 0, pageWidth, 42, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Placement Report', margin, y + 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(dateStr, margin, y + 18);

        doc.setFontSize(8);
        doc.setTextColor(200, 240, 230);
        doc.text('Internship & Placement Portal', margin, y + 24);

        y = 50;

        // ── Summary Stats ──
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Overview Summary', margin, y);
        y += 3;

        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Metric', 'Value']],
            body: [
                ['Total Students', String(s.totalStudents || 0)],
                ['Total Companies', String(s.totalCompanies || 0)],
                ['Total Jobs', String(s.totalJobs || 0)],
                ['Total Applications', String(s.totalApplications || 0)],
                ['Selected Students', String(s.totalSelected || 0)],
                ['Shortlisted', String(s.totalShortlisted || 0)],
                ['Rejected', String(s.totalRejected || 0)],
                ['Selection Rate', `${s.selectionRate || 0}%`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
            bodyStyles: { fontSize: 9, cellPadding: 3.5, textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [240, 253, 250] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { halign: 'center' } },
        });

        y = doc.lastAutoTable.finalY + 14;

        // ── Selection Pipeline ──
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Selection Pipeline', margin, y);
        y += 3;

        const pipeColors = [[99, 102, 241], [245, 158, 11], [16, 185, 129], [239, 68, 68]];
        const pipeLabels = ['Applied', 'Shortlisted', 'Selected', 'Rejected'];
        const pipeValues = [s.totalApplied || 0, s.totalShortlisted || 0, s.totalSelected || 0, s.totalRejected || 0];

        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [pipeLabels],
            body: [
                pipeValues.map(String),
                pipeValues.map(v => s.totalApplications > 0 ? `${Math.round((v / s.totalApplications) * 100)}%` : '0%'),
            ],
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center', cellPadding: 4 },
            bodyStyles: { fontSize: 10, fontStyle: 'bold', halign: 'center', cellPadding: 3.5, textColor: [15, 23, 42] },
            alternateRowStyles: { fillColor: [238, 242, 255] },
        });

        y = doc.lastAutoTable.finalY + 14;

        // ── Department Placements ──
        if (reports.departmentWise?.length > 0) {
            // Check if we need a new page
            if (y > 230) { doc.addPage(); y = 20; }

            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Department-wise Placements', margin, y);
            y += 3;

            autoTable(doc, {
                startY: y,
                margin: { left: margin, right: margin },
                head: [['#', 'Department', 'Students Placed', 'Avg Package (LPA)']],
                body: reports.departmentWise.map((d, i) => [
                    String(i + 1),
                    d._id || 'Unspecified',
                    String(d.count),
                    `Rs ${(d.avgPackage || 0).toFixed(1)}`,
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
                bodyStyles: { fontSize: 9, cellPadding: 3.5, textColor: [30, 41, 59] },
                alternateRowStyles: { fillColor: [239, 246, 255] },
                columnStyles: { 0: { cellWidth: 12, halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
            });

            y = doc.lastAutoTable.finalY + 14;
        }

        // ── Top Hiring Companies ──
        if (reports.topHiringCompanies?.length > 0) {
            if (y > 230) { doc.addPage(); y = 20; }

            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Top Hiring Companies', margin, y);
            y += 3;

            autoTable(doc, {
                startY: y,
                margin: { left: margin, right: margin },
                head: [['Rank', 'Company', 'Students Hired', 'Avg Package (LPA)']],
                body: reports.topHiringCompanies.map((c, i) => [
                    i < 3 ? ['1st', '2nd', '3rd'][i] : `#${i + 1}`,
                    c._id,
                    String(c.hiredCount),
                    `Rs ${(c.avgPackage || 0).toFixed(1)}`,
                ]),
                theme: 'grid',
                headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
                bodyStyles: { fontSize: 9, cellPadding: 3.5, textColor: [30, 41, 59] },
                alternateRowStyles: { fillColor: [255, 251, 235] },
                columnStyles: { 0: { cellWidth: 16, halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
            });

            y = doc.lastAutoTable.finalY + 10;
        }

        // ── Footer ──
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
            doc.text('Placement Portal • Confidential', margin, doc.internal.pageSize.getHeight() - 8);
            // Bottom line
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(margin, doc.internal.pageSize.getHeight() - 12, pageWidth - margin, doc.internal.pageSize.getHeight() - 12);
        }

        doc.save(`Placement_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const downloadCSV = () => {
        if (!reports) return;
        const lines = ['Section,Name,Count,Avg Package (LPA)'];
        reports.departmentWise?.forEach(d => {
            lines.push(`Department,"${d._id || 'Unspecified'}",${d.count},${(d.avgPackage || 0).toFixed(1)}`);
        });
        reports.topHiringCompanies?.forEach(c => {
            lines.push(`Company,"${c._id}",${c.hiredCount},${(c.avgPackage || 0).toFixed(1)}`);
        });
        const csv = lines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `placement_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <LoadingSpinner />;
    if (!reports) return (
        <div className="phr-page">
            <div className="phr-empty-state">
                <div className="phr-empty-icon"><FaFileAlt size={40} /></div>
                <h3>No Report Data Available</h3>
                <p>Reports will generate once placement data is available.</p>
            </div>
        </div>
    );

    const s = reports.summary;

    // Funnel data
    const funnelSteps = [
        { label: 'Applied', value: s.totalApplied || 0, icon: FaClipboardList, color: '#6366f1', bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
        { label: 'Shortlisted', value: s.totalShortlisted || 0, icon: FaFilter, color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
        { label: 'Selected', value: s.totalSelected || 0, icon: FaCheckCircle, color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
        { label: 'Rejected', value: s.totalRejected || 0, icon: FaTimesCircle, color: '#ef4444', bg: 'linear-gradient(135deg, #fef2f2, #fecaca)' },
    ];

    // Department data for the radial chart
    const maxDeptCount = Math.max(...(reports.departmentWise?.map(d => d.count) || [1]), 1);
    const deptChartData = (reports.departmentWise || []).map((d, i) => ({
        name: d._id || 'Other',
        count: d.count,
        avgPackage: (d.avgPackage || 0).toFixed(1),
        fill: DEPT_COLORS[i % DEPT_COLORS.length],
    }));

    // Pie data for application status
    const pieData = [
        { name: 'Applied', value: s.totalApplied || 0, color: '#6366f1' },
        { name: 'Shortlisted', value: s.totalShortlisted || 0, color: '#f59e0b' },
        { name: 'Selected', value: s.totalSelected || 0, color: '#10b981' },
        { name: 'Rejected', value: s.totalRejected || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Selection rate for the ring
    const selectionRate = s.selectionRate || 0;

    return (
        <div className="phr-page">
            {/* ── Hero Header ── */}
            <div className="phr-hero">
                <div className="phr-hero-bg" />
                <div className="phr-hero-content">
                    <div className="phr-hero-left">
                        <div className="phr-hero-icon">
                            <FaChartBar size={26} />
                        </div>
                        <div>
                            <h1 className="phr-hero-title">Placement Reports</h1>
                            <p className="phr-hero-sub">Comprehensive analytics, trends, and hiring insights</p>
                        </div>
                    </div>
                    <div className="phr-hero-date">
                        <FaCalendarAlt size={12} />
                        <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="phr-hero-actions">
                        <button className="phr-export-btn" onClick={downloadCSV}>
                            <FaDownload size={13} />
                            <span>CSV</span>
                        </button>
                        <button className="phr-export-btn phr-export-primary" onClick={downloadPDF}>
                            <FaDownload size={13} />
                            <span>PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Highlight Section: Selection Rate Ring + Quick Stats ── */}
            <div className="phr2-highlight-section">
                {/* Selection Rate Ring */}
                <div className="phr2-ring-card">
                    <div className="phr2-ring-wrap">
                        <svg viewBox="0 0 120 120" className="phr2-ring-svg">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle
                                cx="60" cy="60" r="52" fill="none"
                                stroke="url(#phr2RingGrad)" strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${selectionRate * 3.267} 326.7`}
                                transform="rotate(-90 60 60)"
                                className="phr2-ring-progress"
                            />
                            <defs>
                                <linearGradient id="phr2RingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="phr2-ring-center">
                            <span className="phr2-ring-value">{selectionRate}%</span>
                            <span className="phr2-ring-label">Selection Rate</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="phr2-quick-stats">
                    {[
                        { label: 'Total Students', value: s.totalStudents, icon: FaUsers, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Total Companies', value: s.totalCompanies, icon: FaBuilding, color: '#10b981', bg: '#ecfdf5' },
                        { label: 'Total Jobs', value: s.totalJobs, icon: FaBriefcase, color: '#8b5cf6', bg: '#f5f3ff' },
                        { label: 'Applications', value: s.totalApplications, icon: FaClipboardList, color: '#f59e0b', bg: '#fffbeb' },
                        { label: 'Selected', value: s.totalSelected, icon: FaCheckCircle, color: '#059669', bg: '#ecfdf5' },
                        { label: 'Rejected', value: s.totalRejected, icon: FaTimesCircle, color: '#ef4444', bg: '#fef2f2' },
                    ].map((stat, i) => (
                        <div key={i} className="phr2-quick-stat" style={{ animationDelay: `${i * 0.06}s` }}>
                            <div className="phr2-quick-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                                <stat.icon size={16} />
                            </div>
                            <div className="phr2-quick-stat-info">
                                <span className="phr2-quick-stat-value">{stat.value}</span>
                                <span className="phr2-quick-stat-label">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Selection Pipeline (Step Cards) ── */}
            <div className="phr2-pipeline-section">
                <div className="phr2-section-header">
                    <div className="phr2-section-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
                        <FaChartLine size={16} />
                    </div>
                    <div>
                        <h3 className="phr2-section-title">Selection Pipeline</h3>
                        <p className="phr2-section-sub">Track application flow through each stage</p>
                    </div>
                </div>
                <div className="phr2-pipeline-track">
                    {funnelSteps.map((step, i) => {
                        const pct = s.totalApplications > 0
                            ? Math.round((step.value / s.totalApplications) * 100)
                            : 0;
                        return (
                            <div key={i} className="phr2-pipeline-step" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="phr2-pipeline-card" style={{ background: step.bg }}>
                                    <div className="phr2-pipeline-icon" style={{ color: step.color }}>
                                        <step.icon size={22} />
                                    </div>
                                    <span className="phr2-pipeline-count" style={{ color: step.color }}>{step.value}</span>
                                    <span className="phr2-pipeline-label">{step.label}</span>
                                    <div className="phr2-pipeline-pct-bar">
                                        <div className="phr2-pipeline-pct-fill" style={{ width: `${Math.max(pct, 4)}%`, background: step.color }} />
                                    </div>
                                    <span className="phr2-pipeline-pct">{pct}%</span>
                                </div>
                                {i < funnelSteps.length - 1 && (
                                    <div className="phr2-pipeline-connector">
                                        <FaArrowRight size={14} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Charts Row: Pie + Department Bar ── */}
            <div className="phr2-charts-row">
                {/* Application Status Donut */}
                {pieData.length > 0 && (
                    <div className="phr2-chart-card">
                        <div className="phr2-section-header">
                            <div className="phr2-section-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                                <FaChartBar size={16} />
                            </div>
                            <div>
                                <h3 className="phr2-section-title">Application Breakdown</h3>
                                <p className="phr2-section-sub">{s.totalApplications} total applications</p>
                            </div>
                        </div>
                        <div className="phr2-donut-wrap">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="50%"
                                        innerRadius={65} outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value" stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} style={{ outline: 'none' }} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)', padding: '12px 16px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="phr2-donut-legend">
                                {pieData.map((d, i) => (
                                    <div key={i} className="phr2-donut-legend-item">
                                        <span className="phr2-donut-dot" style={{ background: d.color }} />
                                        <span className="phr2-donut-legend-label">{d.name}</span>
                                        <span className="phr2-donut-legend-value">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Department-wise Bar Chart */}
                {deptChartData.length > 0 && (
                    <div className="phr2-chart-card">
                        <div className="phr2-section-header">
                            <div className="phr2-section-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                                <FaGraduationCap size={16} />
                            </div>
                            <div>
                                <h3 className="phr2-section-title">Department Placements</h3>
                                <p className="phr2-section-sub">{deptChartData.length} departments</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="phr2DeptGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} dy={5} interval={0} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(241,245,249,0.5)', radius: 4 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)', padding: '12px 16px' }}
                                    formatter={(val, name) => [val, name === 'count' ? 'Students Placed' : 'Avg Pkg (LPA)']}
                                />
                                <Bar dataKey="count" name="Students Placed" fill="url(#phr2DeptGrad)" radius={[8, 8, 0, 0]} barSize={32} animationDuration={1200}>
                                    {deptChartData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* ── Department Detail Cards ── */}
            {reports.departmentWise?.length > 0 && (
                <div className="phr2-dept-section">
                    <div className="phr2-section-header">
                        <div className="phr2-section-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                            <FaGraduationCap size={16} />
                        </div>
                        <div>
                            <h3 className="phr2-section-title">Department Details</h3>
                            <p className="phr2-section-sub">Placement stats per department</p>
                        </div>
                    </div>
                    <div className="phr2-dept-grid">
                        {reports.departmentWise.map((dept, i) => {
                            const pct = Math.round((dept.count / maxDeptCount) * 100);
                            const hue = (dept._id?.charCodeAt(0) || 65) * 7 % 360;
                            return (
                                <div key={dept._id} className="phr2-dept-card" style={{ animationDelay: `${i * 0.08}s` }}>
                                    <div className="phr2-dept-card-header">
                                        <div className="phr2-dept-avatar" style={{
                                            background: `hsl(${hue}, 60%, 92%)`,
                                            color: `hsl(${hue}, 60%, 35%)`
                                        }}>
                                            {dept._id?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <span className="phr2-dept-name">{dept._id || 'Unspecified'}</span>
                                    </div>
                                    <div className="phr2-dept-metrics">
                                        <div className="phr2-dept-metric">
                                            <FaUsers size={12} className="phr2-dept-metric-icon" />
                                            <span className="phr2-dept-metric-val">{dept.count}</span>
                                            <span className="phr2-dept-metric-label">Placed</span>
                                        </div>
                                        <div className="phr2-dept-metric">
                                            <FaRupeeSign size={11} className="phr2-dept-metric-icon" />
                                            <span className="phr2-dept-metric-val">{(dept.avgPackage || 0).toFixed(1)}</span>
                                            <span className="phr2-dept-metric-label">Avg LPA</span>
                                        </div>
                                    </div>
                                    <div className="phr2-dept-bar">
                                        <div className="phr2-dept-fill" style={{ width: `${pct}%`, background: `hsl(${hue}, 60%, 55%)` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Top Hiring Companies ── */}
            {reports.topHiringCompanies?.length > 0 && (
                <div className="phr2-companies-section">
                    <div className="phr2-section-header">
                        <div className="phr2-section-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                            <FaTrophy size={16} />
                        </div>
                        <div>
                            <h3 className="phr2-section-title">Top Hiring Companies</h3>
                            <p className="phr2-section-sub">Most active campus recruiters</p>
                        </div>
                        <span className="phr2-section-badge">{reports.topHiringCompanies.length} companies</span>
                    </div>
                    <div className="phr2-company-grid">
                        {reports.topHiringCompanies.map((c, i) => {
                            const hue = (c._id?.charCodeAt(0) || 65) * 9 % 360;
                            const medals = ['🥇', '🥈', '🥉'];
                            return (
                                <div key={c._id} className="phr2-company-card" style={{ animationDelay: `${i * 0.07}s` }}>
                                    <div className="phr2-company-rank-badge">
                                        {i < 3 ? <span className="phr2-company-medal">{medals[i]}</span> : <span className="phr2-company-rank-num">#{i + 1}</span>}
                                    </div>
                                    <div className="phr2-company-logo" style={{
                                        background: `hsl(${hue}, 55%, 92%)`,
                                        color: `hsl(${hue}, 55%, 35%)`
                                    }}>
                                        {c._id?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <span className="phr2-company-name">{c._id}</span>
                                    <div className="phr2-company-stats">
                                        <div className="phr2-company-stat">
                                            <span className="phr2-company-stat-val">{c.hiredCount}</span>
                                            <span className="phr2-company-stat-label">Hired</span>
                                        </div>
                                        <div className="phr2-company-stat-divider" />
                                        <div className="phr2-company-stat">
                                            <span className="phr2-company-stat-val">₹{(c.avgPackage || 0).toFixed(1)}</span>
                                            <span className="phr2-company-stat-label">Avg LPA</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PHReports;
