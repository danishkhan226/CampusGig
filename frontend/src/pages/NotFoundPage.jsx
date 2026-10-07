import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-lg mx-auto space-y-8">
        {/* Illustration */}
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 rounded-full bg-indigo-50 animate-pulse" />
          <div className="relative flex items-center justify-center h-full">
            <div className="space-y-3 text-center">
              <div className="text-8xl font-black text-indigo-100 select-none leading-none">404</div>
              <Search className="w-10 h-10 text-indigo-300 mx-auto" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Page not found
          </h1>
          <p className="text-slate-500 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back to the CampusGig marketplace!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md shadow-indigo-100"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Gigs</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
