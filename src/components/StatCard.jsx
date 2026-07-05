import React from 'react';

const StatCard = ({ label, value, helper, icon, tone = 'primary' }) => {
  const toneClass = tone === 'blue' ? 'text-secondary' : tone === 'danger' ? 'text-error' : 'text-primary';
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-md">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
          <p className={`mt-xs font-headline-md text-[40px] font-extrabold leading-none ${toneClass}`}>{value}</p>
          {helper && <p className="mt-xs text-xs font-semibold text-on-surface-variant">{helper}</p>}
        </div>
        {icon && <span className={`material-symbols-outlined text-[32px] ${toneClass}`}>{icon}</span>}
      </div>
    </div>
  );
};

export default StatCard;
