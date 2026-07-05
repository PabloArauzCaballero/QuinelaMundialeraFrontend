/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { asArray, getErrorInfo } from '../utils/formatters';

const GroupRanking = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const [groupRes, leaderboardRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/leaderboard`),
      ]);
      setGroup(groupRes.data);
      setLeaderboard(asArray(leaderboardRes.data));
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar la clasificación.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [groupId]);

  if (loading) return <LoadingState label="Calculando clasificación..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Ranking del grupo"
        title={group?.name || 'Clasificación'}
        description="Tabla comparativa de puntos, pronósticos y posición de cada participante."
        actions={<Link to={`/groups/${groupId}`} className="rounded-lg border border-outline-variant px-md py-sm text-sm font-extrabold text-on-surface-variant hover:bg-surface-container-high">Volver al grupo</Link>}
      />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadRanking} />
      {leaderboard.length === 0 ? <EmptyState icon="leaderboard" title="Sin clasificación" description="Aún no hay puntos calculados para este grupo." /> : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-surface-container text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                <tr><th className="px-md py-sm">Posición</th><th>Participante</th><th className="text-center">Pronósticos</th><th className="text-center">Exactos</th><th className="text-right pr-md">Puntos</th></tr>
              </thead>
              <tbody>
                {leaderboard.map((item, index) => (
                  <tr key={item.userId || item.id || index} className="border-t border-outline-variant/60 hover:bg-surface-container">
                    <td className="px-md py-md"><span className="rounded-full bg-primary px-sm py-xs text-sm font-extrabold text-on-primary">#{item.position || index + 1}</span></td>
                    <td className="font-extrabold text-on-surface">{item.name || item.user?.name || item.user?.fullName || 'Participante'}</td>
                    <td className="text-center text-on-surface-variant">{item.predictionsCount || item.predictions || 0}</td>
                    <td className="text-center text-on-surface-variant">{item.exactScores || item.exacts || 0}</td>
                    <td className="pr-md text-right text-xl font-extrabold text-primary">{item.points || item.totalPoints || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupRanking;
