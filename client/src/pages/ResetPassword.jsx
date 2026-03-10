// Reset Password page — Reset password with token
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import authService from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (pwd) => {
    const errors = {};
    if (!pwd) {
      errors.password = 'Password is required';
    } else if (pwd.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validation
    const errors = validatePassword(form.password);
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, {
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      {/* Left Brand Panel */}
      <div className="reset-password-brand">
        <div className="reset-password-brand-bg">
          <div className="reset-password-brand-circle reset-password-brand-circle-1" />
          <div className="reset-password-brand-circle reset-password-brand-circle-2" />
          <div className="reset-password-brand-circle reset-password-brand-circle-3" />
        </div>

        <div className="reset-password-brand-content">
          <Link to="/" className="reset-password-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          <div className="reset-password-brand-hero">
            <h1>Create a Strong Password</h1>
            <p>
              Use a combination of letters, numbers, and symbols to create
              a secure password that protects your account.
            </p>
          </div>

          <div className="reset-password-tips">
            <h3>Password Tips:</h3>
            <ul>
              <li>At least 6 characters long</li>
              <li>Mix of uppercase and lowercase letters</li>
              <li>Include numbers and special characters</li>
              <li>Don't use easily guessable information</li>
              <li>Don't reuse old passwords</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="reset-password-form-panel">
        <div className="reset-password-form-container">
          {/* Mobile Logo */}
          <Link to="/" className="reset-password-mobile-logo">
            <img src="/logo.png" alt="PlacementPortal" />
            <span>Placement<strong>Portal</strong></span>
          </Link>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="reset-password-header">
                <h2>Reset Your Password</h2>
                <p>Enter a new password for your account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="reset-password-error">
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="reset-password-form">
                {/* Password Field */}
                <div className="reset-password-form-group">
                  <label htmlFor="password">New Password</label>
                  <div className="reset-password-input-wrapper">
                    <FaLock className="reset-password-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder="Enter new password"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading || submitted}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="reset-password-toggle"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <small className="reset-password-error-small">
                      {validationErrors.password}
                    </small>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="reset-password-form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="reset-password-input-wrapper">
                    <FaLock className="reset-password-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={loading || submitted}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="reset-password-toggle"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <small className="reset-password-error-small">
                      {validationErrors.confirmPassword}
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || submitted}
                  className="reset-password-btn reset-password-btn-primary"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>

              {/* Back to Login */}
              <div className="reset-password-footer">
                <Link to="/login" className="reset-password-link">
                  <FaArrowLeft /> Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="reset-password-success">
                <div className="reset-password-success-icon">
                  <FaCheckCircle />
                </div>
                <h2>Password Reset Successfully!</h2>
                <p>
                  Your password has been reset. You can now login with your new password.
                </p>
                <p className="reset-password-success-note">
                  Redirecting to login page...
                </p>

                <div className="reset-password-success-actions">
                  <Link to="/login" className="reset-password-btn reset-password-btn-primary">
                    Go to Login
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

export default ResetPassword;
