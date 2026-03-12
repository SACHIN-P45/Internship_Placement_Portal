// Company Dashboard — premium management centre for job postings and applicants
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import PDFViewer from '../components/PDFViewer';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaTimes,
  FaCheck,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaRocket,
  FaSyncAlt,
  FaArrowUp,
  FaCode,
  FaStar,
  FaGraduationCap,
  FaEnvelope,
  FaFilter,
  FaSearch,
  FaRegLightbulb,
} from 'react-icons/fa';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Job form state
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'job',
    location: '',
    salary: '',
    skillsRequired: '',
    eligibilityCGPA: '',
    deadline: '',
    openings: 1,
    experience: 'fresher',
  });

  // Applicants modal state
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantFilter, setApplicantFilter] = useState('');

  // PDF Viewer state for applicant resumes
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedApplicationName, setSelectedApplicationName] = useState(null);

  // Fetch company's jobs
  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await jobService.getMyJobs();
      setJobs(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // Quick stats
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0);
  const activeJobs = jobs.filter((j) => j.isActive).length;
  const internships = jobs.filter((j) => j.type === 'internship').length;

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'job',
      location: '',
      salary: '',
      skillsRequired: '',
      eligibilityCGPA: '',
      deadline: '',
      openings: 1,
      experience: 'fresher',
    });
    setEditingJob(null);
    setShowForm(false);
  };

  // Check for #post hash to auto-open form (after resetForm defined)
  useEffect(() => {
    if (location.hash === '#post') {
      setForm({
        title: '',
        description: '',
        type: 'job',
        location: '',
        salary: '',
        skillsRequired: '',
        eligibilityCGPA: '',
        deadline: '',
        openings: 1,
        experience: 'fresher',
      });
      setEditingJob(null);
      setShowForm(true);
      // Clear hash from URL
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location.hash, location.pathname]);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or Update job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingJob) {
        await jobService.update(editingJob, form);
        toast.success('Job updated successfully!');
      } else {
        await jobService.create(form);
        toast.success('Job posted successfully!');
      }
      resetForm();
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit job
  const handleEdit = (job) => {
    setEditingJob(job._id);
    setForm({
      title: job.title,
      description: job.description,
      type: job.type,
      location: job.location || '',
      salary: job.salary || '',
      skillsRequired: job.skillsRequired?.join(', ') || '',
      eligibilityCGPA: job.eligibilityCGPA || '',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
      openings: job.openings || 1,
      experience: job.experience || 'fresher',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete job
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await jobService.remove(id);
      toast.success('Job deleted');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // View applicants
  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setShowApplicants(true);
    setLoadingApplicants(true);
    setApplicantSearch('');
    setApplicantFilter('');
    try {
      const { data } = await applicationService.getApplicantsForJob(job._id);
      setApplicants(data);
    } catch {
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Update applicant status
  const handleStatusUpdate = async (appId, status) => {
    try {
      await applicationService.updateStatus(appId, status);
      toast.success(`Status updated to ${status}`);
      const { data } = await applicationService.getApplicantsForJob(selectedJob._id);
      setApplicants(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      !applicantSearch ||
      app.student?.name?.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.student?.email?.toLowerCase().includes(applicantSearch.toLowerCase());
    const matchesFilter = !applicantFilter || app.status === applicantFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { icon: FaBriefcase, value: jobs.length, label: 'Total Posts', color: '#3b82f6', bg: '#eff6ff', trend: '+5' },
    { icon: FaRocket, value: activeJobs, label: 'Active', color: '#22c55e', bg: '#f0fdf4', trend: null },
    { icon: FaGraduationCap, value: internships, label: 'Internships', color: '#8b5cf6', bg: '#f5f3ff', trend: null },
    { icon: FaUsers, value: totalApplicants, label: 'Applicants', color: '#f59e0b', bg: '#fffbeb', trend: '+12' },
  ];

  return (
    <div className="cmp-page">
      {/* ══════════ Hero Header ══════════ */}
      <div className="cmp-hero">
        <div className="cmp-hero-bg" />
        <div className="cmp-hero-content">
          <div className="cmp-hero-left">
            <div className="cmp-hero-icon">
              <FaBriefcase size={26} />
            </div>
            <div>
              <h1 className="cmp-hero-title">Welcome, {user?.companyName || user?.name} 👋</h1>
              <p className="cmp-hero-sub">Employer Dashboard — Manage job postings & applicants</p>
            </div>
          </div>
          <div className="cmp-hero-actions">
            <button
              className="cmp-hero-btn cmp-hero-btn-ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh"
            >
              <FaSyncAlt size={14} className={refreshing ? 'cmp-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              className={`cmp-hero-btn ${showForm ? 'cmp-hero-btn-ghost' : 'cmp-hero-btn-primary'}`}
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              {showForm ? <FaTimes size={14} /> : <FaPlus size={14} />}
              <span>{showForm ? 'Cancel' : 'Post Job'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ Stats Row ══════════ */}
      <div className="cmp-stats-row">
        {[
          { icon: FaBriefcase, value: jobs.length, label: 'Total Posts', variant: 'blue' },
          { icon: FaRocket, value: activeJobs, label: 'Active Jobs', variant: 'emerald' },
          { icon: FaGraduationCap, value: internships, label: 'Internships', variant: 'violet' },
          { icon: FaUsers, value: totalApplicants, label: 'Total Applicants', variant: 'amber' },
        ].map((s, i) => (
          <div key={i} className={`cmp-stat-card cmp-stat-${s.variant}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="cmp-stat-icon-wrap"><s.icon size={20} /></div>
            <div className="cmp-stat-content">
              <span className="cmp-stat-number">{s.value}</span>
              <span className="cmp-stat-text">{s.label}</span>
            </div>
            <div className="cmp-stat-glow" />
          </div>
        ))}
      </div>

      {/* ══════════ Quick Tip ══════════ */}
      {!showForm && jobs.length === 0 && (
        <div className="cmp-tip-banner">
          <FaRegLightbulb size={18} className="cmp-tip-icon" />
          <div>
            <strong>Get Started!</strong> Post your first job to start receiving applications from talented students.
          </div>
        </div>
      )}

      {/* ══════════ Job Form ══════════ */}
      {showForm && (
        <div className="cmp-form-section">
          <div className="cmp-form-header">
            <div className="cmp-form-icon">
              {editingJob ? <FaEdit size={18} /> : <FaPlus size={18} />}
            </div>
            <div>
              <h5 className="cmp-form-title">{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</h5>
              <p className="cmp-form-sub">Fill in the details below to {editingJob ? 'update' : 'publish'} your job</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="cmp-form">
            <div className="cmp-form-grid">
              {/* Row 1 */}
              <div className="cmp-form-group cmp-form-col-6">
                <label className="cmp-label">Job Title <span className="cmp-required">*</span></label>
                <input
                  type="text"
                  name="title"
                  className="cmp-input"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>
              <div className="cmp-form-group cmp-form-col-3">
                <label className="cmp-label">Type</label>
                <select name="type" className="cmp-select" value={form.type} onChange={handleChange}>
                  <option value="job">Full-time Job</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="cmp-form-group cmp-form-col-3">
                <label className="cmp-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="cmp-input"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Remote / City"
                />
              </div>

              {/* Row 2 - Description */}
              <div className="cmp-form-group cmp-form-col-12">
                <label className="cmp-label">Job Description <span className="cmp-required">*</span></label>
                <textarea
                  name="description"
                  className="cmp-textarea"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  required
                />
              </div>

              {/* Row 3 */}
              <div className="cmp-form-group cmp-form-col-3">
                <label className="cmp-label">
                  <FaMoneyBillWave size={12} className="me-1" /> Salary / Stipend
                </label>
                <input
                  type="text"
                  name="salary"
                  className="cmp-input"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="₹5-8 LPA"
                />
              </div>
              <div className="cmp-form-group cmp-form-col-3">
                <label className="cmp-label">Min CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  name="eligibilityCGPA"
                  className="cmp-input"
                  value={form.eligibilityCGPA}
                  onChange={handleChange}
                  placeholder="6.5"
                />
              </div>
              <div className="cmp-form-group cmp-form-col-3">
                <label className="cmp-label">Openings</label>
                <input
                  type="number"
                  name="openings"
                  min="1"
                  className="cmp-input"
                  value={form.openings}
                  onChange={handleChange}
                />
              </div>
              <div className="cmp-form-group cmp-form-col-3">
                <label className="cmp-label">Experience</label>
                <select name="experience" className="cmp-select" value={form.experience} onChange={handleChange}>
                  <option value="fresher">Fresher</option>
                  <option value="1-2 years">1-2 Years</option>
                  <option value="2-5 years">2-5 Years</option>
                  <option value="5+ years">5+ Years</option>
                </select>
              </div>

              {/* Row 4 */}
              <div className="cmp-form-group cmp-form-col-6">
                <label className="cmp-label">
                  <FaCalendarAlt size={12} className="me-1" /> Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  className="cmp-input"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>
              <div className="cmp-form-group cmp-form-col-6">
                <label className="cmp-label">
                  <FaCode size={12} className="me-1" /> Required Skills
                </label>
                <input
                  type="text"
                  name="skillsRequired"
                  className="cmp-input"
                  value={form.skillsRequired}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>

            <div className="cmp-form-actions">
              <button type="submit" className="cmp-btn cmp-btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>{editingJob ? 'Updating...' : 'Posting...'}</span>
                  </>
                ) : (
                  <>
                    <FaCheck size={12} />
                    <span>{editingJob ? 'Update Job' : 'Post Job'}</span>
                  </>
                )}
              </button>
              {editingJob && (
                <button type="button" className="cmp-btn cmp-btn-secondary" onClick={resetForm}>
                  <FaTimes size={12} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ══════════ Jobs Section ══════════ */}
      <div className="cmp-content">
        <div className="cmp-section-header" style={{ marginTop: '24px' }}>
          <div>
            <h5 className="cmp-section-title">
              <FaBriefcase className="text-primary" /> My Job Postings
            </h5>
            <p className="cmp-section-sub">{jobs.length} total postings</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="cmp-empty-state">
            <div className="cmp-empty-icon">
              <FaBriefcase size={40} />
            </div>
            <h6>No Jobs Posted Yet</h6>
            <p>Click "Post Job" above to create your first job posting and start receiving applications.</p>
          </div>
        ) : (
          <div className="cmp-jobs-grid">
            {jobs.map((job) => {
              const isExpired = job.deadline && new Date(job.deadline) < new Date();
              return (
                <div key={job._id} className={`cmp-job-card ${isExpired ? 'cmp-job-expired' : ''}`}>
                  <div className="cmp-job-header">
                    <div className="cmp-job-type-badge" data-type={job.type}>
                      {job.type === 'internship' ? <FaGraduationCap size={11} /> : <FaBriefcase size={11} />}
                      {job.type}
                    </div>
                    <div className={`cmp-job-status ${job.isActive ? 'active' : 'inactive'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <h6 className="cmp-job-title">{job.title}</h6>

                  <div className="cmp-job-meta">
                    <div className="cmp-job-meta-item">
                      <FaMapMarkerAlt size={11} />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="cmp-job-meta-item">
                      <FaUsers size={11} />
                      <span>{job.openings || 1} openings</span>
                    </div>
                    {job.salary && (
                      <div className="cmp-job-meta-item">
                        <FaMoneyBillWave size={11} />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>

                  {job.deadline && (
                    <div className={`cmp-job-deadline ${isExpired ? 'expired' : ''}`}>
                      <FaCalendarAlt size={11} />
                      <span>
                        {isExpired ? 'Expired' : 'Deadline'}: {formatDate(job.deadline)}
                      </span>
                    </div>
                  )}

                  <div className="cmp-job-stats">
                    <div className="cmp-job-stat">
                      <FaUsers size={12} />
                      <span>{job.applicationCount || 0} applicants</span>
                    </div>
                  </div>

                  <div className="cmp-job-actions">
                    <button
                      className="cmp-job-btn cmp-job-btn-view"
                      onClick={() => handleViewApplicants(job)}
                      title="View Applicants"
                    >
                      <FaUsers size={13} />
                      <span>Applicants</span>
                    </button>
                    <button
                      className="cmp-job-btn cmp-job-btn-edit"
                      onClick={() => handleEdit(job)}
                      title="Edit Job"
                    >
                      <FaEdit size={13} />
                    </button>
                    <button
                      className="cmp-job-btn cmp-job-btn-delete"
                      onClick={() => handleDelete(job._id)}
                      title="Delete Job"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════ Applicants Modal ══════════ */}
      {showApplicants && (
        <div className="cmp-modal-overlay" onClick={() => setShowApplicants(false)}>
          <div className="cmp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cmp-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 className="cmp-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                  <FaUsers className="me-2" style={{ color: '#3b82f6' }} />
                  Applicants for "{selectedJob?.title}"
                </h5>
                <p className="cmp-modal-sub" style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {applicants.length} total applicant{applicants.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button className="cmp-modal-close" onClick={() => setShowApplicants(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                <FaTimes size={18} />
              </button>
            </div>

            {/* Filters */}
            <div className="cmp-modal-filters" style={{ padding: '16px 24px', background: '#f8fafc', display: 'flex', gap: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div className="cmp-modal-search" style={{ position: 'relative', flex: 1 }}>
                <FaSearch size={12} className="cmp-modal-search-icon" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </div>
              <div className="cmp-modal-filter">
                <FaFilter size={11} className="cmp-modal-filter-icon" />
                <select value={applicantFilter} onChange={(e) => setApplicantFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="cmp-modal-body">
              {loadingApplicants ? (
                <LoadingSpinner />
              ) : filteredApplicants.length === 0 ? (
                <div className="cmp-modal-empty">
                  <FaUsers size={40} />
                  <h6>{applicants.length === 0 ? 'No Applicants Yet' : 'No Matches Found'}</h6>
                  <p>
                    {applicants.length === 0
                      ? 'No one has applied yet. Share your job posting to get more visibility!'
                      : 'Try adjusting your search or filter criteria.'}
                  </p>
                </div>
              ) : (
                <div className="cmp-applicants-list">
                  {filteredApplicants.map((app) => (
                    <div key={app._id} className="cmp-applicant-card">
                      <div className="cmp-applicant-avatar">
                        {app.student?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="cmp-applicant-info">
                        <div className="cmp-applicant-name">{app.student?.name}</div>
                        <div className="cmp-applicant-email">
                          <FaEnvelope size={10} /> {app.student?.email}
                        </div>
                        <div className="cmp-applicant-details">
                          {app.student?.department && (
                            <span>
                              <FaGraduationCap size={10} /> {app.student.department}
                            </span>
                          )}
                          {app.student?.cgpa && (
                            <span>
                              <FaStar size={10} /> CGPA: {app.student.cgpa}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="cmp-applicant-actions">
                        {app.resume && (
                          <button
                            onClick={() => {
                              setSelectedApplicationId(app._id);
                              setSelectedApplicationName(`${app.student.name}'s Resume`);
                              setShowApplicants(false);
                              setPdfViewerOpen(true);
                            }}
                            className="cmp-resume-link"
                            title="View resume"
                          >
                            <FaFileAlt size={12} /> Resume
                          </button>
                        )}
                        <StatusBadge status={app.status} />
                        <select
                          className="cmp-status-select"
                          value={app.status?.toLowerCase() || 'applied'}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer for Applicant Resumes */}
      <ApplicationResumePDFViewer
        isOpen={pdfViewerOpen}
        applicationId={selectedApplicationId}
        onClose={() => {
          setPdfViewerOpen(false);
          setShowApplicants(true);
        }}
        fileName={selectedApplicationName}
      />
    </div >
  );
};

// Separate component for viewing applicant resumes (uses applicationService instead of authService)
function ApplicationResumePDFViewer({ isOpen, applicationId, onClose, fileName }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      console.log('Loading applicant resume:', applicationId);
      loadPDF();
    }
  }, [isOpen, applicationId]);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await applicationService.downloadApplicantResume(applicationId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Failed to load resume:', err);
      setError('Failed to load resume');
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await applicationService.downloadApplicantResume(applicationId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded!');
    } catch (err) {
      console.error('Failed to download resume:', err);
      toast.error('Failed to download resume');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-viewer-overlay" onClick={onClose}>
      <div className="pdf-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <h3>{fileName || 'Resume'}</h3>
          <div className="pdf-viewer-actions">
            <button
              className="pdf-viewer-download-btn"
              onClick={handleDownload}
              disabled={loading}
              title="Download PDF"
            >
              <FaFileAlt size={16} />
              Download
            </button>
            <button
              className="pdf-viewer-close-btn"
              onClick={onClose}
              title="Close"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        <div className="pdf-viewer-content">
          {loading ? (
            <div className="pdf-viewer-loading">
              <LoadingSpinner />
              <p>Loading resume...</p>
            </div>
          ) : error ? (
            <div className="pdf-viewer-error">
              <p>Error: {error}</p>
              <p>Could not load resume. Please try again.</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Applicant Resume"
              className="pdf-viewer-iframe"
            />
          ) : (
            <div className="pdf-viewer-error">
              <p>Could not load resume</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;
