/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import TeamBadge from '../components/TeamBadge';
import StatusBadge from '../components/StatusBadge';
import { asArray, formatDateTime, getErrorInfo } from '../utils/formatters';

const GroupPredictions = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [groupRes, predictionsRes] = await Promise.allSettled([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/predictions`),
      ]);
      if (groupRes.status === 'fulfilled') setGroup(groupRes.value.data);
      if (predictionsRes.status === 'fulfilled') setRows(asArray(predictionsRes.value.data));
      if (predictionsRes.status === 'rejected') {
        const fallback = await api.get('/predictions/me');
        setRows(asArray(fallback.data));
      }
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar pronósticos del grupo.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, [groupId]);

  if (loading) return <LoadingState label="Cargando pronósticos del grupo..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Pronósticos del grupo"
        title={group?.name || 'Pronósticos'}
        description="Consulta los marcadores enviados por los participantes y el estado de cada partido."
        actions={<Link to={`/groups/${groupId}`} className="rounded-lg border border-outline-variant px-md py-sm text-sm font-extrabold text-on-surface-variant hover:bg-surface-container-high">Volver al grupo</Link>}
      />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadPredictions} />
      {rows.length === 0 ? <EmptyState icon="fact_check" title="Sin pronósticos visibles" description="Aún no hay pronósticos para mostrar en este grupo." /> : (
        <div className="grid grid-cols-1 gap-md xl:grid-cols-2">
          {rows.map((prediction) => {
            const match = prediction.match;
            return (
              <article key={prediction.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
                <div className="mb-sm flex items-start justify-between gap-sm border-b border-outline-variant pb-sm">
                  <div>
                    <p className="text-sm font-extrabold text-on-surface">{prediction.user?.name || prediction.user?.fullName || prediction.userName || 'Participante'}</p>
                    <p className="text-xs text-on-surface-variant">{formatDateTime(match?.startsAt)}</p>
                  </div>
                  <StatusBadge status={match?.status || prediction.status} />
                </div>
                <div className="flex items-center justify-between gap-sm">
                  <div className="w-5/12"><TeamBadge team={match?.homeTeam} layout="horizontal" /></div>
                  <div className="w-2/12 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Pronóstico</p>
                    <p className="text-xl font-extrabold text-primary">{prediction.predictedHomeScore} - {prediction.predictedAwayScore}</p>
                    {match?.status === 'finished' && <p className="text-xs font-bold text-on-surface">Real: {match.homeScore} - {match.awayScore}</p>}
                  </div>
                  <div className="w-5/12"><TeamBadge team={match?.awayTeam} layout="horizontal" /></div>
                </div>
                <div className="mt-sm border-t border-outline-variant pt-sm text-right text-sm font-extrabold text-primary">{prediction.points || 0} pts</div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupPredictions;
