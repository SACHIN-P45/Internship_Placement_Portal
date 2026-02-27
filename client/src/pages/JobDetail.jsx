// Job Detail page — premium professional design
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaBuilding,
  FaGlobe,
  FaUsers,
  FaGraduationCap,
  FaArrowLeft,
  FaCheckCircle,
  FaBriefcase,
  FaLayerGroup,
  FaExternalLinkAlt,
  FaStar,
  FaRegBookmark,
  FaShareAlt,
  FaCalendarAlt,
  FaShieldAlt,
  FaRegLightbulb,
  FaChevronRight,
  FaRocket,
  FaTimes,
  FaRegClock,
  FaEnvelope,
} from 'react-icons/fa';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await jobService.getById(id);
        setJob(data);
      } catch {
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  useEffect(() => {
    if (user?.role === 'student') {
      applicationService.getMyApplications().then(({ data }) => {
        setApplied(data.some((a) => a.job?._id === id));
      });
    }
  }, [user, id]);

  const handleApply = async () => {
    if (!user) return navigate('/login');
    setApplying(true);
    setMessage({ text: '', type: '' });
    try {
      await applicationService.apply(id);
      setApplied(true);
      setMessage({ text: 'Application submitted successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to apply', type: 'danger' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return null;

  const isExpired = job.deadline && new Date(job.deadline) < new Date();
  const daysLeft = job.deadline
    ? Math.ceil((new Date(job.deadline) - new Date()) / 86400000)
    : null;
  const initial = (job.companyName || 'C')[0].toUpperCase();

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / 86400000);
    if (diff === 0) return 'Posted today';
    if (diff === 1) return 'Posted yesterday';
    if (diff < 7) return `Posted ${diff} days ago`;
    if (diff < 30) return `Posted ${Math.floor(diff / 7)} weeks ago`;
    return `Posted ${Math.floor(diff / 30)} months ago`;
  };

  return (
    <div className="jd-page">
      {/* ── Breadcrumb / Back ── */}
      <div className="jd-breadcrumb">
        <button className="jd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft size={12} />
          <span>Back to Jobs</span>
        </button>
        <div className="jd-breadcrumb-trail">
          <Link to="/jobs">Browse Jobs</Link>
          <FaChevronRight size={9} />
          <span>{job.title}</span>
        </div>
      </div>

      {/* ── Alert ── */}
      {message.text && (
        <div className={`jd-alert jd-alert-${message.type}`}>
          <span>{message.text}</span>
          <button className="jd-alert-close" onClick={() => setMessage({ text: '', type: '' })}>
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="jd-hero">
        <div className="jd-hero-bg" />
        <div className="jd-hero-content">
          <div className="jd-hero-left">
            <div className="jd-hero-avatar">{initial}</div>
            <div className="jd-hero-info">
              <div className="jd-hero-badges">
                <span className={`jd-badge-type ${job.type === 'internship' ? 'jd-badge-intern' : 'jd-badge-ft'}`}>
                  {job.type === 'internship' ? <><FaGraduationCap size={11} /> Internship</> : <><FaBriefcase size={11} /> Full-time</>}
                </span>
                {isExpired && <span className="jd-badge-expired">Expired</span>}
                {!isExpired && daysLeft !== null && daysLeft <= 7 && (
                  <span className="jd-badge-urgent">
                    <FaClock size={10} /> {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                  </span>
                )}
              </div>
              <h1 className="jd-hero-title">{job.title}</h1>
              <div className="jd-hero-company">
                <FaBuilding size={12} />
                <span>{job.companyName}</span>
                {job.company?.website && (
                  <a href={job.company.website} target="_blank" rel="noreferrer" className="jd-hero-link">
                    <FaGlobe size={11} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="jd-hero-actions">
            <button className="jd-action-icon" title="Save job">
              <FaRegBookmark size={16} />
            </button>
            <button className="jd-action-icon" title="Share">
              <FaShareAlt size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="jd-stats-row">
        <div className="jd-stat-pill">
          <FaMapMarkerAlt size={13} />
          <span>{job.location || 'Remote'}</span>
        </div>
        <div className="jd-stat-pill">
          <FaMoneyBillWave size={13} />
          <span>{job.salary || 'Competitive'}</span>
        </div>
        {job.eligibilityCGPA > 0 && (
          <div className="jd-stat-pill">
            <FaStar size={13} />
            <span>Min CGPA: {job.eligibilityCGPA}</span>
          </div>
        )}
        {job.openings && (
          <div className="jd-stat-pill">
            <FaLayerGroup size={13} />
            <span>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
          </div>
        )}
        {job.experience && (
          <div className="jd-stat-pill">
            <FaBriefcase size={13} />
            <span>{job.experience}</span>
          </div>
        )}
        {job.deadline && (
          <div className="jd-stat-pill">
            <FaCalendarAlt size={13} />
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        )}
        {job.applicationCount !== undefined && (
          <div className="jd-stat-pill">
            <FaUsers size={13} />
            <span>{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Main Layout ── */}
      <div className="jd-layout">
        {/* Left — Content */}
        <div className="jd-main">
          {/* Job Description */}
          <div className="jd-section">
            <div className="jd-section-header">
              <div className="jd-section-icon" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb' }}>
                <FaBriefcase size={14} />
              </div>
              <h3 className="jd-section-title">Job Description</h3>
            </div>
            <div className="jd-description">
              {job.description}
            </div>
          </div>

          {/* Skills Required */}
          {job.skillsRequired?.length > 0 && (
            <div className="jd-section">
              <div className="jd-section-header">
                <div className="jd-section-icon" style={{ background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', color: '#7c3aed' }}>
                  <FaStar size={14} />
                </div>
                <h3 className="jd-section-title">Skills Required</h3>
              </div>
              <div className="jd-skills-grid">
                {job.skillsRequired.map((skill, i) => (
                  <span key={i} className="jd-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Key Details */}
          <div className="jd-section">
            <div className="jd-section-header">
              <div className="jd-section-icon" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#059669' }}>
                <FaShieldAlt size={14} />
              </div>
              <h3 className="jd-section-title">Key Details</h3>
            </div>
            <div className="jd-details-grid">
              <div className="jd-detail-item">
                <div className="jd-detail-icon"><FaBriefcase size={14} /></div>
                <div>
                  <span className="jd-detail-label">Type</span>
                  <span className="jd-detail-value">{job.type === 'internship' ? 'Internship' : 'Full-time Job'}</span>
                </div>
              </div>
              <div className="jd-detail-item">
                <div className="jd-detail-icon"><FaMapMarkerAlt size={14} /></div>
                <div>
                  <span className="jd-detail-label">Location</span>
                  <span className="jd-detail-value">{job.location || 'Remote'}</span>
                </div>
              </div>
              <div className="jd-detail-item">
                <div className="jd-detail-icon"><FaMoneyBillWave size={14} /></div>
                <div>
                  <span className="jd-detail-label">Compensation</span>
                  <span className="jd-detail-value">{job.salary || 'Competitive'}</span>
                </div>
              </div>
              {job.eligibilityCGPA > 0 && (
                <div className="jd-detail-item">
                  <div className="jd-detail-icon"><FaGraduationCap size={14} /></div>
                  <div>
                    <span className="jd-detail-label">Min CGPA</span>
                    <span className="jd-detail-value">{job.eligibilityCGPA}</span>
                  </div>
                </div>
              )}
              {job.openings && (
                <div className="jd-detail-item">
                  <div className="jd-detail-icon"><FaLayerGroup size={14} /></div>
                  <div>
                    <span className="jd-detail-label">Openings</span>
                    <span className="jd-detail-value">{job.openings}</span>
                  </div>
                </div>
              )}
              {job.deadline && (
                <div className="jd-detail-item">
                  <div className="jd-detail-icon"><FaCalendarAlt size={14} /></div>
                  <div>
                    <span className="jd-detail-label">Deadline</span>
                    <span className="jd-detail-value">{new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Posted info */}
          <div className="jd-posted-info">
            <FaRegClock size={12} />
            <span>{timeAgo(job.createdAt)}</span>
          </div>
        </div>

        {/* Right — Sidebar */}
        <div className="jd-sidebar">
          {/* Apply Card */}
          <div className="jd-apply-card">
            {user?.role === 'student' ? (
              applied ? (
                <div className="jd-applied-state">
                  <div className="jd-applied-check">
                    <FaCheckCircle size={28} />
                  </div>
                  <h4>Application Submitted</h4>
                  <p>Your application is being reviewed.</p>
                  <Link to="/applications" className="jd-track-link">
                    Track Status <FaChevronRight size={10} />
                  </Link>
                </div>
              ) : (
                <div className="jd-apply-state">
                  <div className="jd-apply-icon-wrap">
                    <FaRocket size={20} />
                  </div>
                  <h4>{isExpired ? 'Position Closed' : 'Interested?'}</h4>
                  <p>{isExpired ? 'This job listing has expired.' : 'Take the next step in your career. Apply now!'}</p>
                  <button
                    className="jd-apply-btn"
                    onClick={handleApply}
                    disabled={applying || isExpired}
                  >
                    {applying ? (
                      <span className="jd-apply-spinner" />
                    ) : isExpired ? (
                      'Expired'
                    ) : (
                      <>Apply Now <FaArrowLeft size={12} style={{ transform: 'rotate(180deg)' }} /></>
                    )}
                  </button>
                  {!isExpired && (
                    <span className="jd-apply-note">
                      <FaShieldAlt size={10} /> Your information is secure
                    </span>
                  )}
                </div>
              )
            ) : !user ? (
              <div className="jd-apply-state">
                <div className="jd-apply-icon-wrap">
                  <FaRocket size={20} />
                </div>
                <h4>Want to Apply?</h4>
                <p>Sign in with your student account to get started.</p>
                <Link to="/login" className="jd-apply-btn">
                  Login to Apply <FaArrowLeft size={12} style={{ transform: 'rotate(180deg)' }} />
                </Link>
              </div>
            ) : (
              <div className="jd-apply-state">
                <p className="jd-apply-note" style={{ margin: 0 }}>Only students can apply for jobs.</p>
              </div>
            )}
          </div>

          {/* Company Card */}
          {job.company && (
            <div className="jd-company-card">
              <div className="jd-company-header">
                <div className="jd-company-avatar">{initial}</div>
                <div>
                  <h5 className="jd-company-name">{job.company.companyName || job.companyName}</h5>
                  <span className="jd-company-tag">
                    <FaBuilding size={10} /> Verified Employer
                  </span>
                </div>
              </div>
              {job.company.description && (
                <p className="jd-company-desc">{job.company.description}</p>
              )}
              <div className="jd-company-links">
                {job.company.website && (
                  <a href={job.company.website} target="_blank" rel="noreferrer" className="jd-company-link">
                    <FaGlobe size={12} /> Visit Website <FaExternalLinkAlt size={9} />
                  </a>
                )}
                {job.company.email && (
                  <a href={`mailto:${job.company.email}`} className="jd-company-link">
                    <FaEnvelope size={12} /> Contact
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="jd-tip-card">
            <FaRegLightbulb size={16} className="jd-tip-icon" />
            <div>
              <strong>Application Tip</strong>
              <p>Tailor your resume to highlight skills matching this position for a better chance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
