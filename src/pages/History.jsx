import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TeamBadge from '../components/TeamBadge';

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/predictions/me');
      setPredictions(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el historial de apuestas.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
  const totalPredicted = predictions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header e Historial Resumen */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-sm border-b border-outline-variant pb-4">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-primary mb-1">Tu Historial de Pronósticos</h2>
          <p className="font-body-sm text-on-surface-variant">Revisa tus predicciones guardadas y los puntos obtenidos en los partidos finalizados.</p>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex items-center gap-md shadow-sm">
          <div className="flex flex-col">
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Apuestas Hechas</span>
            <span className="font-stat-value text-stat-value text-primary">{totalPredicted}</span>
          </div>
          <div className="w-px h-8 bg-outline-variant"></div>
          <div className="flex flex-col">
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Puntos Acumulados</span>
            <span className="font-stat-value text-stat-value text-success">{totalPoints} pts</span>
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

      {/* Listado de Historial */}
      {predictions.length === 0 ? (
        <div className="p-lg bg-surface-container-low border border-outline-variant rounded-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">history</span>
          <p className="font-body-md text-on-surface-variant">Aún no has registrado ninguna apuesta en el fixture mundialista.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((p) => {
            const match = p.match;
            if (!match) return null;
            const startsDate = new Date(match.startsAt);
            const dateStr = startsDate.toLocaleDateString(undefined, { 
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            // Lógica de puntos ganados y badges
            const isMatchFinished = match.status === 'finished';
            const isMatchLive = match.status === 'live';
            const isMatchVoid = p.status === 'void';

            return (
              <div key={p.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col gap-3">
                
                {/* Cabecera de la apuesta */}
                <div className="flex justify-between items-center border-b border-outline-variant/50 pb-2">
                  <span className="text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">{match.phase} • {dateStr}</span>
                  <div>
                    {isMatchVoid ? (
                      <span className="px-2 py-0.5 bg-outline text-on-surface-variant text-[9px] font-bold rounded-full">ANULADO</span>
                    ) : isMatchFinished ? (
                      <span className="px-2 py-0.5 bg-success/20 text-[#10B981] text-[9px] font-bold rounded-full">FINALIZADO</span>
                    ) : isMatchLive ? (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-bold rounded-full">JUGANDO</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[9px] font-bold rounded-full">PENDIENTE</span>
                    )}
                  </div>
                </div>

                {/* Equipos y Marcadores */}
                <div className="flex items-center justify-between py-2">
                  {/* Local */}
                  <div className="w-5/12 flex items-center justify-start">
                    <TeamBadge team={match.homeTeam} layout="horizontal" showFullName={true} />
                  </div>

                  {/* Marcadores pronosticados vs marcadores reales */}
                  <div className="flex flex-col items-center justify-center w-2/12">
                    <span className="text-xs text-on-surface-variant font-label-bold">Apuesta</span>
                    <span className="font-bold text-md text-primary">{p.predictedHomeScore} - {p.predictedAwayScore}</span>
                    {isMatchFinished && (
                      <>
                        <span className="text-[9px] text-on-surface-variant uppercase mt-1">Real</span>
                        <span className="text-xs font-bold text-on-surface">{match.homeScore} - {match.awayScore}</span>
                      </>
                    )}
                  </div>

                  {/* Visitante */}
                  <div className="w-5/12 flex items-center justify-end text-right">
                    <TeamBadge team={match.awayTeam} layout="horizontal" showFullName={true} />
                  </div>
                </div>

                {/* Puntos Ganados */}
                <div className="flex justify-between items-center text-xs mt-1 pt-2 border-t border-outline-variant/30">
                  <span className="text-[10px] text-on-surface-variant">Puntos Ganados:</span>
                  <span className={`font-bold text-sm ${isMatchVoid ? 'text-on-surface-variant' : p.points > 0 ? 'text-[#10B981]' : 'text-primary'}`}>
                    {isMatchVoid ? '0 pts (Anulada)' : isMatchFinished ? `+${p.points || 0} pts` : 'Pendiente de cálculo'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default History;
