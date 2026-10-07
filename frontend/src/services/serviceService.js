import api from './api';

export const getServices = async (params = {}) => {
  return await api.get('/services', { params });
};

export const getServiceById = async (id) => {
  return await api.get(`/services/${id}`);
};

export const createService = async (serviceData) => {
  return await api.post('/services', serviceData);
};

export const updateService = async (id, serviceData) => {
  return await api.put(`/services/${id}`, serviceData);
};

export const deleteService = async (id) => {
  return await api.delete(`/services/${id}`);
};
