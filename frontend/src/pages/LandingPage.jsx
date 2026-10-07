import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Palette, 
  PenTool, 
  Video, 
  Megaphone, 
  BookOpen, 
  Database, 
  Sparkles,
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Search,
  Server,
  HardDrive,
  Globe,
  RefreshCw,
  Wallet,
  Star,
  Users
} from 'lucide-react';
import { getHealthStatus } from '../services/healthService';

export default function LandingPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getHealthStatus();
      setHealth(res.data);
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const categories = [
    { name: 'Development', icon: Code, count: '120+ student devs', color: 'from-blue-500 to-indigo-600' },
    { name: 'Design', icon: Palette, count: '90+ UI/UX designers', color: 'from-purple-500 to-pink-600' },
    { name: 'Writing', icon: PenTool, count: '75+ content writers', color: 'from-amber-500 to-orange-600' },
    { name: 'Video', icon: Video, count: '50+ video editors', color: 'from-rose-500 to-red-600' },
    { name: 'Marketing', icon: Megaphone, count: '40+ growth marketers', color: 'from-emerald-500 to-teal-600' },
    { name: 'Academic Projects', icon: BookOpen, count: '85+ subject peers', color: 'from-cyan-500 to-blue-600' },
    { name: 'Data', icon: Database, count: '45+ data analysts', color: 'from-violet-500 to-purple-600' },
    { name: 'Other', icon: Sparkles, count: '30+ versatile skills', color: 'from-slate-600 to-slate-800' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Live System Status Notification Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health?.database?.connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-medium text-slate-300">Phase 1 Architecture Status:</span>
            <span className="text-slate-400">
              {loading ? 'Verifying system links...' : error ? 'Connection Warning' : 'Frontend ↔ Express Backend ↔ MongoDB Online'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>DB: <strong className="text-slate-200">{health?.database?.name || 'campusgig'}</strong> ({health?.database?.status || 'checking'})</span>
            </span>
            <button 
              onClick={fetchHealth} 
              disabled={loading}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              title="Refresh connection test"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              The Campus Marketplace for Student Freelancers
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Turn Your Skills Into <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">Opportunities.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CampusGig helps students discover talented freelancers and earn by turning their skills into real projects.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/explore"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-slate-800 font-semibold text-base border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Start Freelancing</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-2xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-xs text-slate-500">Student Verified</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-2xl font-bold text-slate-900">₹0</p>
                <p className="text-xs text-slate-500">Hidden Fees</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-2xl font-bold text-slate-900">Escrow</p>
                <p className="text-xs text-slate-500">Secure Payments</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
                <p className="text-2xl font-bold text-slate-900">4.9 ★</p>
                <p className="text-xs text-slate-500">Peer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Stack Architecture Live Telemetry Card */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Phase 1 Integration Verified
                </span>
                <h3 className="text-2xl font-bold mt-2">
                  Live Stack Telemetry (React ↔ Express ↔ MongoDB)
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Active connection verified between client browser, Express REST API, and MongoDB instance.
                </p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Test Live Connection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Frontend Tile */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Frontend Client</h4>
                    <p className="text-xs text-slate-400">React 19 + Vite + Tailwind</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                  </span>
                </div>
              </div>

              {/* Backend Tile */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Backend Engine</h4>
                    <p className="text-xs text-slate-400">Express.js API Layer</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status</span>
                  <span className={`${health?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'} font-medium flex items-center gap-1`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {health?.status === 'ok' ? 'Responding (200 OK)' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Database Tile */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Database</h4>
                    <p className="text-xs text-slate-400">MongoDB Mongoose</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cluster</span>
                  <span className={`${health?.database?.connected ? 'text-emerald-400' : 'text-amber-400'} font-medium flex items-center gap-1`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {health?.database?.status || 'Checking'} ({health?.database?.name || 'campusgig'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Popular Categories
          </h2>
          <p className="text-slate-600 mt-2">
            Find certified student specialists ready to help with projects, portfolios, and assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer block"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {cat.count}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              How CampusGig Works
            </h2>
            <p className="text-slate-600 mt-2">
              Designed to make peer hiring safe, affordable, and collaborative.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Clients */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  💼
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Clients (Students Hiring)</h3>
                  <p className="text-xs text-slate-500">Get quality work delivered by peers</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-200 text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Find a Service</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Search by service category, price, college verification, or delivery timeline.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-200 text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Hire a Student</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Submit your project requirements and place order with escrow Razorpay protection.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-200 text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Get Your Work</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Review submitted files, request revisions if needed, approve, and leave a review.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Freelancers */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Freelancers (Students Selling)</h3>
                  <p className="text-xs text-slate-500">Monetize your talent while studying</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 border border-emerald-200 text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Create Your Service</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      List your skills, define your custom packages, delivery times, and pricing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 border border-emerald-200 text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Get Orders</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Accept orders from students, communicate via real-time chat, and build your queue.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 border border-emerald-200 text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Earn & Build Your Portfolio</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Receive direct payouts, gather verified peer reviews, and showcase your live work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why CampusGig? */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why CampusGig?
          </h2>
          <p className="text-slate-600 mt-2">
            Built from the ground up for the student experience, eliminating traditional agency overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Student-Focused</h4>
            <p className="text-sm text-slate-600 mt-2">
              Empowering college students to collaborate, understand campus timelines, and exchange value natively.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Affordable Services</h4>
            <p className="text-sm text-slate-600 mt-2">
              Fair, student-friendly pricing starting from ₹499 without corporate agency commission markups.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Verified Students</h4>
            <p className="text-sm text-slate-600 mt-2">
              Official college email verification provides confidence that you are interacting with genuine university peers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Secure Payments</h4>
            <p className="text-sm text-slate-600 mt-2">
              Escrow payment holds funds until the client reviews and approves the submitted work.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Portfolio Building</h4>
            <p className="text-sm text-slate-600 mt-2">
              Every completed gig translates to a proven project with real client feedback for your placement resume.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Star className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Ratings and Reviews</h4>
            <p className="text-sm text-slate-600 mt-2">
              Authentic reviews from verified buyers build long-term reputation and credibility.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
