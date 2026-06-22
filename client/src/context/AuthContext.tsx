import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../utils/auth';
import type { User } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (auth.isAuthenticated()) {
          const currentUser = await auth.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await auth.login({ email, password });
    setUser(userData);
    navigate('/dashboard');
    return userData;
  };

  const register = async (data: any) => {
    const userData = await auth.register(data);
    setUser(userData);
    navigate('/dashboard');
    return userData;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    auth.setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: !!user && auth.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
