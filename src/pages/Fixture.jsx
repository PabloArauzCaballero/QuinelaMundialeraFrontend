import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TeamBadge from '../components/TeamBadge';

const Fixture = () => {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({}); // { [matchId]: prediction }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  // Estados de los filtros
  const [phase, setPhase] = useState('all');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');

  // Modal de apuestas
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query params
      const params = {};
      if (phase !== 'all') params.phase = phase;
      if (status !== 'all') params.status = status;
      if (date) params.date = date;

      const [matchesRes, predictionsRes] = await Promise.all([
        api.get('/matches', { params }),
        api.get('/predictions/me')
      ]);

      setMatches(matchesRes.data);

      // Crear mapa de predicciones por matchId
      const predMap = {};
      predictionsRes.data.forEach((p) => {
        predMap[p.matchId] = p;
      });
      setPredictions(predMap);

    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el calendario y predicciones.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [phase, status, date]);

  const handleOpenPredictModal = (match) => {
    setSelectedMatch(match);
    const existing = predictions[match.id];
    if (existing) {
      setHomeScore(existing.predictedHomeScore);
      setAwayScore(existing.predictedAwayScore);
    } else {
      setHomeScore('');
      setAwayScore('');
    }
    setShowModal(true);
  };

  const handleSavePrediction = async (e) => {
    e.preventDefault();
    if (homeScore === '' || awayScore === '') {
      alert('Por favor ingrese ambos marcadores.');
      return;
    }

    setSaving(true);
    setError(null);
    setRequestId(null);

    const existing = predictions[selectedMatch.id];
    const scoreHome = parseInt(homeScore, 10);
    const scoreAway = parseInt(awayScore, 10);

    try {
      if (existing) {
        // Actualizar pronóstico existente
        await api.patch(`/predictions/${existing.id}`, {
          predictedHomeScore: scoreHome,
          predictedAwayScore: scoreAway
        });
      } else {
        // Crear nuevo pronóstico
        await api.post('/predictions', {
          matchId: selectedMatch.id,
          predictedHomeScore: scoreHome,
          predictedAwayScore: scoreAway
        });
      }

      // Recargar datos
      await loadData();
      setShowModal(false);
      alert('¡Pronóstico registrado exitosamente!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el pronóstico.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (statusValue) => {
    switch (statusValue) {
      case 'live':
        return (
          <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center gap-1 select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span> EN VIVO
          </span>
        );
      case 'finished':
        return (
          <span className="px-2 py-0.5 bg-[#10B981] text-white text-[10px] font-bold rounded-full select-none">
            FINALIZADO
          </span>
        );
      case 'postponed':
        return (
          <span className="px-2 py-0.5 bg-[#f59e0b] text-white text-[10px] font-bold rounded-full select-none">
            POSPUESTO
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full select-none">
            CANCELADO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant text-[10px] font-bold rounded-full select-none">
            PROGRAMADO
          </span>
        );
    }
  };

  const isClosed = (match) => {
    const isPast = new Date(match.startsAt) <= new Date();
    const isNotScheduled = match.status !== 'scheduled';
    return isPast || isNotScheduled;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header y Filtros */}
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-4">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-primary mb-1">Calendario de Encuentros</h2>
          <p className="font-body-sm text-on-surface-variant">Filtra y consulta los próximos encuentros de la Copa Mundial 2026.</p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-container-low border border-outline-variant p-3 rounded-xl shadow-sm">
          <div>
            <label className="block font-label-bold text-[10px] text-on-surface-variant uppercase mb-1">Fase del Torneo</label>
            <select 
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg text-xs py-1.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todas las Fases</option>
              <option value="group">Fase de Grupos</option>
              <option value="round_16">Octavos de Final</option>
              <option value="quarter_final">Cuartos de Final</option>
              <option value="semi_final">Semifinal</option>
              <option value="final">Final</option>
            </select>
          </div>

          <div>
            <label className="block font-label-bold text-[10px] text-on-surface-variant uppercase mb-1">Estado de Juego</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg text-xs py-1.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos los Estados</option>
              <option value="scheduled">Programados</option>
              <option value="live">En Vivo</option>
              <option value="finished">Finalizados</option>
              <option value="postponed">Pospuestos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div>
            <label className="block font-label-bold text-[10px] text-on-surface-variant uppercase mb-1">Filtrar por Fecha</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg text-xs py-1.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-lg flex gap-2">
          <span className="material-symbols-outlined">error</span>
          <div>
            <span>{error}</span>
            {requestId && <span className="block text-[10px] opacity-75">ID Soporte: {requestId}</span>}
          </div>
        </div>
      )}

      {/* Modal de Apuesta */}
      {showModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant p-6 rounded-xl max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-headline-md font-bold text-on-surface">Registrar Pronóstico</h4>
                <span className="font-label-bold text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {selectedMatch.phase} • Sede: {selectedMatch.stadium?.name}
                </span>
              </div>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePrediction} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 py-4 bg-surface-container-low border border-outline-variant rounded-lg">
                
                {/* Local */}
                <div className="w-1/3 flex justify-center">
                  <TeamBadge team={selectedMatch.homeTeam} layout="vertical" showFullName={true} />
                </div>

                {/* Inputs de marcador */}
                <div className="flex items-center gap-xs justify-center w-1/3">
                  <input 
                    className="score-input w-12 text-center font-headline-md text-xl font-bold border border-outline-variant rounded-md py-1 bg-surface-container-lowest focus:ring-2 focus:ring-primary" 
                    max="99" 
                    min="0" 
                    required
                    disabled={isClosed(selectedMatch)}
                    placeholder="-" 
                    type="number" 
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                  />
                  <span className="font-headline-md text-outline-variant font-bold">:</span>
                  <input 
                    className="score-input w-12 text-center font-headline-md text-xl font-bold border border-outline-variant rounded-md py-1 bg-surface-container-lowest focus:ring-2 focus:ring-primary" 
                    max="99" 
                    min="0" 
                    required
                    disabled={isClosed(selectedMatch)}
                    placeholder="-" 
                    type="number" 
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                  />
                </div>

                {/* Visitante */}
                <div className="w-1/3 flex justify-center">
                  <TeamBadge team={selectedMatch.awayTeam} layout="vertical" showFullName={true} />
                </div>
              </div>

              {isClosed(selectedMatch) && (
                <p className="text-xs text-error font-bold text-center">
                  Este partido ha sido cerrado para predicciones debido a que ya ha comenzado, está en vivo o ha sido suspendido.
                </p>
              )}

              <div className="flex justify-end gap-sm mt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 border border-outline-variant text-on-surface-variant text-xs font-label-bold rounded-lg hover:bg-surface-container-high"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving || isClosed(selectedMatch)}
                  className="py-2 px-4 bg-primary text-white text-xs font-label-bold rounded-lg hover:bg-primary-container disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Predicción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid de Partidos */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-lg bg-surface-container-low border border-outline-variant rounded-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">calendar_today</span>
          <p className="font-body-md text-on-surface-variant">No se encontraron encuentros con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => {
            const hasPrediction = !!predictions[match.id];
            const pred = predictions[match.id];
            const dateStr = new Date(match.startsAt).toLocaleDateString(undefined, { 
              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            return (
              <div key={match.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col gap-3 relative">
                
                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-center border-b border-outline-variant/50 pb-2">
                  <span className="text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">{match.phase}</span>
                  {getStatusBadge(match.status)}
                </div>

                {/* Marcadores e Información */}
                <div className="flex items-center justify-between">
                  {/* Local */}
                  <div className="w-5/12 flex items-center justify-start">
                    <TeamBadge team={match.homeTeam} layout="horizontal" showFullName={true} />
                  </div>

                  {/* Marcador Real */}
                  <div className="flex items-center justify-center font-bold text-lg w-2/12">
                    {match.status === 'live' || match.status === 'finished' ? (
                      <span>{match.score?.home} - {match.score?.away}</span>
                    ) : (
                      <span className="text-xs text-outline-variant select-none">VS</span>
                    )}
                  </div>

                  {/* Visitante */}
                  <div className="w-5/12 flex items-center justify-end text-right">
                    <TeamBadge team={match.awayTeam} layout="horizontal" showFullName={true} />
                  </div>
                </div>

                {/* Subinfo (Fecha y Apuesta Guardada) */}
                <div className="flex justify-between items-center text-xs mt-1 pt-2 border-t border-outline-variant/30">
                  <div className="text-on-surface-variant flex flex-col gap-0.5">
                    <span className="text-[10px]">{dateStr}</span>
                    {hasPrediction ? (
                      <span className="text-primary font-bold">
                        Tu Apuesta: {pred.predictedHomeScore} - {pred.predictedAwayScore}
                        {pred.status === 'void' && ' (Anulada)'}
                      </span>
                    ) : (
                      <span className="text-outline-variant text-[11px]">Sin pronosticar</span>
                    )}
                  </div>

                  <button 
                    onClick={() => handleOpenPredictModal(match)}
                    className={`py-1 px-3 rounded-lg text-xs font-label-bold transition-colors ${
                      isClosed(match)
                        ? 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:bg-surface-container-high cursor-default'
                        : 'bg-primary text-white hover:bg-primary-container'
                    }`}
                  >
                    {isClosed(match) ? 'Ver Detalles' : hasPrediction ? 'Modificar' : 'Pronosticar'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Fixture;
