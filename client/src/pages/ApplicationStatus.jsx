// ApplicationStatus — Premium redesign with Applications + Saved Jobs tabs
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import applicationService from '../services/applicationService';
import jobService from '../services/jobService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaFileAlt,
  FaClipboardList,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTrophy,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaArrowRight,
  FaSortAmountDown,
  FaInbox,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaTimes,
  FaChevronDown,
  FaBookmark,
  FaRegBookmark,
  FaMoneyBillWave,
  FaUsers,
  FaStar,
  FaGraduationCap,
  FaTrashAlt,
} from 'react-icons/fa';

const STAT_DEFS = [
  { key: '', label: 'Total', icon: FaClipboardList, variant: 'blue' },
  { key: 'applied', label: 'Pending', icon: FaClock, variant: 'violet' },
  { key: 'shortlisted', label: 'Shortlisted', icon: FaCheckCircle, variant: 'amber' },
  { key: 'selected', label: 'Selected', icon: FaTrophy, variant: 'green' },
  { key: 'rejected', label: 'Rejected', icon: FaTimesCircle, variant: 'pink' },
];

const TYPE_COLOR = {
  internship: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', label: '🎓 Internship' },
  'full-time': { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: '💼 Full-time' },
  job: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: '💼 Full-time' },
};

const ApplicationStatus = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');

  // ── Applications state ──
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // ── Saved Jobs state ──
  const [savedJobs, setSavedJobs] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [savedSearch, setSavedSearch] = useState('');
  const [savedToast, setSavedToast] = useState('');

  // Load applications
  useEffect(() => {
    (async () => {
      try {
        const { data } = await applicationService.getMyApplications();
        setApplications(data);
      } catch { /* silent */ } finally {
        setLoadingApps(false);
      }
    })();
  }, []);

  // Load saved jobs when tab is opened
  useEffect(() => {
    if (activeTab === 'saved' && !savedLoaded) {
      setLoadingSaved(true);
      jobService.getBookmarkedJobs()
        .then(({ data }) => {
          setSavedJobs(Array.isArray(data) ? data : data.jobs || []);
          setSavedLoaded(true);
        })
        .catch(() => setSavedJobs([]))
        .finally(() => setLoadingSaved(false));
    }
  }, [activeTab, savedLoaded]);

  const showSavedToast = (msg) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(''), 2800);
  };

  const handleRemoveBookmark = async (jobId) => {
    setRemovingId(jobId);
    try {
      await jobService.toggleBookmark(jobId);
      setSavedJobs(prev => prev.filter(j => j._id !== jobId));
      showSavedToast('Bookmark removed');
    } catch {
      showSavedToast('Failed to remove bookmark');
    } finally {
      setRemovingId(null);
    }
  };

  // ── Application stats & filters ──
  const stats = useMemo(() => ({
    '': applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }), [applications]);

  const filtered = useMemo(() => {
    let list = [...applications];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.job?.title?.toLowerCase().includes(q) ||
        a.job?.companyName?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter(a => a.status === statusFilter);
    if (typeFilter) list = list.filter(a => a.job?.type === typeFilter);
    list.sort((a, b) =>
      sortBy === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    return list;
  }, [applications, search, statusFilter, typeFilter, sortBy]);

  const filteredSaved = useMemo(() => {
    if (!savedSearch) return savedJobs;
    const q = savedSearch.toLowerCase();
    return savedJobs.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.companyName?.toLowerCase().includes(q)
    );
  }, [savedJobs, savedSearch]);

  const formatDate = d =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const timeAgo = d => {
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 30) return `${diff} days ago`;
    if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
    return formatDate(d);
  };

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / 86400000);
  };

  const hasActiveFilters = search || statusFilter || typeFilter;

  if (loadingApps) return <LoadingSpinner />;

  return (
    <div className="phd-page">

      {/* ═══ HERO ═══ */}
      <div className="phd-hero">
        <div className="phd-hero-bg" />
        <div className="phd-hero-content">
          <div className="phd-hero-left">
            <div className="phd-hero-icon">
              <FaClipboardList size={24} />
            </div>
            <div>
              <h1 className="phd-hero-title">My Applications</h1>
              <p className="phd-hero-sub">Track applications & manage your saved jobs</p>
            </div>
          </div>
          <Link to="/jobs" className="apps-hero-btn">
            <FaBriefcase size={14} />
            Browse Jobs
            <FaArrowRight size={12} />
          </Link>
        </div>

        {/* ── Tabs inside hero ── */}
        <div className="apps-tabs">
          <button
            className={`apps-tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <FaClipboardList size={14} />
            Applications
            <span className="apps-tab-count">{applications.length}</span>
          </button>
          <button
            className={`apps-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <FaBookmark size={13} />
            Saved Jobs
            {savedLoaded && <span className="apps-tab-count apps-tab-count-saved">{savedJobs.length}</span>}
          </button>
        </div>
      </div>

      {/* ═══ APPLICATIONS TAB ═══ */}
      {activeTab === 'applications' && (
        <>
          {/* Stat cards */}
          <div className="phd-stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginTop: '24px' }}>
            {STAT_DEFS.map((s, i) => (
              <button
                key={s.key}
                className={`phd-stat-card phd-stat-${s.variant} apps-stat-btn ${statusFilter === s.key ? 'apps-stat-active' : ''}`}
                style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer', textAlign: 'left', border: 'none' }}
                onClick={() => setStatusFilter(prev => (prev === s.key ? '' : s.key))}
              >
                <div className="phd-stat-icon-wrap"><s.icon size={18} /></div>
                <div className="phd-stat-content">
                  <span className="phd-stat-number">{stats[s.key]}</span>
                  <span className="phd-stat-text">{s.label}</span>
                </div>
                <div className="phd-stat-glow" />
                {statusFilter === s.key && s.key && (
                  <div className="apps-active-ring" />
                )}
              </button>
            ))}
          </div>

          {/* Main card */}
          <div className="phd-content">
            <div className="phd-card" style={{ marginTop: 0 }}>
              {/* Filter bar */}
              <div className="apps-filter-bar">
                <div className="apps-search">
                  <FaSearch size={13} className="apps-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by job title or company…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="apps-search-clear" onClick={() => setSearch('')}>
                      <FaTimes size={11} />
                    </button>
                  )}
                </div>

                <div className="apps-select-wrap">
                  <FaFilter size={11} className="apps-sel-icon" />
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-Time</option>
                  </select>
                  <FaChevronDown size={10} className="apps-sel-arrow" />
                </div>

                <div className="apps-select-wrap">
                  <FaSortAmountDown size={11} className="apps-sel-icon" />
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <FaChevronDown size={10} className="apps-sel-arrow" />
                </div>

                {hasActiveFilters && (
                  <button
                    className="apps-clear-btn"
                    onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
                  >
                    <FaTimes size={11} /> Clear
                  </button>
                )}

                <div className="apps-result-count">
                  <span>{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Content */}
              {applications.length === 0 ? (
                <div className="apps-empty">
                  <div className="apps-empty-icon"><FaInbox size={48} /></div>
                  <h4>No Applications Yet</h4>
                  <p>Start exploring jobs and apply to kickstart your career!</p>
                  <Link to="/jobs" className="apps-empty-btn">
                    <FaBriefcase size={14} /> Browse Opportunities
                  </Link>
                </div>
              ) : filtered.length === 0 ? (
                <div className="apps-empty">
                  <div className="apps-empty-icon apps-empty-search"><FaSearch size={40} /></div>
                  <h4>No Matching Applications</h4>
                  <p>Try adjusting your search or filters.</p>
                  <button className="apps-empty-btn" style={{ background: '#f1f5f9', color: '#475569' }}
                    onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="phd-table-wrap">
                  <table className="phd-table apps-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Package</th>
                        <th>Applied</th>
                        <th className="phd-th-right">Status</th>
                        <th style={{ width: 48 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((app, i) => {
                        const tc = TYPE_COLOR[app.job?.type] || TYPE_COLOR['full-time'];
                        const hue = (app.job?.companyName?.charCodeAt(0) || 65) * 9 % 360;
                        return (
                          <tr key={app._id} className="phd-tr" style={{ animationDelay: `${i * 0.025}s` }}>
                            <td className="phd-td-rank">
                              <span className="phd-rank-num">{i + 1}</span>
                            </td>
                            <td>
                              <div className="phd-company-cell">
                                <div
                                  className="phd-avatar"
                                  style={{ background: `hsl(${hue},55%,92%)`, color: `hsl(${hue},55%,35%)` }}
                                >
                                  {app.job?.companyName?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                  {app.job?.companyName || '—'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <Link to={`/jobs/${app.job?._id}`} className="apps-role-link">
                                {app.job?.title || '—'}
                              </Link>
                            </td>
                            <td>
                              <span className="apps-type-chip" style={{ background: tc.bg, color: tc.color }}>
                                {tc.label}
                              </span>
                            </td>
                            <td>
                              {app.job?.location ? (
                                <span className="apps-meta-item">
                                  <FaMapMarkerAlt size={10} /> {app.job.location}
                                </span>
                              ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                            </td>
                            <td>
                              {app.job?.salary ? (
                                <span className="apps-meta-item">
                                  <FaRupeeSign size={10} /> {app.job.salary}
                                </span>
                              ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                            </td>
                            <td>
                              <div className="apps-date-cell">
                                <span className="apps-date-primary">{timeAgo(app.createdAt)}</span>
                                <span className="apps-date-secondary">{formatDate(app.createdAt)}</span>
                              </div>
                            </td>
                            <td className="phd-td-right">
                              <StatusBadge status={app.status} />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <Link
                                to={`/jobs/${app.job?._id}`}
                                className="apps-view-btn"
                                title="View job details"
                              >
                                <FaExternalLinkAlt size={12} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══ SAVED JOBS TAB ═══ */}
      {activeTab === 'saved' && (
        <div className="phd-content" style={{ marginTop: '24px' }}>

          {/* Toast */}
          {savedToast && (
            <div className="saved-toast">
              <FaCheckCircle size={13} /> {savedToast}
            </div>
          )}

          {loadingSaved ? (
            <LoadingSpinner />
          ) : savedJobs.length === 0 ? (
            <div className="apps-empty" style={{ marginTop: '12px' }}>
              <div className="apps-empty-icon" style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)', color: '#d97706' }}>
                <FaRegBookmark size={44} />
              </div>
              <h4>No Saved Jobs Yet</h4>
              <p>Bookmark jobs from the listings page to save them here for later!</p>
              <Link to="/jobs" className="apps-empty-btn">
                <FaBriefcase size={14} /> Browse Opportunities
              </Link>
            </div>
          ) : (
            <>
              {/* Header + search */}
              <div className="saved-header">
                <div className="saved-header-left">
                  <div className="saved-count-pill">
                    <FaBookmark size={12} />
                    {savedJobs.length} saved
                  </div>
                  {savedSearch && (
                    <span className="saved-filtered-tag">{filteredSaved.length} results</span>
                  )}
                </div>
                <div className="apps-search saved-search">
                  <FaSearch size={13} className="apps-search-icon" />
                  <input
                    type="text"
                    placeholder="Search saved jobs…"
                    value={savedSearch}
                    onChange={e => setSavedSearch(e.target.value)}
                  />
                  {savedSearch && (
                    <button className="apps-search-clear" onClick={() => setSavedSearch('')}>
                      <FaTimes size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Saved jobs grid */}
              {filteredSaved.length === 0 ? (
                <div className="apps-empty">
                  <div className="apps-empty-icon apps-empty-search"><FaSearch size={40} /></div>
                  <h4>No matches</h4>
                  <p>Try a different search keyword.</p>
                  <button className="apps-empty-btn" style={{ background: '#f1f5f9', color: '#475569' }}
                    onClick={() => setSavedSearch('')}>Clear Search</button>
                </div>
              ) : (
                <div className="saved-grid">
                  {filteredSaved.map((job, idx) => {
                    const hue = (job.companyName?.charCodeAt(0) || 65) * 9 % 360;
                    const initial = (job.companyName || 'C')[0].toUpperCase();
                    const isExpired = job.deadline && new Date(job.deadline) < new Date();
                    const dl = daysLeft(job.deadline);
                    const tc = TYPE_COLOR[job.type] || TYPE_COLOR['full-time'];

                    return (
                      <div
                        key={job._id}
                        className={`saved-card ${isExpired ? 'saved-card-expired' : ''}`}
                        style={{ animationDelay: `${idx * 0.04}s` }}
                      >
                        {/* Type accent top bar */}
                        <div className="saved-card-accent" style={{
                          background: job.type === 'internship'
                            ? 'linear-gradient(90deg,#7c3aed,#a78bfa)'
                            : 'linear-gradient(90deg,#2563eb,#60a5fa)'
                        }} />

                        {/* Top row */}
                        <div className="saved-card-top">
                          <span className="saved-type-badge" style={{ background: tc.bg, color: tc.color }}>
                            {tc.label}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {isExpired && <span className="saved-badge-expired">Expired</span>}
                            {!isExpired && dl !== null && dl <= 5 && (
                              <span className="saved-badge-urgent">🔥 {dl}d left</span>
                            )}
                            <button
                              className="saved-remove-btn"
                              onClick={() => handleRemoveBookmark(job._id)}
                              disabled={removingId === job._id}
                              title="Remove bookmark"
                            >
                              {removingId === job._id ? (
                                <span className="saved-spinner" />
                              ) : (
                                <FaTrashAlt size={12} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Company + Title */}
                        <div className="saved-card-body">
                          <div className="saved-company-row">
                            <div
                              className="saved-avatar"
                              style={{
                                background: `hsl(${hue},55%,92%)`,
                                color: `hsl(${hue},55%,35%)`
                              }}
                            >
                              {initial}
                            </div>
                            <div>
                              <Link to={`/jobs/${job._id}`} className="saved-job-title">
                                {job.title}
                              </Link>
                              <div className="saved-company-name">
                                <FaBuilding size={10} /> {job.companyName}
                              </div>
                            </div>
                          </div>

                          {/* Meta pills */}
                          <div className="saved-meta-row">
                            {job.location && (
                              <span className="saved-meta-pill">
                                <FaMapMarkerAlt size={10} /> {job.location}
                              </span>
                            )}
                            {job.salary && (
                              <span className="saved-meta-pill">
                                <FaMoneyBillWave size={10} /> {job.salary}
                              </span>
                            )}
                            {job.eligibilityCGPA > 0 && (
                              <span className="saved-meta-pill">
                                <FaStar size={10} /> CGPA {job.eligibilityCGPA}+
                              </span>
                            )}
                          </div>

                          {/* Skills */}
                          {job.skillsRequired?.length > 0 && (
                            <div className="saved-skills-row">
                              {job.skillsRequired.slice(0, 3).map((s, i) => (
                                <span key={i} className="saved-skill-tag">{s}</span>
                              ))}
                              {job.skillsRequired.length > 3 && (
                                <span className="saved-skill-more">+{job.skillsRequired.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="saved-card-footer">
                          {job.deadline && (
                            <span className={`saved-deadline ${isExpired ? 'saved-deadline-expired' : dl <= 7 ? 'saved-deadline-urgent' : ''}`}>
                              <FaCalendarAlt size={10} />
                              {isExpired ? 'Expired' : `Deadline: ${formatDate(job.deadline)}`}
                            </span>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                            <Link to={`/jobs/${job._id}`} className="saved-btn-view">
                              View <FaExternalLinkAlt size={10} />
                            </Link>
                            <Link to={`/jobs/${job._id}`} className="saved-btn-apply">
                              Apply <FaArrowRight size={10} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;
