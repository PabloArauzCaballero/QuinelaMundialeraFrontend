import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
  const [teams, setTeams] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [matches, setMatches] = useState([]);
  const [syncRuns, setSyncRuns] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  // Formulario: Crear Partido
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [stadiumId, setStadiumId] = useState('');
  const [phase, setPhase] = useState('group');
  const [startsAt, setStartsAt] = useState('');
  const [creating, setCreating] = useState(false);

  // Formulario: Editar/Reprogramar Partido
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [editStadiumId, setEditStadiumId] = useState('');
  const [editStartsAt, setEditStartsAt] = useState('');
  const [updating, setUpdating] = useState(false);

  // Sincronización
  const [syncing, setSyncing] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsRes, stadiumsRes, matchesRes, syncRunsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/stadiums'),
        api.get('/matches'),
        api.get('/admin/sync/runs')
      ]);

      setTeams(teamsRes.data);
      setStadiums(stadiumsRes.data);
      setMatches(matchesRes.data);
      setSyncRuns(syncRunsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos de administración.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || !stadiumId || !startsAt) {
      alert('Por favor complete todos los campos del partido.');
      return;
    }

    if (homeTeamId === awayTeamId) {
      alert('El equipo local no puede ser igual al equipo visitante.');
      return;
    }

    setCreating(true);
    setError(null);
    setRequestId(null);

    try {
      await api.post('/admin/matches', {
        homeTeamId,
        awayTeamId,
        stadiumId,
        phase,
        startsAt: new Date(startsAt).toISOString()
      });

      // Resetear campos
      setHomeTeamId('');
      setAwayTeamId('');
      setStadiumId('');
      setStartsAt('');
      
      alert('¡Partido registrado con éxito!');
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el partido.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateMatch = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) {
      alert('Por favor seleccione un partido a modificar.');
      return;
    }

    setUpdating(true);
    setError(null);
    setRequestId(null);

    const payload = {};
    if (editStadiumId) payload.stadiumId = editStadiumId;
    if (editStartsAt) payload.startsAt = new Date(editStartsAt).toISOString();

    try {
      await api.patch(`/admin/matches/${selectedMatchId}`, payload);
      
      setSelectedMatchId('');
      setEditStadiumId('');
      setEditStartsAt('');

      alert('¡Partido reprogramado con éxito!');
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el partido.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setUpdating(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setError(null);
    setRequestId(null);
    try {
      const response = await api.post('/admin/sync/run');
      alert(`Sincronización finalizada con éxito. Marcadores actualizados.`);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al ejecutar la sincronización de resultados.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setSyncing(false);
    }
  };

  // Cargar info del partido seleccionado para edición rápida
  useEffect(() => {
    if (selectedMatchId) {
      const match = matches.find((m) => m.id === selectedMatchId);
      if (match) {
        setEditStadiumId(match.stadium?.id || '');
        // Formatear fecha para datetime-local input (YYYY-MM-DDTHH:MM)
        const d = new Date(match.startsAt);
        const pad = (n) => n.toString().padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setEditStartsAt(formatted);
      }
    } else {
      setEditStadiumId('');
      setEditStartsAt('');
    }
  }, [selectedMatchId]);

  if (loading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Cabecera */}
      <div className="border-b border-outline-variant pb-2">
        <h2 className="font-display-lg text-display-lg font-bold text-[#ef4444] mb-1">Panel de Administración</h2>
        <p className="font-body-sm text-on-surface-variant">Registra nuevos encuentros, reprograma partidos y ejecuta la sincronización oficial de resultados.</p>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-lg flex gap-2">
          <span className="material-symbols-outlined">error</span>
          <div>
            <span>{error}</span>
            {requestId && <span className="block text-[10px] opacity-75">ID Soporte: {requestId}</span>}
          </div>
        </div>
      )}

      {/* Dos Columnas del Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Crear Partido y Reprogramar */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Formulario Crear Partido */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-md font-bold text-on-surface mb-4">Registrar Nuevo Partido</h3>
            <form onSubmit={handleCreateMatch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block font-label-bold text-xs text-on-surface mb-1">Equipo Local</label>
                <select 
                  value={homeTeamId} 
                  onChange={(e) => setHomeTeamId(e.target.value)} 
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccione equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.fifaCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-bold text-xs text-on-surface mb-1">Equipo Visitante</label>
                <select 
                  value={awayTeamId} 
                  onChange={(e) => setAwayTeamId(e.target.value)} 
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccione equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.fifaCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-bold text-xs text-on-surface mb-1">Estadio Sede</label>
                <select 
                  value={stadiumId} 
                  onChange={(e) => setStadiumId(e.target.value)} 
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccione sede...</option>
                  {stadiums.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - {s.city}, {s.country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-bold text-xs text-on-surface mb-1">Fase del Torneo</label>
                <select 
                  value={phase} 
                  onChange={(e) => setPhase(e.target.value)} 
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                >
                  <option value="group">Fase de Grupos</option>
                  <option value="round_16">Octavos de Final</option>
                  <option value="quarter_final">Cuartos de Final</option>
                  <option value="semi_final">Semifinal</option>
                  <option value="final">Final</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-label-bold text-xs text-on-surface mb-1">Fecha y Hora de Inicio</label>
                <input 
                  type="datetime-local" 
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="sm:col-span-2 mt-2 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container disabled:opacity-50 transition-colors"
              >
                {creating ? 'Registrando...' : 'Registrar Partido'}
              </button>
            </form>
          </div>

          {/* Formulario Reprogramar Partido */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-md font-bold text-on-surface mb-4">Reprogramar / Modificar Sede</h3>
            <form onSubmit={handleUpdateMatch} className="flex flex-col gap-4">
              
              <div>
                <label className="block font-label-bold text-xs text-on-surface mb-1">Seleccionar Partido</label>
                <select 
                  value={selectedMatchId} 
                  onChange={(e) => setSelectedMatchId(e.target.value)} 
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccione un partido del fixture...</option>
                  {matches.map((m) => {
                    const dateStr = new Date(m.startsAt).toLocaleDateString();
                    return (
                      <option key={m.id} value={m.id}>
                        {m.homeTeam?.fifaCode} vs {m.awayTeam?.fifaCode} ({dateStr} - {m.phase})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedMatchId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-bold text-xs text-on-surface mb-1">Modificar Estadio Sede</label>
                    <select 
                      value={editStadiumId} 
                      onChange={(e) => setEditStadiumId(e.target.value)} 
                      required
                      className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleccione sede...</option>
                      {stadiums.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} - {s.city}, {s.country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-label-bold text-xs text-on-surface mb-1">Modificar Fecha y Hora</label>
                    <input 
                      type="datetime-local" 
                      value={editStartsAt}
                      onChange={(e) => setEditStartsAt(e.target.value)}
                      required
                      className="w-full bg-surface border border-outline-variant rounded-lg text-xs py-2 text-on-surface focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={updating}
                    className="sm:col-span-2 py-2 bg-[#f59e0b] text-white font-bold rounded-lg hover:bg-warning transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Guardando...' : 'Guardar Cambios de Reprogramación'}
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Columna Derecha: Sincronización Manual */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-headline-md font-bold text-on-surface">Sincronización de Marcadores</h3>
            <p className="font-body-sm text-on-surface-variant">Sincroniza los marcadores de los partidos del día de hoy utilizando la API de TheSportsDB.</p>
            
            <button 
              onClick={handleTriggerSync}
              disabled={syncing}
              className="w-full py-3 bg-[#10B981] text-white font-bold rounded-xl hover:bg-success disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined">{syncing ? 'sync' : 'sync_alt'}</span>
              <span>{syncing ? 'Sincronizando Marcadores...' : 'Sincronizar Marcadores de Hoy'}</span>
            </button>

            {/* Consola de logs de ejecuciones anteriores */}
            <div className="border border-outline-variant/60 rounded-lg overflow-hidden flex flex-col mt-2">
              <div className="bg-surface-container-low px-3 py-2 border-b border-outline-variant font-label-bold text-[10px] uppercase text-on-surface-variant">Últimas Sincronizaciones</div>
              <div className="max-h-56 overflow-y-auto p-2 bg-surface flex flex-col gap-1.5 font-mono text-[10px] text-on-surface-variant">
                {syncRuns.length === 0 ? (
                  <span className="italic text-outline-variant">No hay registros de ejecuciones previas.</span>
                ) : (
                  syncRuns.slice(0, 8).map((run) => (
                    <div key={run.id} className="border-b border-outline-variant/30 pb-1 flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">Sincronización Exitosa</span>
                        <span className="opacity-70">{new Date(run.startedAt).toLocaleString()}</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#10B981]/25 text-[#10B981] rounded text-[8px] font-bold">OK</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
