import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function VerifiedBadge({ size = 'md', className = '' }) {
  if (size === 'sm') {
    return (
      <span
        title="Verified Student with validated university credentials"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs ${className}`}
      >
        <GraduationCap className="w-3 h-3 text-emerald-600" />
        <span>Verified Student</span>
      </span>
    );
  }

  return (
    <span
      title="Verified Student with validated university credentials"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs ${className}`}
    >
      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
      <span>🎓 Verified Student</span>
    </span>
  );
}
