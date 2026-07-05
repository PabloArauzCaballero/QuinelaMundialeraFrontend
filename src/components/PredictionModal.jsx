import React, { useEffect, useState } from 'react';
import TeamBadge from './TeamBadge';
import ErrorBanner from './ErrorBanner';
import { formatDateTime, isMatchClosedForPrediction, matchTitle, phaseLabel } from '../utils/formatters';

const PredictionModal = ({ match, prediction, saving, error, requestId, onClose, onSave }) => {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  useEffect(() => {
    setHomeScore(prediction?.predictedHomeScore ?? '');
    setAwayScore(prediction?.predictedAwayScore ?? '');
  }, [prediction, match?.id]);

  if (!match) return null;

  const closed = isMatchClosedForPrediction(match);

  const submit = (event) => {
    event.preventDefault();
    onSave?.({
      matchId: match.id,
      predictionId: prediction?.id,
      predictedHomeScore: Number(homeScore),
      predictedAwayScore: Number(awayScore),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-md backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-outline-variant bg-surface p-md shadow-2xl">
        <div className="mb-md flex items-start justify-between gap-md border-b border-outline-variant pb-sm">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">Registrar pronóstico</p>
            <h2 className="mt-xs text-2xl font-extrabold text-on-surface">{matchTitle(match)}</h2>
            <p className="mt-xs text-xs text-on-surface-variant">{phaseLabel(match.phase)} • {formatDateTime(match.startsAt)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-xs text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ErrorBanner error={error} requestId={requestId} />

        <form onSubmit={submit} className="mt-md flex flex-col gap-md">
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
            <div className="flex items-center justify-between gap-md">
              <div className="w-4/12"><TeamBadge team={match.homeTeam} layout="vertical" showFullName /></div>
              <div className="flex w-4/12 items-center justify-center gap-sm">
                <input
                  aria-label="Goles local"
                  className="h-16 w-16 rounded-lg border border-outline-variant bg-surface-container-lowest text-center text-3xl font-extrabold text-primary focus:border-primary focus:ring-primary disabled:opacity-40"
                  min="0"
                  max="99"
                  required
                  type="number"
                  disabled={closed || saving}
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                />
                <span className="text-2xl font-extrabold text-outline">-</span>
                <input
                  aria-label="Goles visitante"
                  className="h-16 w-16 rounded-lg border border-outline-variant bg-surface-container-lowest text-center text-3xl font-extrabold text-primary focus:border-primary focus:ring-primary disabled:opacity-40"
                  min="0"
                  max="99"
                  required
                  type="number"
                  disabled={closed || saving}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                />
              </div>
              <div className="w-4/12"><TeamBadge team={match.awayTeam} layout="vertical" showFullName /></div>
            </div>
          </div>

          {closed && (
            <p className="rounded-lg border border-error/50 bg-error-container/60 p-sm text-sm font-semibold text-on-error-container">
              Este partido ya no acepta pronósticos porque inició, está en vivo o fue cerrado.
            </p>
          )}

          <div className="flex justify-end gap-sm">
            <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-md py-sm text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">
              Cancelar
            </button>
            <button type="submit" disabled={closed || saving} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? 'Guardando...' : prediction ? 'Guardar cambios' : 'Guardar pronóstico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PredictionModal;
