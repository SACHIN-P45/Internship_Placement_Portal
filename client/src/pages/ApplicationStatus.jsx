// Application Status — professional application tracking for students
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../services/applicationService';
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
} from 'react-icons/fa';

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await applicationService.getMyApplications();
        setApplications(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    selected: applications.filter((a) => a.status === 'selected').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    let list = [...applications];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.job?.title?.toLowerCase().includes(q) ||
          a.job?.companyName?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((a) => a.status === statusFilter);
    if (typeFilter) list = list.filter((a) => a.job?.type === typeFilter);

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

    return list;
  }, [applications, search, statusFilter, typeFilter, sortBy]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getTimeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 30) return `${diff} days ago`;
    if (diff < 365) return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? 's' : ''} ago`;
    return formatDate(d);
  };

  const statCards = [
    { icon: FaClipboardList, value: stats.total, label: 'Total', color: '#3b82f6', bg: '#eff6ff', filterVal: '' },
    { icon: FaClock, value: stats.applied, label: 'Pending', color: '#6366f1', bg: '#eef2ff', filterVal: 'applied' },
    { icon: FaCheckCircle, value: stats.shortlisted, label: 'Shortlisted', color: '#f59e0b', bg: '#fffbeb', filterVal: 'shortlisted' },
    { icon: FaTrophy, value: stats.selected, label: 'Selected', color: '#22c55e', bg: '#f0fdf4', filterVal: 'selected' },
    { icon: FaTimesCircle, value: stats.rejected, label: 'Rejected', color: '#ef4444', bg: '#fef2f2', filterVal: 'rejected' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="myapp-page">
      {/* Header */}
      <div className="myapp-header">
        <div className="myapp-header-left">
          <div className="myapp-header-icon">
            <FaClipboardList size={22} />
          </div>
          <div>
            <h2 className="myapp-title">My Applications</h2>
            <p className="myapp-subtitle">Track and manage all your job applications</p>
          </div>
        </div>
        <Link to="/jobs" className="myapp-browse-btn">
          <FaBriefcase size={14} />
          Browse Jobs
          <FaArrowRight size={11} />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="myapp-stats-row">
        {statCards.map((s, i) => (
          <button
            key={i}
            className={`myapp-stat-card ${statusFilter === s.filterVal ? 'active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === s.filterVal ? '' : s.filterVal)}
          >
            <div className="myapp-stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={16} />
            </div>
            <div className="myapp-stat-value">{s.value}</div>
            <div className="myapp-stat-label">{s.label}</div>
            {statusFilter === s.filterVal && s.filterVal && (
              <div className="myapp-stat-active-dot" style={{ background: s.color }} />
            )}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="myapp-filters">
        <div className="myapp-search">
          <FaSearch size={13} className="myapp-search-icon" />
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="myapp-filter-group">
          <div className="myapp-select-wrap">
            <FaFilter size={10} className="myapp-select-icon" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="full-time">Full-Time</option>
            </select>
          </div>
          <div className="myapp-select-wrap">
            <FaSortAmountDown size={10} className="myapp-select-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        {(search || statusFilter || typeFilter) && (
          <button
            className="myapp-clear-btn"
            onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="myapp-results-info">
        <span>{filtered.length} application{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Applications */}
      {applications.length === 0 ? (
        <div className="myapp-empty">
          <div className="myapp-empty-icon">
            <FaInbox size={44} />
          </div>
          <h5>No Applications Yet</h5>
          <p>Start exploring jobs and apply to kickstart your career!</p>
          <Link to="/jobs" className="myapp-empty-btn">
            <FaBriefcase size={14} /> Browse Opportunities
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="myapp-empty">
          <div className="myapp-empty-icon myapp-empty-search">
            <FaSearch size={36} />
          </div>
          <h5>No Matching Applications</h5>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="myapp-list">
          {filtered.map((app) => (
            <div key={app._id} className="myapp-card">
              <div className="myapp-card-left">
                <div className="myapp-company-avatar">
                  {app.job?.companyName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="myapp-card-info">
                  <div className="myapp-card-title-row">
                    <Link to={`/jobs/${app.job?._id}`} className="myapp-job-title">
                      {app.job?.title || 'N/A'}
                    </Link>
                    <span className={`myapp-type-badge myapp-type-${app.job?.type || 'internship'}`}>
                      {app.job?.type === 'full-time' ? 'Full-Time' : 'Internship'}
                    </span>
                  </div>
                  <div className="myapp-card-meta">
                    <span><FaBuilding size={11} /> {app.job?.companyName || 'N/A'}</span>
                    {app.job?.location && (
                      <span><FaMapMarkerAlt size={11} /> {app.job.location}</span>
                    )}
                    {app.job?.salary && (
                      <span><FaRupeeSign size={10} /> {app.job.salary}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="myapp-card-right">
                <div className="myapp-card-date">
                  <FaCalendarAlt size={10} />
                  <span title={formatDate(app.createdAt)}>{getTimeAgo(app.createdAt)}</span>
                </div>
                <StatusBadge status={app.status} />
                <Link to={`/jobs/${app.job?._id}`} className="myapp-view-btn" title="View job details">
                  <FaExternalLinkAlt size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;
