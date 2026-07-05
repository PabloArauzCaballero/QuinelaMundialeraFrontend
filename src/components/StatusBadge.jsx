import React from 'react';
import { statusLabel } from '../utils/formatters';

const StatusBadge = ({ status }) => {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-sm py-xs text-[11px] font-extrabold uppercase tracking-wide text-on-primary shadow shadow-primary/20">
        <span className="h-1.5 w-1.5 rounded-full bg-on-primary animate-pulse" />
        {statusLabel(status)}
      </span>
    );
  }
  if (status === 'finished') {
    return <span className="inline-flex rounded-full bg-secondary-container px-sm py-xs text-[11px] font-extrabold uppercase tracking-wide text-on-secondary-container">Finalizado</span>;
  }
  if (status === 'postponed' || status === 'cancelled') {
    return <span className="inline-flex rounded-full bg-error-container px-sm py-xs text-[11px] font-extrabold uppercase tracking-wide text-on-error-container">{statusLabel(status)}</span>;
  }
  return <span className="inline-flex rounded-full bg-surface-container-high px-sm py-xs text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">{statusLabel(status)}</span>;
};

export default StatusBadge;
