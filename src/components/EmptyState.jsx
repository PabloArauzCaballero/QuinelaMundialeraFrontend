import React from 'react';

const EmptyState = ({ icon = 'sports_soccer', title = 'Sin información', description, action }) => (
  <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-lg text-center shadow-inner">
    <span className="material-symbols-outlined text-[48px] text-primary">{icon}</span>
    <h3 className="mt-sm text-xl font-extrabold text-on-surface">{title}</h3>
    {description && <p className="mx-auto mt-xs max-w-xl text-sm text-on-surface-variant">{description}</p>}
    {action && <div className="mt-md">{action}</div>}
  </div>
);

export default EmptyState;
