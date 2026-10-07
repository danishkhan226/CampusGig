import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as serviceService from '../services/serviceService';
import * as reviewService from '../services/reviewService';
import ServiceCard from '../components/ServiceCard';
import VerifiedBadge from '../components/VerifiedBadge';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  Clock, 
  ArrowLeft, 
  Building, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Share2, 
  Heart, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Eye,
  MessageSquare,
  Filter
} from 'lucide-react';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [similarServices, setSimilarServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Phase 8: Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchServiceDetail(id);
    fetchServiceReviews(id, null, 1);
    window.scrollTo(0, 0);
  }, [id]);

  const fetchServiceReviews = async (serviceId, rating, page = 1) => {
    try {
      setReviewsLoading(true);
      const params = { page, limit: 5 };
      if (rating) params.rating = rating;
      const res = await reviewService.getServiceReviews(serviceId, params);
      setReviews(res.data?.reviews || []);
      if (res.data?.stats) {
        setReviewStats(res.data.stats);
      }
      if (res.data?.pagination) {
        setReviewsPagination(res.data.pagination);
      }
    } catch {
      // quiet fail for reviews
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleRatingFilterChange = (val) => {
    setRatingFilter(val);
    fetchServiceReviews(id, val, 1);
  };

  const handleReviewUpdated = (updated) => {
    setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const fetchServiceDetail = async (serviceId) => {
    try {
      setLoading(true);
      setError('');
      const res = await serviceService.getServiceById(serviceId);
      setService(res.data.service);
      setSimilarServices(res.data.similarServices || []);
    } catch (err) {
      setError(err.message || 'Service not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this gig listing?')) {
      return;
    }

    try {
      setDeleting(true);
      await serviceService.deleteService(service._id);
      navigate('/explore');
    } catch (err) {
      alert(err.message || 'Failed to delete gig');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Service Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'This service is unavailable or has been removed.'}</p>
        <Link
          to="/explore"
          className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const seller = service.sellerId || {};
  const isOwner = authUser && seller._id === authUser._id;
  const images = (service.images && service.images.length > 0) 
    ? service.images 
    : ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80'];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation & Top Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Link to="/explore" className="hover:text-indigo-600 transition">Marketplace</Link>
            <span>/</span>
            <Link to={`/explore?category=${service.category}`} className="hover:text-indigo-600 transition">{service.category}</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-xs">{service.title}</span>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                to={`/services/${service._id}/edit`}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Gig</span>
              </Link>
              <button
                onClick={handleDeleteService}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Grid: Left (Content) + Right (Sticky Pricing Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Seller Meta */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {service.category}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {service.title}
              </h1>

              {/* Seller Brief Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${seller._id}`} className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
                    {seller.profileImage ? (
                      <img src={seller.profileImage} alt={seller.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{seller.name?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </Link>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${seller._id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition text-sm">
                        {seller.name}
                      </Link>
                      {seller.isVerifiedStudent && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-slate-400 mt-0.5">{seller.collegeName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>{service.rating > 0 ? service.rating.toFixed(1) : 'New'}</span>
                    <span className="text-slate-400 font-normal">({service.reviewCount} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{service.views} views</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-900 relative">
                <img
                  src={images[activeImageIndex]}
                  alt="Gig preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                        activeImageIndex === idx ? 'border-indigo-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                About This Service
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Skills / Tech Stack */}
            {service.skills && service.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Skills & Tools Included
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Client Requirements */}
            {service.requirements && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Requirements from Client
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {service.requirements}
                </p>
              </div>
            )}

            {/* Reviews & Ratings Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <span>Peer Reviews & Ratings</span>
                    <span className="text-sm font-normal text-slate-400">
                      ({reviewStats.totalReviews || service.reviewCount || 0})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Authentic feedback from verified student clients who completed this gig.
                  </p>
                </div>
              </div>

              {/* Rating Summary & Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
                {/* Average Score */}
                <div className="flex flex-col items-center justify-center text-center p-3 sm:border-r border-slate-200">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : (service.rating > 0 ? service.rating.toFixed(1) : '0.0')}
                  </span>
                  <div className="my-1.5">
                    <StarRating
                      rating={reviewStats.averageRating || service.rating || 0}
                      size="md"
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    Based on {reviewStats.totalReviews || service.reviewCount || 0} reviews
                  </span>
                </div>

                {/* Rating Breakdown Bars */}
                <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewStats.breakdown?.[stars] || 0;
                    const total = reviewStats.totalReviews || 1;
                    const pct = reviewStats.totalReviews > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-slate-600 font-medium flex items-center gap-1">
                          <span>{stars}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-slate-400 font-mono text-[11px]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Star Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
                <button
                  onClick={() => handleRatingFilterChange(null)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shrink-0 ${
                    ratingFilter === null
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({reviewStats.totalReviews || 0})
                </button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleRatingFilterChange(s)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                      ratingFilter === s
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{s} Stars</span>
                    <span className="text-[10px] opacity-80">({reviewStats.breakdown?.[s] || 0})</span>
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
                  <span className="text-xs">Loading reviews...</span>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {reviews.map((rev) => (
                    <ReviewCard
                      key={rev._id}
                      review={rev}
                      currentUserId={authUser?._id}
                      onReviewUpdated={handleReviewUpdated}
                    />
                  ))}

                  {/* Pagination Controls if multiple pages */}
                  {reviewsPagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                      <button
                        disabled={reviewsPagination.page <= 1 || reviewsLoading}
                        onClick={() => fetchServiceReviews(id, ratingFilter, reviewsPagination.page - 1)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-slate-500 font-medium">
                        Page {reviewsPagination.page} of {reviewsPagination.pages}
                      </span>
                      <button
                        disabled={reviewsPagination.page >= reviewsPagination.pages || reviewsLoading}
                        onClick={() => fetchServiceReviews(id, ratingFilter, reviewsPagination.page + 1)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 text-center space-y-2 border border-dashed border-slate-200">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No reviews yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {ratingFilter
                      ? `No ${ratingFilter}-star reviews found for this gig.`
                      : 'Be the first student client to hire this peer and leave a review once the gig is completed!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col Sticky Card & Freelancer Card) */}
          <div className="space-y-6">
            {/* Sticky Pricing & Checkout Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg sticky top-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Standard Package
                </span>
                <span className="text-3xl font-extrabold text-indigo-600">
                  ₹{service.price}
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span><strong>{service.deliveryDays} Days Delivery</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Escrow payment protection (held until approval)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct peer communication & revision requests</span>
                </div>
              </div>

              {/* CTA Button */}
              {isOwner ? (
                <Link
                  to={`/services/${service._id}/edit`}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit This Gig</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: { pathname: `/services/${service._id}` } } });
                    } else {
                      navigate(`/orders/checkout/${service._id}`);
                    }
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Continue / Hire Freelancer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <p className="text-[11px] text-center text-slate-400">
                You won't be charged until you confirm order requirements.
              </p>
            </div>

            {/* Freelancer Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                About The Student Seller
              </h4>

              <div className="flex items-center gap-3">
                <Link to={`/profile/${seller._id}`} className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-xl flex items-center justify-center overflow-hidden shrink-0">
                  {seller.profileImage ? (
                    <img src={seller.profileImage} alt={seller.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{seller.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </Link>

                <div>
                  <Link to={`/profile/${seller._id}`} className="font-bold text-base text-slate-900 hover:text-indigo-600 transition block">
                    {seller.name}
                  </Link>
                  {seller.isVerifiedStudent && <VerifiedBadge size="sm" />}
                </div>
              </div>

              {seller.bio && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {seller.bio}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">College:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">{seller.collegeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Completed Gigs:</span>
                  <span className="font-semibold text-slate-800">{seller.completedOrders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Peer Rating:</span>
                  <span className="font-semibold text-slate-800">★ {seller.rating > 0 ? seller.rating.toFixed(1) : 'New'}</span>
                </div>
              </div>

              <Link
                to={`/profile/${seller._id}`}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition block text-center"
              >
                <span>View Full Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Services Section */}
        {similarServices.length > 0 && (
          <div className="pt-10 border-t border-slate-200 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Similar Gigs in {service.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarServices.map((sim) => (
                <ServiceCard key={sim._id} service={sim} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
