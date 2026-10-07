import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import * as serviceService from '../services/serviceService.js';
import * as orderService from '../services/orderService.js';
import * as paymentService from '../services/paymentService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CheckoutPage() {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await serviceService.getServiceById(serviceId);
        setService(res.data.data);
      } catch {
        setError('Service not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requirements.trim()) return setError('Please describe your project requirements.');
    if (requirements.trim().length < 20) return setError('Requirements must be at least 20 characters.');

    setSubmitting(true);
    setError('');
    try {
      // 1. Create CampusGig order
      const res = await orderService.createOrder(serviceId, requirements);
      const order = res.data.data;
      const orderId = order._id;

      // 2. Create Razorpay Order on Backend
      const paymentOrderRes = await paymentService.createPaymentOrder(orderId);
      const paymentData = paymentOrderRes.data.data;

      // 3. Check if simulated or live Razorpay
      if (paymentData.isSimulation) {
        // Direct simulation verification for environments without live Razorpay keys
        await paymentService.verifyPayment({
          orderId,
          razorpayOrderId: paymentData.razorpayOrderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated_signature'
        });
        navigate(`/orders/${orderId}`, { state: { justPlaced: true } });
        return;
      }

      // 4. Load Razorpay SDK and open checkout modal
      const isLoaded = await paymentService.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'CampusGig',
        description: `Order #${orderId.slice(-6).toUpperCase()} - ${service.title}`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: ''
        },
        theme: {
          color: '#4f46e5' // Indigo 600
        },
        handler: async function (response) {
          try {
            // 5. Verify payment signature on backend server
            await paymentService.verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            navigate(`/orders/${orderId}`, { state: { justPlaced: true } });
          } catch (verificationErr) {
            setError(
              verificationErr.response?.data?.message ||
                'Payment verification failed. Please contact support if money was deducted.'
            );
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setError('Payment cancelled. Your order remains pending in Orders.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setError(response.error?.description || 'Payment processing failed.');
        setSubmitting(false);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <p className="text-slate-600">{error}</p>
          <Link to="/explore" className="mt-4 inline-block text-indigo-600 hover:underline">Browse Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/explore" className="hover:text-indigo-600">Marketplace</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/services/${serviceId}`} className="hover:text-indigo-600">Service</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-800 font-medium">Checkout</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Requirements Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Place Your Order</h1>
                  <p className="text-sm text-slate-500">Tell the freelancer exactly what you need</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Project Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={requirements}
                    onChange={(e) => { setRequirements(e.target.value); setError(''); }}
                    placeholder={`Describe your project in detail. For example:\n• What exactly do you need?\n• Target audience or style preferences\n• Any references or examples\n• Specific technologies or formats required\n• Deadline or other constraints`}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">{requirements.length} / 2000 characters</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Placing Order…' : `Confirm & Pay ₹${service?.price?.toLocaleString('en-IN')}`}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  By placing this order you agree to CampusGig's terms. Payment is held securely until work is approved.
                </p>
              </form>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Order Summary</h2>

              {service?.images?.[0] && (
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-36 object-cover rounded-xl mb-4"
                />
              )}

              <p className="font-semibold text-slate-900 text-sm leading-snug mb-4">{service?.title}</p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Delivery
                  </span>
                  <span className="font-medium text-slate-800">{service?.deliveryDays} day{service?.deliveryDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Service fee</span>
                  <span className="font-medium text-slate-800">₹{service?.price?.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-600 text-lg">₹{service?.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">What Happens Next</h2>
              <ol className="space-y-3">
                {[
                  'Your order is placed & payment is secured',
                  'Freelancer accepts and work begins',
                  'Freelancer delivers within the promised time',
                  'You review and approve the work',
                  'Leave a review!'
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
