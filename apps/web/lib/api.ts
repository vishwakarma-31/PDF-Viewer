import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

class ApiService {
  private axiosInstance: AxiosInstance;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
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
      (response: AxiosResponse) => {
        // Reset retry count on success
        this.retryCount = 0;
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Handle authentication errors
        if (error.response?.status === 401) {
          // Clear auth token and redirect to login
          localStorage.removeItem('authToken');
          toast.error('Session expired. Please log in again.');
          // You might want to redirect to login page here
          // window.location.href = '/login';
          return Promise.reject(error);
        }

        // Handle network errors with retry
        if (!error.response && this.retryCount < this.maxRetries) {
          this.retryCount++;
          const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff

          await new Promise(resolve => setTimeout(resolve, delay));

          toast.info(`Retrying request... (${this.retryCount}/${this.maxRetries})`);
          return this.axiosInstance(originalRequest);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            const delay = parseInt(retryAfter) * 1000;
            toast.info(`Rate limited. Retrying in ${retryAfter} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.axiosInstance(originalRequest);
          }
        }

        // Reset retry count
        this.retryCount = 0;

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      // Error is already handled by interceptor, just re-throw
      throw error;
    }
  }

  // Invoice methods
  async getInvoices(params?: { q?: string }) {
    return this.request({ method: 'GET', url: '/invoices', params });
  }

  async getInvoice(id: string) {
    return this.request({ method: 'GET', url: `/invoices/${id}` });
  }

  async createInvoice(data: any) {
    return this.request({ method: 'POST', url: '/invoices', data });
  }

  async updateInvoice(id: string, data: any) {
    return this.request({ method: 'PUT', url: `/invoices/${id}`, data });
  }

  async deleteInvoice(id: string) {
    return this.request({ method: 'DELETE', url: `/invoices/${id}` });
  }

  // Upload methods
  async uploadFile(formData: FormData) {
    return this.request({
      method: 'POST',
      url: '/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Extract methods
  async extractInvoice(data: any) {
    return this.request({ method: 'POST', url: '/extract', data });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;