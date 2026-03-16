// OAuth Callback page — handles OAuth redirect with token
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromOAuth } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(
        errorParam === 'blocked'
          ? 'Your account has been blocked'
          : 'OAuth authentication failed. Please try again.'
      );
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // ✅ FIX: Read auth data from the secure one-time handoff cookie, NOT from the URL.
    // The old approach (URL query param) exposed the JWT in browser history & server logs.
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const cookieData = getCookie('oauth_handoff');

    if (cookieData) {
      // Immediately clear the cookie so it cannot be replayed
      document.cookie = 'oauth_handoff=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      try {
        const userData = JSON.parse(atob(cookieData));
        setUserFromOAuth(userData);
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'company') {
          navigate('/company/dashboard');
        } else if (userData.role === 'placementHead') {
          navigate('/placement-head/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } catch (err) {
        setError('Failed to process authentication data');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      setError('No authentication data received');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate, setUserFromOAuth]);

  return (
    <div className="oauth-callback-page">
      <div className="oauth-callback-card">
        {error ? (
          <>
            <div className="oauth-error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2>Authentication Failed</h2>
            <p>{error}</p>
            <p className="redirect-text">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="oauth-loading-spinner"></div>
            <h2>Signing you in...</h2>
            <p>Please wait while we complete your authentication.</p>
          </>
        )}
      </div>

      <style>{`
        .oauth-callback-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #3b82f6 70%, #06b6d4 100%);
          padding: 1rem;
        }
        .oauth-callback-card {
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .oauth-loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .oauth-error-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1.5rem;
          color: #ef4444;
        }
        .oauth-callback-card h2 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        .oauth-callback-card p {
          color: #6b7280;
          margin: 0;
        }
        .redirect-text {
          margin-top: 1rem !important;
          font-size: 0.875rem;
          color: #9ca3af !important;
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
