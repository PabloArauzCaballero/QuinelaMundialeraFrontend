import React from 'react';
import { Link } from 'react-router-dom';
import TeamBadge from './TeamBadge';
import StatusBadge from './StatusBadge';
import { formatDateTime, isMatchClosedForPrediction, phaseLabel } from '../utils/formatters';

const MatchCard = ({ match, prediction, onPredict, compact = false, admin = false }) => {
  const closed = isMatchClosedForPrediction(match);
  const hasScore = match?.homeScore !== null && match?.homeScore !== undefined && match?.awayScore !== null && match?.awayScore !== undefined;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20 transition hover:border-primary/80 hover:bg-surface-container">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition group-hover:opacity-100" />
      <div className="mb-md flex items-start justify-between gap-sm">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.18em] text-on-surface-variant">
            {phaseLabel(match?.phase)} • {match?.stadium?.name || 'Sede por confirmar'}
          </p>
          <p className="mt-xs text-xs font-semibold text-on-surface-variant">{formatDateTime(match?.startsAt)}</p>
        </div>
        <StatusBadge status={match?.status} />
      </div>

      <div className="flex items-center justify-between gap-md">
        <div className="w-5/12"><TeamBadge team={match?.homeTeam} layout="vertical" showFullName={!compact} /></div>
        <div className="flex w-2/12 flex-col items-center justify-center">
          {hasScore ? (
            <span className="font-headline-md text-[34px] font-extrabold text-primary">{match.homeScore} - {match.awayScore}</span>
          ) : (
            <span className="font-headline-md text-[28px] font-extrabold text-on-surface">VS</span>
          )}
          {prediction && (
            <span className="mt-xs rounded-full bg-primary/10 px-xs py-[2px] text-[10px] font-bold text-primary">
              Tu pronóstico: {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
            </span>
          )}
        </div>
        <div className="w-5/12"><TeamBadge team={match?.awayTeam} layout="vertical" showFullName={!compact} /></div>
      </div>

      <div className="mt-md flex flex-wrap items-center justify-between gap-sm border-t border-outline-variant/60 pt-sm">
        <Link to={admin ? `/admin/matches/${match?.id}` : `/matches/${match?.id}`} className="rounded-lg border border-secondary-container px-sm py-xs text-xs font-extrabold text-secondary hover:bg-secondary-container hover:text-on-secondary-container">
          Ver detalle
        </Link>
        {!admin && (
          <button
            type="button"
            disabled={closed}
            onClick={() => onPredict?.(match)}
            className="rounded-lg bg-primary px-md py-xs text-xs font-extrabold uppercase tracking-wide text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {prediction ? 'Modificar pronóstico' : 'Pronosticar'}
          </button>
        )}
      </div>
    </article>
  );
};

export default MatchCard;
