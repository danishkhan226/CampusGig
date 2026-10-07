import React from 'react';

/**
 * Reusable skeleton shimmer blocks
 */
function Shimmer({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%] rounded-xl ${className}`}
      style={{ backgroundSize: '400% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }}
    />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
      <Shimmer className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shimmer className="w-7 h-7 rounded-full" />
          <Shimmer className="h-3 w-28 rounded-lg" />
        </div>
        <Shimmer className="h-4 w-full rounded-lg" />
        <Shimmer className="h-3 w-3/4 rounded-lg" />
        <div className="flex items-center justify-between pt-2">
          <Shimmer className="h-4 w-16 rounded-lg" />
          <Shimmer className="h-4 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ServiceDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Shimmer className="h-8 w-3/4 rounded-xl" />
        <Shimmer className="h-64 w-full rounded-2xl" />
        <div className="space-y-3">
          <Shimmer className="h-4 w-full rounded-lg" />
          <Shimmer className="h-4 w-full rounded-lg" />
          <Shimmer className="h-4 w-2/3 rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        <Shimmer className="h-52 w-full rounded-2xl" />
        <Shimmer className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4 w-3/4 rounded-lg" />
          <Shimmer className="h-3 w-1/2 rounded-lg" />
        </div>
        <Shimmer className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <Shimmer className="h-3 w-24 rounded-lg" />
        <Shimmer className="h-3 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl p-8 space-y-6">
        <div className="flex items-start gap-6">
          <Shimmer className="w-24 h-24 rounded-3xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Shimmer className="h-6 w-48 rounded-xl" />
            <Shimmer className="h-4 w-32 rounded-lg" />
            <Shimmer className="h-3 w-56 rounded-lg" />
            <div className="flex gap-2 pt-1">
              <Shimmer className="h-6 w-16 rounded-full" />
              <Shimmer className="h-6 w-20 rounded-full" />
              <Shimmer className="h-6 w-14 rounded-full" />
            </div>
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <Shimmer className="h-3 w-full rounded-lg" />
          <Shimmer className="h-3 w-full rounded-lg" />
          <Shimmer className="h-3 w-2/3 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Shimmer key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex h-full gap-0">
      <div className="w-80 border-r border-slate-200 bg-white p-4 space-y-3">
        <Shimmer className="h-9 w-full rounded-xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-3/4 rounded-lg" />
              <Shimmer className="h-2.5 w-1/2 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-slate-50 p-6 flex flex-col justify-end gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <Shimmer className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
          </div>
        ))}
        <Shimmer className="h-12 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

export default Shimmer;
