import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authUtils } from './authUtils';

interface User {
  id: number;
  email: string;
  nickname: string;
  mannerScore: number;
  location: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string, location: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기화: localStorage에서 토큰 로드
  useEffect(() => {
    const storedToken = authUtils.getToken();
    if (storedToken && authUtils.isTokenValid()) {
      const currentUser = authUtils.getCurrentUser();
      if (currentUser) {
        setToken(storedToken);
        setUser(currentUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = authUtils.login(email, password);
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, nickname: string, location: string = '강남구') => {
    setIsLoading(true);
    try {
      const newUser = authUtils.register(email, password, nickname, location);
      // 회원가입 후 자동으로 로그인
      const loginResult = authUtils.login(email, password);
      setToken(loginResult.token);
      setUser(loginResult.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authUtils.logout();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('사용자 정보가 없습니다');
    setIsLoading(true);
    try {
      const updatedUser = authUtils.updateProfile(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
