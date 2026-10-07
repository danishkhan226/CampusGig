import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, AlertCircle, ChevronRight, ShoppingBag, ArrowUpRight } from 'lucide-react';
import * as orderService from '../services/orderService.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CONFIG = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid / Pending', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700' },
  in_progress: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700' },
  submitted: { label: 'Delivered', color: 'bg-purple-100 text-purple-700' },
  revision_requested: { label: 'Revision', color: 'bg-orange-100 text-orange-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' }
};

export default function OrdersListPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getMyOrders({
        role: activeTab,
        status: statusFilter || undefined
      });
      setOrders(res.data.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track projects you hired or work you are delivering as a freelancer
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Services
          </Link>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 mb-6 shadow-sm">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'buyer'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Bought by Me
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'seller'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Freelance Work
            </button>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid / Awaiting Acceptance</option>
              <option value="accepted">Accepted / In Progress</option>
              <option value="submitted">Delivered</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No orders found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'buyer'
                ? "You haven't ordered any student services yet."
                : "You haven't received any orders for your services yet."}
            </p>
            {activeTab === 'buyer' ? (
              <Link
                to="/explore"
                className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:underline"
              >
                Browse Marketplace →
              </Link>
            ) : (
              <Link
                to="/services/new"
                className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:underline"
              >
                Create a Service →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const otherUser = activeTab === 'buyer' ? order.sellerId : order.buyerId;
              const statusCfg = STATUS_CONFIG[order.status] || {
                label: order.status,
                color: 'bg-slate-100 text-slate-600'
              };

              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="block bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                        {order.serviceId?.images?.[0] ? (
                          <img
                            src={order.serviceId.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mt-1 line-clamp-1">
                          {order.serviceSnapshot?.title || order.serviceId?.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {activeTab === 'buyer' ? 'Freelancer: ' : 'Client: '}
                          <span className="font-semibold text-slate-700">
                            {otherUser?.name || 'Student'}
                          </span>{' '}
                          ({otherUser?.collegeName || 'Verified College'})
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <span className="text-lg font-bold text-indigo-600">
                        ₹{order.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
