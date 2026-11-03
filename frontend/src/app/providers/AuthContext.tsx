import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company, Role } from '@/types';
import { authService } from '@/services/apiServices';
import { getStoredRefreshToken, setAuthTokens } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  registerCandidate: (data: any) => Promise<void>;
  registerRecruiter: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    const storedRefresh = getStoredRefreshToken();
    if (!storedRefresh) {
      setIsLoading(false);
      return;
    }

    try {
      // Restore user details
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (e) {
      setAuthTokens(null, null);
      setUser(null);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      if (data.company) setCompany(data.company);
    } finally {
      setIsLoading(false);
    }
  };

  const registerCandidate = async (data: any) => {
    setIsLoading(true);
    try {
      const resp = await authService.registerCandidate(data);
      setUser(resp.user);
    } finally {
      setIsLoading(false);
    }
  };

  const registerRecruiter = async (data: any) => {
    setIsLoading(true);
    try {
      const resp = await authService.registerRecruiter(data);
      setUser(resp.user);
      if (resp.company) setCompany(resp.company);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setCompany(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const u = await authService.getMe();
      setUser(u);
    } catch (e) {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerCandidate,
        registerRecruiter,
        logout,
        refreshUser,
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
