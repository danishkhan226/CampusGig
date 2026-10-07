import api from './api';

export const registerUser = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const loginUser = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const logoutUser = async () => {
  return await api.post('/auth/logout');
};

export const getMe = async () => {
  return await api.get('/auth/me');
};

export const forgotPassword = async (email) => {
  return await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async ({ token, password, confirmPassword }) => {
  return await api.post(`/auth/reset-password/${token}`, { password, confirmPassword });
};
