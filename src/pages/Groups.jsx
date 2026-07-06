import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAutoRefresh } from '../services/useAutoRefresh';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { asArray, getErrorInfo } from '../utils/formatters';

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      setRequestId(null);
      const response = await api.get('/groups');
      setGroups(asArray(response.data).filter((group) => group.status !== 'inactive'));
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar tus grupos.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useAutoRefresh(loadGroups);

  if (loading) return <LoadingState label="Cargando grupos..." />;

  const activeCount = groups.length;
  const ownerCount = groups.filter((group) => group.role === 'owner' || group.memberRole === 'owner' || group.ownerUserId).length;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Mis grupos"
        title="Competencias privadas"
        description="Crea quinielas privadas, únete con código de invitación y revisa la clasificación de cada grupo."
        actions={<Link to="/groups/new" className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Crear o unirse</Link>}
      />

      <ErrorBanner error={error} requestId={requestId} onRetry={loadGroups} />

      <section className="grid grid-cols-1 gap-md md:grid-cols-3">
        <StatCard label="Grupos activos" value={activeCount} icon="groups" />
        <StatCard label="Grupos creados" value={ownerCount} icon="verified_user" tone="blue" />
        <StatCard label="Modo" value="2026" helper="World Cup" icon="sports_soccer" />
      </section>

      {groups.length === 0 ? (
        <EmptyState
          icon="group_add"
          title="Todavía no perteneces a ningún grupo"
          description="Crea tu primera competencia o usa un código de invitación para sumarte a una quiniela existente."
          action={<Link to="/groups/new" className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Empezar ahora</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <article key={group.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20 hover:border-primary">
              <div className="flex items-start justify-between gap-md">
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">Grupo privado</p>
                  <h2 className="mt-xs truncate text-2xl font-extrabold text-on-surface">{group.name}</h2>
                  <p className="mt-xs text-sm text-on-surface-variant">{group.membersCount || group.memberCount || 0} participantes</p>
                </div>
                <span className="material-symbols-outlined text-[36px] text-secondary">groups</span>
              </div>
              <div className="mt-md grid grid-cols-2 gap-sm">
                <div className="rounded-lg bg-surface-container p-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Puntos</p>
                  <p className="text-xl font-extrabold text-primary">{group.points || group.totalPoints || 0}</p>
                </div>
                <div className="rounded-lg bg-surface-container p-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Posición</p>
                  <p className="text-xl font-extrabold text-on-surface">#{group.position || '-'}</p>
                </div>
              </div>
              <div className="mt-md flex gap-sm">
                <button type="button" onClick={() => navigate(`/groups/${group.id}`)} className="flex-1 rounded-lg bg-primary px-sm py-sm text-xs font-extrabold uppercase tracking-wide text-on-primary">Detalle</button>
                <button type="button" onClick={() => navigate(`/groups/${group.id}/ranking`)} className="rounded-lg border border-outline-variant px-sm py-sm text-xs font-extrabold uppercase tracking-wide text-on-surface-variant hover:bg-surface-container-high">Ranking</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
