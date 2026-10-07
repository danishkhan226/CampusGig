import React from 'react';
import { GraduationCap, Heart, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Campus<span className="text-indigo-400">Gig</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The premier peer-to-peer freelance marketplace designed exclusively for university students to showcase talent, gain industry experience, and earn.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Campus verified profiles & secure escrow payments</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Popular Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/categories?cat=development" className="hover:text-white transition-colors">Web & App Development</Link></li>
              <li><Link to="/categories?cat=design" className="hover:text-white transition-colors">UI/UX & Graphic Design</Link></li>
              <li><Link to="/categories?cat=writing" className="hover:text-white transition-colors">Content & Resume Writing</Link></li>
              <li><Link to="/categories?cat=video" className="hover:text-white transition-colors">Video & Animation</Link></li>
              <li><Link to="/categories?cat=data" className="hover:text-white transition-colors">Data Analysis & ML</Link></li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              For Students
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/explore" className="hover:text-white transition-colors">Browse Projects</Link></li>
              <li><Link to="/become-freelancer" className="hover:text-white transition-colors">Start Freelancing</Link></li>
              <li><Link to="/verification-info" className="hover:text-white transition-colors">Student Badge Verification</Link></li>
              <li><Link to="/safety" className="hover:text-white transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Architecture & Stack
            </h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Node.js / Express Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>MongoDB Mongoose Cluster</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
                <span>React 19 + Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Razorpay & Cloudinary Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusGig. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for the student developer ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
