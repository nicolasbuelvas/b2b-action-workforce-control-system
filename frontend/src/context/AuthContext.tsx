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
  showSessionExpiredMessage: boolean;
  setShowSessionExpiredMessage: (show: boolean) => void;
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

function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return false;
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= decoded.exp * 1000;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSessionExpiredMessage, setShowSessionExpiredMessage] = useState(false);

  // Check token validity and set up periodic validation
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Check if token is already expired
        if (isTokenExpired(token)) {
          localStorage.clear();
          setUser(null);
          setShowSessionExpiredMessage(true);
          setTimeout(() => setShowSessionExpiredMessage(false), 5000);
          window.location.replace('/login');
          return;
        }
        
        const userData = buildUserFromToken(token);
        setUser(userData);
      } catch {
        localStorage.clear();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Check token expiration periodically (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiration = () => {
      const token = localStorage.getItem('accessToken');
      if (!token || isTokenExpired(token)) {
        localStorage.clear();
        setUser(null);
        setShowSessionExpiredMessage(true);
        setTimeout(() => setShowSessionExpiredMessage(false), 5000);
        window.location.replace('/login');
      }
    };

    const interval = setInterval(checkTokenExpiration, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user, 
      login, 
      logout,
      showSessionExpiredMessage,
      setShowSessionExpiredMessage
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}