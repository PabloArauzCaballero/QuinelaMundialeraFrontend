import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { asArray, getErrorInfo } from '../utils/formatters';

const Ranking = () => {
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rankingRes, groupsRes] = await Promise.allSettled([
        api.get('/leaderboard/me'),
        api.get('/groups'),
      ]);
      if (rankingRes.status === 'fulfilled') setRows(asArray(rankingRes.value.data));
      if (groupsRes.status === 'fulfilled') setGroups(asArray(groupsRes.value.data));
      if (rankingRes.status === 'rejected' && groupsRes.status === 'rejected') throw rankingRes.reason;
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar el ranking.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  if (loading) return <LoadingState label="Cargando ranking..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader eyebrow="Ranking" title="Clasificaciones" description="Atajo para revisar tu posición en cada grupo y acceder a tablas completas." />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadRanking} />
      {rows.length > 0 ? (
        <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item, index) => (
            <article key={item.groupId || index} className="rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">{item.groupName || 'Grupo'}</p>
              <div className="mt-sm flex items-end justify-between">
                <div>
                  <p className="text-5xl font-extrabold text-on-surface">#{item.position?.position || item.position || '-'}</p>
                  <p className="text-sm text-on-surface-variant">{item.points || item.totalPoints || 0} pts acumulados</p>
                </div>
                <Link to={`/groups/${item.groupId}/ranking`} className="rounded-lg bg-primary px-sm py-xs text-xs font-extrabold text-on-primary">Ver tabla</Link>
              </div>
            </article>
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <article key={group.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
              <h2 className="text-2xl font-extrabold text-on-surface">{group.name}</h2>
              <p className="mt-xs text-sm text-on-surface-variant">Accede a la clasificación completa de este grupo.</p>
              <Link to={`/groups/${group.id}/ranking`} className="mt-md inline-flex rounded-lg bg-primary px-sm py-xs text-xs font-extrabold text-on-primary">Ver ranking</Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon="leaderboard" title="Sin ranking disponible" description="Únete a un grupo para comenzar a competir." action={<Link to="/groups/new" className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Crear o unirse</Link>} />
      )}
    </div>
  );
};

export default Ranking;
