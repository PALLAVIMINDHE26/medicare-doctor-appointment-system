import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../api/authService';
import { getErrorMessage } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // role-specific profile (Doctor/Patient doc)
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user: freshUser, profile: freshProfile } = await authService.getMe();
      setUser(freshUser);
      setProfile(freshProfile);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    await loadUserFromStorage();
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const { user: freshUser, profile: freshProfile } = await authService.getMe();
      setUser(freshUser);
      setProfile(freshProfile);
    } catch (err) {
      // silent — caller can still function with stale data
      console.error(getErrorMessage(err));
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    role: user?.role,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
