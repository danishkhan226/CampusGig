import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Bearer token fallback for reliable cross-domain requests
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('campusgig_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Storage access might be restricted in some sandboxed iframes
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('campusgig_token');
      } catch (e) {}
    }
    const customError = {
      message: error.response?.data?.message || error.message || 'Network error occurred',
      status: error.response?.status,
      errors: error.response?.data?.errors
    };
    return Promise.reject(customError);
  }
);

export default api;
