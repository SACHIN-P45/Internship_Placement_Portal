// Forgot Password page — Request password reset
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      const response = await authService.forgotPassword({ email });
      if (response.data && response.data.debugLink) {
        setResetLink(response.data.debugLink);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Left Brand Panel */}
      <div className="forgot-password-brand">
        <div className="forgot-password-brand-bg">
          <div className="forgot-password-brand-circle forgot-password-brand-circle-1" />
          <div className="forgot-password-brand-circle forgot-password-brand-circle-2" />
          <div className="forgot-password-brand-circle forgot-password-brand-circle-3" />
        </div>

        <div className="forgot-password-brand-content">
          <Link to="/" className="forgot-password-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          <div className="forgot-password-brand-hero">
            <h1>Reset Your Password</h1>
            <p>
              No worries! It happens to the best of us. Enter your email address
              and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="forgot-password-info">
            <div className="forgot-password-info-item">
              <FaCheckCircle className="forgot-password-info-icon" />
              <span>Secure email verification</span>
            </div>
            <div className="forgot-password-info-item">
              <FaCheckCircle className="forgot-password-info-icon" />
              <span>Link expires in 1 hour</span>
            </div>
            <div className="forgot-password-info-item">
              <FaCheckCircle className="forgot-password-info-icon" />
              <span>Quick and easy reset process</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="forgot-password-form-panel">
        <div className="forgot-password-form-container">
          {/* Mobile Logo */}
          <Link to="/" className="forgot-password-mobile-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="forgot-password-header">
                <h2>Forgot Your Password?</h2>
                <p>
                  Enter the email address associated with your account and we'll
                  send you a link to reset your password.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="forgot-password-error">
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="forgot-password-form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="forgot-password-input-wrapper">
                    <FaEnvelope className="forgot-password-input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <small>We'll never share your email with anyone else.</small>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="forgot-password-btn forgot-password-btn-primary"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Back to Login */}
              <div className="forgot-password-footer">
                <Link to="/login" className="forgot-password-link">
                  <FaArrowLeft /> Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="forgot-password-success">
                <div className="forgot-password-success-icon">
                  <FaCheckCircle />
                </div>
                <h2>Check Your Email!</h2>
                <p>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="forgot-password-success-note">
                  The link will expire in 1 hour. If you don't see it in your inbox,
                  please check your spam folder.
                </p>

                {resetLink && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'left' }}>
                    <p style={{ color: '#1e40af', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                      ⚠️ Render Free Tier Detected
                    </p>
                    <p style={{ color: '#1e3a8a', margin: '0 0 12px 0', fontSize: '13px' }}>
                      Outbound emails are blocked on the free hosting plan. For testing purposes, please use this direct reset link:
                    </p>
                    <a href={resetLink} style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'underline', wordBreak: 'break-all', fontSize: '14px' }}>
                      {resetLink}
                    </a>
                  </div>
                )}

                <div className="forgot-password-success-actions">
                  <button
                    onClick={() => {
                      setEmail('');
                      setSubmitted(false);
                      setResetLink('');
                    }}
                    className="forgot-password-btn forgot-password-btn-secondary"
                  >
                    Try Another Email
                  </button>
                  <Link to="/login" className="forgot-password-btn forgot-password-btn-tertiary">
                    Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
