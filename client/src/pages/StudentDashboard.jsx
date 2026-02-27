// Student Dashboard — professional profile management, resume, applications
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import applicationService from '../services/applicationService';
import jobService from '../services/jobService';
import StatusBadge from '../components/StatusBadge';
import PDFViewer from '../components/PDFViewer';
import {
  FaUser,
  FaUpload,
  FaFileAlt,
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPhone,
  FaInfoCircle,
  FaUserGraduate,
  FaCloudUploadAlt,
  FaExternalLinkAlt,
  FaArrowRight,
  FaEdit,
  FaGraduationCap,
  FaStar,
  FaCalendarAlt,
  FaBuilding,
  FaRocket,
  FaLightbulb,
  FaTrophy,
  FaChartLine,
  FaFilePdf,
  FaTimes,
  FaBookmark,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTrashAlt,
} from 'react-icons/fa';

const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    department: '',
    cgpa: '',
    skills: '',
    phone: '',
    bio: '',
  });
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [removingBookmark, setRemovingBookmark] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  // Load profile data
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        department: user.department || '',
        cgpa: user.cgpa || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  // Load applications
  useEffect(() => {
    if (user) {
      applicationService
        .getMyApplications()
        .then(({ data }) => setApplications(data))
        .catch(() => {});
    }
  }, [user]);

  // Load saved (bookmarked) jobs
  useEffect(() => {
    if (user) {
      jobService
        .getBookmarkedJobs()
        .then(({ data }) => setSavedJobs(data))
        .catch(() => {});
    }
  }, [user]);

  // Load resume history
  useEffect(() => {
    if (user) {
      authService
        .getResumeHistory()
        .then(({ data }) => setResumes(data))
        .catch(() => {});
    }
  }, [user]);

  // Remove bookmark handler
  const handleRemoveBookmark = async (jobId) => {
    setRemovingBookmark(jobId);
    try {
      await jobService.toggleBookmark(jobId);
      setSavedJobs(savedJobs.filter((job) => job._id !== jobId));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    } finally {
      setRemovingBookmark(null);
    }
  };

  // Profile completion
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    const fields = [user.name, user.department, user.cgpa, user.skills?.length > 0, user.phone, user.bio, user.resume];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [user]);

  const completionGradient =
    profileCompletion >= 80
      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
      : profileCompletion >= 50
      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
      : 'linear-gradient(135deg, #ef4444, #dc2626)';

  // Missing fields
  const missingFields = useMemo(() => {
    if (!user) return [];
    const checks = [
      { field: 'department', label: 'Department' },
      { field: 'cgpa', label: 'CGPA' },
      { field: 'phone', label: 'Phone' },
      { field: 'bio', label: 'Bio' },
      { field: 'resume', label: 'Resume' },
    ];
    return checks.filter((c) => {
      if (c.field === 'skills') return !user.skills?.length;
      return !user[c.field];
    });
  }, [user]);

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(profile);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Upload resume
  const handleResumeUpload = async (e) => {
    e?.preventDefault();
    if (!resumeFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      await authService.uploadResume(formData);
      await refreshUser();
      setResumeFile(null);
      toast.success('Resume uploaded successfully!');
      // Reload resume history
      const { data } = await authService.getResumeHistory();
      setResumes(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Drag & drop for resume
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') setResumeFile(file);
      else toast.error('Only PDF files are accepted');
    }
  };

  // Stats
  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    selected: applications.filter((a) => a.status === 'selected').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const statCards = [
    { icon: FaBriefcase, value: stats.total, label: 'Applied', color: '#3b82f6', bg: '#eff6ff' },
    { icon: FaClock, value: stats.shortlisted, label: 'Shortlisted', color: '#f59e0b', bg: '#fffbeb' },
    { icon: FaTrophy, value: stats.selected, label: 'Selected', color: '#22c55e', bg: '#f0fdf4' },
    { icon: FaBookmark, value: savedJobs.length, label: 'Saved', color: '#6366f1', bg: '#f5f3ff' },
  ];

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="stu-dashboard">
      {/* ---- Header ---- */}
      <div className="stu-header">
        <div className="stu-header-left">
          <div className="stu-header-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="stu-header-greeting">{getGreeting()}</p>
            <h2 className="stu-header-name">{user?.name}</h2>
            <div className="stu-header-meta">
              {user?.department && (
                <span><FaGraduationCap size={12} /> {user.department}</span>
              )}
              {user?.cgpa && (
                <span><FaStar size={11} /> CGPA: {user.cgpa}</span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion Ring */}
        <div className="stu-completion-card">
          <div className="stu-completion-ring">
            <svg width="68" height="68" viewBox="0 0 68 68">
              <circle cx="34" cy="34" r="28" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <circle
                cx="34" cy="34" r="28"
                fill="none"
                stroke={profileCompletion >= 80 ? '#22c55e' : profileCompletion >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(profileCompletion / 100) * 175.9} 175.9`}
                transform="rotate(-90 34 34)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <span className="stu-completion-pct">{profileCompletion}%</span>
          </div>
          <div className="stu-completion-info">
            <span className="stu-completion-label">Profile Complete</span>
            {missingFields.length > 0 && (
              <span className="stu-completion-hint">
                Missing: {missingFields.map((f) => f.label).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---- Stat Cards ---- */}
      <div className="stu-stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stu-stat-card">
            <div className="stu-stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={18} />
            </div>
            <div className="stu-stat-info">
              <div className="stu-stat-value">{s.value}</div>
              <div className="stu-stat-label">{s.label}</div>
            </div>
            <div className="stu-stat-deco" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* ---- Main Grid ---- */}
      <div className="stu-main-grid">
        {/* LEFT COLUMN — Profile Form */}
        <div className="stu-card">
          <div className="stu-card-header">
            <div className="stu-card-header-icon stu-icon-blue">
              <FaEdit size={16} />
            </div>
            <div>
              <h5 className="stu-card-title">Edit Profile</h5>
              <p className="stu-card-sub">Keep your information updated for recruiters</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="stu-form">
            <div className="stu-form-group">
              <label className="stu-label">Full Name</label>
              <input
                className="stu-input"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="stu-form-row">
              <div className="stu-form-group">
                <label className="stu-label">Department</label>
                <input
                  className="stu-input"
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="stu-form-group">
                <label className="stu-label">CGPA</label>
                <input
                  className="stu-input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={profile.cgpa}
                  onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                  placeholder="0.00 — 10.00"
                />
              </div>
            </div>

            <div className="stu-form-group">
              <label className="stu-label"><FaPhone size={10} className="me-1" /> Phone</label>
              <input
                className="stu-input"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="stu-form-group">
              <label className="stu-label">Skills</label>
              <input
                className="stu-input"
                type="text"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                placeholder="React, Node.js, MongoDB…"
              />
              {profile.skills && (
                <div className="stu-skills-tags">
                  {profile.skills.split(',').filter(Boolean).map((s, i) => (
                    <span key={i} className="stu-skill-tag">{s.trim()}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="stu-form-group">
              <label className="stu-label"><FaInfoCircle size={10} className="me-1" /> Bio</label>
              <textarea
                className="stu-input stu-textarea"
                rows="3"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell employers about yourself…"
              />
            </div>

            <button type="submit" className="stu-btn stu-btn-primary" disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm" /> Saving…</>
              ) : (
                <><FaCheckCircle size={14} /> Save Changes</>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN */}
        <div className="stu-right-col">
          {/* Resume Card */}
          <div className="stu-card">
            <div className="stu-card-header">
              <div className="stu-card-header-icon stu-icon-green">
                <FaFilePdf size={16} />
              </div>
              <div>
                <h5 className="stu-card-title">Resume</h5>
                <p className="stu-card-sub">Upload your latest resume (PDF)</p>
              </div>
            </div>

            {resumes.length > 0 ? (
              <div className="stu-resume-section">
                <div className="stu-resume-current">
                  <div className="stu-resume-file-icon">
                    <FaFilePdf size={20} />
                  </div>
                  <div className="stu-resume-file-info">
                    <span className="stu-resume-file-name">{resumes.find(r => r.isActive)?.originalFileName || 'Resume'}</span>
                    <span className="stu-resume-file-status"><FaCheckCircle size={10} /> Active</span>
                  </div>
                  <button
                    className="stu-resume-view-btn"
                    onClick={() => {
                      const activeResume = resumes.find(r => r.isActive);
                      console.log('Active resume:', activeResume);
                      if (activeResume) {
                        setSelectedResumeId(activeResume._id);
                        setPdfViewerOpen(true);
                      }
                    }}
                  >
                    View <FaExternalLinkAlt size={10} />
                  </button>
                </div>

                {resumes.length > 1 && (
                  <div className="stu-resume-history">
                    <h6>Resume History</h6>
                    {resumes.map((resume) => (
                      <div key={resume._id} className="stu-resume-history-item">
                        <span>{resume.originalFileName}</span>
                        <span className="stu-resume-date">
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </span>
                        <div className="stu-resume-history-actions">
                          <button
                            className="stu-resume-history-btn"
                            onClick={() => {
                              setSelectedResumeId(resume._id);
                              setPdfViewerOpen(true);
                            }}
                          >
                            View
                          </button>
                          {!resume.isActive && (
                            <button
                              className="stu-resume-history-btn"
                              onClick={async () => {
                                try {
                                  await authService.activateResume(resume._id);
                                  const { data } = await authService.getResumeHistory();
                                  setResumes(data);
                                  await refreshUser();
                                  toast.success('Resume activated!');
                                } catch {
                                  toast.error('Failed to activate resume');
                                }
                              }}
                            >
                              Activate
                            </button>
                          )}
                          {!resume.isActive && (
                            <button
                              className="stu-resume-history-btn delete"
                              onClick={async () => {
                                try {
                                  await authService.deleteResume(resume._id);
                                  const { data } = await authService.getResumeHistory();
                                  setResumes(data);
                                  toast.success('Resume deleted!');
                                } catch {
                                  toast.error('Failed to delete resume');
                                }
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="stu-resume-alert">
                <FaInfoCircle size={14} />
                <span>No resume uploaded yet. Upload one to apply for jobs.</span>
              </div>
            )}

            {/* Drag & drop zone */}
            <div
              className={`stu-dropzone ${dragActive ? 'active' : ''} ${resumeFile ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              {resumeFile ? (
                <div className="stu-dropzone-file">
                  <FaFilePdf size={20} className="text-danger" />
                  <span>{resumeFile.name}</span>
                  <button
                    type="button"
                    className="stu-dropzone-remove"
                    onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <FaCloudUploadAlt size={28} className="stu-dropzone-icon" />
                  <span className="stu-dropzone-text">Drag & drop or click to browse</span>
                  <span className="stu-dropzone-hint">PDF only, max 5MB</span>
                </>
              )}
            </div>

            <button
              className="stu-btn stu-btn-green"
              onClick={handleResumeUpload}
              disabled={!resumeFile || uploading}
            >
              {uploading ? (
                <><span className="spinner-border spinner-border-sm" /> Uploading…</>
              ) : (
                <><FaUpload size={13} /> Upload Resume</>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="stu-card stu-quick-actions">
            <h5 className="stu-card-title" style={{ marginBottom: 16 }}>
              <FaRocket size={14} className="me-2" style={{ color: '#6366f1' }} />
              Quick Actions
            </h5>
            <Link to="/jobs" className="stu-action-link">
              <div className="stu-action-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <FaBriefcase size={16} />
              </div>
              <div>
                <span className="stu-action-label">Browse Jobs</span>
                <span className="stu-action-desc">Find new opportunities</span>
              </div>
              <FaArrowRight size={12} className="stu-action-arrow" />
            </Link>
            <Link to="/applications" className="stu-action-link">
              <div className="stu-action-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}>
                <FaFileAlt size={16} />
              </div>
              <div>
                <span className="stu-action-label">My Applications</span>
                <span className="stu-action-desc">Track your progress</span>
              </div>
              <FaArrowRight size={12} className="stu-action-arrow" />
            </Link>
          </div>

          {/* Tip Card */}
          <div className="stu-tip-card">
            <FaLightbulb size={16} className="stu-tip-icon" />
            <div>
              <strong>Pro Tip</strong>
              <p>Profiles with a resume, bio, and skills get 3x more views from recruiters!</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Recent Applications ---- */}
      {applications.length > 0 && (
        <div className="stu-card stu-recent-apps">
          <div className="stu-card-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
            <div className="stu-card-header-icon stu-icon-purple">
              <FaChartLine size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <h5 className="stu-card-title">Recent Applications</h5>
              <p className="stu-card-sub">Your latest {Math.min(applications.length, 5)} applications</p>
            </div>
            <Link to="/applications" className="stu-view-all-btn">
              View All <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="stu-apps-list">
            {applications.slice(0, 5).map((app) => (
              <Link
                key={app._id}
                to={`/jobs/${app.job?._id}`}
                className="stu-app-row"
              >
                <div className="stu-app-company-icon">
                  {app.job?.companyName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="stu-app-info">
                  <span className="stu-app-title">{app.job?.title}</span>
                  <span className="stu-app-company">
                    <FaBuilding size={10} className="me-1" />
                    {app.job?.companyName}
                  </span>
                </div>
                <div className="stu-app-date">
                  <FaCalendarAlt size={10} />
                  {formatDate(app.createdAt)}
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---- Saved Jobs ---- */}
      {savedJobs.length > 0 && (
        <div className="stu-card stu-saved-jobs">
          <div className="stu-card-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
            <div className="stu-card-header-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}>
              <FaBookmark size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <h5 className="stu-card-title">Saved Jobs</h5>
              <p className="stu-card-sub">Jobs you've bookmarked for later</p>
            </div>
            <Link to="/jobs" className="stu-view-all-btn">
              Browse More <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="stu-saved-grid">
            {savedJobs.slice(0, 6).map((job) => {
              const isExpired = job.deadline && new Date(job.deadline) < new Date();
              return (
                <div key={job._id} className={`stu-saved-card ${isExpired ? 'expired' : ''}`}>
                  <div className="stu-saved-header">
                    <div className="stu-saved-avatar">
                      {job.companyName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="stu-saved-type">
                      {job.type === 'internship' ? (
                        <><FaGraduationCap size={10} /> Internship</>
                      ) : (
                        <><FaBriefcase size={10} /> Full-time</>
                      )}
                    </div>
                    <button
                      className="stu-saved-remove"
                      onClick={() => handleRemoveBookmark(job._id)}
                      disabled={removingBookmark === job._id}
                      title="Remove bookmark"
                    >
                      {removingBookmark === job._id ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <FaTrashAlt size={12} />
                      )}
                    </button>
                  </div>
                  <Link to={`/jobs/${job._id}`} className="stu-saved-title">
                    {job.title}
                  </Link>
                  <div className="stu-saved-company">
                    <FaBuilding size={10} /> {job.companyName}
                  </div>
                  <div className="stu-saved-meta">
                    <span><FaMapMarkerAlt size={10} /> {job.location || 'Remote'}</span>
                    <span><FaMoneyBillWave size={10} /> {job.salary || 'Competitive'}</span>
                  </div>
                  {isExpired && (
                    <div className="stu-saved-expired-badge">
                      <FaClock size={10} /> Expired
                    </div>
                  )}
                  <Link to={`/jobs/${job._id}`} className="stu-saved-view-btn">
                    View Details <FaArrowRight size={10} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <PDFViewer
        isOpen={pdfViewerOpen}
        resumeId={selectedResumeId}
        onClose={() => setPdfViewerOpen(false)}
        fileName={resumes.find(r => r._id === selectedResumeId)?.originalFileName}
      />
    </div>
  );
};

export default StudentDashboard;
