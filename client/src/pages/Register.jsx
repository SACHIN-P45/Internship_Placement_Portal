// Register page — Modern professional design with seamless flow
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaUserGraduate,
  FaBuilding,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaLock,
  FaGlobe,
  FaAlignLeft,
  FaEye,
  FaEyeSlash,
  FaBriefcase,
  FaGithub,
  FaUsers,
  FaAward,
  FaCheck,
} from 'react-icons/fa';

const Register = () => {
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    website: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /* Password strength */
  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength] || '';
  const strengthColor = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'][strength] || '';

  useEffect(() => { setStep(1); setError(''); }, [role]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.email.trim();
    if (step === 2 && role === 'company') return form.companyName.trim();
    return true;
  };

  const totalSteps = role === 'company' ? 3 : 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      await register({ ...form, role });
      if (role === 'company') {
        setSuccess('Company registered! Please wait for admin approval before logging in.');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: FaUsers, value: '5,000+', label: 'Active Users' },
    { icon: FaBriefcase, value: '500+', label: 'Companies' },
    { icon: FaAward, value: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="register-page">
      {/* Left Brand Panel */}
      <div className="register-brand">
        <div className="register-brand-bg">
          <div className="register-brand-circle register-brand-circle-1"></div>
          <div className="register-brand-circle register-brand-circle-2"></div>
          <div className="register-brand-circle register-brand-circle-3"></div>
        </div>

        <div className="register-brand-content">
          <Link to="/" className="register-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          <div className="register-brand-hero">
            <h1>
              {role === 'student'
                ? 'Start Your Career Journey Today'
                : 'Find the Best Talent for Your Team'}
            </h1>
            <p>
              {role === 'student'
                ? 'Connect with top companies and land your dream internship or job placement.'
                : 'Access a pool of talented students and streamline your campus recruitment.'}
            </p>
          </div>

          <div className="register-stats">
            {stats.map((stat, i) => (
              <div key={i} className="register-stat">
                <stat.icon className="register-stat-icon" />
                <div className="register-stat-value">{stat.value}</div>
                <div className="register-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="register-brand-features">
            <div className="register-brand-feature">
              <FaCheck />
              <span>Free registration for students</span>
            </div>
            <div className="register-brand-feature">
              <FaCheck />
              <span>Verified company profiles</span>
            </div>
            <div className="register-brand-feature">
              <FaCheck />
              <span>Real-time application tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="register-form-panel">
        <div className="register-form-container">
          {/* Mobile Logo */}
          <Link to="/" className="register-mobile-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          <div className="register-header">
            <h2>Create your account</h2>
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>

          {/* OAuth Section — only for students */}
          {role === 'student' && (
            <>
              <div className="register-oauth">
                <a href="http://localhost:5000/api/auth/google" className="register-oauth-btn register-oauth-google">
                  <svg viewBox="0 0 24 24" className="register-oauth-icon">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </a>
                <a href="http://localhost:5000/api/auth/github" className="register-oauth-btn register-oauth-github">
                  <FaGithub className="register-oauth-icon" />
                  <span>Continue with GitHub</span>
                </a>
              </div>

              <div className="register-divider">
                <span>or register with email</span>
              </div>
            </>
          )}

          {/* Company email-only notice */}
          {role === 'company' && (
            <div className="register-company-notice">
              <FaEnvelope className="register-company-notice-icon" />
              <div>
                <strong>Email Registration Only</strong>
                <p>Company accounts must be registered with a verified email address. Social login is not available for companies.</p>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="register-role-select">
            <button
              type="button"
              className={`register-role-card ${role === 'student' ? 'active' : ''}`}
              onClick={() => setRole('student')}
            >
              <div className="register-role-icon">
                <FaUserGraduate />
              </div>
              <div className="register-role-info">
                <span className="register-role-title">Student</span>
                <span className="register-role-desc">Find opportunities</span>
              </div>
              {role === 'student' && <FaCheckCircle className="register-role-check" />}
            </button>
            <button
              type="button"
              className={`register-role-card ${role === 'company' ? 'active' : ''}`}
              onClick={() => setRole('company')}
            >
              <div className="register-role-icon">
                <FaBuilding />
              </div>
              <div className="register-role-info">
                <span className="register-role-title">Company</span>
                <span className="register-role-desc">Hire talent</span>
              </div>
              {role === 'company' && <FaCheckCircle className="register-role-check" />}
            </button>
          </div>

          {/* Step Progress */}
          <div className="register-progress">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className="register-progress-step">
                <div className={`register-progress-dot ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
                  {step > i + 1 ? <FaCheck /> : i + 1}
                </div>
                <span className={`register-progress-label ${step >= i + 1 ? 'active' : ''}`}>
                  {role === 'company' ? ['Personal', 'Company', 'Security'][i] : ['Personal', 'Security'][i]}
                </span>
                {i < totalSteps - 1 && (
                  <div className={`register-progress-line ${step > i + 1 ? 'completed' : ''}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="register-alert register-alert-error">
              <span>{error}</span>
              <button onClick={() => setError('')}>&times;</button>
            </div>
          )}
          {success && (
            <div className="register-alert register-alert-success">
              <FaCheckCircle />
              <span>{success}</span>
            </div>
          )}

          {/* Form Steps */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="register-step">
                <div className="register-field">
                  <label>
                    <FaUser />
                    {role === 'company' ? 'Contact Person' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder={role === 'company' ? 'John Doe' : 'Enter your full name'}
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="register-field">
                  <label>
                    <FaEnvelope />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="register-btn-primary"
                  disabled={!canNext()}
                  onClick={() => setStep(2)}
                >
                  Continue
                  <FaArrowRight />
                </button>
              </div>
            )}

            {/* Step 2 (Company): Company Info */}
            {step === 2 && role === 'company' && (
              <div className="register-step">
                <div className="register-field">
                  <label>
                    <FaBuilding />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Your company name"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="register-field">
                  <label>
                    <FaGlobe />
                    Website <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://yourcompany.com"
                    value={form.website}
                    onChange={handleChange}
                  />
                </div>
                <div className="register-field">
                  <label>
                    <FaAlignLeft />
                    Description <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Brief description about your company"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="register-btn-group">
                  <button type="button" className="register-btn-secondary" onClick={() => setStep(1)}>
                    <FaArrowLeft />
                    Back
                  </button>
                  <button
                    type="button"
                    className="register-btn-primary"
                    disabled={!canNext()}
                    onClick={() => setStep(3)}
                  >
                    Continue
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* Last Step: Password */}
            {step === totalSteps && !(step === 2 && role === 'company') && (
              <div className="register-step">
                <div className="register-field">
                  <label>
                    <FaLock />
                    Password
                  </label>
                  <div className="register-input-wrapper">
                    <input
                      type={showPw ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="register-eye-toggle"
                      onClick={() => setShowPw(!showPw)}
                      tabIndex={-1}
                    >
                      {showPw ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="register-strength">
                      <div className="register-strength-bar">
                        <div
                          className="register-strength-fill"
                          style={{ width: `${(strength / 5) * 100}%`, background: strengthColor }}
                        />
                      </div>
                      <span style={{ color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>
                <div className="register-field">
                  <label>
                    <FaLock />
                    Confirm Password
                  </label>
                  <div className="register-input-wrapper">
                    <input
                      type={showCpw ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="register-eye-toggle"
                      onClick={() => setShowCpw(!showCpw)}
                      tabIndex={-1}
                    >
                      {showCpw ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <span className="register-field-error">Passwords don't match</span>
                  )}
                  {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length > 0 && (
                    <span className="register-field-success">
                      <FaCheckCircle /> Passwords match
                    </span>
                  )}
                </div>

                <p className="register-terms">
                  By creating an account, you agree to our{' '}
                  <a href="#">Terms of Service</a> and{' '}
                  <a href="#">Privacy Policy</a>
                </p>

                <div className="register-btn-group">
                  <button type="button" className="register-btn-secondary" onClick={() => setStep(step - 1)}>
                    <FaArrowLeft />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="register-btn-primary"
                    disabled={loading || form.password !== form.confirmPassword}
                  >
                    {loading ? (
                      <>
                        <span className="register-spinner"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Account
                        <FaArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
