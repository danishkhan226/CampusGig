import React, { useState } from 'react';
import { X, Star, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';
import * as reviewService from '../services/reviewService';

const RATING_LABELS = {
  1: 'Poor — Did not meet expectations',
  2: 'Fair — Some issues with delivery',
  3: 'Good — Met basic requirements',
  4: 'Very Good — High quality work',
  5: 'Exceptional — Outstanding work & communication'
};

export default function ReviewModal({
  isOpen,
  onClose,
  order,
  onReviewSubmitted
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 5) {
      setError('Please share at least 5 characters of feedback.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await reviewService.createReview({
        orderId: order._id,
        rating,
        comment: comment.trim()
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(res.data?.review || res.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Rate & Review Gig</h3>
              <p className="text-xs text-slate-500">
                Share your peer feedback for {order.sellerId?.name || 'the freelancer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Snapshot Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 truncate max-w-[280px]">
              {order.serviceSnapshot?.title}
            </span>
            <span className="font-bold text-indigo-600">
              ₹{order.amount?.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Star Selection */}
          <div className="text-center space-y-2 py-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Overall Rating
            </label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                interactive={true}
                size="lg"
                onChange={(val) => setRating(val)}
              />
            </div>
            <p className="text-xs font-semibold text-amber-600 min-h-[1.25rem]">
              {RATING_LABELS[rating]}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Detailed Feedback</label>
              <span className="text-slate-400">{comment.length}/1000</span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the communication, work quality, and delivery speed? Constructive feedback helps our campus community thrive..."
              className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none placeholder:text-slate-400"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
