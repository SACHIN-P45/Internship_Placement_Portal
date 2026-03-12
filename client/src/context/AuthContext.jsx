// AuthContext — global authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Set user immediately from cache so UI renders fast
      setUser(parsed);
      // Fetch fresh profile from server — keep loading=true until resolved
      authService
        .getMe()
        .then((res) => {
          setUser({ ...res.data, token: parsed.token });
        })
        .catch(() => {
          // Token is invalid or expired — clear session
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => {
          // Only mark loading done AFTER the async check completes
          setLoading(false);
        });
    } else {
      // No stored user — immediately done loading
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    
    // Fetch complete user profile from server
    try {
      const { data: completeData } = await authService.getMe();
      const updated = { ...completeData, token: data.token };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      // If getMe fails, user is still logged in with basic data
      console.error('Failed to fetch complete profile:', err);
    }
    
    return data;
  };

  // Register
  const register = async (userData) => {
    const { data } = await authService.register(userData);
    // Companies must wait for approval — don't auto-login
    if (data.role !== 'company') {
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    }
    return data;
  };

  // Set user from OAuth callback
  const setUserFromOAuth = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Refresh user profile
  const refreshUser = async () => {
    try {
      const { data } = await authService.getMe();
      const stored = JSON.parse(localStorage.getItem('user'));
      const updated = { ...data, token: stored.token };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, setUserFromOAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
