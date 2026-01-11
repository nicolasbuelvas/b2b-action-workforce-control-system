import { createContext, useContext, useEffect, useState } from 'react';
import { loginApi } from '../api/auth.api';
import type { UserRole } from '../types/roles';

interface User {
  id: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(window.atob(payload));
  } catch {
    return null;
  }
}

function buildUserFromToken(token: string): User {
  const decoded = decodeJwt(token);
  if (!decoded?.sub || !decoded?.roles || !Array.isArray(decoded.roles)) {
    throw new Error('Invalid token payload');
  }
  return {
    id: decoded.sub,
    role: decoded.roles[0] as UserRole,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const userData = buildUserFromToken(token);
        setUser(userData);
      } catch {
        localStorage.clear();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const userData = buildUserFromToken(data.accessToken);
      setUser(userData);
      return userData.role;
    } catch (err) {
      localStorage.clear();
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}