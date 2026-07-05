import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fullNameOf, initialsOf } from '../utils/formatters';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => {
    const base = [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/groups', label: 'Grupos', icon: 'groups' },
      { to: '/fixture', label: 'Calendario', icon: 'calendar_month' },
      { to: '/predictions', label: 'Pronósticos', icon: 'sports_soccer' },
      { to: '/ranking', label: 'Ranking', icon: 'leaderboard' },
      { to: '/map', label: 'Sedes', icon: 'map' },
      { to: '/profile', label: 'Perfil', icon: 'person' },
    ];
    if (isAdmin) base.push({ to: '/admin', label: 'Admin', icon: 'admin_panel_settings' });
    return base;
  }, [isAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `flex items-center gap-md rounded-xl px-md py-sm text-sm font-bold transition ${
    isActive
      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
  }`;

  const mobileLinkClass = ({ isActive }) => `flex min-w-0 flex-1 flex-col items-center justify-center gap-[2px] rounded-xl px-xs py-xs text-[10px] font-bold transition ${
    isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant active:bg-surface-container-high'
  }`;

  const userName = fullNameOf(user);

  return (
    <div className="min-h-screen bg-background text-on-background md:pl-[280px]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur md:left-[280px]">
        <div className="flex h-[72px] items-center justify-between px-md md:px-lg">
          <div className="flex items-center gap-sm">
            <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-xs text-primary hover:bg-surface-container-high md:hidden" aria-label="Abrir menú">
              <span className="material-symbols-outlined text-[32px]">menu</span>
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[32px] text-primary">sports_soccer</span>
              <span className="font-headline-md text-2xl font-extrabold tracking-tight text-primary md:hidden">WORLD CUP 2026</span>
            </button>
          </div>

          <div className="flex items-center gap-sm">
            <button type="button" onClick={() => navigate('/matches/next/predict')} className="hidden rounded-lg bg-primary px-md py-sm text-xs font-extrabold uppercase tracking-wide text-on-primary shadow-lg shadow-primary/20 sm:inline-flex">
              Hacer pronóstico
            </button>
            <button type="button" onClick={() => navigate('/profile')} className="flex items-center gap-sm rounded-xl border border-outline-variant bg-surface-container-low px-sm py-xs hover:border-primary">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-on-primary">{initialsOf(userName)}</span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-[160px] truncate text-xs font-extrabold text-on-surface">{userName}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">{isAdmin ? 'Administrador' : 'Jugador'}</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-[60] hidden w-[280px] flex-col border-r border-outline-variant bg-surface-container-low md:flex">
        <div className="p-lg">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[42px] text-primary">sports_soccer</span>
            <div>
              <h1 className="font-headline-md text-[32px] font-extrabold leading-none text-primary">Command Center</h1>
              <p className="text-sm font-semibold text-on-surface-variant">World Cup 2026</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/fixture')} className="mt-lg w-full rounded-lg bg-primary py-sm text-xs font-extrabold uppercase tracking-wide text-on-primary shadow-lg shadow-primary/20">
            Make prediction
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-xs px-md">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline-variant p-md">
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-md rounded-xl px-md py-sm text-sm font-bold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/60 md:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-[82vw] max-w-[320px] border-r border-outline-variant bg-surface-container-low p-md shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-lg flex items-center justify-between">
              <span className="font-headline-md text-3xl font-extrabold text-primary">WORLD CUP 2026</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-xs text-on-surface-variant hover:bg-surface-container-high">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex flex-col gap-xs">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={linkClass}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1400px] px-md pb-28 pt-[96px] md:px-xl md:pb-xl">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex gap-xs border-t border-outline-variant bg-surface/95 px-xs py-xs shadow-2xl backdrop-blur md:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
            <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
