/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import MatchCard from '../components/MatchCard';
import PageHeader from '../components/PageHeader';
import PredictionModal from '../components/PredictionModal';
import StatCard from '../components/StatCard';
import { asArray, fullNameOf, getErrorInfo, sortByDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalRequestId, setModalRequestId] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      setRequestId(null);
      const [dashboardRes, matchesRes, predictionsRes, groupsRes] = await Promise.allSettled([
        api.get('/dashboard/me'),
        api.get('/matches', { params: { status: 'scheduled' } }),
        api.get('/predictions/me'),
        api.get('/groups'),
      ]);

      if (dashboardRes.status === 'fulfilled') setSummary(dashboardRes.value.data);
      if (matchesRes.status === 'fulfilled') setMatches(asArray(matchesRes.value.data));
      if (groupsRes.status === 'fulfilled') setGroups(asArray(groupsRes.value.data).filter((group) => group.status !== 'inactive'));
      if (predictionsRes.status === 'fulfilled') {
        const map = {};
        asArray(predictionsRes.value.data).forEach((prediction) => {
          map[prediction.matchId || prediction.match?.id] = prediction;
        });
        setPredictions(map);
      }

      const rejected = [dashboardRes, matchesRes, predictionsRes, groupsRes].find((result) => result.status === 'rejected');
      if (rejected && !summary && matches.length === 0) {
        const info = getErrorInfo(rejected.reason, 'Error al cargar el panel principal.');
        setError(info.message);
        setRequestId(info.requestId);
      }
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar el panel principal.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingMatches = useMemo(() => sortByDate(matches)
    .filter((match) => !predictions[match.id] && new Date(match.startsAt) > new Date())
    .slice(0, 4), [matches, predictions]);

  const rankingItems = useMemo(() => {
    const raw = asArray(summary?.groups || summary?.rankings || summary?.leaderboards);
    if (raw.length > 0) return raw.slice(0, 4);
    return groups.slice(0, 4).map((group) => ({ groupName: group.name, points: group.points || 0, position: group.position || '-' }));
  }, [summary, groups]);

  const savePrediction = async (payload) => {
    try {
      setSaving(true);
      setModalError(null);
      setModalRequestId(null);
      if (payload.predictionId) {
        await api.patch(`/predictions/${payload.predictionId}`, {
          predictedHomeScore: payload.predictedHomeScore,
          predictedAwayScore: payload.predictedAwayScore,
        });
      } else {
        await api.post('/predictions', {
          matchId: payload.matchId,
          predictedHomeScore: payload.predictedHomeScore,
          predictedAwayScore: payload.predictedAwayScore,
        });
      }
      setSelectedMatch(null);
      await loadDashboard();
    } catch (err) {
      const info = getErrorInfo(err, 'Error al guardar el pronóstico.');
      setModalError(info.message);
      setModalRequestId(info.requestId);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Preparando tu command center..." />;

  const totalPoints = summary?.accumulatedPoints ?? summary?.totalPoints ?? summary?.points ?? 0;
  const pendingCount = summary?.pendingPredictionsCount ?? pendingMatches.length;
  const predictedCount = summary?.predictionsCount ?? Object.keys(predictions).length;
  const bestRank = summary?.bestRank ?? summary?.globalRank ?? '-';

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Quiniela Mundial 2026"
        title={<>Hola, <span className="text-primary">{fullNameOf(user).split(' ')[0]}</span></>}
        description="Tu centro operativo para pronosticar partidos, revisar tus grupos y seguir tu rendimiento durante el torneo."
        actions={<button type="button" onClick={() => navigate('/fixture')} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Ir al calendario</button>}
      />

      <ErrorBanner error={error} requestId={requestId} onRetry={loadDashboard} />

      <section className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Puntos totales" value={totalPoints} helper="Acumulado personal" icon="emoji_events" />
        <StatCard label="Pendientes" value={pendingCount} helper="Partidos por pronosticar" icon="pending_actions" tone="blue" />
        <StatCard label="Pronósticos" value={predictedCount} helper="Marcadores registrados" icon="fact_check" />
        <StatCard label="Mejor ranking" value={bestRank === '-' ? '-' : `#${bestRank}`} helper="Entre tus grupos" icon="leaderboard" tone="blue" />
      </section>

      <section className="grid grid-cols-1 gap-lg xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="mb-md flex items-center justify-between gap-sm">
            <div>
              <h2 className="text-2xl font-extrabold text-on-surface md:text-3xl">Próximos partidos</h2>
              <p className="text-sm text-on-surface-variant">Registra tus marcadores antes del pitazo inicial.</p>
            </div>
            <Link to="/fixture" className="text-xs font-extrabold uppercase tracking-wide text-primary hover:underline">Ver todos</Link>
          </div>

          {pendingMatches.length === 0 ? (
            <EmptyState
              icon="check_circle"
              title="Estás al día"
              description="No tienes partidos pendientes de pronóstico por ahora. Revisa el calendario completo para ver resultados y próximos encuentros."
              action={<button type="button" onClick={() => navigate('/fixture')} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Abrir calendario</button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
              {pendingMatches.map((match) => (
                <MatchCard key={match.id} match={match} prediction={predictions[match.id]} onPredict={setSelectedMatch} />
              ))}
            </div>
          )}
        </div>

        <aside className="xl:col-span-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
            <div className="mb-md flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-on-surface">Mis grupos</h2>
                <p className="text-sm text-on-surface-variant">Clasificación rápida.</p>
              </div>
              <Link to="/groups" className="text-xs font-extrabold uppercase tracking-wide text-primary hover:underline">Abrir</Link>
            </div>

            {rankingItems.length === 0 ? (
              <EmptyState
                icon="group_add"
                title="Sin grupos"
                description="Crea o únete a un grupo para competir con tus amigos."
                action={<button type="button" onClick={() => navigate('/groups/new')} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Crear o unirse</button>}
              />
            ) : (
              <div className="flex flex-col gap-sm">
                {rankingItems.map((item, index) => {
                  const groupId = item.groupId || item.id;
                  return (
                    <button key={groupId || index} type="button" onClick={() => groupId && navigate(`/groups/${groupId}`)} className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container p-sm text-left hover:border-primary">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-on-surface">{item.groupName || item.name || 'Grupo'}</p>
                        <p className="text-xs font-bold text-primary">{item.points || item.totalPoints || 0} pts</p>
                      </div>
                      <span className="text-lg font-extrabold text-on-surface">#{item.position?.position || item.position || '-'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </section>

      <PredictionModal
        match={selectedMatch}
        prediction={selectedMatch ? predictions[selectedMatch.id] : null}
        saving={saving}
        error={modalError}
        requestId={modalRequestId}
        onClose={() => setSelectedMatch(null)}
        onSave={savePrediction}
      />
    </div>
  );
};

export default Dashboard;
