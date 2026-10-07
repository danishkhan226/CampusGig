import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle, AlertCircle, Upload, RefreshCw,
  XCircle, ArrowLeft, User, Package, Star, MessageSquare
} from 'lucide-react';
import * as orderService from '../services/orderService.js';
import * as uploadService from '../services/uploadService.js';
import * as reviewService from '../services/reviewService.js';
import * as chatService from '../services/chatService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import ReviewCard from '../components/ReviewCard.jsx';

 const STATUS_CONFIG = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  paid:            { label: 'Paid — Awaiting Acceptance', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  accepted:        { label: 'Accepted — In Progress', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  in_progress:     { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  submitted:       { label: 'Work Submitted', color: 'bg-purple-100 text-purple-700', icon: Upload },
  revision_requested: { label: 'Revision Requested', color: 'bg-orange-100 text-orange-700', icon: RefreshCw },
  completed:       { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled:       { label: 'Cancelled', color: 'bg-slate-100 text-slate-500', icon: XCircle },
  rejected:        { label: 'Rejected', color: 'bg-red-100 text-red-600', icon: XCircle },
  disputed:        { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

const TIMELINE = [
  { status: 'paid',      label: 'Order Placed' },
  { status: 'accepted',  label: 'Accepted' },
  { status: 'submitted', label: 'Work Submitted' },
  { status: 'completed', label: 'Completed' }
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending_payment;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ status }) {
  const terminalStatuses = ['cancelled', 'rejected', 'disputed'];
  if (terminalStatuses.includes(status)) return null;

  const activeIdx = TIMELINE.findIndex((t) => t.status === status);

  return (
    <div className="flex items-center gap-0 mb-8">
      {TIMELINE.map((step, idx) => {
        const isComplete = activeIdx > idx || status === 'completed';
        const isActive = activeIdx === idx;
        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${isComplete ? 'bg-indigo-600 border-indigo-600 text-white' :
                  isActive ? 'bg-white border-indigo-600 text-indigo-600' :
                  'bg-white border-slate-200 text-slate-400'}`}>
                {isComplete ? <CheckCircle className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isActive || isComplete ? 'text-indigo-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < TIMELINE.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${activeIdx > idx ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const justPlaced = location.state?.justPlaced;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [revisionMessage, setRevisionMessage] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [uploadingDelivery, setUploadingDelivery] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [orderReview, setOrderReview] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOrder(id);
      const orderData = res.data.data;
      setOrder(orderData);
      if (orderData.isReviewed) {
        fetchReview(orderData._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async (orderId) => {
    try {
      const res = await reviewService.getOrderReview(orderId);
      if (res.data?.review) {
        setOrderReview(res.data.review);
      }
    } catch {
      // Review not found or quiet fail
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleAction = async (action, ...args) => {
    setActionLoading(action);
    try {
      await action(...args);
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <p className="text-slate-600">{error}</p>
          <Link to="/orders" className="mt-4 inline-block text-indigo-600 hover:underline">← My Orders</Link>
        </div>
      </div>
    );
  }

  const isBuyer = String(order.buyerId._id) === String(user?._id);
  const isSeller = String(order.sellerId._id) === String(user?._id);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/orders" className="p-2 rounded-xl hover:bg-slate-100 transition">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order #{id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Just placed banner */}
        {justPlaced && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-700 text-sm font-medium">
            <CheckCircle className="h-5 w-5 shrink-0" />
            Order placed successfully! The freelancer will review it shortly.
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <ProgressBar status={order.status} />

          {/* Service Snapshot */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{order.serviceSnapshot.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{order.serviceSnapshot.category} · {order.serviceSnapshot.deliveryDays} day delivery</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-indigo-600">₹{order.amount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Project Requirements</h2>
              <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{order.requirements}</p>
            </div>

            {/* Delivery (if submitted) */}
            {order.submittedAt && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Delivery</h2>
                {order.deliveryMessage && (
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed mb-4">{order.deliveryMessage}</p>
                )}
                {order.submittedFiles?.length > 0 && (
                  <div className="space-y-2">
                    {order.submittedFiles.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                        <Upload className="h-4 w-4" />
                        Delivered File {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Revision Requests */}
            {order.revisionRequests?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Revision History</h2>
                <div className="space-y-3">
                  {order.revisionRequests.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-sm text-orange-700">
                      <p className="font-medium mb-1">Revision {i + 1}</p>
                      <p>{r.message}</p>
                      <p className="text-xs text-orange-400 mt-1">{new Date(r.requestedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Actions</h2>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* SELLER ACTIONS */}
              {isSeller && order.status === 'paid' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(() => orderService.acceptOrder(id))}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                  >
                    {actionLoading ? 'Processing…' : '✓ Accept Order'}
                  </button>
                  <button
                    onClick={() => handleAction(() => orderService.rejectOrder(id, 'Unable to complete this project'))}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-60"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

              {isSeller && ['accepted', 'in_progress', 'revision_requested'].includes(order.status) && (
                <div>
                  {!showDeliveryForm ? (
                    <button
                      onClick={() => setShowDeliveryForm(true)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                      <Upload className="h-4 w-4 inline mr-2" />
                      Submit Completed Work
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        rows={4}
                        value={deliveryMessage}
                        onChange={(e) => setDeliveryMessage(e.target.value)}
                        placeholder="Add a message with your delivery..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />

                      {/* ImageKit Delivery File Upload */}
                      <div>
                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl bg-indigo-50/50 transition cursor-pointer text-xs font-semibold text-indigo-700">
                          <Upload className="h-4 w-4" />
                          <span>{uploadingDelivery ? 'Uploading files to CDN...' : 'Attach files (ZIP, PDF, images, etc.)'}</span>
                          <input
                            type="file"
                            multiple
                            disabled={uploadingDelivery}
                            onChange={async (e) => {
                              if (!e.target.files?.length) return;
                              try {
                                setUploadingDelivery(true);
                                const res = await uploadService.uploadDeliveryFiles(e.target.files);
                                setDeliveryFiles((prev) => [...prev, ...res.data.data.urls]);
                              } catch (uploadErr) {
                                setError('File upload failed. Please try again.');
                              } finally {
                                setUploadingDelivery(false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {deliveryFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {deliveryFiles.map((f, i) => (
                              <div key={i} className="text-xs text-indigo-600 truncate flex items-center gap-1.5">
                                <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                                <span>Attached File {i + 1}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleAction(() =>
                              orderService.submitWork(id, {
                                deliveryMessage,
                                submittedFiles: deliveryFiles
                              })
                            )
                          }
                          disabled={!!actionLoading || uploadingDelivery}
                          className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 cursor-pointer"
                        >
                          {actionLoading ? 'Submitting…' : 'Submit Work'}
                        </button>
                        <button
                          onClick={() => setShowDeliveryForm(false)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BUYER ACTIONS */}
              {isBuyer && order.status === 'submitted' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction(() => orderService.completeOrder(id))}
                    disabled={!!actionLoading}
                    className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60"
                  >
                    {actionLoading ? 'Processing…' : '✓ Accept & Complete Order'}
                  </button>
                  {!showRevisionForm ? (
                    <button
                      onClick={() => setShowRevisionForm(true)}
                      className="w-full py-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 text-sm font-semibold hover:bg-orange-100 transition"
                    >
                      <RefreshCw className="h-4 w-4 inline mr-2" />
                      Request Revision
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        value={revisionMessage}
                        onChange={(e) => setRevisionMessage(e.target.value)}
                        placeholder="What specifically needs to be revised?"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(() => orderService.requestRevision(id, revisionMessage))}
                          disabled={!revisionMessage.trim() || !!actionLoading}
                          className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60"
                        >
                          {actionLoading ? 'Sending…' : 'Send Revision Request'}
                        </button>
                        <button onClick={() => setShowRevisionForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isBuyer && order.status === 'paid' && (
                <button
                  onClick={() => handleAction(() => orderService.cancelOrder(id, 'Cancelled by buyer'))}
                  disabled={!!actionLoading}
                  className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-60"
                >
                  Cancel Order
                </button>
              )}

              {isBuyer && order.status === 'completed' && !order.isReviewed && (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold shadow-md shadow-amber-100 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="h-4 w-4 fill-white" />
                  Rate & Review Freelancer
                </button>
              )}

              {['completed', 'cancelled', 'rejected'].includes(order.status) && (
                <p className="text-sm text-slate-400 text-center py-2">
                  This order is {order.status}. No further order status changes available.
                </p>
              )}
            </div>

            {/* Completed Order Review Card */}
            {orderReview && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                    Verified Client Review
                  </h2>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Verified Order
                  </span>
                </div>
                <ReviewCard
                  review={orderReview}
                  currentUserId={user?._id}
                  onReviewUpdated={(updated) => setOrderReview(updated)}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Buyer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Client</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  {order.buyerId.profileImage
                    ? <img src={order.buyerId.profileImage} className="h-9 w-9 rounded-full object-cover" alt="" />
                    : <User className="h-5 w-5 text-indigo-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{order.buyerId.name}</p>
                  <p className="text-xs text-slate-500">{order.buyerId.collegeName}</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Freelancer</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  {order.sellerId.profileImage
                    ? <img src={order.sellerId.profileImage} className="h-9 w-9 rounded-full object-cover" alt="" />
                    : <User className="h-5 w-5 text-indigo-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{order.sellerId.name}</p>
                  <p className="text-xs text-slate-500">{order.sellerId.collegeName}</p>
                </div>
              </div>
            </div>

            {/* Quick Peer Chat Action */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const recipientId = isBuyer ? order.sellerId._id : order.buyerId._id;
                    const res = await chatService.getOrCreateConversation({
                      recipientId,
                      orderId: order._id,
                      serviceId: order.serviceId?._id || order.serviceId
                    });
                    const convId = res.data?.conversation?._id;
                    navigate(`/chat/${convId}`);
                  } catch (err) {
                    toast.error('Could not open chat: ' + (err.message || 'Error'));
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Chat with {isBuyer ? 'Freelancer' : 'Client'}</span>
              </button>
            </div>

            {/* Deadlines */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-2 text-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Timeline</p>
              <div className="flex justify-between text-slate-600">
                <span>Ordered</span>
                <span className="font-medium text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              {order.acceptedAt && (
                <div className="flex justify-between text-slate-600">
                  <span>Accepted</span>
                  <span className="font-medium text-slate-800">{new Date(order.acceptedAt).toLocaleDateString('en-IN')}</span>
                </div>
              )}
              {order.deadline && (
                <div className="flex justify-between text-slate-600">
                  <span>Deadline</span>
                  <span className={`font-medium ${new Date(order.deadline) < new Date() && !['completed','cancelled'].includes(order.status) ? 'text-red-600' : 'text-slate-800'}`}>
                    {new Date(order.deadline).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex justify-between text-slate-600">
                  <span>Completed</span>
                  <span className="font-medium text-green-600">{new Date(order.completedAt).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-2 text-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Escrow Payment</p>
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-medium text-slate-800">Razorpay</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment ID</span>
                <span className="font-mono text-xs text-slate-700 truncate max-w-35">
                  {order.razorpayPaymentId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status</span>
                <span className="font-semibold text-emerald-600">Verified Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal for Buyer */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          order={order}
          onReviewSubmitted={(newReview) => {
            setOrderReview(newReview);
            setOrder((prev) => ({ ...prev, isReviewed: true }));
          }}
        />
      </div>
    </div>
  );
}
