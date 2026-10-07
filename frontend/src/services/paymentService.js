import api from './api.js';

// Load Razorpay Checkout SDK Script Dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay Order
export const createPaymentOrder = (orderId) => {
  return api.post('/payments/create-order', { orderId });
};

// Verify Payment Signature
export const verifyPayment = (paymentData) => {
  return api.post('/payments/verify', paymentData);
};

// Get Payment Details
export const getPaymentDetails = (orderId) => {
  return api.get(`/payments/order/${orderId}`);
};
