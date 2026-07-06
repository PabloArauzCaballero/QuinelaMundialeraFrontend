/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAutoRefresh } from '../services/useAutoRefresh';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import PredictionModal from '../components/PredictionModal';
import FeedbackModal from '../components/FeedbackModal';
import { asArray, getErrorInfo, isMatchClosedForPrediction, sortByDate } from '../utils/formatters';

const RegisterPrediction = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [modalRequestId, setModalRequestId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      let selectedMatch = null;
      if (matchId === 'next') {
        const matchesRes = await api.get('/matches', { params: { status: 'scheduled' } });
        selectedMatch = sortByDate(asArray(matchesRes.data)).find((item) => new Date(item.startsAt) > new Date()) || null;
      } else {
        const matchRes = await api.get(`/matches/${matchId}`);
        selectedMatch = matchRes.data;
      }
      setMatch(selectedMatch);
      const predictionsRes = await api.get('/predictions/me');
      const existing = asArray(predictionsRes.data).find((item) => String(item.matchId || item.match?.id) === String(selectedMatch?.id));
      setPrediction(existing || null);
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar el formulario de pronóstico.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [matchId]);

  useAutoRefresh(loadData);

  const savePrediction = async (payload) => {
    try {
      setSaving(true);
      setModalError(null);
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
      setFeedback({ type: 'success', message: 'Tu pronóstico se guardó correctamente.' });
    } catch (err) {
      const info = getErrorInfo(err, 'Error al guardar el pronóstico.');
      setModalError(info.message);
      setModalRequestId(info.requestId);
      setFeedback({ type: 'error', message: info.message, requestId: info.requestId });
    } finally {
      setSaving(false);
    }
  };

  const closeFeedback = () => {
    const wasSuccess = feedback?.type === 'success';
    setFeedback(null);
    if (wasSuccess) navigate('/predictions');
  };

  if (loading) return <LoadingState label="Preparando registro de pronóstico..." />;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Registrar pronóstico"
        title="Define tu marcador"
        description="Guarda tu resultado antes de que el partido comience."
        actions={<Link to="/fixture" className="rounded-lg border border-outline-variant px-md py-sm text-sm font-extrabold text-on-surface-variant hover:bg-surface-container-high">Volver al calendario</Link>}
      />
      <ErrorBanner error={error} requestId={requestId} onRetry={loadData} />
      {!match ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-lg text-center text-on-surface-variant">No hay un próximo partido disponible para pronosticar.</div>
      ) : isMatchClosedForPrediction(match) ? (
        <div className="rounded-xl border border-error/50 bg-error-container/60 p-lg text-on-error-container">Este partido ya está cerrado para pronósticos.</div>
      ) : (
        <PredictionModal match={match} prediction={prediction} saving={saving} error={modalError} requestId={modalRequestId} onClose={() => navigate('/fixture')} onSave={savePrediction} />
      )}

      <FeedbackModal feedback={feedback} onClose={closeFeedback} />
    </div>
  );
};

export default RegisterPrediction;
