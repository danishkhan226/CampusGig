import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as adminService from '../services/adminService';
import VerifiedBadge from '../components/VerifiedBadge';
import {
  ShieldAlert,
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Ban,
  UserCheck,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'services' | 'orders'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Overview Data
  const [analytics, setAnalytics] = useState(null);

  // Users Data
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userVerifiedFilter, setUserVerifiedFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Services Data
  const [services, setServices] = useState([]);
  const [servicesPagination, setServicesPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('');
  const [serviceActiveFilter, setServiceActiveFilter] = useState('');
  const [loadingServices, setLoadingServices] = useState(false);

  // Orders Data
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Dispute resolution modal state
  const [disputeModalOrder, setDisputeModalOrder] = useState(null);
  const [disputeResolution, setDisputeResolution] = useState('refund');
  const [disputeReason, setDisputeReason] = useState('');
  const [resolvingDispute, setResolvingDispute] = useState(false);
  const toast = useToast();

  // Initial Load: Overview Analytics
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === 'users') fetchUsers(1);
    if (activeTab === 'services') fetchServices(1);
    if (activeTab === 'orders') fetchOrders(1);
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getAnalyticsOverview();
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoadingUsers(true);
      const params = { page, limit: 15 };
      if (userSearch) params.search = userSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      if (userVerifiedFilter !== '') params.isVerifiedStudent = userVerifiedFilter;

      const res = await adminService.getUsers(params);
      setUsers(res.data?.users || []);
      setUsersPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchServices = async (page = 1) => {
    try {
      setLoadingServices(true);
      const params = { page, limit: 15 };
      if (serviceSearch) params.search = serviceSearch;
      if (serviceCategoryFilter) params.category = serviceCategoryFilter;
      if (serviceActiveFilter !== '') params.isActive = serviceActiveFilter;

      const res = await adminService.getServices(params);
      setServices(res.data?.services || []);
      setServicesPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      setLoadingOrders(true);
      const params = { page, limit: 15 };
      if (orderStatusFilter) params.status = orderStatusFilter;

      const res = await adminService.getOrders(params);
      setOrders(res.data?.orders || []);
      setOrdersPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // User Action Handlers
  const handleToggleVerification = async (userId) => {
    try {
      const res = await adminService.toggleUserVerification(userId);
      const updated = res.data?.user;
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isVerifiedStudent: updated.isVerifiedStudent } : u))
      );
    } catch (err) {
      toast.error('Verification update failed: ' + err.message);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: res.data?.user?.role } : u))
      );
    } catch (err) {
      toast.error('Role update failed: ' + err.message);
    }
  };

  const handleToggleSuspension = async (userId) => {
    try {
      const res = await adminService.toggleUserSuspension(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isSuspended: res.data?.user?.isSuspended } : u))
      );
    } catch (err) {
      toast.error('Suspension update failed: ' + err.message);
    }
  };

  // Service Action Handlers
  const handleToggleService = async (serviceId) => {
    try {
      const res = await adminService.toggleServiceStatus(serviceId);
      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? { ...s, isActive: res.data?.service?.isActive } : s))
      );
    } catch (err) {
      toast.error('Service update failed: ' + err.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service listing permanently?')) return;
    try {
      await adminService.deleteService(serviceId);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
    } catch (err) {
      toast.error('Service deletion failed: ' + err.message);
    }
  };

  // Order Dispute Resolution Handler
  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!disputeModalOrder) return;

    try {
      setResolvingDispute(true);
      const res = await adminService.resolveOrderDispute(disputeModalOrder._id, {
        resolution: disputeResolution,
        reason: disputeReason
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === disputeModalOrder._id ? res.data?.order : o))
      );
      setDisputeModalOrder(null);
      setDisputeReason('');
    } catch (err) {
      toast.error('Dispute resolution failed: ' + err.message);
    } finally {
      setResolvingDispute(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  CampusGig Admin Control Panel
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Superadmin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full platform oversight, student verification, gig moderation, and escrow dispute management
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchAnalytics();
              if (activeTab === 'users') fetchUsers(usersPagination.page);
              if (activeTab === 'services') fetchServices(servicesPagination.page);
              if (activeTab === 'orders') fetchOrders(ordersPagination.page);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3 overflow-x-auto text-sm font-semibold">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: TrendingUp },
            { id: 'users', label: 'Student Users', icon: Users, badge: analytics?.metrics?.totalUsers },
            { id: 'services', label: 'Marketplace Gigs', icon: ShoppingBag, badge: analytics?.metrics?.totalServices },
            { id: 'orders', label: 'Orders & Escrow', icon: Package, badge: analytics?.metrics?.totalOrders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.2 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <span className="text-sm">Calculating platform metrics...</span>
              </div>
            ) : analytics ? (
              <>
                {/* 4 Primary Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold text-slate-900">{analytics.metrics.totalUsers}</span>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        🎓 {analytics.metrics.verifiedStudents} verified
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform GMV</span>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold text-slate-900">
                        ₹{analytics.metrics.totalGMV?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Escrow volume</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Gigs</span>
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold text-slate-900">{analytics.metrics.activeServices}</span>
                      <span className="text-xs text-slate-400 font-medium">of {analytics.metrics.totalServices} total</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Gigs</span>
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold text-slate-900">{analytics.metrics.completedOrders}</span>
                      <span className="text-xs text-slate-400 font-medium">of {analytics.metrics.totalOrders} orders</span>
                    </div>
                  </div>
                </div>

                {/* 2 Grid Tables: Recent Orders & Recent Users */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        <span>Recent Orders</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-indigo-600 hover:underline font-semibold"
                      >
                        View All
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {analytics.recentOrders?.map((ord) => (
                        <div key={ord._id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 truncate block max-w-xs">
                              {ord.serviceSnapshot?.title || 'Order'}
                            </span>
                            <span className="text-slate-400">
                              By {ord.buyerId?.name} • ₹{ord.amount?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {ord.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Signups */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Recent Student Signups</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="text-xs text-indigo-600 hover:underline font-semibold"
                      >
                        View All
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {analytics.recentUsers?.map((u) => (
                        <div key={u._id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
                              {u.profileImage ? (
                                <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                u.name?.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <span>{u.name}</span>
                                {u.isVerifiedStudent && <VerifiedBadge size="sm" />}
                              </div>
                              <span className="text-slate-400">{u.collegeName}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
            {/* Filter Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search name, email, college..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto text-xs">
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    fetchUsers(1);
                  }}
                  className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={userVerifiedFilter}
                  onChange={(e) => {
                    setUserVerifiedFilter(e.target.value);
                    fetchUsers(1);
                  }}
                  className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                >
                  <option value="">All Verification</option>
                  <option value="true">Verified Students</option>
                  <option value="false">Unverified</option>
                </select>

                <button
                  onClick={() => fetchUsers(1)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {loadingUsers ? (
                <div className="py-20 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <span className="text-xs">Loading users...</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Student Peer</th>
                      <th className="py-3.5 px-6">College / Uni</th>
                      <th className="py-3.5 px-6">Email</th>
                      <th className="py-3.5 px-6">Verification</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-800 overflow-hidden shrink-0">
                              {u.profileImage ? (
                                <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                u.name?.charAt(0)
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/profile/${u._id}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 transition block"
                              >
                                {u.name}
                              </Link>
                              <span className="text-[11px] text-slate-400">★ {u.rating || 'New'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-600">{u.collegeName}</td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-500">{u.email}</td>
                        <td className="py-4 px-6">
                          {u.isVerifiedStudent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified Student
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Verification */}
                            <button
                              onClick={() => handleToggleVerification(u._id)}
                              title={u.isVerifiedStudent ? 'Revoke verification badge' : 'Grant verified student badge'}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                u.isVerifiedStudent
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>

                            {/* Toggle Admin Role */}
                            <button
                              onClick={() => handleToggleRole(u._id, u.role)}
                              title={u.role === 'admin' ? 'Demote to regular user' : 'Promote to admin'}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                u.role === 'admin'
                                  ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>

                            {/* Suspend / Unsuspend */}
                            <button
                              onClick={() => handleToggleSuspension(u._id)}
                              title={u.isSuspended ? 'Unsuspend account' : 'Suspend account'}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                u.isSuspended
                                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                                  : 'border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {usersPagination.pages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  disabled={usersPagination.page <= 1 || loadingUsers}
                  onClick={() => fetchUsers(usersPagination.page - 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-slate-500 font-medium">
                  Page {usersPagination.page} of {usersPagination.pages} ({usersPagination.total} users)
                </span>
                <button
                  disabled={usersPagination.page >= usersPagination.pages || loadingUsers}
                  onClick={() => fetchUsers(usersPagination.page + 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GIG / SERVICE MODERATION */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
            {/* Filter Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search gig titles or skills..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchServices(1)}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto text-xs">
                <select
                  value={serviceActiveFilter}
                  onChange={(e) => {
                    setServiceActiveFilter(e.target.value);
                    fetchServices(1);
                  }}
                  className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active Only</option>
                  <option value="false">Disabled Only</option>
                </select>

                <button
                  onClick={() => fetchServices(1)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Services Table */}
            <div className="overflow-x-auto">
              {loadingServices ? (
                <div className="py-20 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <span className="text-xs">Loading marketplace gigs...</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Gig Service</th>
                      <th className="py-3.5 px-6">Student Seller</th>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Price</th>
                      <th className="py-3.5 px-6">Orders & Rating</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {services.map((svc) => (
                      <tr key={svc._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6">
                          <Link
                            to={`/services/${svc._id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition block max-w-xs truncate"
                          >
                            {svc.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">{svc.deliveryDays} days delivery</span>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-700">
                          {svc.sellerId?.name || 'Unknown Seller'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            {svc.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-indigo-600">
                          ₹{svc.price?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6">
                          <span>{svc.ordersCount || 0} orders • ★ {svc.rating || 0}</span>
                        </td>
                        <td className="py-4 px-6">
                          {svc.isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleService(svc._id)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                svc.isActive
                                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {svc.isActive ? 'Disable' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteService(svc._id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                              title="Delete gig listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {servicesPagination.pages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  disabled={servicesPagination.page <= 1 || loadingServices}
                  onClick={() => fetchServices(servicesPagination.page - 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-slate-500 font-medium">
                  Page {servicesPagination.page} of {servicesPagination.pages}
                </span>
                <button
                  disabled={servicesPagination.page >= servicesPagination.pages || loadingServices}
                  onClick={() => fetchServices(servicesPagination.page + 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORDERS & ESCROW MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
            {/* Filter Bar */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-slate-500">Status Filter:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    fetchOrders(1);
                  }}
                  className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                >
                  <option value="">All Orders</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="paid">Paid (In Escrow)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              {loadingOrders ? (
                <div className="py-20 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <span className="text-xs">Loading campus orders...</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Order ID</th>
                      <th className="py-3.5 px-6">Gig Description</th>
                      <th className="py-3.5 px-6">Buyer</th>
                      <th className="py-3.5 px-6">Freelancer</th>
                      <th className="py-3.5 px-6">Escrow Amount</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          #{ord._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate">
                          <Link to={`/orders/${ord._id}`} className="hover:text-indigo-600 transition">
                            {ord.serviceSnapshot?.title || 'Order'}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{ord.buyerId?.name || 'Buyer'}</td>
                        <td className="py-4 px-6 text-slate-600">{ord.sellerId?.name || 'Seller'}</td>
                        <td className="py-4 px-6 font-bold text-indigo-600">
                          ₹{ord.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : ord.status === 'disputed'
                                ? 'bg-rose-100 text-rose-700'
                                : ord.status === 'cancelled'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/orders/${ord._id}`}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition inline-flex items-center gap-1"
                            >
                              <span>Inspect</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>

                            {/* Dispute Resolution Option */}
                            {['paid', 'in_progress', 'submitted', 'disputed'].includes(ord.status) && (
                              <button
                                onClick={() => {
                                  setDisputeModalOrder(ord);
                                  setDisputeResolution('refund');
                                  setDisputeReason('');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold transition cursor-pointer"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {ordersPagination.pages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  disabled={ordersPagination.page <= 1 || loadingOrders}
                  onClick={() => fetchOrders(ordersPagination.page - 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-slate-500 font-medium">
                  Page {ordersPagination.page} of {ordersPagination.pages}
                </span>
                <button
                  disabled={ordersPagination.page >= ordersPagination.pages || loadingOrders}
                  onClick={() => fetchOrders(ordersPagination.page + 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dispute Resolution Modal */}
        {disputeModalOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-lg text-slate-900">Resolve Escrow Dispute</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                You are resolving order <strong>#{disputeModalOrder._id.slice(-6).toUpperCase()}</strong> for ₹{disputeModalOrder.amount}.
              </p>

              <form onSubmit={handleResolveDispute} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Outcome</label>
                  <select
                    value={disputeResolution}
                    onChange={(e) => setDisputeResolution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="refund">Force Cancellation & Refund to Buyer</option>
                    <option value="complete">Force Complete & Release Escrow to Seller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Notes / Reason</label>
                  <textarea
                    rows={3}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Enter reason for dispute determination..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputeModalOrder(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resolvingDispute}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {resolvingDispute ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Confirm Resolution</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
