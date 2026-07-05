import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Groups = () => {
  const { user } = useAuth();
  
  // Pestanas principales: 'list' | 'create' | 'join'
  const [activeTab, setActiveTab] = useState('list');
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [members, setMembers] = useState([]);
  const [invitationCode, setInvitationCode] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  
  // Campos de formulario
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  // Modal de código generado
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups');
      // Sincronización del extra: filtrar solo grupos activos
      const activeGroups = response.data.filter(g => g.status === 'active');
      setGroups(activeGroups);
      
      // Si hay grupos y ninguno seleccionado, seleccionar el primero
      if (activeGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(activeGroups[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar grupos.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId) => {
    if (!groupId) return;
    try {
      setError(null);
      const [groupRes, leaderboardRes, membersRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/leaderboard`),
        api.get(`/groups/${groupId}/members`)
      ]);

      setSelectedGroup(groupRes.data);
      setLeaderboard(leaderboardRes.data);
      
      // Sincronización del extra: filtrar miembros activos
      const activeMembers = membersRes.data.filter(m => m.status === 'active');
      setMembers(activeMembers);

      // Si el usuario es el creador, cargar el código de invitación
      if (groupRes.data.ownerUserId === user?.id) {
        const codeRes = await api.get(`/groups/${groupId}/invitation-code`);
        setInvitationCode(codeRes.data.invitationCode);
      } else {
        setInvitationCode(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar detalles del grupo.');
      setRequestId(err.response?.data?.requestId);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupDetails(selectedGroupId);
    }
  }, [selectedGroupId]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setError(null);
    setRequestId(null);

    try {
      const response = await api.post('/groups', { name: newGroupName });
      setNewGroupName('');
      setGeneratedCode(response.data.invitationCode);
      setShowCodeModal(true);
      
      // Recargar lista y seleccionar el nuevo
      const responseGroups = await api.get('/groups');
      const activeGroups = responseGroups.data.filter(g => g.status === 'active');
      setGroups(activeGroups);
      setSelectedGroupId(response.data.id);
      
      setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el grupo.');
      setRequestId(err.response?.data?.requestId);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (joinCode.length !== 6) {
      alert('El código debe ser de exactamente 6 caracteres.');
      return;
    }

    setError(null);
    setRequestId(null);

    try {
      const response = await api.post('/groups/join', { invitationCode: joinCode });
      setJoinCode('');
      
      // Recargar lista y seleccionar el nuevo
      const responseGroups = await api.get('/groups');
      const activeGroups = responseGroups.data.filter(g => g.status === 'active');
      setGroups(activeGroups);
      setSelectedGroupId(response.data.id);
      
      setActiveTab('list');
      alert('¡Te has unido al grupo correctamente!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al unirse al grupo.');
      setRequestId(err.response?.data?.requestId);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Código copiado al portapapeles.');
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Pestanas de Navegacion de Grupos */}
      <div className="flex justify-between items-center border-b border-outline-variant pb-2">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('list')}
            className={`pb-2 font-label-bold text-sm border-b-2 transition-all ${
              activeTab === 'list' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Mis Grupos
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`pb-2 font-label-bold text-sm border-b-2 transition-all ${
              activeTab === 'create' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Crear Grupo
          </button>
          <button 
            onClick={() => setActiveTab('join')}
            className={`pb-2 font-label-bold text-sm border-b-2 transition-all ${
              activeTab === 'join' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Unirse a Grupo
          </button>
        </div>
      </div>

      {/* Banners de Error */}
      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-lg flex gap-2">
          <span className="material-symbols-outlined">error</span>
          <div>
            <span>{error}</span>
            {requestId && <span className="block text-[10px] opacity-75">ID Soporte: {requestId}</span>}
          </div>
        </div>
      )}

      {/* Modal flotante de Código Generado */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant p-6 rounded-xl max-w-sm w-full text-center shadow-2xl flex flex-col gap-4">
            <span className="material-symbols-outlined text-[48px] text-primary">celebration</span>
            <div>
              <h4 className="font-headline-md font-bold text-on-surface">¡Grupo Creado Exitosamente!</h4>
              <p className="font-body-sm text-on-surface-variant mt-1">Comparte este código con tus amigos para que se unan al grupo:</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant rounded-lg">
              <span className="font-mono text-xl font-bold tracking-widest text-primary">{generatedCode}</span>
              <button 
                onClick={() => handleCopyCode(generatedCode)}
                className="p-1.5 bg-primary text-white rounded-md hover:bg-primary-container transition-colors"
                title="Copiar Código"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
            <button 
              onClick={() => setShowCodeModal(false)}
              className="w-full py-2 bg-secondary-container text-on-secondary-container font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Renderizado de Pestañas */}
      {activeTab === 'create' && (
        <div className="max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h3 className="font-headline-md font-bold text-on-surface mb-2">Crear Nuevo Grupo</h3>
          <p className="font-body-sm text-on-surface-variant mb-4">Crea una quiniela privada para competir únicamente con tus invitados.</p>
          <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
            <div>
              <label className="block font-label-bold text-xs text-on-surface mb-1" htmlFor="group-name">Nombre del Grupo</label>
              <input 
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
                id="group-name" 
                placeholder="Ej: Los Amigos Futboleros" 
                required 
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <button 
              className="py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors"
              type="submit"
            >
              Crear Grupo y Obtener Código
            </button>
          </form>
        </div>
      )}

      {activeTab === 'join' && (
        <div className="max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h3 className="font-headline-md font-bold text-on-surface mb-2">Unirse a un Grupo</h3>
          <p className="font-body-sm text-on-surface-variant mb-4">Introduce el código de invitación alfanumérico de 6 dígitos que te compartieron.</p>
          <form onSubmit={handleJoinGroup} className="flex flex-col gap-4">
            <div>
              <label className="block font-label-bold text-xs text-on-surface mb-1" htmlFor="inv-code">Código de Invitación</label>
              <input 
                className="w-full px-3 py-2 font-mono text-center text-lg tracking-widest bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-on-surface uppercase" 
                id="inv-code" 
                placeholder="ABCXYZ" 
                maxLength={6}
                required 
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
            <button 
              className="py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors"
              type="submit"
            >
              Unirme al Grupo
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Listado lateral de Grupos */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">Mis Grupos Activos</h3>
            {groups.length === 0 ? (
              <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl text-center">
                <p className="font-body-sm text-on-surface-variant">No perteneces a ningún grupo.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {groups.map((g) => (
                  <button 
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className={`w-full text-left p-3 border rounded-xl transition-all flex items-center justify-between ${
                      selectedGroupId === g.id 
                        ? 'bg-surface-container-high border-primary text-primary font-bold' 
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{g.name}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard y detalle del grupo seleccionado */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {selectedGroup ? (
              <div className="flex flex-col gap-4">
                
                {/* Cabecera del Grupo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface-container-low border border-outline-variant rounded-xl gap-3">
                  <div>
                    <h3 className="font-headline-md font-bold text-on-surface">{selectedGroup.name}</h3>
                    <p className="font-body-sm text-on-surface-variant">Código de Invitación: {
                      invitationCode ? (
                        <span className="font-mono font-bold text-primary ml-1 cursor-pointer hover:underline" onClick={() => handleCopyCode(invitationCode)}>
                          {invitationCode} (Copiar)
                        </span>
                      ) : (
                        <span className="text-xs opacity-75">Oculto</span>
                      )
                    }</p>
                  </div>
                </div>

                {/* Tablas de Leaderboard */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                  <h4 className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">Tabla de Clasificación</h4>
                  {leaderboard.length === 0 ? (
                    <p className="font-body-sm text-on-surface-variant text-center py-4">No hay clasificaciones disponibles.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant text-[11px] text-on-surface-variant uppercase font-label-bold">
                            <th className="py-2 px-3 w-12">Pos</th>
                            <th className="py-2 px-3">Participante</th>
                            <th className="py-2 px-3 text-center w-24">Apuestas</th>
                            <th className="py-2 px-3 text-right w-24">Puntos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((item, index) => {
                            const isCurrentUser = item.userId === user?.id;
                            return (
                              <tr 
                                key={item.userId}
                                className={`border-b border-outline-variant/50 text-sm transition-colors ${
                                  isCurrentUser ? 'bg-secondary-container/20 border-l-4 border-l-success' : 'hover:bg-surface-container-low'
                                }`}
                              >
                                <td className="py-2.5 px-3 font-bold">{item.position}</td>
                                <td className="py-2.5 px-3">{item.name || 'Participante'}</td>
                                <td className="py-2.5 px-3 text-center">{item.predictionsCount}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-primary">{item.points} pts</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Miembros del grupo */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                  <h4 className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">Participantes Activos ({members.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                          {member.user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-label-bold text-on-surface truncate">{member.user?.fullName}</span>
                          {member.role === 'owner' && (
                            <span className="text-[9px] text-[#10B981] font-bold uppercase">Creador</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-lg bg-surface-container-low border border-outline-variant rounded-xl text-center">
                <p className="font-body-md text-on-surface-variant">Selecciona un grupo a la izquierda para ver su clasificación y participantes.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default Groups;
