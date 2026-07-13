import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import PageHeader from '../components/PageHeader';
import { getErrorInfo } from '../utils/formatters';

const CreateOrJoinGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [createdGroupId, setCreatedGroupId] = useState('');
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingJoin, setSavingJoin] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const handleError = (err, fallback) => {
    const info = getErrorInfo(err, fallback);
    setError(info.message);
    setRequestId(info.requestId);
  };

  const createGroup = async (event) => {
    event.preventDefault();
    try {
      setSavingCreate(true);
      setError(null);
      setRequestId(null);
      const response = await api.post('/groups', { name: groupName.trim() });
      setGeneratedCode(response.data.invitationCode || response.data.code || '');
      // Se muestra el código en la misma página (no se redirige) para que el
      // usuario lo vea y copie. El botón "Ir al grupo" navega cuando él quiera.
      if (response.data.id) setCreatedGroupId(response.data.id);
      setGroupName('');
    } catch (err) {
      handleError(err, 'Error al crear el grupo.');
    } finally {
      setSavingCreate(false);
    }
  };

  const joinGroup = async (event) => {
    event.preventDefault();
    try {
      setSavingJoin(true);
      setError(null);
      setRequestId(null);
      const response = await api.post('/groups/join', { invitationCode: joinCode.trim().toUpperCase() });
      navigate(`/groups/${response.data.id || response.data.groupId || ''}`);
    } catch (err) {
      handleError(err, 'Error al unirte al grupo.');
    } finally {
      setSavingJoin(false);
    }
  };

  const copyGeneratedCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
  };

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Crear o unirse"
        title="Arma tu quiniela privada"
        description="Genera un grupo para tus invitados o ingresa el código que te compartieron."
      />

      <ErrorBanner error={error} requestId={requestId} />

      <section className="grid grid-cols-1 gap-lg lg:grid-cols-2">
        <form onSubmit={createGroup} className="rounded-xl border border-outline-variant bg-surface-container-low p-lg shadow-lg shadow-black/20">
          <span className="material-symbols-outlined text-[42px] text-primary">add_circle</span>
          <h2 className="mt-sm text-3xl font-extrabold text-on-surface">Crear grupo</h2>
          <p className="mt-xs text-sm text-on-surface-variant">Ideal para familia, oficina, amigos o clientes. El sistema generará un código de invitación.</p>
          <label className="mt-md flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            Nombre del grupo
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} required placeholder="Ej: Oficina Tech" className="rounded-lg border-outline-variant bg-surface-container-lowest text-sm normal-case text-on-surface focus:border-primary focus:ring-primary" />
          </label>
          <button disabled={savingCreate} className="mt-md w-full rounded-lg bg-primary py-sm text-sm font-extrabold uppercase tracking-wide text-on-primary disabled:opacity-50">
            {savingCreate ? 'Creando...' : 'Crear grupo'}
          </button>
          {generatedCode && (
            <div className="mt-md rounded-xl border border-primary/50 bg-primary/10 p-md">
              <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Código generado</p>
              <div className="mt-xs flex items-center justify-between gap-sm">
                <span className="font-mono text-2xl font-extrabold tracking-[0.25em] text-primary">{generatedCode}</span>
                <button type="button" onClick={copyGeneratedCode} className="rounded-lg border border-primary px-sm py-xs text-xs font-extrabold text-primary">Copiar</button>
              </div>
              {createdGroupId && (
                <button type="button" onClick={() => navigate(`/groups/${createdGroupId}`)} className="mt-sm w-full rounded-lg bg-primary py-sm text-sm font-extrabold uppercase tracking-wide text-on-primary">
                  Ir al grupo
                </button>
              )}
            </div>
          )}
        </form>

        <form onSubmit={joinGroup} className="rounded-xl border border-outline-variant bg-surface-container-low p-lg shadow-lg shadow-black/20">
          <span className="material-symbols-outlined text-[42px] text-secondary">login</span>
          <h2 className="mt-sm text-3xl font-extrabold text-on-surface">Unirse a grupo</h2>
          <p className="mt-xs text-sm text-on-surface-variant">Introduce el código alfanumérico de invitación que te compartieron.</p>
          <label className="mt-md flex flex-col gap-xs text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            Código de invitación
            <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={12} required placeholder="ABC123" className="rounded-lg border-outline-variant bg-surface-container-lowest text-center font-mono text-xl font-extrabold uppercase tracking-[0.25em] text-on-surface focus:border-primary focus:ring-primary" />
          </label>
          <button disabled={savingJoin} className="mt-md w-full rounded-lg bg-secondary-container py-sm text-sm font-extrabold uppercase tracking-wide text-on-secondary-container disabled:opacity-50">
            {savingJoin ? 'Uniendo...' : 'Unirme'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default CreateOrJoinGroup;
