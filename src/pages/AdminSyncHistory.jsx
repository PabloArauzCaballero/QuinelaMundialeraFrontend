import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAutoRefresh } from '../services/useAutoRefresh';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { asArray, formatDateTime, getErrorInfo } from '../utils/formatters';

const AdminSyncHistory = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/sync/runs');
      setRuns(asArray(response.data));
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar historial de sincronización.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  useAutoRefresh(loadRuns);

  const runSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      await api.post('/admin/sync/run');
      await loadRuns();
    } catch (err) {
      const info = getErrorInfo(err, 'Error al ejecutar sincronización.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <LoadingState label="Cargando historial de sincronización..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Historial de sincronización"
        title="Actualizaciones oficiales"
        description="Controla cuándo se ejecutaron las sincronizaciones, su estado y mensajes de resultado."
        actions={<button type="button" onClick={runSync} disabled={syncing} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary disabled:opacity-50">{syncing ? 'Ejecutando...' : 'Ejecutar ahora'}</button>}
      />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadRuns} />
      {runs.length === 0 ? <EmptyState icon="sync" title="Sin ejecuciones registradas" description="Ejecuta una sincronización para crear el primer registro de auditoría." /> : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-surface-container text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                <tr><th className="px-md py-sm">Inicio</th><th>Fin</th><th>Estado</th><th>Actualizados</th><th className="pr-md">Mensaje</th></tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-outline-variant/60 hover:bg-surface-container">
                    <td className="px-md py-md text-sm font-bold text-on-surface">{formatDateTime(run.startedAt || run.createdAt)}</td>
                    <td className="text-sm text-on-surface-variant">{formatDateTime(run.finishedAt)}</td>
                    <td><StatusBadge status={run.status === 'success' ? 'finished' : run.status === 'failed' ? 'cancelled' : 'live'} /></td>
                    <td className="text-sm font-extrabold text-primary">{run.updatedMatches || run.matchesUpdated || 0}</td>
                    <td className="pr-md text-sm text-on-surface-variant">{run.message || run.errorMessage || 'Sin mensaje'}</td>
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

export default AdminSyncHistory;
