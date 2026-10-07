import api from './api.js';

// POST /api/orders — create an order (before payment)
export const createOrder = (serviceId, requirements) =>
  api.post('/orders', { serviceId, requirements });

// GET /api/orders — list orders
export const getMyOrders = (params = {}) =>
  api.get('/orders', { params });

// GET /api/orders/stats
export const getOrderStats = () =>
  api.get('/orders/stats');

// GET /api/orders/:id
export const getOrder = (id) =>
  api.get(`/orders/${id}`);

// POST /api/orders/:id/pay — confirm payment (Phase 6 fills Razorpay data)
export const confirmPayment = (id, paymentData) =>
  api.post(`/orders/${id}/pay`, paymentData);

// PATCH actions
export const acceptOrder = (id) => api.patch(`/orders/${id}/accept`);
export const rejectOrder = (id, reason) => api.patch(`/orders/${id}/reject`, { reason });
export const submitWork = (id, data) => api.patch(`/orders/${id}/submit`, data);
export const completeOrder = (id) => api.patch(`/orders/${id}/complete`);
export const requestRevision = (id, message) => api.patch(`/orders/${id}/revision`, { message });
export const cancelOrder = (id, reason) => api.patch(`/orders/${id}/cancel`, { reason });
