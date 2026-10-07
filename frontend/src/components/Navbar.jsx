import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap, LogOut, LayoutDashboard, User as UserIcon, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from './VerifiedBadge';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                Campus<span className="text-indigo-600">Gig</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">
                Student Marketplace
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/explore"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Explore
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Categories
            </Link>
            <Link
              to={isAuthenticated ? "/services/new" : "/register"}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Become a Freelancer
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/orders"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
                >
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>Orders</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile/me"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 transition text-sm font-semibold text-slate-800"
                  title="View Your Student Profile"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                  {user?.isVerifiedStudent && (
                    <span className="text-[11px]" title="🎓 Verified Student">🎓</span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 hover:shadow-md transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
