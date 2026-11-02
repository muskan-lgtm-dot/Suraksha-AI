import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EmergencyIncident } from '../types';
import { api, getToken, setToken, removeToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  activeIncident: EmergencyIncident | null;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'user' | 'admin') => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshActiveIncident: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);

  const refreshUser = async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (err) {
      removeToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveIncident = async () => {
    if (!getToken()) {
      setActiveIncident(null);
      return;
    }
    try {
      const inc = await api.getActiveIncident();
      setActiveIncident(inc);
    } catch {
      setActiveIncident(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      refreshActiveIncident();
      // Poll active emergency every 10 seconds for real-time acknowledgment & status
      const interval = setInterval(refreshActiveIncident, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.access_token);
    setTokenState(res.access_token);
    setUser(res.user);
    refreshActiveIncident();
  };

  const demoLogin = async (role: 'user' | 'admin') => {
    // Ensure demo seed is run
    try {
      await api.seedDemo();
    } catch (e) {
      // Ignore if already seeded
    }

    if (role === 'admin') {
      await login('admin@suraksha.ai', 'AdminSafe#2026');
    } else {
      await login('demo@suraksha.ai', 'DemoSafe#2026');
    }
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setToken(res.access_token);
    setTokenState(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    api.logout();
    removeToken();
    setTokenState(null);
    setUser(null);
    setActiveIncident(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeIncident,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
        refreshActiveIncident
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
