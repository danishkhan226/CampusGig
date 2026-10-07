import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import * as reviewService from '../services/reviewService';
import VerifiedBadge from '../components/VerifiedBadge';
import EditProfileModal from '../components/EditProfileModal';
import StudentVerificationModal from '../components/StudentVerificationModal';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import { 
  Building, 
  GraduationCap, 
  Mail, 
  Star, 
  Briefcase, 
  ExternalLink, 
  Edit3, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  FolderGit2,
  Package,
  MessageSquare
} from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: authUser } = useAuth();

  const isMe = !id || id === 'me' || id === authUser?._id;
  const targetId = isMe ? authUser?._id : id;

  const [profileUser, setProfileUser] = useState(isMe ? authUser : null);
  const [loading, setLoading] = useState(!profileUser);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'services' | 'reviews'

  // Phase 8: Reviews State
  const [userReviews, setUserReviews] = useState([]);
  const [userReviewsLoading, setUserReviewsLoading] = useState(false);
  const [userReviewsPagination, setUserReviewsPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    if (isMe && authUser) {
      setProfileUser(authUser);
      setLoading(false);
    } else if (targetId) {
      fetchUserProfile(targetId);
    }
  }, [targetId, isMe, authUser]);

  useEffect(() => {
    if (targetId && activeTab === 'reviews') {
      fetchUserReviews(targetId, 1);
    }
  }, [targetId, activeTab]);

  const fetchUserReviews = async (userId, page = 1) => {
    try {
      setUserReviewsLoading(true);
      const res = await reviewService.getUserReviews(userId, { page, limit: 10 });
      setUserReviews(res.data?.reviews || []);
      if (res.data?.pagination) {
        setUserReviewsPagination(res.data.pagination);
      }
    } catch {
      // quiet fail
    } finally {
      setUserReviewsLoading(false);
    }
  };

  const handleReviewUpdated = (updated) => {
    setUserReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getUserProfile(userId);
      setProfileUser(res.data.user);
    } catch (err) {
      setError(err.message || 'Unable to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = (updated) => {
    setProfileUser(updated);
  };

  const handleVerificationComplete = (updated) => {
    setProfileUser(updated);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'The requested student profile could not be found.'}</p>
        <Link
          to="/"
          className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Verification Banner CTA if viewing own unverified profile */}
        {isMe && !profileUser.isVerifiedStudent && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Verify your college email</h4>
                <p className="text-xs text-amber-100 mt-0.5">
                  Get the official 🎓 Verified Student badge on your profile and marketplace gigs.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white text-orange-700 hover:bg-amber-50 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
            >
              Verify Student Status Now
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-indigo-100 overflow-hidden border-2 border-white">
                  {profileUser.profileImage ? (
                    <img
                      src={profileUser.profileImage}
                      alt={profileUser.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span>{profileUser.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                {profileUser.isVerifiedStudent && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs" title="Verified Student">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {profileUser.name}
                  </h1>
                  {profileUser.isVerifiedStudent ? (
                    <VerifiedBadge />
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                      Unverified Peer
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Building className="w-4 h-4 text-indigo-500" />
                    <span>{profileUser.collegeName}</span>
                  </span>
                  {profileUser.education && (
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>{profileUser.education}</span>
                    </span>
                  )}
                </div>

                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>{profileUser.rating > 0 ? profileUser.rating.toFixed(1) : 'New'}</span>
                    <span className="text-slate-400 font-normal">({profileUser.totalReviews} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>{profileUser.completedOrders} completed gigs</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isMe && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-slate-500" />
                  <span>Edit Profile</span>
                </button>
                {!profileUser.isVerifiedStudent && (
                  <button
                    onClick={() => setIsVerifyModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Get Verified</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 mt-8 border-t border-slate-100 pt-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2 border-b-2 transition cursor-pointer ${activeTab === 'about' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Overview & Skills
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'services' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <span>Services / Gigs</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">Phase 4</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <span>Reviews</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                {profileUser.totalReviews || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content: About */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Bio & Portfolio */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  About Me
                </h3>
                {profileUser.bio ? (
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {profileUser.bio}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    {isMe ? 'You have not added a bio yet. Click "Edit Profile" to tell fellow students about your freelance services.' : 'This student has not added a bio yet.'}
                  </p>
                )}
              </div>

              {/* Portfolio & External Links */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-indigo-600" />
                    <span>Portfolio & Project Links</span>
                  </h3>
                  <span className="text-xs text-slate-400">{profileUser.portfolioLinks?.length || 0} links</span>
                </div>

                {profileUser.portfolioLinks && profileUser.portfolioLinks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profileUser.portfolioLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 transition text-sm"
                      >
                        <span className="font-medium text-slate-800 group-hover:text-indigo-600 truncate max-w-xs">
                          {link.replace(/^https?:\/\//, '')}
                        </span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    No portfolio links provided.
                  </p>
                )}
              </div>
            </div>

            {/* Right 1 Col: Skills & Verification Info */}
            <div className="space-y-8">
              {/* Skills */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Skills & Proficiencies</span>
                  <span className="text-xs text-slate-400">{profileUser.skills?.length || 0} skills</span>
                </h3>

                {profileUser.skills && profileUser.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    No skills listed. {isMe && 'Add your top skills to stand out!'}
                  </p>
                )}
              </div>

              {/* Student Verification Credential Tile */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Campus Trust & Verification</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student Status:</span>
                    {profileUser.isVerifiedStudent ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        🎓 Verified Student
                      </span>
                    ) : (
                      <span className="text-slate-500">Pending Email Verification</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">University Email:</span>
                    <span className="font-mono text-slate-800">
                      {profileUser.collegeEmail || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">College:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {profileUser.collegeName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Services Placeholder */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm space-y-4">
            <Package className="w-12 h-12 text-indigo-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Services & Gigs</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Services created by this student will be listed here with package pricing, delivery times, and buyer reviews once Phase 4 (Marketplace) is active.
            </p>
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Summary Banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-amber-600 leading-none">
                    {profileUser.rating > 0 ? profileUser.rating.toFixed(1) : 'New'}
                  </span>
                  <div className="mt-0.5">
                    <StarRating rating={profileUser.rating || 0} size="sm" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Peer Reputation & Feedback
                  </h3>
                  <p className="text-xs text-slate-500">
                    {profileUser.totalReviews > 0
                      ? `Based on ${profileUser.totalReviews} verified order review${profileUser.totalReviews === 1 ? '' : 's'}`
                      : 'No client reviews received yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
                <div>
                  <span className="text-slate-400 block">Total Reviews</span>
                  <span className="font-bold text-slate-900 text-sm">{profileUser.totalReviews || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gigs Completed</span>
                  <span className="font-bold text-slate-900 text-sm">{profileUser.completedOrders || 0}</span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {userReviewsLoading ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-xs font-medium text-slate-500">Loading student reviews...</p>
              </div>
            ) : userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((rev) => (
                  <div key={rev._id} className="space-y-2">
                    {rev.serviceId && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                        <Package className="w-3.5 h-3.5 text-indigo-500" />
                        <span>For gig:</span>
                        <Link
                          to={`/services/${rev.serviceId._id}`}
                          className="font-semibold text-indigo-600 hover:underline truncate max-w-md"
                        >
                          {rev.serviceId.title}
                        </Link>
                      </div>
                    )}
                    <ReviewCard
                      review={rev}
                      currentUserId={authUser?._id}
                      onReviewUpdated={handleReviewUpdated}
                    />
                  </div>
                ))}

                {/* Pagination Controls */}
                {userReviewsPagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-4 text-xs">
                    <button
                      disabled={userReviewsPagination.page <= 1 || userReviewsLoading}
                      onClick={() => fetchUserReviews(targetId, userReviewsPagination.page - 1)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-slate-500 font-medium">
                      Page {userReviewsPagination.page} of {userReviewsPagination.pages}
                    </span>
                    <button
                      disabled={userReviewsPagination.page >= userReviewsPagination.pages || userReviewsLoading}
                      onClick={() => fetchUserReviews(targetId, userReviewsPagination.page + 1)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm space-y-3">
                <MessageSquare className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No Peer Reviews Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isMe
                    ? 'When you complete client orders, reviews and ratings from fellow students will appear here.'
                    : 'This student freelancer has not received client reviews yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={handleProfileUpdated}
      />

      <StudentVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerified={handleVerificationComplete}
      />
    </div>
  );
}
