// PHJobControl — Premium Job Control page for Placement Head
import { useState, useEffect, useCallback } from 'react';
import placementHeadService from '../services/placementHeadService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    FaBriefcase,
    FaTimes,
    FaToggleOn,
    FaToggleOff,
    FaChevronLeft,
    FaChevronRight,
    FaSearch,
    FaCheckCircle,
    FaTimesCircle,
    FaBuilding,
    FaRupeeSign,
    FaClock,
    FaFilter,
    FaCalendarAlt,
} from 'react-icons/fa';

const PHJobControl = () => {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState({ jobs: [], total: 0, page: 1, pages: 1 });
    const [jobStatus, setJobStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [togglingJob, setTogglingJob] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchJobs = useCallback(async (page = 1) => {
        try {
            const params = { page, limit: 10 };
            if (jobStatus) params.status = jobStatus;
            const { data } = await placementHeadService.getAllJobs(params);
            setJobs(data);
        } catch (err) {
            console.error('Jobs fetch error:', err);
        }
    }, [jobStatus]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchJobs();
            setLoading(false);
        };
        load();
    }, [fetchJobs]);

    const handleToggleJob = async (jobId, currentlyActive) => {
        setTogglingJob(jobId);
        try {
            if (currentlyActive) {
                await placementHeadService.deactivateJob(jobId);
                setMessage({ text: '✓ Job deactivated successfully', type: 'success' });
            } else {
                await placementHeadService.activateJob(jobId);
                setMessage({ text: '✓ Job activated successfully', type: 'success' });
            }
            fetchJobs(jobs.page);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || '✕ Failed to update job', type: 'danger' });
        } finally {
            setTogglingJob(null);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    // Client-side search
    const filteredJobs = jobs.jobs.filter(job => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            job.title?.toLowerCase().includes(q) ||
            job.companyName?.toLowerCase().includes(q)
        );
    });

    // Stats from loaded data
    const stats = {
        total: jobs.total,
        active: jobs.jobs.filter(j => j.isActive).length,
        inactive: jobs.jobs.filter(j => !j.isActive).length,
        internships: jobs.jobs.filter(j => j.type === 'internship').length,
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="phjc-page">
            {/* Hero Header */}
            <div className="phjc-hero">
                <div className="phjc-hero-bg" />
                <div className="phjc-hero-content">
                    <div className="phjc-hero-left">
                        <div className="phjc-hero-icon">
                            <FaBriefcase size={26} />
                        </div>
                        <div>
                            <h1 className="phjc-hero-title">Job Control</h1>
                            <p className="phjc-hero-sub">Manage, activate, and deactivate job postings across the platform</p>
                        </div>
                    </div>
                    <div className="phjc-hero-date">
                        <FaCalendarAlt size={12} />
                        <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {message.text && (
                <div className={`phjc-toast phjc-toast-${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ text: '', type: '' })} className="phjc-toast-close">
                        <FaTimes size={11} />
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="phjc-stats-row">
                <div className="phjc-stat-card phjc-stat-blue">
                    <div className="phjc-stat-icon-wrap"><FaBriefcase size={18} /></div>
                    <div className="phjc-stat-content">
                        <span className="phjc-stat-number">{stats.total}</span>
                        <span className="phjc-stat-text">Total Jobs</span>
                    </div>
                    <div className="phjc-stat-glow" />
                </div>
                <div className="phjc-stat-card phjc-stat-emerald">
                    <div className="phjc-stat-icon-wrap"><FaCheckCircle size={18} /></div>
                    <div className="phjc-stat-content">
                        <span className="phjc-stat-number">{stats.active}</span>
                        <span className="phjc-stat-text">Active</span>
                    </div>
                    <div className="phjc-stat-glow" />
                </div>
                <div className="phjc-stat-card phjc-stat-red">
                    <div className="phjc-stat-icon-wrap"><FaTimesCircle size={18} /></div>
                    <div className="phjc-stat-content">
                        <span className="phjc-stat-number">{stats.inactive}</span>
                        <span className="phjc-stat-text">Inactive</span>
                    </div>
                    <div className="phjc-stat-glow" />
                </div>
                <div className="phjc-stat-card phjc-stat-violet">
                    <div className="phjc-stat-icon-wrap"><FaClock size={18} /></div>
                    <div className="phjc-stat-content">
                        <span className="phjc-stat-number">{stats.internships}</span>
                        <span className="phjc-stat-text">Internships</span>
                    </div>
                    <div className="phjc-stat-glow" />
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="phjc-toolbar">
                <div className="phjc-search-box">
                    <FaSearch size={14} className="phjc-search-icon" />
                    <input
                        type="text"
                        className="phjc-search-input"
                        placeholder="Search jobs by title or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="phjc-search-clear" onClick={() => setSearchQuery('')}>
                            <FaTimes size={11} />
                        </button>
                    )}
                </div>
                <div className="phjc-filter-row">
                    <div className="phjc-status-tabs">
                        {[
                            { value: '', label: 'All Jobs', icon: FaBriefcase },
                            { value: 'active', label: 'Active', icon: FaCheckCircle },
                            { value: 'inactive', label: 'Inactive', icon: FaTimesCircle },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                className={`phjc-status-tab ${jobStatus === tab.value ? 'active' : ''}`}
                                onClick={() => setJobStatus(tab.value)}
                            >
                                <tab.icon size={12} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Bar */}
            <div className="phjc-results-bar">
                <div className="phjc-results-info">
                    <FaBriefcase size={12} className="phjc-results-icon" />
                    <span>Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.total}</strong> job postings</span>
                </div>
                {jobs.pages > 1 && (
                    <span className="phjc-results-page">Page {jobs.page} of {jobs.pages}</span>
                )}
            </div>

            {/* Job Cards Grid */}
            <div className="phjc-content">
                {filteredJobs.length === 0 ? (
                    <div className="phjc-empty-state">
                        <div className="phjc-empty-icon"><FaBriefcase size={40} /></div>
                        <h3>No Jobs Found</h3>
                        <p>Try adjusting your search or filter to find job postings.</p>
                    </div>
                ) : (
                    <div className="phjc-jobs-grid">
                        {filteredJobs.map((job, i) => {
                            const isInternship = job.type === 'internship';
                            const pkg = job.package ? `₹${job.package} LPA` : (job.salary || '—');

                            return (
                                <div
                                    key={job._id}
                                    className={`phjc-job-card ${job.isActive ? 'phjc-job-active' : 'phjc-job-inactive'}`}
                                    style={{ animationDelay: `${i * 0.04}s` }}
                                >
                                    {/* Status Dot */}
                                    <div className={`phjc-job-status-dot ${job.isActive ? 'active' : 'inactive'}`} />

                                    <div className="phjc-job-top">
                                        <div className="phjc-job-company-icon">
                                            {job.companyName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="phjc-job-meta">
                                            <span className="phjc-job-title">{job.title}</span>
                                            <span className="phjc-job-company">
                                                <FaBuilding size={10} /> {job.companyName}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="phjc-job-details">
                                        <div className="phjc-job-detail">
                                            <span className={`phjc-job-type-badge ${isInternship ? 'intern' : 'ft'}`}>
                                                {isInternship ? '🎓 Internship' : '💼 Full-time'}
                                            </span>
                                        </div>
                                        <div className="phjc-job-detail">
                                            <span className="phjc-job-pkg">
                                                <FaRupeeSign size={10} /> {pkg}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="phjc-job-footer">
                                        <span className={`phjc-job-status-badge ${job.isActive ? 'active' : 'inactive'}`}>
                                            {job.isActive ? (
                                                <><FaCheckCircle size={10} /> Active</>
                                            ) : (
                                                <><FaTimesCircle size={10} /> Inactive</>
                                            )}
                                        </span>
                                        <button
                                            className={`phjc-toggle-btn ${job.isActive ? 'deactivate' : 'activate'}`}
                                            onClick={() => handleToggleJob(job._id, job.isActive)}
                                            disabled={togglingJob === job._id}
                                        >
                                            {togglingJob === job._id ? (
                                                <span className="phjc-spinner" />
                                            ) : job.isActive ? (
                                                <><FaToggleOff size={14} /> Deactivate</>
                                            ) : (
                                                <><FaToggleOn size={14} /> Activate</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {jobs.pages > 1 && (
                <div className="phjc-pagination">
                    <button
                        className="phjc-page-btn"
                        disabled={jobs.page <= 1}
                        onClick={() => fetchJobs(jobs.page - 1)}
                    >
                        <FaChevronLeft size={11} />
                        <span>Previous</span>
                    </button>
                    <div className="phjc-page-numbers">
                        {Array.from({ length: jobs.pages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === jobs.pages || Math.abs(p - jobs.page) <= 1)
                            .map((p, idx, arr) => (
                                <span key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="phjc-page-dots">...</span>}
                                    <button
                                        className={`phjc-page-num ${p === jobs.page ? 'active' : ''}`}
                                        onClick={() => fetchJobs(p)}
                                    >
                                        {p}
                                    </button>
                                </span>
                            ))}
                    </div>
                    <button
                        className="phjc-page-btn"
                        disabled={jobs.page >= jobs.pages}
                        onClick={() => fetchJobs(jobs.page + 1)}
                    >
                        <span>Next</span>
                        <FaChevronRight size={11} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PHJobControl;
