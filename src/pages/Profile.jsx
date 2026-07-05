import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { refreshUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/me');
      setName(response.data.name || '');
      setEmail(response.data.email || '');
      setRoles(response.data.roles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar información personal.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Por favor complete todos los campos.');
      return;
    }

    setSaving(true);
    setError(null);
    setRequestId(null);
    try {
      await api.patch('/users/me', { name, email });
      await refreshUser(); // Actualizar estado global del usuario
      alert('¡Perfil actualizado con éxito!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar los cambios de perfil.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      
      {/* Cabecera */}
      <div className="border-b border-outline-variant pb-2">
        <h2 className="font-display-lg text-display-lg font-bold text-primary mb-1">Mi Perfil</h2>
        <p className="font-body-sm text-on-surface-variant">Consulta y actualiza tu información personal de cuenta.</p>
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

      {/* Formulario Perfil */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4">
        
        <div className="flex items-center gap-md pb-4 border-b border-outline-variant/50">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-headline-md text-lg">
            {name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-headline-md font-bold text-on-surface">{name}</h3>
            <div className="flex gap-1 mt-0.5">
              {roles.map((role) => (
                <span key={role} className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[9px] font-bold uppercase rounded-full">
                  {role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block font-label-bold text-xs text-on-surface mb-1" htmlFor="profile-name">Nombre Completo</label>
            <input 
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
              id="profile-name" 
              required 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-label-bold text-xs text-on-surface mb-1" htmlFor="profile-email">Correo Electrónico</label>
            <input 
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
              id="profile-email" 
              required 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-sm mt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="py-2 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Profile;
