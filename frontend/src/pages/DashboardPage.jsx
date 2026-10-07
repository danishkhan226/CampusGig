import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Mail, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag, 
  Briefcase, 
  LogOut,
  ArrowRight,
  Clock,
  Plus,
  Compass,
  MessageSquare
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user?.name}
                </h1>
                {user?.isVerifiedStudent ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <GraduationCap className="w-3.5 h-3.5" />
                    🎓 Verified Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Student Profile
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{user?.collegeName || 'University Student'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile/me"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <User className="w-4 h-4" />
              <span>View Profile</span>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dual-Role Capabilities Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Unified Student Dual-Role Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              You can act as both a Freelancer and a Client
            </h2>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              CampusGig never restricts you to one profile. Sell your development, design, and writing skills to peers, and hire fellow student freelancers whenever you need help on assignments and startups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-indigo-200">Freelancer Mode</p>
                <p className="text-sm font-medium text-white mt-1">Offer your skills & earn</p>
              </div>
              <Link
                to="/services/new"
                className="px-3.5 py-1.5 rounded-lg bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition"
              >
                Create Gig
              </Link>
            </div>

            <div className="p-5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-sky-200">Client Mode</p>
                <p className="text-sm font-medium text-white mt-1">Hire student experts</p>
              </div>
              <Link
                to="/explore"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition"
              >
                Browse Gigs
              </Link>
            </div>
          </div>
        </div>

        {/* Account Details & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Details */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Account Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </span>
                <p className="font-semibold text-slate-800">{user?.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Registered Email
                </span>
                <p className="font-semibold text-slate-800">{user?.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> College / Institution
                </span>
                <p className="font-semibold text-slate-800">{user?.collegeName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Member Since
                </span>
                <p className="font-semibold text-slate-800">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Completed Orders: {user?.completedOrders || 0}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" /> Average Rating: {user?.rating ? `${user.rating} ★` : 'No reviews yet'}
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Quick Shortcuts
            </h3>

            <div className="space-y-2">
              <Link
                to="/services/new"
                className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-between transition shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Post a New Gig
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/explore"
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-500" /> Browse Marketplace
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/chat"
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" /> Messages & Chat
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/orders"
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-500" /> My Orders
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
