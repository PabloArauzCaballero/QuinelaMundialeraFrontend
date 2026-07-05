/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import TeamBadge from '../components/TeamBadge';
import { asArray, formatDateTime, getErrorInfo, matchTitle, phaseLabel, toDateTimeLocalValue } from '../utils/formatters';

const AdminMatchDetail = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [stadiums, setStadiums] = useState([]);
  const [form, setForm] = useState({ stadiumId: '', startsAt: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [matchRes, stadiumsRes] = await Promise.all([
        api.get(`/matches/${matchId}`),
        api.get('/stadiums'),
      ]);
      setMatch(matchRes.data);
      setStadiums(asArray(stadiumsRes.data));
      setForm({
        stadiumId: matchRes.data.stadium?.id || '',
        startsAt: toDateTimeLocalValue(matchRes.data.startsAt),
        status: matchRes.data.status || 'scheduled',
      });
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar detalle administrativo del partido.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [matchId]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        stadiumId: form.stadiumId,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        status: form.status,
      };
      await api.patch(`/admin/matches/${matchId}`, payload);
      await loadData();
    } catch (err) {
      const info = getErrorInfo(err, 'Error al guardar cambios del partido.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Cargando partido administrativo..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Detalle pro de partido"
        title={match ? matchTitle(match) : 'Partido'}
        description={match ? `${phaseLabel(match.phase)} • ${formatDateTime(match.startsAt)}` : 'Administración del encuentro'}
        actions={<Link to="/admin/matches" className="rounded-lg border border-outline-variant px-md py-sm text-sm font-extrabold text-on-surface-variant hover:bg-surface-container-high">Volver</Link>}
      />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadData} />
      {match && (
        <section className="grid grid-cols-1 gap-lg xl:grid-cols-12">
          <article className="xl:col-span-7 rounded-xl border border-outline-variant bg-surface-container-low p-lg shadow-lg shadow-black/20">
            <div className="mb-md flex justify-end"><StatusBadge status={match.status} /></div>
            <div className="flex items-center justify-between gap-md">
              <div className="w-5/12"><TeamBadge team={match.homeTeam} layout="vertical" showFullName /></div>
              <div className="w-2/12 text-center"><p className="font-headline-md text-[44px] font-extrabold text-primary">{match.homeScore !== null && match.homeScore !== undefined ? `${match.homeScore} - ${match.awayScore}` : 'VS'}</p></div>
              <div className="w-5/12"><TeamBadge team={match.awayTeam} layout="vertical" showFullName /></div>
            </div>
          </article>
          <form onSubmit={save} className="xl:col-span-5 rounded-xl border border-outline-variant bg-surface-container-low p-lg shadow-lg shadow-black/20">
            <h2 className="text-2xl font-extrabold text-on-surface">Reprogramación</h2>
            <label className="mt-md flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              Sede
              <select value={form.stadiumId} onChange={(event) => updateField('stadiumId', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm normal-case text-on-surface focus:border-primary focus:ring-primary">
                <option value="">Sin sede</option>
                {stadiums.map((stadium) => <option key={stadium.id} value={stadium.id}>{stadium.name}</option>)}
              </select>
            </label>
            <label className="mt-md flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              Fecha y hora
              <input type="datetime-local" value={form.startsAt} onChange={(event) => updateField('startsAt', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm normal-case text-on-surface focus:border-primary focus:ring-primary" />
            </label>
            <label className="mt-md flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              Estado
              <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm normal-case text-on-surface focus:border-primary focus:ring-primary">
                <option value="scheduled">Programado</option>
                <option value="live">En vivo</option>
                <option value="finished">Finalizado</option>
                <option value="postponed">Pospuesto</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </label>
            <button disabled={saving} className="mt-md w-full rounded-lg bg-primary py-sm text-sm font-extrabold uppercase tracking-wide text-on-primary disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          </form>
        </section>
      )}
    </div>
  );
};

export default AdminMatchDetail;
