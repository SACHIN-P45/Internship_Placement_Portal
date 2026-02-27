// Login page — Modern professional design matching Register page
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaRocket,
  FaBolt,
  FaGithub,
  FaCheckCircle,
  FaUserGraduate,
  FaBuilding,
  FaBriefcase,
} from 'react-icons/fa';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for OAuth error in query params
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'oauth_failed') {
      setError('OAuth authentication failed. Please try again or use email login.');
    } else if (oauthError === 'blocked') {
      setError('Your account has been blocked. Please contact support.');
    }
  }, [searchParams]);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberMe');
    if (savedCredentials) {
      const { email, password } = JSON.parse(savedCredentials);
      setForm({ email, password });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form);

      // Save credentials if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({
          email: form.email,
          password: form.password,
        }));
      } else {
        // Clear saved credentials if "Remember me" is unchecked
        localStorage.removeItem('rememberMe');
      }

      if (data.role === 'admin') navigate('/admin/dashboard');
      else if (data.role === 'company') navigate('/company/dashboard');
      else if (data.role === 'placementHead') navigate('/placement-head/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Brand Panel */}
      <div className="login-brand">
        <div className="login-brand-bg">
          <div className="login-brand-circle login-brand-circle-1" />
          <div className="login-brand-circle login-brand-circle-2" />
          <div className="login-brand-circle login-brand-circle-3" />
        </div>

        <div className="login-brand-content">
          <Link to="/" className="login-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          <div className="login-brand-hero">
            <h1>Welcome Back!</h1>
            <p>
              Sign in to access your personalized dashboard and continue
              your journey towards the perfect opportunity.
            </p>
          </div>

          {/* Stats */}
          <div className="login-stats">
            <div className="login-stat">
              <div className="login-stat-icon"><FaBriefcase /></div>
              <div className="login-stat-value">1,200+</div>
              <div className="login-stat-label">Open Positions</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-icon"><FaUserGraduate /></div>
              <div className="login-stat-value">5,000+</div>
              <div className="login-stat-label">Students</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-icon"><FaBuilding /></div>
              <div className="login-stat-value">200+</div>
              <div className="login-stat-label">Companies</div>
            </div>
          </div>

          {/* Features */}
          <div className="login-brand-features">
            <div className="login-brand-feature">
              <FaCheckCircle />
              <span>Quick access to your personalized dashboard</span>
            </div>
            <div className="login-brand-feature">
              <FaCheckCircle />
              <span>Track all your applications in real-time</span>
            </div>
            <div className="login-brand-feature">
              <FaCheckCircle />
              <span>AI-powered job recommendations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Mobile Logo */}
          <Link to="/" className="login-mobile-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          {/* Header */}
          <div className="login-header">
            <h2>Sign In</h2>
            <p>
              New to PlacementPortal?{' '}
              <Link to="/register">Create an account</Link>
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="login-oauth">
            <a
              href="http://localhost:5000/api/auth/google"
              className="login-oauth-btn login-oauth-google"
            >
              <svg className="login-oauth-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </a>

            <a
              href="http://localhost:5000/api/auth/github"
              className="login-oauth-btn login-oauth-github"
            >
              <FaGithub className="login-oauth-icon" />
              <span>Continue with GitHub</span>
            </a>
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span>or sign in with email</span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="login-alert login-alert-error">
              <span>{error}</span>
              <button onClick={() => setError('')}>&times;</button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
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
                autoFocus
              />
            </div>

            <div className="login-field">
              <label>
                <FaLock />
                Password
              </label>
              <div className="login-input-wrapper">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="login-eye-toggle"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="login-forgot">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-btn-primary"
              disabled={loading || !form.email || !form.password}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="login-security">
            <FaShieldAlt />
            <span>Your connection is secure and encrypted</span>
          </div>

          {/* Role Cards */}
          <div className="login-roles">
            <div className="login-role-card">
              <div className="login-role-icon student">
                <FaUserGraduate />
              </div>
              <div className="login-role-info">
                <span className="login-role-title">Students</span>
                <span className="login-role-desc">Track applications & get placed</span>
              </div>
            </div>
            <div className="login-role-card">
              <div className="login-role-icon company">
                <FaBuilding />
              </div>
              <div className="login-role-info">
                <span className="login-role-title">Companies</span>
                <span className="login-role-desc">Post jobs & hire talent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
