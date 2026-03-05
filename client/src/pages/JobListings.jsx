// Job listings page — premium redesign matching placement dashboard aesthetic
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
  FaBookmark,
  FaRegBookmark,
  FaRocket,
  FaFilter,
  FaThLarge,
  FaList,
  FaChevronDown,
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
  const [toast, setToast] = useState({ text: '', type: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [viewMode, setViewMode] = useState('grid');

  // Debounced search
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchTerm), 400);
    return () => clearTimeout(t);
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
        setJobs(data); setTotalPages(1); setTotalJobs(data.length);
      } else {
        setJobs(data.jobs || []); setTotalPages(data.pages || 1); setTotalJobs(data.total || 0);
      }
    } catch { setJobs([]); } finally { setLoading(false); }
  }, [search, typeFilter, locationFilter, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { setPage(1); }, [search, typeFilter, locationFilter]);

  useEffect(() => {
    if (user?.role === 'student') {
      applicationService.getMyApplications().then(({ data }) => {
        setAppliedJobs(data.map(a => a.job?._id));
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'student') {
      jobService.getBookmarkIds().then(({ data }) => setBookmarkedJobs(data)).catch(() => { });
    }
  }, [user]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 3500);
  };

  const handleApply = async (jobId) => {
    if (!user) return;
    setApplying(jobId);
    try {
      await applicationService.apply(jobId);
      setAppliedJobs(prev => [...prev, jobId]);
      showToast('Application submitted successfully! 🎉');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to apply', 'danger');
    } finally { setApplying(null); }
  };

  const handleBookmark = async (jobId) => {
    if (!user) return;
    setBookmarking(jobId);
    try {
      const { data } = await jobService.toggleBookmark(jobId);
      if (data.bookmarked) {
        setBookmarkedJobs(prev => [...prev, jobId]);
        showToast('Job saved to bookmarks!');
      } else {
        setBookmarkedJobs(prev => prev.filter(id => id !== jobId));
        showToast('Bookmark removed');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to bookmark', 'danger');
    } finally { setBookmarking(null); }
  };

  const hasFilters = search || typeFilter || locationFilter;
  const clearFilters = () => { setSearchTerm(''); setSearch(''); setTypeFilter(''); setLocationFilter(''); };

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
    <div className="phd-page">

      {/* ═══ HERO ═══ */}
      <div className="phd-hero" style={{ paddingBottom: '32px' }}>
        <div className="phd-hero-bg" />
        <div className="phd-hero-content">
          <div className="phd-hero-left">
            <div className="phd-hero-icon"><FaRocket size={24} /></div>
            <div>
              <h1 className="phd-hero-title">Browse Opportunities</h1>
              <p className="phd-hero-sub">
                {loading ? 'Loading jobs…' : `Discover ${totalJobs} job${totalJobs !== 1 ? 's' : ''} & internships tailored for you`}
              </p>
            </div>
          </div>

          {/* View mode toggle integrated into hero */}
          <div className="jobs-view-toggle">
            <button
              className={`jobs-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')} title="Grid view"
            >
              <FaThLarge size={14} />
            </button>
            <button
              className={`jobs-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')} title="List view"
            >
              <FaList size={14} />
            </button>
          </div>
        </div>

        {/* ── Filter bar embedded in hero ── */}
        <div className="jobs-filter-strip">
          <div className="jobs-search-wrap">
            <FaSearch className="jobs-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search jobs, companies, skills…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="jobs-search-clear" onClick={() => { setSearchTerm(''); setSearch(''); }}>
                <FaTimes size={11} />
              </button>
            )}
          </div>

          <div className="jobs-filter-wrap">
            <FaSlidersH size={11} className="jobs-fil-icon" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="job">Full-time Job</option>
            </select>
            <FaChevronDown size={9} className="jobs-fil-arrow" />
          </div>

          <div className="jobs-filter-wrap">
            <FaMapMarkerAlt size={11} className="jobs-fil-icon" />
            <input
              type="text"
              placeholder="Location…"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="jobs-location-input"
            />
          </div>

          {hasFilters && (
            <button className="jobs-clear-btn" onClick={clearFilters}>
              <FaTimes size={10} /> Clear
            </button>
          )}
        </div>

        {/* ── Quick type chips ── */}
        <div className="jobs-quick-chips">
          {[{ label: 'All', val: '' }, { label: '🎓 Internships', val: 'internship' }, { label: '💼 Full-time', val: 'job' }].map(c => (
            <button
              key={c.val}
              className={`jobs-chip ${typeFilter === c.val ? 'active' : ''}`}
              onClick={() => setTypeFilter(c.val)}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {/* ── Toast notification ── */}
      {toast.text && (
        <div className={`jobs-toast jobs-toast-${toast.type}`}>
          {toast.type === 'success' ? <FaCheckCircle size={14} /> : <FaTimes size={14} />}
          <span>{toast.text}</span>
          <button onClick={() => setToast({ text: '', type: '' })}><FaTimes size={11} /></button>
        </div>
      )}


      {/* ── Results bar ── */}
      {!loading && (
        <div className="jobs-results-bar">
          <div className="jobs-results-left">
            <span className="jobs-results-pill">
              {totalJobs} {totalJobs === 1 ? 'Job' : 'Jobs'}
            </span>
            {hasFilters && (
              <span className="jobs-filtered-tag"><FaFilter size={9} /> Filters active</span>
            )}
          </div>
          {totalJobs > 0 && (
            <div className="jobs-results-right">
              <span className="jobs-type-dot jobs-type-dot-intern" />
              <span className="jobs-type-label">{jobs.filter(j => j.type === 'internship').length} Internships</span>
              <span className="jobs-results-divider" />
              <span className="jobs-type-dot jobs-type-dot-ft" />
              <span className="jobs-type-label">{jobs.filter(j => j.type !== 'internship').length} Full-time</span>
            </div>
          )}
        </div>
      )}


      {/* ── Content ── */}
      <div className="phd-content" style={{ paddingTop: 0 }}>
        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div className="jobs-empty">
            <div className="jobs-empty-icon"><FaSearch size={36} /></div>
            <h4>No Opportunities Found</h4>
            <p>Try adjusting your search or filters to discover more opportunities</p>
            {hasFilters && (
              <button className="jobs-empty-btn" onClick={clearFilters}>
                <FaTimes size={12} /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Job Cards Grid ── */}
            <div className={`jobs-grid ${viewMode === 'list' ? 'jobs-grid-list' : ''}`}>
              {jobs.map((job, idx) => {
                const isExpired = job.deadline && new Date(job.deadline) < new Date();
                const daysLeft = job.deadline ? Math.ceil((new Date(job.deadline) - new Date()) / 86400000) : null;
                const isApplied = appliedJobs.includes(job._id);
                const isBookmarked = bookmarkedJobs.includes(job._id);
                const initial = (job.companyName || 'C')[0].toUpperCase();
                const hue = (job.companyName?.charCodeAt(0) || 65) * 9 % 360;

                // Timeline bar
                let pct = 0, tlLabel = 'Open', tlClass = 'jobs-tl-green';
                if (job.deadline) {
                  const totalMs = new Date(job.deadline) - new Date(job.createdAt);
                  const elapsedMs = Date.now() - new Date(job.createdAt);
                  pct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
                  const dl = daysLeft;
                  tlLabel = isExpired ? 'Expired' : dl === 0 ? 'Last day!' : dl === 1 ? '1d left' : `${dl}d left`;
                  tlClass = isExpired || dl <= 3 ? 'jobs-tl-red' : dl <= 7 ? 'jobs-tl-orange' : dl <= 14 ? 'jobs-tl-yellow' : 'jobs-tl-green';
                }

                return (
                  <div
                    key={job._id}
                    className={`jobs-card ${isExpired ? 'jobs-card-expired' : ''} ${isApplied ? 'jobs-card-applied' : ''}`}
                    style={{
                      animationDelay: `${(idx % 12) * 0.04}s`,
                      '--card-accent': job.type === 'internship' ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'linear-gradient(90deg,#2563eb,#60a5fa)',
                    }}
                  >
                    {/* ── Top Row: badges + bookmark ── */}
                    <div className="jobs-card-top">
                      <div className="jobs-badge-row">
                        <span className={`jobs-badge ${job.type === 'internship' ? 'jobs-badge-intern' : 'jobs-badge-ft'}`}>
                          {job.type === 'internship' ? <><FaGraduationCap size={10} /> Internship</> : <><FaBriefcase size={10} /> Full-time</>}
                        </span>
                        {isExpired && <span className="jobs-badge jobs-badge-expired">Expired</span>}
                        {!isExpired && daysLeft !== null && daysLeft <= 5 && (
                          <span className="jobs-badge jobs-badge-urgent"><FaClock size={9} /> {daysLeft}d left</span>
                        )}
                        {isApplied && <span className="jobs-badge jobs-badge-applied"><FaCheckCircle size={9} /> Applied</span>}
                      </div>
                      {user?.role === 'student' && (
                        <button
                          className={`jobs-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                          onClick={() => handleBookmark(job._id)}
                          disabled={bookmarking === job._id}
                          title={isBookmarked ? 'Remove bookmark' : 'Save job'}
                        >
                          {bookmarking === job._id
                            ? <span className="jobs-btn-spinner" />
                            : isBookmarked ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />
                          }
                        </button>
                      )}
                    </div>

                    {/* ── Company + Title ── */}
                    <div className="jobs-card-body">
                      <div className="jobs-company-row">
                        <div
                          className="jobs-avatar"
                          style={{ background: `hsl(${hue},55%,92%)`, color: `hsl(${hue},55%,35%)` }}
                        >
                          {initial}
                        </div>
                        <div className="jobs-company-info">
                          <Link to={`/jobs/${job._id}`} className="jobs-card-title">{job.title}</Link>
                          <span className="jobs-card-company"><FaBuilding size={10} /> {job.companyName}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="jobs-card-desc">
                        {job.description?.substring(0, viewMode === 'list' ? 180 : 110)}
                        {job.description?.length > (viewMode === 'list' ? 180 : 110) ? '…' : ''}
                      </p>

                      {/* Meta pills */}
                      <div className="jobs-meta-row">
                        <span className="jobs-meta-pill"><FaMapMarkerAlt size={10} /> {job.location || 'Remote'}</span>
                        <span className="jobs-meta-pill"><FaMoneyBillWave size={10} /> {job.salary || 'Competitive'}</span>
                        {job.applicationCount !== undefined && (
                          <span className="jobs-meta-pill"><FaUsers size={10} /> {job.applicationCount} applied</span>
                        )}
                        {job.openings > 1 && (
                          <span className="jobs-meta-pill"><FaLayerGroup size={10} /> {job.openings} openings</span>
                        )}
                        {job.eligibilityCGPA > 0 && (
                          <span className="jobs-meta-pill"><FaStar size={10} /> CGPA {job.eligibilityCGPA}+</span>
                        )}
                      </div>

                      {/* Skill tags */}
                      {job.skillsRequired?.length > 0 && (
                        <div className="jobs-skills-row">
                          {job.skillsRequired.slice(0, 4).map((s, i) => (
                            <span key={i} className="jobs-skill-tag">{s}</span>
                          ))}
                          {job.skillsRequired.length > 4 && (
                            <span className="jobs-skill-more">+{job.skillsRequired.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Footer: timeline + actions ── */}
                    <div className="jobs-card-footer">
                      <div className="jobs-timeline">
                        <div className="jobs-tl-labels">
                          <span className="jobs-tl-posted"><FaClock size={9} /> {timeAgo(job.createdAt) || 'Recently'}</span>
                          <span className={`jobs-tl-badge ${tlClass}`}>{tlLabel}</span>
                        </div>
                        <div className="jobs-tl-track">
                          <div className={`jobs-tl-fill ${tlClass}`} style={{ width: job.deadline ? `${pct}%` : '12%' }} />
                        </div>
                      </div>

                      <div className="jobs-actions">
                        <Link to={`/jobs/${job._id}`} className="jobs-btn-details">
                          View <FaExternalLinkAlt size={10} />
                        </Link>
                        {user?.role === 'student' && !isApplied && (
                          <button
                            className="jobs-btn-apply"
                            onClick={() => handleApply(job._id)}
                            disabled={applying === job._id || isExpired}
                          >
                            {applying === job._id
                              ? <span className="jobs-btn-spinner" />
                              : <>Apply <FaArrowRight size={10} /></>
                            }
                          </button>
                        )}
                        {!user && (
                          <Link to="/login" className="jobs-btn-apply">Login to Apply <FaArrowRight size={10} /></Link>
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
                <button className="jobs-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <FaChevronLeft size={12} /> Prev
                </button>
                <div className="jobs-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                    .map((p, idx, arr) => (
                      <span key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="jobs-page-dots">…</span>}
                        <button
                          className={`jobs-page-num ${p === page ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >{p}</button>
                      </span>
                    ))}
                </div>
                <button className="jobs-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <FaChevronRight size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobListings;
