import React, { useEffect, useState } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TeamBadge from '../components/TeamBadge';
import { asArray, formatDateTime, getErrorInfo, sortByDate } from '../utils/formatters';

const MyPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/predictions/me');
      setPredictions(sortByDate(asArray(response.data), 'createdAt'));
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar tus pronósticos.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  if (loading) return <LoadingState label="Cargando tus pronósticos..." />;

  const totalPoints = predictions.reduce((sum, prediction) => sum + Number(prediction.points || 0), 0);
  const finished = predictions.filter((prediction) => prediction.match?.status === 'finished').length;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader eyebrow="Mis pronósticos" title="Historial y resultados" description="Revisa todos tus marcadores guardados y los puntos obtenidos cuando los partidos terminan." />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadPredictions} />
      <section className="grid grid-cols-1 gap-md md:grid-cols-3">
        <StatCard label="Registrados" value={predictions.length} icon="fact_check" />
        <StatCard label="Puntos" value={totalPoints} icon="emoji_events" />
        <StatCard label="Finalizados" value={finished} icon="done_all" tone="blue" />
      </section>
      {predictions.length === 0 ? <EmptyState icon="sports_soccer" title="Aún no tienes pronósticos" description="Ingresa al calendario y registra marcadores para comenzar a competir." /> : (
        <div className="grid grid-cols-1 gap-md xl:grid-cols-2">
          {predictions.map((prediction) => {
            const match = prediction.match;
            return (
              <article key={prediction.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
                <div className="mb-sm flex items-start justify-between gap-sm border-b border-outline-variant pb-sm">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">{formatDateTime(match?.startsAt)}</p>
                    <p className="mt-xs text-sm font-bold text-on-surface-variant">{match?.stadium?.name || 'Sede pendiente'}</p>
                  </div>
                  <StatusBadge status={match?.status || prediction.status} />
                </div>
                <div className="flex items-center justify-between gap-sm">
                  <div className="w-5/12"><TeamBadge team={match?.homeTeam} layout="horizontal" /></div>
                  <div className="w-2/12 text-center">
                    {prediction.status === 'void' ? (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Anulado</p>
                        <p className="text-xl font-extrabold text-red-400">---</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Tu marcador</p>
                        <p className="text-xl font-extrabold text-primary">{prediction.predictedHomeScore} - {prediction.predictedAwayScore}</p>
                      </>
                    )}
                    {match?.status === 'finished' && <p className="text-xs font-bold text-on-surface">Real: {match.homeScore} - {match.awayScore}</p>}
                  </div>
                  <div className="w-5/12"><TeamBadge team={match?.awayTeam} layout="horizontal" /></div>
                </div>
                <div className="mt-sm flex items-center justify-between border-t border-outline-variant pt-sm">
                  <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Puntos</span>
                  {prediction.status === 'void' ? (
                    <span className="text-lg font-extrabold text-red-400">0 pts (anulado)</span>
                  ) : (
                    <span className="text-lg font-extrabold text-primary">{prediction.points || 0} pts</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPredictions;
