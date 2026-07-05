import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

const Admin = () => {
  const cards = [
    { to: '/admin/matches', icon: 'sports_soccer', title: 'Administración de partidos', description: 'Registrar, editar, reprogramar y revisar encuentros del torneo.' },
    { to: '/admin/sync-history', icon: 'sync', title: 'Historial de sincronización', description: 'Auditar ejecuciones de actualización de resultados y estados.' },
    { to: '/fixture', icon: 'calendar_month', title: 'Calendario público', description: 'Ver cómo se presenta el fixture a los jugadores.' },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader eyebrow="Panel de administración" title="Command Center Pro" description="Módulo administrativo para mantener el calendario, resultados y sincronizaciones bajo control." />
      <section className="grid grid-cols-1 gap-md md:grid-cols-3">
        <StatCard label="Módulo" value="Admin" icon="admin_panel_settings" />
        <StatCard label="Control" value="Partidos" icon="fact_check" tone="blue" />
        <StatCard label="Auditoría" value="Sync" icon="sync_saved_locally" />
      </section>
      <section className="grid grid-cols-1 gap-md lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="rounded-xl border border-outline-variant bg-surface-container-low p-lg shadow-lg shadow-black/20 transition hover:border-primary hover:bg-surface-container">
            <span className="material-symbols-outlined text-[42px] text-primary">{card.icon}</span>
            <h2 className="mt-sm text-2xl font-extrabold text-on-surface">{card.title}</h2>
            <p className="mt-xs text-sm text-on-surface-variant">{card.description}</p>
            <span className="mt-md inline-flex items-center gap-xs text-xs font-extrabold uppercase tracking-wide text-primary">Abrir <span className="material-symbols-outlined text-sm">arrow_forward</span></span>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Admin;
