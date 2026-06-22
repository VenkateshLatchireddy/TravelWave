import { api } from './api';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        this.setTokens(tokens);
        this.setUser(user);
        toast.success(response.message || 'Login successful!');
        return user;
      }
      
      throw new Error(response.error?.message || 'Login failed');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  }

  public async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await api.post('/api/auth/register', credentials);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        this.setTokens(tokens);
        this.setUser(user);
        toast.success(response.message || 'Registration successful!');
        return user;
      }
      
      throw new Error(response.error?.message || 'Registration failed');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  }

  public logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  }

  public getTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    
    return null;
  }

  public setTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  public getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  public setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens;
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/api/auth/me');
      if (response.success && response.data) {
        this.setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async verifyEmail(token: string): Promise<boolean> {
    try {
      const response = await api.get(`/api/auth/verify-email/${token}`);
      if (response.success) {
        toast.success('Email verified successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Email verification failed';
      toast.error(message);
      return false;
    }
  }
  
}

export const auth = AuthService.getInstance();