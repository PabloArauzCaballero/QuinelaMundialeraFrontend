import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TeamBadge from '../components/TeamBadge';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  
  // Estado para capturar predicciones temporales en el dashboard
  const [predValues, setPredValues] = useState({}); // { [matchId]: { home: '', away: '' } }
  const [savingId, setSavingId] = useState(null);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/me');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos del dashboard.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleScoreChange = (matchId, side, value) => {
    setPredValues((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: value,
      },
    }));
  };

  const handleSavePrediction = async (matchId) => {
    const prediction = predValues[matchId];
    if (!prediction || prediction.home === '' || prediction.away === '') {
      alert('Por favor ingrese ambos marcadores.');
      return;
    }

    setSavingId(matchId);
    setError(null);
    setRequestId(null);

    try {
      await api.post('/predictions', {
        matchId,
        predictedHomeScore: parseInt(prediction.home, 10),
        predictedAwayScore: parseInt(prediction.away, 10),
      });

      // Remover el partido guardado de la lista del UI
      setData((prev) => ({
        ...prev,
        pendingPredictionsCount: Math.max(0, prev.pendingPredictionsCount - 1),
        upcomingMatches: prev.upcomingMatches.filter((m) => m.id !== matchId),
      }));

      alert('¡Predicción guardada con éxito!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la predicción.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si hay error al cargar datos iniciales
  if (error && !data) {
    return (
      <div className="p-4 bg-error-container text-on-error-container border border-error rounded-lg">
        <strong className="block mb-1">Error</strong>
        <span>{error}</span>
        {requestId && <span className="block text-xs opacity-75 mt-1">ID Soporte: {requestId}</span>}
        <button onClick={loadDashboardData} className="mt-2 text-sm underline font-bold">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Resumen con Estadísticas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-sm border-b border-outline-variant pb-4">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-primary mb-base">Tu Panel Principal</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">El torneo está en marcha. Realiza tus predicciones antes de cada pitazo inicial.</p>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm flex items-center gap-md shadow-sm">
          <div className="flex flex-col">
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Apuestas Pendientes</span>
            <span className="font-stat-value text-stat-value text-[#f59e0b]">{data?.pendingPredictionsCount || 0}</span>
          </div>
          <div className="w-px h-8 bg-outline-variant"></div>
          <div className="flex flex-col">
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Puntos Totales</span>
            <span className="font-stat-value text-stat-value text-primary">{data?.accumulatedPoints || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Alertas de error en operaciones */}
      {error && data && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-lg flex gap-2">
          <span className="material-symbols-outlined">error</span>
          <div>
            <span>{error}</span>
            {requestId && <span className="block text-[10px] opacity-75">ID Soporte: {requestId}</span>}
          </div>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg">
        
        {/* Columna Izquierda: Listado de Partidos Pendientes de Pronóstico */}
        <div className="lg:col-span-8 flex flex-col gap-md">
          <div className="flex justify-between items-center mb-xs">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Próximos Partidos por Pronosticar</h3>
            <button onClick={() => navigate('/fixture')} className="font-label-bold text-label-bold text-primary hover:underline text-xs">Ver Calendario Completo</button>
          </div>

          {data?.upcomingMatches?.length === 0 ? (
            <div className="p-lg bg-surface-container-low border border-outline-variant rounded-xl text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">sports_soccer</span>
              <p className="font-body-md text-on-surface-variant">¡Estás al día! No tienes predicciones pendientes de juego para los próximos encuentros.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data?.upcomingMatches?.map((match) => {
                const matchVal = predValues[match.id] || { home: '', away: '' };
                const startsDate = new Date(match.startsAt);
                return (
                  <div key={match.id} className="bento-card p-md relative overflow-hidden bg-surface-container-lowest border border-outline-variant rounded-xl">
                    <div className="absolute top-0 right-0 px-sm py-xs bg-[#10B981] text-white font-label-bold text-[10px] rounded-bl-lg flex items-center gap-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      {startsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {startsDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-center mb-2 pt-2">
                      <span className="font-label-bold text-[11px] text-on-surface-variant uppercase tracking-wider">{match.phase} • Sede: {match.stadium?.name}</span>
                    </div>

                    <div className="flex items-center justify-between px-2 md:px-6 py-2">
                      {/* Local */}
                      <div className="w-1/3 flex justify-center">
                        <TeamBadge team={match.homeTeam} layout="vertical" showFullName={true} />
                      </div>

                      {/* Inputs de marcador */}
                      <div className="flex items-center gap-xs justify-center w-1/3">
                        <input 
                          className="score-input w-12 text-center font-headline-md text-xl font-bold border border-outline-variant rounded-md py-1 bg-surface-container-lowest" 
                          max="99" 
                          min="0" 
                          placeholder="-" 
                          type="number" 
                          value={matchVal.home}
                          onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                        />
                        <span className="font-headline-md text-outline-variant font-bold">:</span>
                        <input 
                          className="score-input w-12 text-center font-headline-md text-xl font-bold border border-outline-variant rounded-md py-1 bg-surface-container-lowest" 
                          max="99" 
                          min="0" 
                          placeholder="-" 
                          type="number" 
                          value={matchVal.away}
                          onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                        />
                      </div>

                      {/* Visitante */}
                      <div className="w-1/3 flex justify-center">
                        <TeamBadge team={match.awayTeam} layout="vertical" showFullName={true} />
                      </div>
                    </div>

                    <div className="flex justify-end mt-2 pt-2 border-t border-outline-variant">
                      <button 
                        onClick={() => handleSavePrediction(match.id)}
                        disabled={savingId === match.id}
                        className="py-1 px-4 bg-primary text-white text-xs font-label-bold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
                      >
                        {savingId === match.id ? 'Guardando...' : 'Guardar Predicción'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Ranking en Mis Grupos */}
        <div className="lg:col-span-4 flex flex-col gap-md">
          <div className="flex justify-between items-center mb-xs">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Mis Clasificaciones</h3>
            <button onClick={() => navigate('/groups')} className="font-label-bold text-label-bold text-primary hover:underline text-xs">Mis Grupos</button>
          </div>

          <div className="bento-card p-md bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col gap-3">
            {data?.groupPositions?.length === 0 ? (
              <div className="text-center py-4">
                <p className="font-body-sm text-on-surface-variant mb-3">Aún no perteneces a ningún grupo de apuestas.</p>
                <button 
                  onClick={() => navigate('/groups')}
                  className="py-1.5 px-3 bg-secondary-container text-on-secondary-container rounded-lg font-label-bold text-xs hover:bg-[#ffc329] transition-colors"
                >
                  Unirme a un Grupo
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {data?.groupPositions?.map((item) => (
                  <div 
                    key={item.groupId} 
                    onClick={() => navigate(`/groups`)}
                    className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer border border-transparent hover:border-outline-variant"
                  >
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-headline-md text-sm">
                        {item.groupName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-label-bold text-xs text-on-surface">{item.groupName}</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-stat-value text-sm text-primary font-bold">#{item.position?.position || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
