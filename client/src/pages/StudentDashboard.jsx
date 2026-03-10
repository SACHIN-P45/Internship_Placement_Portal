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
  FaFire,
  FaCode,
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
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

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
        .catch(() => { });
    }
  }, [user]);

  // Load saved (bookmarked) jobs
  useEffect(() => {
    if (user) {
      jobService
        .getBookmarkedJobs()
        .then(({ data }) => setSavedJobs(data))
        .catch(() => { });
    }
  }, [user]);

  // Load resume history
  useEffect(() => {
    if (user) {
      authService
        .getResumeHistory()
        .then(({ data }) => setResumes(data))
        .catch(() => { });
    }
  }, [user]);

  // Load skill-based recommendations
  useEffect(() => {
    if (user && user.skills && user.skills.length > 0) {
      setLoadingRecs(true);
      jobService
        .getRecommendations()
        .then(({ data }) => setRecommendations(data))
        .catch(() => setRecommendations([]))
        .finally(() => setLoadingRecs(false));
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

    // Validations
    if (!profile.name?.trim()) {
      return toast.error('Full Name is required');
    }
    if (profile.name.trim().length < 2) {
      return toast.error('Full Name must be at least 2 characters');
    }

    if (!profile.department?.trim()) {
      return toast.error('Department is required');
    }
    if (profile.department.trim().length < 2) {
      return toast.error('Department must be at least 2 characters');
    }

    if (profile.cgpa === '' || profile.cgpa === null || profile.cgpa === undefined) {
      return toast.error('CGPA is required');
    }
    const cgpaNum = parseFloat(profile.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      return toast.error('CGPA must be a valid number between 0 and 10');
    }

    if (!profile.phone?.trim()) {
      return toast.error('Phone number is required');
    }
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    if (!phoneRegex.test(profile.phone) || profile.phone.replace(/[^0-9]/g, '').length < 10) {
      return toast.error('Please enter a valid phone number (min 10 digits)');
    }

    if (!profile.skills?.trim()) {
      return toast.error('At least one skill is required');
    }

    if (!profile.bio?.trim()) {
      return toast.error('Bio is required');
    }
    if (profile.bio.trim().length < 10) {
      return toast.error('Bio must be at least 10 characters');
    }
    if (profile.bio.trim().length > 500) {
      return toast.error('Bio must not exceed 500 characters');
    }

    setSaving(true);
    try {
      await authService.updateProfile({
        ...profile,
        name: profile.name.trim(),
        department: profile.department.trim(),
        phone: profile.phone.trim(),
        skills: profile.skills.trim(),
        bio: profile.bio.trim(),
      });
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
    <div className="phd-page">

      {/* ═══ HERO HEADER ═══ */}
      <div className="phd-hero">
        <div className="phd-hero-bg" />
        <div className="phd-hero-content">
          <div className="phd-hero-left">
            <div className="phd-hero-icon">
              <FaUserGraduate size={26} />
            </div>
            <div>
              <h1 className="phd-hero-title">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
              <div className="phd-hero-sub" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {user?.department && <span style={{ display: 'flex', alignItems: 'center' }}><FaGraduationCap style={{ marginRight: 6 }} />{user.department}</span>}
                {user?.cgpa && <span style={{ display: 'flex', alignItems: 'center' }}><FaStar style={{ marginRight: 4 }} />CGPA: {user.cgpa}</span>}
              </div>
            </div>
          </div>
          {/* Profile ring sits inside hero right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>Profile</div>
              <div style={{ fontSize: '0.75rem', color: profileCompletion < 100 ? '#fcd34d' : '#6ee7b7', fontWeight: 600 }}>
                {profileCompletion === 100 ? '✓ Complete' : `${missingFields.length} field${missingFields.length > 1 ? 's' : ''} missing`}
              </div>
            </div>
            <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
              <svg width="60" height="60" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="28" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
                <circle
                  cx="34" cy="34" r="28"
                  fill="none"
                  stroke={profileCompletion >= 80 ? '#6ee7b7' : profileCompletion >= 50 ? '#fcd34d' : '#fca5a5'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(profileCompletion / 100) * 175.9} 175.9`}
                  transform="rotate(-90 34 34)"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                {profileCompletion}%
              </span>
            </div>
            <div className="phd-hero-date">
              <FaCalendarAlt size={12} />
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="phd-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '24px' }}>
        {[
          { label: 'Applied', value: stats.total, icon: FaBriefcase, variant: 'blue' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: FaClock, variant: 'amber' },
          { label: 'Selected', value: stats.selected, icon: FaTrophy, variant: 'green' },
          { label: 'Saved Jobs', value: savedJobs.length, icon: FaBookmark, variant: 'violet' },
        ].map((s, i) => (
          <div key={i} className={`phd-stat-card phd-stat-${s.variant}`} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="phd-stat-icon-wrap"><s.icon size={20} /></div>
            <div className="phd-stat-content">
              <span className="phd-stat-number">{s.value}</span>
              <span className="phd-stat-text">{s.label}</span>
            </div>
            <div className="phd-stat-glow" />
          </div>
        ))}
      </div>

      {/* ═══ RECOMMENDED FOR YOU ═══ */}
      <div className="phd-card" style={{ marginTop: '24px' }}>
        <div className="phd-card-header">
          <div className="phd-card-icon" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff' }}><FaFire size={16} /></div>
          <div>
            <h3 className="phd-card-title">Recommended For You 🎯</h3>
            <p className="phd-card-sub">Jobs matched to your skills</p>
          </div>
          {recommendations.length > 0 && (
            <Link to="/jobs" className="phd-card-badge" style={{ textDecoration: 'none', marginLeft: 'auto' }}>See All <FaArrowRight size={10} style={{ marginLeft: 4 }} /></Link>
          )}
        </div>

        {loadingRecs ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            <span className="spinner-border spinner-border-sm me-2" />Finding matches…
          </div>
        ) : !user?.skills?.length ? (
          <div style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
            <FaCode style={{ marginRight: 6 }} />Add your skills in the profile form above to get personalised job recommendations!
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
            No matching jobs found right now. Check back later or <Link to="/jobs" style={{ color: '#6366f1', fontWeight: 600 }}>browse all jobs →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', padding: '0 24px 24px' }}>
            {recommendations.map((job, i) => (
              <div
                key={job._id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  animationDelay: `${i * 0.05}s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.3 }}>{job.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{job.companyName}</div>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: job.type === 'internship' ? '#ede9fe' : '#eff6ff',
                      color: job.type === 'internship' ? '#7c3aed' : '#2563eb',
                      borderRadius: 20,
                      padding: '2px 8px',
                    }}
                  >
                    {job.type === 'internship' ? '🎓 Intern' : '💼 Job'}
                  </span>
                </div>

                {/* Match score bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: 4 }}>
                    <span>Skill Match</span>
                    <span style={{ fontWeight: 700, color: job.matchScore >= 70 ? '#16a34a' : job.matchScore >= 40 ? '#d97706' : '#64748b' }}>{job.matchScore}%</span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${job.matchScore}%`,
                        background: job.matchScore >= 70
                          ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                          : job.matchScore >= 40
                            ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                            : 'linear-gradient(90deg,#94a3b8,#64748b)',
                        borderRadius: 999,
                        transition: 'width 0.8s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Matched skills chips */}
                {job.matchedSkills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {job.matchedSkills.slice(0, 3).map((sk, si) => (
                      <span key={si} style={{ fontSize: '0.68rem', padding: '2px 8px', background: '#dcfce7', color: '#15803d', borderRadius: 20, fontWeight: 600 }}>
                        ✓ {sk}
                      </span>
                    ))}
                    {job.matchedSkills.length > 3 && (
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: 20 }}>+{job.matchedSkills.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Meta row + Apply */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaMoneyBillWave size={10} /> {job.salary || 'Competitive'}
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#fff',
                      background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                      padding: '5px 14px',
                      borderRadius: 20,
                      textDecoration: 'none',
                    }}
                  >
                    View <FaArrowRight size={9} style={{ marginLeft: 3 }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="phd-content">

        {/* Top grid: Profile form (left) + Resume & Actions (right) */}
        <div className="phd-charts-grid" style={{ gridTemplateColumns: '1.3fr 0.7fr' }}>

          {/* Edit Profile */}
          <div className="phd-card">
            <div className="phd-card-header">
              <div className="phd-card-icon phd-card-icon-blue"><FaEdit size={16} /></div>
              <div>
                <h3 className="phd-card-title">Edit Profile</h3>
                <p className="phd-card-sub">Keep your information updated for recruiters</p>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="stu-form-group">
                <label className="stu-label">Full Name</label>
                <input className="stu-input" type="text" maxLength="50" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="stu-form-row">
                <div className="stu-form-group">
                  <label className="stu-label">Department</label>
                  <input className="stu-input" type="text" maxLength="50" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} placeholder="e.g. Computer Science" />
                </div>
                <div className="stu-form-group">
                  <label className="stu-label">CGPA</label>
                  <input className="stu-input" type="number" step="0.01" min="0" max="10" value={profile.cgpa} onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })} placeholder="e.g. 8.5" />
                </div>
              </div>
              <div className="stu-form-group">
                <label className="stu-label"><FaPhone size={10} style={{ marginRight: 4 }} />Phone</label>
                <input className="stu-input" type="tel" maxLength="15" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="stu-form-group">
                <label className="stu-label">Skills <span style={{ color: '#94a3b8', fontWeight: 400 }}>(comma-separated)</span></label>
                <input className="stu-input" type="text" value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} placeholder="React, Node.js, MongoDB…" />
                {profile.skills && (
                  <div className="stu-skills-tags">
                    {profile.skills.split(',').filter(Boolean).map((s, i) => <span key={i} className="stu-skill-tag">{s.trim()}</span>)}
                  </div>
                )}
              </div>
              <div className="stu-form-group">
                <label className="stu-label"><FaInfoCircle size={10} style={{ marginRight: 4 }} />Bio</label>
                <textarea className="stu-input stu-textarea" rows="3" maxLength="500" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell employers about yourself…" />
              </div>
              <button type="submit" className="stu-btn stu-btn-primary" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm" /> Saving…</> : <><FaCheckCircle size={13} /> Save Changes</>}
              </button>
            </form>
          </div>

          {/* Right: Resume + Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Resume */}
            <div className="phd-card">
              <div className="phd-card-header">
                <div className="phd-card-icon phd-card-icon-green"><FaFilePdf size={16} /></div>
                <div><h3 className="phd-card-title">Resume</h3><p className="phd-card-sub">PDF only · max 5MB</p></div>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                {resumes.length > 0 ? (
                  <div className="stu-resume-current" style={{ marginBottom: '12px' }}>
                    <div className="stu-resume-file-icon"><FaFilePdf size={20} /></div>
                    <div className="stu-resume-file-info">
                      <span className="stu-resume-file-name">{resumes.find(r => r.isActive)?.originalFileName || 'Resume'}</span>
                      <span className="stu-resume-file-status"><FaCheckCircle size={10} /> Active</span>
                    </div>
                    <button className="stu-resume-view-btn" onClick={() => {
                      const a = resumes.find(r => r.isActive);
                      if (a) { setSelectedResumeId(a._id); setPdfViewerOpen(true); }
                    }}>View <FaExternalLinkAlt size={10} /></button>
                  </div>
                ) : (
                  <div className="stu-resume-alert" style={{ marginBottom: '12px' }}>
                    <FaInfoCircle size={14} /><span>No resume uploaded yet.</span>
                  </div>
                )}

                {/* Dropzone */}
                <div
                  className={`stu-dropzone ${dragActive ? 'active' : ''} ${resumeFile ? 'has-file' : ''}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setResumeFile(e.target.files[0])} />
                  {resumeFile ? (
                    <div className="stu-dropzone-file">
                      <FaFilePdf size={20} className="text-danger" />
                      <span>{resumeFile.name}</span>
                      <button type="button" className="stu-dropzone-remove" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}><FaTimes size={12} /></button>
                    </div>
                  ) : (
                    <>
                      <FaCloudUploadAlt size={26} className="stu-dropzone-icon" />
                      <span className="stu-dropzone-text">Drag & drop or click</span>
                      <span className="stu-dropzone-hint">PDF only · max 5MB</span>
                    </>
                  )}
                </div>
                <button className="stu-btn stu-btn-green" onClick={handleResumeUpload} disabled={!resumeFile || uploading}>
                  {uploading ? <><span className="spinner-border spinner-border-sm" /> Uploading…</> : <><FaUpload size={13} /> Upload Resume</>}
                </button>

                {/* History */}
                {resumes.length > 1 && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>VERSION HISTORY</p>
                    {resumes.map(r => (
                      <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.78rem', color: '#475569' }}>{r.originalFileName}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="stu-view-all-btn" style={{ padding: '3px 8px', fontSize: '0.7rem' }} onClick={() => { setSelectedResumeId(r._id); setPdfViewerOpen(true); }}>View</button>
                          {!r.isActive && <button className="stu-view-all-btn" style={{ padding: '3px 8px', fontSize: '0.7rem', background: '#f0fdf4', color: '#16a34a' }} onClick={async () => { try { await authService.activateResume(r._id); const { data } = await authService.getResumeHistory(); setResumes(data); await refreshUser(); toast.success('Activated!'); } catch { toast.error('Failed'); } }}>Set Active</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="phd-card">
              <div className="phd-card-header">
                <div className="phd-card-icon phd-card-icon-indigo"><FaRocket size={16} /></div>
                <div><h3 className="phd-card-title">Quick Actions</h3></div>
              </div>
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/jobs" className="stu-action-link">
                  <div className="stu-action-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FaBriefcase size={16} /></div>
                  <div><span className="stu-action-label">Browse Jobs</span><span className="stu-action-desc">Find new opportunities</span></div>
                  <FaArrowRight size={12} className="stu-action-arrow" />
                </Link>
                <Link to="/applications" className="stu-action-link">
                  <div className="stu-action-icon" style={{ background: '#f5f3ff', color: '#6366f1' }}><FaFileAlt size={16} /></div>
                  <div><span className="stu-action-label">My Applications</span><span className="stu-action-desc">Track your progress</span></div>
                  <FaArrowRight size={12} className="stu-action-arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Recent Applications + Saved Jobs ── */}
        <div className="phd-charts-grid" style={{ marginTop: '24px' }}>

          {/* Recent Applications */}
          <div className="phd-card">
            <div className="phd-card-header">
              <div className="phd-card-icon phd-card-icon-indigo"><FaChartLine size={16} /></div>
              <div>
                <h3 className="phd-card-title">Recent Applications</h3>
                <p className="phd-card-sub">Your latest {Math.min(applications.length, 5)} applications</p>
              </div>
              {applications.length > 0 && (
                <Link to="/applications" className="phd-card-badge" style={{ textDecoration: 'none' }}>View All <FaArrowRight size={10} style={{ marginLeft: 4 }} /></Link>
              )}
            </div>
            {applications.length > 0 ? (
              <div className="phd-table-wrap">
                <table className="phd-table">
                  <thead><tr><th>#</th><th>Company</th><th>Role</th><th>Date</th><th className="phd-th-right">Status</th></tr></thead>
                  <tbody>
                    {applications.slice(0, 5).map((app, i) => (
                      <tr key={app._id} className="phd-tr" style={{ animationDelay: `${i * 0.03}s` }}>
                        <td className="phd-td-rank"><span className="phd-rank-num">{i + 1}</span></td>
                        <td>
                          <div className="phd-company-cell">
                            <div className="phd-company-dot" style={{ background: `hsl(${(app.job?.companyName?.charCodeAt(0) || 65) * 9 % 360},55%,92%)`, color: `hsl(${(app.job?.companyName?.charCodeAt(0) || 65) * 9 % 360},55%,35%)` }}>{app.job?.companyName?.[0]?.toUpperCase() || 'C'}</div>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{app.job?.companyName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="phd-position-cell">
                            <span className="phd-position-title">{app.job?.title}</span>
                            <span className={`phd-type-badge ${app.job?.type === 'internship' ? 'intern' : 'ft'}`}>{app.job?.type === 'internship' ? '🎓 Internship' : '💼 Full-time'}</span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{formatDate(app.createdAt)}</td>
                        <td className="phd-td-right"><StatusBadge status={app.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                No applications yet. <Link to="/jobs" style={{ color: '#6366f1', fontWeight: 600 }}>Browse jobs →</Link>
              </div>
            )}
          </div>

          {/* Saved Jobs */}
          <div className="phd-card">
            <div className="phd-card-header">
              <div className="phd-card-icon phd-card-icon-purple"><FaBookmark size={16} /></div>
              <div>
                <h3 className="phd-card-title">Saved Jobs</h3>
                <p className="phd-card-sub">Jobs you've bookmarked</p>
              </div>
              {savedJobs.length > 0 && (
                <Link to="/jobs" className="phd-card-badge" style={{ textDecoration: 'none' }}>Browse More <FaArrowRight size={10} style={{ marginLeft: 4 }} /></Link>
              )}
            </div>
            {savedJobs.length > 0 ? (
              <div className="phd-table-wrap">
                <table className="phd-table">
                  <thead><tr><th>Company</th><th>Role</th><th className="phd-th-right">Remove</th></tr></thead>
                  <tbody>
                    {savedJobs.slice(0, 5).map((job, i) => (
                      <tr key={job._id} className="phd-tr" style={{ animationDelay: `${i * 0.03}s` }}>
                        <td>
                          <div className="phd-company-cell">
                            <div className="phd-company-dot" style={{ background: `hsl(${(job.companyName?.charCodeAt(0) || 65) * 9 % 360},55%,92%)`, color: `hsl(${(job.companyName?.charCodeAt(0) || 65) * 9 % 360},55%,35%)` }}>{job.companyName?.[0]?.toUpperCase() || 'C'}</div>
                            <Link to={`/jobs/${job._id}`} style={{ fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>{job.companyName}</Link>
                          </div>
                        </td>
                        <td>
                          <div className="phd-position-cell">
                            <Link to={`/jobs/${job._id}`} className="phd-position-title" style={{ textDecoration: 'none' }}>{job.title}</Link>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><FaMoneyBillWave size={10} />{job.salary || 'Competitive'}</span>
                          </div>
                        </td>
                        <td className="phd-td-right">
                          <button
                            className="stu-dropzone-remove"
                            onClick={() => handleRemoveBookmark(job._id)}
                            disabled={removingBookmark === job._id}
                            title="Remove bookmark"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {removingBookmark === job._id ? <span className="spinner-border spinner-border-sm" /> : <FaTrashAlt size={12} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                No saved jobs yet. <Link to="/jobs" style={{ color: '#6366f1', fontWeight: 600 }}>Find one →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

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


