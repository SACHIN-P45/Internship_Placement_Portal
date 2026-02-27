// PHSelectedStudents — Premium Selected Students page for Placement Head
import { useState, useEffect, useCallback } from 'react';
import placementHeadService from '../services/placementHeadService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    FaBuilding,
    FaTimes,
    FaGraduationCap,
    FaChevronLeft,
    FaChevronRight,
    FaFilter,
    FaSearch,
    FaUsers,
    FaRupeeSign,
    FaCheckCircle,
    FaChartLine,
    FaBriefcase,
    FaDownload,
    FaUserTie,
    FaCalendarAlt,
} from 'react-icons/fa';

const PHSelectedStudents = () => {
    const [loading, setLoading] = useState(true);
    const [selectedStudents, setSelectedStudents] = useState({ students: [], total: 0, page: 1, pages: 1 });
    const [deptFilter, setDeptFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchSelectedStudents = useCallback(async (page = 1) => {
        try {
            const params = { page, limit: 10 };
            if (deptFilter) params.department = deptFilter;
            if (companyFilter) params.company = companyFilter;
            if (jobTypeFilter) params.type = jobTypeFilter;
            const { data } = await placementHeadService.getSelectedStudents(params);
            setSelectedStudents(data);
        } catch (err) {
            console.error('Selected students fetch error:', err);
        }
    }, [deptFilter, companyFilter, jobTypeFilter]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchSelectedStudents();
            setLoading(false);
        };
        load();
    }, [fetchSelectedStudents]);

    // Client-side search filter on loaded data
    const filteredStudents = selectedStudents.students.filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.student?.name?.toLowerCase().includes(q) ||
            s.student?.email?.toLowerCase().includes(q) ||
            s.job?.companyName?.toLowerCase().includes(q) ||
            s.job?.title?.toLowerCase().includes(q)
        );
    });

    // Download CSV
    const downloadCSV = () => {
        if (!selectedStudents.students.length) return;
        const headers = ['#', 'Student Name', 'Email', 'Department', 'CGPA', 'Company', 'Position', 'Type', 'Package (LPA)'];
        const rows = selectedStudents.students.map((s, i) => [
            i + 1,
            s.student?.name || '',
            s.student?.email || '',
            s.student?.department || '',
            s.student?.cgpa || '',
            s.job?.companyName || '',
            s.job?.title || '',
            s.job?.type || '',
            s.selectedPackage || s.job?.package || s.job?.salary || '',
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected_students_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Calculate stats from loaded data
    const stats = {
        totalSelected: selectedStudents.total,
        uniqueCompanies: [...new Set(selectedStudents.students.map(s => s.job?.companyName).filter(Boolean))].length,
        avgPackage: selectedStudents.students.length > 0
            ? (selectedStudents.students.reduce((sum, s) => sum + (s.selectedPackage || s.job?.package || 0), 0) / selectedStudents.students.length).toFixed(1)
            : 0,
        internships: selectedStudents.students.filter(s => s.job?.type === 'internship').length,
    };

    const activeFilters = [deptFilter, companyFilter, jobTypeFilter].filter(Boolean).length;

    if (loading) return <LoadingSpinner />;

    return (
        <div className="phs-page">
            {/* Hero Header */}
            <div className="phs-hero">
                <div className="phs-hero-bg" />
                <div className="phs-hero-content">
                    <div className="phs-hero-left">
                        <div className="phs-hero-icon">
                            <FaGraduationCap size={26} />
                        </div>
                        <div>
                            <h1 className="phs-hero-title">Selected Students</h1>
                            <p className="phs-hero-sub">Track and manage all placed students across departments and companies</p>
                        </div>
                    </div>
                    <div className="phs-hero-date">
                        <FaCalendarAlt size={12} />
                        <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <button className="phs-export-btn" onClick={downloadCSV} disabled={!selectedStudents.students.length}>
                        <FaDownload size={13} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="phs-stats-row">
                <div className="phs-stat-card phs-stat-blue">
                    <div className="phs-stat-icon-wrap"><FaUsers size={18} /></div>
                    <div className="phs-stat-content">
                        <span className="phs-stat-number">{stats.totalSelected}</span>
                        <span className="phs-stat-text">Total Selected</span>
                    </div>
                    <div className="phs-stat-glow" />
                </div>
                <div className="phs-stat-card phs-stat-emerald">
                    <div className="phs-stat-icon-wrap"><FaBuilding size={18} /></div>
                    <div className="phs-stat-content">
                        <span className="phs-stat-number">{stats.uniqueCompanies}</span>
                        <span className="phs-stat-text">Companies</span>
                    </div>
                    <div className="phs-stat-glow" />
                </div>
                <div className="phs-stat-card phs-stat-amber">
                    <div className="phs-stat-icon-wrap"><FaRupeeSign size={18} /></div>
                    <div className="phs-stat-content">
                        <span className="phs-stat-number">₹{stats.avgPackage}</span>
                        <span className="phs-stat-text">Avg Package LPA</span>
                    </div>
                    <div className="phs-stat-glow" />
                </div>
                <div className="phs-stat-card phs-stat-violet">
                    <div className="phs-stat-icon-wrap"><FaBriefcase size={18} /></div>
                    <div className="phs-stat-content">
                        <span className="phs-stat-number">{stats.internships}</span>
                        <span className="phs-stat-text">Internships</span>
                    </div>
                    <div className="phs-stat-glow" />
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="phs-toolbar">
                <div className="phs-search-box">
                    <FaSearch size={14} className="phs-search-icon" />
                    <input
                        type="text"
                        className="phs-search-input"
                        placeholder="Search students, companies, positions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="phs-search-clear" onClick={() => setSearchQuery('')}>
                            <FaTimes size={11} />
                        </button>
                    )}
                </div>

                <div className="phs-filter-group">
                    <div className="phs-filter-chip">
                        <FaFilter size={10} className="phs-filter-chip-icon" />
                        <input
                            type="text"
                            placeholder="Department"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="phs-filter-input"
                        />
                    </div>
                    <div className="phs-filter-chip">
                        <FaBuilding size={10} className="phs-filter-chip-icon" />
                        <input
                            type="text"
                            placeholder="Company"
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                            className="phs-filter-input"
                        />
                    </div>
                    <div className="phs-filter-chip phs-filter-select-wrap">
                        <FaBriefcase size={10} className="phs-filter-chip-icon" />
                        <select
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                            className="phs-filter-select"
                        >
                            <option value="">All Types</option>
                            <option value="job">Full-time</option>
                            <option value="internship">Internship</option>
                        </select>
                    </div>
                    {activeFilters > 0 && (
                        <button className="phs-clear-filters" onClick={() => { setDeptFilter(''); setCompanyFilter(''); setJobTypeFilter(''); }}>
                            <FaTimes size={9} />
                            <span>Clear ({activeFilters})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Results Info */}
            <div className="phs-results-bar">
                <div className="phs-results-info">
                    <FaCheckCircle size={12} className="phs-results-icon" />
                    <span>Showing <strong>{filteredStudents.length}</strong> of <strong>{selectedStudents.total}</strong> selected students</span>
                </div>
                {selectedStudents.pages > 1 && (
                    <span className="phs-results-page">Page {selectedStudents.page} of {selectedStudents.pages}</span>
                )}
            </div>

            {/* Table */}
            <div className="phs-table-container">
                {filteredStudents.length === 0 ? (
                    <div className="phs-empty-state">
                        <div className="phs-empty-icon"><FaUserTie size={40} /></div>
                        <h3>No Students Found</h3>
                        <p>Try adjusting your filters or search query to find selected students.</p>
                        {activeFilters > 0 && (
                            <button className="phs-empty-btn" onClick={() => { setDeptFilter(''); setCompanyFilter(''); setJobTypeFilter(''); setSearchQuery(''); }}>
                                <FaTimes size={11} /> Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="phs-table-wrap">
                        <table className="phs-table">
                            <thead>
                                <tr>
                                    <th className="phs-th-rank">#</th>
                                    <th>Student</th>
                                    <th>Department</th>
                                    <th className="phs-th-center">CGPA</th>
                                    <th>Company</th>
                                    <th>Position</th>
                                    <th className="phs-th-right">Package</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s, i) => {
                                    const pkg = s.selectedPackage || s.job?.package || null;
                                    const salaryDisplay = pkg ? `₹${pkg} LPA` : (s.job?.salary || '—');
                                    const isInternship = s.job?.type === 'internship';
                                    const rowNum = (selectedStudents.page - 1) * 10 + i + 1;

                                    return (
                                        <tr key={s._id} className="phs-tr" style={{ animationDelay: `${i * 0.03}s` }}>
                                            <td className="phs-td-rank">
                                                <span className="phs-rank-badge">{rowNum}</span>
                                            </td>
                                            <td>
                                                <div className="phs-student-cell">
                                                    <div className="phs-student-avatar" style={{
                                                        background: `hsl(${(s.student?.name?.charCodeAt(0) || 65) * 5 % 360}, 65%, 92%)`,
                                                        color: `hsl(${(s.student?.name?.charCodeAt(0) || 65) * 5 % 360}, 65%, 35%)`
                                                    }}>
                                                        {s.student?.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="phs-student-info">
                                                        <span className="phs-student-name">{s.student?.name || 'Unknown'}</span>
                                                        <span className="phs-student-email">{s.student?.email || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="phs-dept-badge">{s.student?.department || '—'}</span>
                                            </td>
                                            <td className="phs-td-center">
                                                <div className="phs-cgpa-wrap">
                                                    <span className="phs-cgpa-value">{s.student?.cgpa || '—'}</span>
                                                    {s.student?.cgpa && (
                                                        <div className="phs-cgpa-bar">
                                                            <div className="phs-cgpa-fill" style={{ width: `${(s.student.cgpa / 10) * 100}%` }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="phs-company-cell">
                                                    <div className="phs-company-logo">
                                                        {s.job?.companyName?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="phs-company-name">{s.job?.companyName || '—'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="phs-position-cell">
                                                    <span className="phs-position-title">{s.job?.title || '—'}</span>
                                                    <span className={`phs-type-badge ${isInternship ? 'phs-type-intern' : 'phs-type-job'}`}>
                                                        {isInternship ? '🎓 Internship' : '💼 Full-time'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="phs-td-right">
                                                <div className="phs-package-cell">
                                                    <span className={`phs-package-value ${pkg ? 'phs-package-has' : ''}`}>
                                                        {salaryDisplay}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {selectedStudents.pages > 1 && (
                <div className="phs-pagination">
                    <button
                        className="phs-page-btn"
                        disabled={selectedStudents.page <= 1}
                        onClick={() => fetchSelectedStudents(selectedStudents.page - 1)}
                    >
                        <FaChevronLeft size={11} />
                        <span>Previous</span>
                    </button>
                    <div className="phs-page-numbers">
                        {Array.from({ length: selectedStudents.pages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === selectedStudents.pages || Math.abs(p - selectedStudents.page) <= 1)
                            .map((p, idx, arr) => (
                                <span key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="phs-page-dots">...</span>}
                                    <button
                                        className={`phs-page-num ${p === selectedStudents.page ? 'active' : ''}`}
                                        onClick={() => fetchSelectedStudents(p)}
                                    >
                                        {p}
                                    </button>
                                </span>
                            ))}
                    </div>
                    <button
                        className="phs-page-btn"
                        disabled={selectedStudents.page >= selectedStudents.pages}
                        onClick={() => fetchSelectedStudents(selectedStudents.page + 1)}
                    >
                        <span>Next</span>
                        <FaChevronRight size={11} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PHSelectedStudents;
