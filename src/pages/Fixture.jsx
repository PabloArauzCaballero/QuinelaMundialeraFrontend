/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAutoRefresh } from '../services/useAutoRefresh';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import MatchCard from '../components/MatchCard';
import PageHeader from '../components/PageHeader';
import PredictionModal from '../components/PredictionModal';
import FeedbackModal from '../components/FeedbackModal';
import { asArray, getErrorInfo, groupByDate, sortByDate } from '../utils/formatters';

const Fixture = () => {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [phase, setPhase] = useState('all');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalRequestId, setModalRequestId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRequestId(null);
      const params = {};
      if (phase !== 'all') params.phase = phase;
      if (status !== 'all') params.status = status;
      if (date) params.date = date;
      const [matchesRes, predictionsRes] = await Promise.all([
        api.get('/matches', { params }),
        api.get('/predictions/me'),
      ]);
      setMatches(sortByDate(asArray(matchesRes.data)));
      const map = {};
      asArray(predictionsRes.data).forEach((prediction) => {
        map[prediction.matchId || prediction.match?.id] = prediction;
      });
      setPredictions(map);
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar el calendario.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [phase, status, date]);

  useAutoRefresh(loadData);

  const matchesByDate = useMemo(() => groupByDate(matches), [matches]);

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
      setFeedback({ type: 'success', message: 'Tu pronóstico se guardó correctamente.' });
      await loadData();
    } catch (err) {
      const info = getErrorInfo(err, 'Error al guardar el pronóstico.');
      setModalError(info.message);
      setModalRequestId(info.requestId);
      setFeedback({ type: 'error', message: info.message, requestId: info.requestId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Cargando calendario mundialista..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Calendario"
        title="Partidos del Mundial"
        description="Consulta cada encuentro, revisa estados y registra tus pronósticos desde una vista limpia de calendario."
      />

      <section className="grid grid-cols-1 gap-sm rounded-xl border border-outline-variant bg-surface-container-low p-md md:grid-cols-4">
        <label className="flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          Fase
          <select value={phase} onChange={(event) => setPhase(event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm normal-case text-on-surface focus:border-primary focus:ring-primary">
            <option value="all">Todas</option>
            <option value="group">Fase de Grupos</option>
            <option value="round_16">Octavos</option>
            <option value="quarter_final">Cuartos</option>
            <option value="semi_final">Semifinal</option>
            <option value="final">Final</option>
          </select>
        </label>
        <label className="flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          Estado
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm normal-case text-on-surface focus:border-primary focus:ring-primary">
            <option value="all">Todos</option>
            <option value="scheduled">Programados</option>
            <option value="live">En vivo</option>
            <option value="finished">Finalizados</option>
            <option value="postponed">Pospuestos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </label>
        <label className="flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          Fecha
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm normal-case text-on-surface focus:border-primary focus:ring-primary" />
        </label>
        <div className="flex items-end">
          <button type="button" onClick={() => { setPhase('all'); setStatus('all'); setDate(''); }} className="w-full rounded-lg border border-outline-variant px-md py-[11px] text-sm font-extrabold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
            Limpiar filtros
          </button>
        </div>
      </section>

      <ErrorBanner error={error} requestId={requestId} onRetry={loadData} />

      {matches.length === 0 ? (
        <EmptyState icon="calendar_month" title="Sin partidos para mostrar" description="No hay encuentros que coincidan con los filtros seleccionados." />
      ) : (
        <div className="flex flex-col gap-lg">
          {Object.entries(matchesByDate).map(([dateKey, dateMatches]) => (
            <section key={dateKey} className="flex flex-col gap-md">
              <div className="flex items-center gap-sm border-b border-outline-variant pb-sm">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <h2 className="text-2xl font-extrabold capitalize text-on-surface">{dateKey}</h2>
              </div>
              <div className="grid grid-cols-1 gap-md lg:grid-cols-2 2xl:grid-cols-3">
                {dateMatches.map((match) => (
                  <MatchCard key={match.id} match={match} prediction={predictions[match.id]} onPredict={setSelectedMatch} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <PredictionModal
        match={selectedMatch}
        prediction={selectedMatch ? predictions[selectedMatch.id] : null}
        saving={saving}
        error={modalError}
        requestId={modalRequestId}
        onClose={() => setSelectedMatch(null)}
        onSave={savePrediction}
      />

      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
    </div>
  );
};

export default Fixture;
