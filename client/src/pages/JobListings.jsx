// Job listings page — professional browse jobs experience
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaSearch,
  FaCheckCircle,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaLayerGroup,
  FaBriefcase,
  FaGraduationCap,
  FaBuilding,
  FaClock,
  FaExternalLinkAlt,
  FaStar,
  FaArrowRight,
  FaTimes,
  FaSlidersH,
  FaRocket,
  FaRegLightbulb,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa';

const JobListings = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [applying, setApplying] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [bookmarking, setBookmarking] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Debounced search
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (locationFilter) params.location = locationFilter;
      const { data } = await jobService.getAll(params);
      if (Array.isArray(data)) {
        setJobs(data);
        setTotalPages(1);
        setTotalJobs(data.length);
      } else {
        setJobs(data.jobs || []);
        setTotalPages(data.pages || 1);
        setTotalJobs(data.total || 0);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, locationFilter, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { setPage(1); }, [search, typeFilter, locationFilter]);

  useEffect(() => {
    if (user?.role === 'student') {
      applicationService.getMyApplications().then(({ data }) => {
        setAppliedJobs(data.map((a) => a.job?._id));
      });
    }
  }, [user]);

  // Fetch bookmarks for students
  useEffect(() => {
    if (user?.role === 'student') {
      jobService.getBookmarkIds().then(({ data }) => {
        setBookmarkedJobs(data);
      }).catch(() => { });
    }
  }, [user]);

  const handleApply = async (jobId) => {
    if (!user) return;
    setApplying(jobId);
    setMessage({ text: '', type: '' });
    try {
      await applicationService.apply(jobId);
      setAppliedJobs([...appliedJobs, jobId]);
      setMessage({ text: 'Applied successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to apply', type: 'danger' });
    } finally {
      setApplying(null);
    }
  };

  const handleBookmark = async (jobId) => {
    if (!user) return;
    setBookmarking(jobId);
    try {
      const { data } = await jobService.toggleBookmark(jobId);
      if (data.bookmarked) {
        setBookmarkedJobs([...bookmarkedJobs, jobId]);
        setMessage({ text: 'Job saved to bookmarks!', type: 'success' });
      } else {
        setBookmarkedJobs(bookmarkedJobs.filter((id) => id !== jobId));
        setMessage({ text: 'Bookmark removed', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to bookmark', type: 'danger' });
    } finally {
      setBookmarking(null);
    }
  };

  const hasFilters = search || typeFilter || locationFilter;

  const clearFilters = () => {
    setSearchTerm('');
    setSearch('');
    setTypeFilter('');
    setLocationFilter('');
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return `${Math.floor(diff / 30)}mo ago`;
  };

  return (
    <div className="jobs-page">
      {/* ── Header ── */}
      <div className="jobs-header">
        <div className="jobs-header-left">
          <div className="jobs-header-icon">
            <FaBriefcase size={22} />
          </div>
          <div>
            <h1 className="jobs-title">Browse Opportunities</h1>
            <p className="jobs-subtitle">
              Discover {totalJobs} job{totalJobs !== 1 ? 's' : ''} &amp; internships tailored for you
            </p>
          </div>
        </div>
        <div className="jobs-header-right">
          <div className="jobs-view-toggle">
            <button
              className={`jobs-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              className={`jobs-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="2" width="14" height="3" rx="1" />
                <rect x="1" y="7" width="14" height="3" rx="1" />
                <rect x="1" y="12" width="14" height="3" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Success/Error Banner ── */}
      {message.text && (
        <div className={`jobs-alert jobs-alert-${message.type}`}>
          <span>{message.text}</span>
          <button className="jobs-alert-close" onClick={() => setMessage({ text: '', type: '' })}>
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="jobs-filters">
        <div className="jobs-search">
          <FaSearch className="jobs-search-icon" size={14} />
          <input
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="jobs-filter-group">
          <div className="jobs-select-wrap">
            <FaSlidersH className="jobs-select-icon" size={12} />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="job">Full-time Job</option>
            </select>
          </div>

          <div className="jobs-select-wrap">
            <FaMapMarkerAlt className="jobs-select-icon" size={12} />
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="jobs-location-input"
            />
          </div>
        </div>

        {hasFilters && (
          <button className="jobs-clear-btn" onClick={clearFilters}>
            <FaTimes size={10} /> Clear
          </button>
        )}
      </div>

      {/* ── Results Info ── */}
      <div className="jobs-results-bar">
        <span className="jobs-results-count">
          {loading ? 'Loading...' : `${totalJobs} result${totalJobs !== 1 ? 's' : ''} found`}
        </span>
        {hasFilters && !loading && (
          <span className="jobs-results-filter-tag">
            Filtered
          </span>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="jobs-empty">
          <div className="jobs-empty-icon">
            <FaSearch size={32} />
          </div>
          <h5>No Opportunities Found</h5>
          <p>Try adjusting your search or filters to discover more opportunities</p>
          {hasFilters && (
            <button className="jobs-empty-btn" onClick={clearFilters}>
              <FaTimes size={12} /> Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Job Cards ── */}
          <div className={`jobs-grid ${viewMode === 'list' ? 'jobs-grid-list' : ''}`}>
            {jobs.map((job) => {
              const isExpired = job.deadline && new Date(job.deadline) < new Date();
              const daysLeft = job.deadline
                ? Math.ceil((new Date(job.deadline) - new Date()) / 86400000)
                : null;
              const isApplied = appliedJobs.includes(job._id);
              const isBookmarked = bookmarkedJobs.includes(job._id);
              const initial = (job.companyName || 'C')[0].toUpperCase();

              return (
                <div key={job._id} className={`jobs-card ${isExpired ? 'jobs-card-expired' : ''}`}>
                  {/* Top badges row */}
                  <div className="jobs-card-badges">
                    <span className={`jobs-badge-type ${job.type === 'internship' ? 'jobs-badge-intern' : 'jobs-badge-ft'}`}>
                      {job.type === 'internship' ? <><FaGraduationCap size={10} /> Internship</> : <><FaBriefcase size={10} /> Full-time</>}
                    </span>
                    {isExpired && <span className="jobs-badge-expired">Expired</span>}
                    {!isExpired && daysLeft !== null && daysLeft <= 5 && (
                      <span className="jobs-badge-urgent">
                        <FaClock size={9} /> {daysLeft}d left
                      </span>
                    )}
                    {isApplied && (
                      <span className="jobs-badge-applied">
                        <FaCheckCircle size={9} /> Applied
                      </span>
                    )}
                    {/* Bookmark button */}
                    {user?.role === 'student' && (
                      <button
                        className={`jobs-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                        onClick={() => handleBookmark(job._id)}
                        disabled={bookmarking === job._id}
                        title={isBookmarked ? 'Remove bookmark' : 'Save job'}
                      >
                        {bookmarking === job._id ? (
                          <span className="jobs-btn-spinner" />
                        ) : isBookmarked ? (
                          <FaBookmark size={14} />
                        ) : (
                          <FaRegBookmark size={14} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Company + Title */}
                  <div className="jobs-card-header">
                    <div className="jobs-company-avatar">{initial}</div>
                    <div className="jobs-card-header-info">
                      <Link to={`/jobs/${job._id}`} className="jobs-card-title">
                        {job.title}
                      </Link>
                      <span className="jobs-card-company">
                        <FaBuilding size={10} /> {job.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="jobs-card-desc">
                    {job.description?.substring(0, 110)}
                    {job.description?.length > 110 ? '...' : ''}
                  </p>

                  {/* Meta */}
                  <div className="jobs-card-meta">
                    <span><FaMapMarkerAlt size={11} /> {job.location || 'Remote'}</span>
                    <span><FaMoneyBillWave size={11} /> {job.salary || 'Competitive'}</span>
                    {job.applicationCount !== undefined && (
                      <span><FaUsers size={11} /> {job.applicationCount} applicants</span>
                    )}
                    {job.openings && job.openings > 1 && (
                      <span><FaLayerGroup size={11} /> {job.openings} openings</span>
                    )}
                    {job.eligibilityCGPA > 0 && (
                      <span><FaStar size={11} /> CGPA {job.eligibilityCGPA}+</span>
                    )}
                  </div>

                  {/* Skills */}
                  {job.skillsRequired?.length > 0 && (
                    <div className="jobs-card-skills">
                      {job.skillsRequired.slice(0, 4).map((skill, i) => (
                        <span key={i} className="jobs-skill-tag">{skill}</span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="jobs-skill-more">+{job.skillsRequired.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="jobs-card-footer">
                    {/* Timeline */}
                    {(() => {
                      const posted = timeAgo(job.createdAt) || 'Recently';
                      if (!job.deadline) {
                        return (
                          <div className="jobs-card-timeline">
                            <div className="jobs-tl-labels">
                              <span className="jobs-tl-posted"><FaClock size={9} /> Posted {posted}</span>
                              <span className="jobs-tl-status jobs-tl-open">Open</span>
                            </div>
                            <div className="jobs-tl-bar">
                              <div className="jobs-tl-fill jobs-tl-green" style={{ width: '15%' }} />
                            </div>
                          </div>
                        );
                      }
                      const totalMs = new Date(job.deadline) - new Date(job.createdAt);
                      const elapsedMs = Date.now() - new Date(job.createdAt);
                      const pct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
                      const dleft = Math.ceil((new Date(job.deadline) - Date.now()) / 86400000);
                      const colorClass = isExpired ? 'jobs-tl-red'
                        : dleft <= 3 ? 'jobs-tl-red'
                          : dleft <= 7 ? 'jobs-tl-orange'
                            : dleft <= 14 ? 'jobs-tl-yellow'
                              : 'jobs-tl-green';
                      const dlLabel = isExpired ? 'Expired'
                        : dleft === 0 ? 'Last day!'
                          : dleft === 1 ? '1 day left'
                            : `${dleft}d left`;
                      return (
                        <div className="jobs-card-timeline">
                          <div className="jobs-tl-labels">
                            <span className="jobs-tl-posted"><FaClock size={9} /> {posted}</span>
                            <span className={`jobs-tl-status ${colorClass}`}>{dlLabel}</span>
                          </div>
                          <div className="jobs-tl-bar">
                            <div className={`jobs-tl-fill ${colorClass}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })()}
                    <div className="jobs-card-actions">
                      <Link to={`/jobs/${job._id}`} className="jobs-btn-details">
                        View Details <FaExternalLinkAlt size={10} />
                      </Link>
                      {user?.role === 'student' && !isApplied && (
                        <button
                          className="jobs-btn-apply"
                          onClick={() => handleApply(job._id)}
                          disabled={applying === job._id || isExpired}
                        >
                          {applying === job._id ? (
                            <span className="jobs-btn-spinner" />
                          ) : (
                            <>Apply <FaArrowRight size={10} /></>
                          )}
                        </button>
                      )}
                      {!user && (
                        <Link to="/login" className="jobs-btn-apply">
                          Login to Apply <FaArrowRight size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="jobs-pagination">
              <button
                className="jobs-page-btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <FaChevronLeft size={12} /> Prev
              </button>

              <div className="jobs-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="jobs-page-dots">...</span>
                      )}
                      <button
                        className={`jobs-page-num ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>

              <button
                className="jobs-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <FaChevronRight size={12} />
              </button>
            </div>
          )}
        </>
      )
      }

      {/* ── Quick Tip ── */}
      {
        !loading && jobs.length > 0 && (
          <div className="jobs-tip-bar">
            <FaRegLightbulb size={14} />
            <span>
              <strong>Pro tip:</strong> Set up alerts to get notified when new jobs matching your skills are posted.
            </span>
          </div>
        )
      }
    </div >
  );
};

export default JobListings;
