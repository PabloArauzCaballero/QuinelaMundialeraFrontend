/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { asArray, fullNameOf, getErrorInfo, initialsOf } from '../utils/formatters';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [members, setMembers] = useState([]);
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      setRequestId(null);
      const [groupRes, leaderboardRes, membersRes, codeRes] = await Promise.allSettled([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/leaderboard`),
        api.get(`/groups/${groupId}/members`),
        api.get(`/groups/${groupId}/invitation-code`),
      ]);
      if (groupRes.status === 'fulfilled') setGroup(groupRes.value.data);
      if (leaderboardRes.status === 'fulfilled') setLeaderboard(asArray(leaderboardRes.value.data));
      if (membersRes.status === 'fulfilled') setMembers(asArray(membersRes.value.data).filter((member) => member.status !== 'inactive'));
      if (codeRes.status === 'fulfilled') setInvitationCode(codeRes.value.data.invitationCode || codeRes.value.data.code || '');
      if (groupRes.status === 'rejected') throw groupRes.reason;
    } catch (err) {
      const info = getErrorInfo(err, 'Error al cargar el detalle del grupo.');
      setError(info.message);
      setRequestId(info.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const copyCode = async () => {
    if (invitationCode) await navigator.clipboard.writeText(invitationCode);
  };

  if (loading) return <LoadingState label="Cargando detalle del grupo..." />;

  const winner = leaderboard[0];

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        eyebrow="Detalle de grupo"
        title={group?.name || 'Grupo'}
        description="Vista central del grupo: invitación, participantes, ranking y acceso a pronósticos compartidos."
        actions={
          <>
            <Link to={`/groups/${groupId}/ranking`} className="rounded-lg border border-outline-variant px-md py-sm text-sm font-extrabold text-on-surface-variant hover:bg-surface-container-high">Ranking</Link>
            <Link to={`/groups/${groupId}/predictions`} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Pronósticos</Link>
          </>
        }
      />

      <ErrorBanner error={error} requestId={requestId} onRetry={loadGroup} />

      <section className="grid grid-cols-1 gap-md md:grid-cols-3">
        <StatCard label="Participantes" value={members.length} icon="groups" />
        <StatCard label="Líder actual" value={winner?.name || winner?.user?.name || '-'} helper={winner ? `${winner.points || winner.totalPoints || 0} pts` : 'Sin ranking'} icon="emoji_events" tone="blue" />
        <StatCard label="Código" value={invitationCode || 'Oculto'} helper={invitationCode ? 'Toca para copiar abajo' : 'Disponible para el creador'} icon="vpn_key" />
      </section>

      {invitationCode && (
        <div className="flex flex-col gap-sm rounded-xl border border-primary/50 bg-primary/10 p-md md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Código de invitación</p>
            <p className="mt-xs font-mono text-3xl font-extrabold tracking-[0.25em] text-on-surface">{invitationCode}</p>
          </div>
          <button type="button" onClick={copyCode} className="rounded-lg bg-primary px-md py-sm text-sm font-extrabold text-on-primary">Copiar código</button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-lg xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
          <div className="mb-md flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-on-surface">Tabla de clasificación</h2>
            <Link to={`/groups/${groupId}/ranking`} className="text-xs font-extrabold uppercase tracking-wide text-primary hover:underline">Ver completo</Link>
          </div>
          {leaderboard.length === 0 ? (
            <EmptyState icon="leaderboard" title="Ranking sin datos" description="Cuando existan pronósticos calculados aparecerá la clasificación." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead className="border-b border-outline-variant text-[11px] uppercase tracking-wide text-on-surface-variant">
                  <tr><th className="py-sm">Pos</th><th>Participante</th><th className="text-center">Pronósticos</th><th className="text-right">Puntos</th></tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 8).map((item, index) => (
                    <tr key={item.userId || item.id || index} className="border-b border-outline-variant/50 text-sm hover:bg-surface-container">
                      <td className="py-sm font-extrabold text-primary">#{item.position || index + 1}</td>
                      <td className="font-bold text-on-surface">{item.name || item.user?.name || item.user?.fullName || 'Participante'}</td>
                      <td className="text-center text-on-surface-variant">{item.predictionsCount || item.predictions || 0}</td>
                      <td className="text-right font-extrabold text-primary">{item.points || item.totalPoints || 0} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="xl:col-span-5 rounded-xl border border-outline-variant bg-surface-container-low p-md shadow-lg shadow-black/20">
          <h2 className="mb-md text-2xl font-extrabold text-on-surface">Participantes</h2>
          {members.length === 0 ? (
            <EmptyState icon="person_add" title="Sin participantes" description="Comparte el código para sumar jugadores." />
          ) : (
            <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-1">
              {members.map((member) => {
                const name = fullNameOf(member.user || member);
                return (
                  <div key={member.id || member.userId} className="flex items-center gap-sm rounded-xl border border-outline-variant bg-surface-container p-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-on-primary">{initialsOf(name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-on-surface">{name}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{member.role === 'owner' ? 'Creador' : 'Jugador'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GroupDetail;
