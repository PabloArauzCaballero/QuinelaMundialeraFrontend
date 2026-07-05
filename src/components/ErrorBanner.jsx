import React from 'react';

const ErrorBanner = ({ error, requestId, onRetry }) => {
  if (!error) return null;
  return (
    <div className="rounded-xl border border-error/60 bg-error-container/80 p-md text-on-error-container shadow-lg shadow-black/20">
      <div className="flex gap-sm">
        <span className="material-symbols-outlined text-error">error</span>
        <div className="min-w-0 flex-1">
          <strong className="block text-sm">No pudimos completar la operación</strong>
          <p className="mt-1 text-sm opacity-90">{error}</p>
          {requestId && <span className="mt-2 block text-[11px] opacity-70">ID de soporte: {requestId}</span>}
          {onRetry && (
            <button type="button" onClick={onRetry} className="mt-sm rounded-lg border border-error/40 px-sm py-xs text-xs font-bold hover:bg-error/10">
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;
