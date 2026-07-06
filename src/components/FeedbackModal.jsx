import React from 'react';

const FeedbackModal = ({ feedback, onClose }) => {
  if (!feedback) return null;
  const { type, message, requestId } = feedback;
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-md backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface p-lg text-center shadow-2xl">
        <span
          className={`material-symbols-outlined mx-auto flex h-14 w-14 items-center justify-center rounded-full text-[32px] ${
            isSuccess ? 'bg-success/15 text-success' : 'bg-error-container text-on-error-container'
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isSuccess ? 'check_circle' : 'error'}
        </span>

        <h2 className="mt-md text-xl font-extrabold text-on-surface">
          {isSuccess ? '¡Listo!' : 'Algo salió mal'}
        </h2>
        <p className="mt-xs text-sm text-on-surface-variant">{message}</p>
        {requestId && !isSuccess && (
          <p className="mt-2 text-[11px] text-on-surface-variant opacity-70">ID de soporte: {requestId}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`mt-lg w-full rounded-lg px-md py-sm text-sm font-extrabold uppercase tracking-wide ${
            isSuccess ? 'bg-primary text-on-primary' : 'bg-error text-on-error'
          }`}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
