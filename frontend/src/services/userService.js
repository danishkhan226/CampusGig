import api from './api';

export const getUserProfile = async (userId) => {
  return await api.get(`/users/${userId}`);
};

export const updateProfile = async (profileData) => {
  return await api.put('/users/profile', profileData);
};

export const updateAvatar = async (profileImage) => {
  return await api.post('/users/avatar', { profileImage });
};

export const requestStudentVerification = async (collegeEmail) => {
  return await api.post('/users/verify-student/request', { collegeEmail });
};

export const confirmStudentVerification = async (code) => {
  return await api.post('/users/verify-student/confirm', { code });
};
