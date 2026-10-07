import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';

export default function ServiceCard({ service }) {
  if (!service) return null;

  const seller = service.sellerId || {};
  const image = (service.images && service.images[0]) || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Gig Image Header */}
      <Link to={`/services/${service._id}`} className="relative h-48 w-full overflow-hidden bg-slate-100 block">
        <img
          src={image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-white shadow-xs">
            {service.category}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller Info Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Link
              to={`/profile/${seller._id || ''}`}
              className="flex items-center gap-2 group/seller hover:opacity-90 transition min-w-0"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                {seller.profileImage ? (
                  <img src={seller.profileImage} alt={seller.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{seller.name?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover/seller:text-indigo-600 transition truncate">
                {seller.name || 'Student Freelancer'}
              </span>
            </Link>

            {seller.isVerifiedStudent && (
              <span className="shrink-0" title="🎓 Verified Student">
                <VerifiedBadge size="sm" />
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/services/${service._id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
              {service.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold text-slate-900">
              {service.rating > 0 ? service.rating.toFixed(1) : 'New'}
            </span>
            <span className="text-slate-400">
              ({service.reviewCount || 0})
            </span>
            {service.ordersCount > 0 && (
              <span className="text-slate-400 ml-1">
                • {service.ordersCount} orders
              </span>
            )}
          </div>
        </div>

        {/* Footer Meta Row */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Delivery: {service.deliveryDays} {service.deliveryDays === 1 ? 'day' : 'days'}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block -mb-0.5">
              Starting at
            </span>
            <span className="text-base font-extrabold text-indigo-600">
              ₹{service.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
