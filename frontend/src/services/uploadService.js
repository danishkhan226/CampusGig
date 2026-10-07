import api from './api.js';

// Upload user profile avatar
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  // Do NOT set Content-Type manually — Axios/browser sets it with the correct multipart boundary
  return await api.post('/upload/avatar', formData);
};

// Upload service gig images (multiple)
 export const uploadServiceImages = async (files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  return await api.post('/upload/service-images', formData);
};

// Upload order delivery attachment files (multiple)
export const uploadDeliveryFiles = async (files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  return await api.post('/upload/delivery-files', formData);
};

