/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import TeamBadge from '../components/TeamBadge';
import StatCard from '../components/StatCard';
import { formatDateTime, getErrorInfo, matchTitle, phaseLabel } from '../utils/formatters';

const MatchDetail = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      const [matchRes, predictionsRes] = await Promise.allSettled([
        api.get(`/matches/${matchId}`),
        api.get('/predictions/me'),
      ]);
      if (matchRes.status === 'fulfilled') setMatch(matchRes.value.data);
      if (predictionsRes.status === 'fulfilled') {
        const found = Array.isArray(predictionsRes.value.data)
          ? predictionsRes.value.data.find((item) => String(item.matchId || item.match?.id) === String(matchId))
          : null;
        setPrediction(found || null);
      }
      if (matchRes.status === 'rejected') throw matchRes.reason;
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar el detalle del partido.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  if (loading) return <LoadingState label="Cargando detalle del partido..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Detalle de partido"
        title={match ? matchTitle(match) : 'Partido'}
        description={match ? `${phaseLabel(match.phase)} • ${formatDateTime(match.startsAt)}` : 'Información del encuentro'}
        actions={<Link to={`/matches/${matchId}/predict`} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Registrar pronóstico</Link>}
      />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadMatch} />
      {match && (
        <>
          <section className="rounded-xl border border-outline-variant bg-surface-container-low p-lg shadow-lg shadow-black/20">
            <div className="mb-md flex justify-end"><StatusBadge status={match.status} /></div>
            <div className="flex items-center justify-between gap-md">
              <div className="w-5/12"><TeamBadge team={match.homeTeam} layout="vertical" showFullName /></div>
              <div className="w-2/12 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Marcador</p>
                <p className="mt-xs font-headline-md text-[48px] font-extrabold text-primary">
                  {match.homeScore !== null && match.homeScore !== undefined ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
                </p>
              </div>
              <div className="w-5/12"><TeamBadge team={match.awayTeam} layout="vertical" showFullName /></div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-md md:grid-cols-3">
            <StatCard label="Fase" value={phaseLabel(match.phase)} icon="flag" />
            <StatCard label="Sede" value={match.stadium?.name || 'Pendiente'} helper={`${match.stadium?.city || ''} ${match.stadium?.country || ''}`} icon="stadium" tone="blue" />
            <StatCard label="Tu pronóstico" value={prediction ? `${prediction.predictedHomeScore}-${prediction.predictedAwayScore}` : 'Sin enviar'} helper={prediction ? `${prediction.points || 0} pts` : 'Disponible hasta el inicio'} icon="sports_score" />
          </section>
        </>
      )}
    </div>
  );
};

export default MatchDetail;
