import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
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

    // If uploading FormData, delete Content-Type so browser sets correct multipart/form-data boundary
    if (config.data && (typeof FormData !== 'undefined' && config.data instanceof FormData)) {
      if (config.headers?.delete) {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
      }
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
