import React, { useState } from 'react';
import { Star, MessageSquare, Reply, CornerDownRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';
import * as reviewService from '../services/reviewService';

export default function ReviewCard({
  review,
  currentUserId,
  onReviewUpdated
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [errorReply, setErrorReply] = useState('');

  const buyer = review.buyerId || {};
  const isSeller = currentUserId && (
    (typeof review.sellerId === 'object' && review.sellerId?._id === currentUserId) ||
    review.sellerId === currentUserId
  );
  const hasReply = !!review.sellerReply?.message;

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setLoadingReply(true);
      setErrorReply('');
      const res = await reviewService.replyToReview(review._id, replyMessage.trim());
      if (onReviewUpdated) {
        onReviewUpdated(res.data?.review || res.data);
      }
      setShowReplyBox(false);
      setReplyMessage('');
    } catch (err) {
      setErrorReply(err.message || 'Failed to submit reply');
    } finally {
      setLoadingReply(false);
    }
  };

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  const replyDate = review.sellerReply?.repliedAt
    ? new Date(review.sellerReply.repliedAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 transition hover:border-slate-300">
      {/* Reviewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
            {buyer.profileImage ? (
              <img src={buyer.profileImage} alt={buyer.name} className="w-full h-full object-cover" />
            ) : (
              <span>{buyer.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm">{buyer.name || 'Student Buyer'}</span>
              {buyer.isVerifiedStudent && <VerifiedBadge size="sm" />}
            </div>
            {buyer.collegeName && (
              <p className="text-xs text-slate-400">{buyer.collegeName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-slate-400">{formattedDate}</span>
        </div>
      </div>

      {/* Review Comment */}
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {review.comment}
      </p>

      {/* Seller Reply Display */}
      {hasReply && (
        <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-slate-50/70 p-3.5 rounded-r-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-700 flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
              Response from Freelancer
            </span>
            <span className="text-slate-400 text-[11px]">{replyDate}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {review.sellerReply.message}
          </p>
        </div>
      )}

      {/* Reply Action for Seller */}
      {isSeller && !hasReply && (
        <div className="pt-2">
          {!showReplyBox ? (
            <button
              onClick={() => setShowReplyBox(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply to client</span>
            </button>
          ) : (
            <form onSubmit={handleSendReply} className="space-y-2.5 mt-2">
              <div className="relative">
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Thank the client or provide response to feedback..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>
              {errorReply && (
                <p className="text-xs text-rose-500">{errorReply}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyBox(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingReply}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  {loadingReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Post Reply</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
