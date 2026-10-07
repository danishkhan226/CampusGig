import api from './api.js';

// GET /api/admin/analytics — overview metrics and stats
export const getAnalyticsOverview = () =>
  api.get('/admin/analytics');

// GET /api/admin/users — paginated users list with filters
export const getUsers = (params = {}) =>
  api.get('/admin/users', { params });

// PATCH /api/admin/users/:id/verify — toggle verified student status
export const toggleUserVerification = (id) =>
  api.patch(`/admin/users/${id}/verify`);

// PATCH /api/admin/users/:id/role — change user role (user/admin)
export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });

// PATCH /api/admin/users/:id/suspend — toggle suspension
export const toggleUserSuspension = (id) =>
  api.patch(`/admin/users/${id}/suspend`);

// GET /api/admin/services — paginated marketplace gigs list
export const getServices = (params = {}) =>
  api.get('/admin/services', { params });

// PATCH /api/admin/services/:id/toggle — toggle active/disabled
export const toggleServiceStatus = (id) =>
  api.patch(`/admin/services/${id}/toggle`);

// DELETE /api/admin/services/:id — remove gig
export const deleteService = (id) =>
  api.delete(`/admin/services/${id}`);

// GET /api/admin/orders — paginated platform orders
export const getOrders = (params = {}) =>
  api.get('/admin/orders', { params });

// PATCH /api/admin/orders/:id/resolve — dispute resolution
export const resolveOrderDispute = (id, { resolution, reason }) =>
  api.patch(`/admin/orders/${id}/resolve`, { resolution, reason });
