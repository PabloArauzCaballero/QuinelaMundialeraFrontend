import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import MatchCard from '../components/MatchCard';
import PageHeader from '../components/PageHeader';
import { asArray, getErrorInfo, sortByDate } from '../utils/formatters';

const AdminMatches = () => {
  const [teams, setTeams] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({ homeTeamId: '', awayTeamId: '', stadiumId: '', phase: 'group', startsAt: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsRes, stadiumsRes, matchesRes] = await Promise.all([
        api.get('/teams'),
        api.get('/stadiums'),
        api.get('/matches'),
      ]);
      setTeams(asArray(teamsRes.data));
      setStadiums(asArray(stadiumsRes.data));
      setMatches(sortByDate(asArray(matchesRes.data)));
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar datos de administración.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const canSubmit = useMemo(() => form.homeTeamId && form.awayTeamId && form.stadiumId && form.startsAt && form.homeTeamId !== form.awayTeamId, [form]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const createMatch = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      setCreating(true);
      setError(null);
      await api.post('/admin/matches', { ...form, startsAt: new Date(form.startsAt).toISOString() });
      setForm({ homeTeamId: '', awayTeamId: '', stadiumId: '', phase: 'group', startsAt: '' });
      await loadData();
    } catch (err) {
      const info = getErrorInfo(err, 'Error al registrar el partido.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setCreating(false);
    }
  };

  const runSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      await api.post('/admin/sync/run');
      await loadData();
    } catch (err) {
      const info = getErrorInfo(err, 'Error al ejecutar sincronización.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <LoadingState label="Cargando administración de partidos..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Admin partidos"
        title="Administración de encuentros"
        description="Crea partidos, revisa el fixture y ejecuta actualizaciones oficiales de resultados."
        actions={<button type="button" onClick={runSync} disabled={syncing} className="rounded-lg bg-secondary-container px-md py-sm text-sm font-extrabold text-on-secondary-container disabled:opacity-50">{syncing ? 'Sincronizando...' : 'Sincronizar resultados'}</button>}
      />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadData} />

      <form onSubmit={createMatch} className="grid grid-cols-1 gap-sm rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20 md:grid-cols-6">
        <select value={form.homeTeamId} onChange={(event) => updateField('homeTeamId', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-primary">
          <option value="">Equipo local</option>
          {teams.map((team) => <option key={team.id} value={team.id}>{team.name} ({team.fifaCode})</option>)}
        </select>
        <select value={form.awayTeamId} onChange={(event) => updateField('awayTeamId', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-primary">
          <option value="">Equipo visitante</option>
          {teams.map((team) => <option key={team.id} value={team.id}>{team.name} ({team.fifaCode})</option>)}
        </select>
        <select value={form.stadiumId} onChange={(event) => updateField('stadiumId', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-primary">
          <option value="">Sede</option>
          {stadiums.map((stadium) => <option key={stadium.id} value={stadium.id}>{stadium.name}</option>)}
        </select>
        <select value={form.phase} onChange={(event) => updateField('phase', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-primary">
          <option value="group">Fase de Grupos</option>
          <option value="round_16">Octavos</option>
          <option value="quarter_final">Cuartos</option>
          <option value="semi_final">Semifinal</option>
          <option value="final">Final</option>
        </select>
        <input type="datetime-local" value={form.startsAt} onChange={(event) => updateField('startsAt', event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-primary" />
        <button disabled={!canSubmit || creating} className="rounded-lg bg-primary px-sm py-sm text-xs font-extrabold uppercase tracking-wide text-on-primary disabled:opacity-50">{creating ? 'Guardando...' : 'Crear'}</button>
      </form>

      <section className="grid grid-cols-1 gap-md lg:grid-cols-2 2xl:grid-cols-3">
        {matches.map((match) => <MatchCard key={match.id} match={match} admin />)}
      </section>
    </div>
  );
};

export default AdminMatches;
