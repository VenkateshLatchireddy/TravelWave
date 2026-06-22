import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T = any> {
  trips: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = originalRequest?.url?.includes('/api/auth/refresh-token');
        
        // Handle token refresh for protected endpoints only
        // Do NOT attempt refresh for public auth endpoints (login/register/forgot/reset/verify)
        const requestUrl: string = originalRequest?.url || '';
        const isAuthEndpoint = /\/api\/auth\/(login|register|forgot-password|reset-password|verify-email)/.test(requestUrl);

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest && !isAuthEndpoint) {
          if (this.isRefreshing) {
            // Wait for refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(`${this.axiosInstance.defaults.baseURL}/api/auth/refresh-token`, {
              refreshToken,
            }, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            this.isRefreshing = false;
            
            // Update all subscribers
            this.refreshSubscribers.forEach((callback) => callback(accessToken));
            this.refreshSubscribers = [];

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            toast.error('Session expired. Please login again.');
            
            // Redirect to login
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response) {
          const message = error.response.data?.error?.message || error.message || 'An error occurred';
          // Avoid duplicate toasts for auth endpoints — let auth service/pages handle those
          if (!isAuthEndpoint) {
            toast.error(message);
          }
        } else if (error.request) {
          if (!isAuthEndpoint) {
            toast.error('Network error. Please check your connection.');
          }
        } else {
          if (!isAuthEndpoint) {
            toast.error('An unexpected error occurred.');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
}

export const api = ApiClient.getInstance();

// Helper hooks for components
export const useApi = () => {
  return {
    get: api.get.bind(api),
    post: api.post.bind(api),
    put: api.put.bind(api),
    delete: api.delete.bind(api),
    patch: api.patch.bind(api),
  };
};
