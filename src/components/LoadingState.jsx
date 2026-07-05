import React from 'react';

const LoadingState = ({ label = 'Cargando información...' }) => (
  <div className="min-h-[360px] flex flex-col items-center justify-center gap-sm text-on-surface-variant">
    <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    <span className="text-sm font-bold tracking-wide">{label}</span>
  </div>
);

export default LoadingState;
