import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/fixture', label: 'Fixture', icon: 'calendar_today' },
    { to: '/groups', label: 'Grupos', icon: 'groups' },
    { to: '/history', label: 'Historial', icon: 'history' },
    { to: '/map', label: 'Mapa Sedes', icon: 'map' },
    { to: '/profile', label: 'Mi Perfil', icon: 'person' },
  ];

  // Si el usuario es administrador, agregar el panel de administración al menú
  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: 'admin_panel_settings' });
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-sm p-sm rounded-full font-label-bold text-label-bold transition-all duration-150 ${
      isActive
        ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed shadow-sm'
        : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-inverse-surface'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center rounded-xl p-xs transition-all duration-150 ${
      isActive
        ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed scale-95'
        : 'text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high'
    }`;

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md pt-16 md:pl-64 lg:pb-0 pb-20">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-sm md:px-md h-16 bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-on-surface-variant">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary cursor-pointer lg:hidden" onClick={() => navigate('/dashboard')}>sports_soccer</span>
          <h1 className="text-headline-md font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed select-none">
            Quiniela Mundial 2026
          </h1>
        </div>
        
        <div className="flex items-center gap-md">
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-label-bold text-[12px] text-on-surface-variant">{user?.fullName}</span>
            <span className="text-[10px] text-primary font-bold uppercase">{isAdmin ? 'Administrador' : 'Usuario'}</span>
          </div>

          <button 
            onClick={handleLogout} 
            title="Cerrar sesión"
            className="hover:text-error transition-colors text-on-surface-variant dark:text-outline-variant flex items-center justify-center p-xs hover:bg-surface-container-high rounded-full"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-64 p-sm overflow-y-auto bg-surface-container-low dark:bg-surface-container-highest border-r border-outline-variant dark:border-on-surface-variant">
        <div className="mb-lg px-xs py-sm border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-primary dark:text-secondary-fixed">Tournament Hub</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">FIFA World Cup 2026</p>
        </div>

        <ul className="flex flex-col gap-xs flex-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClass}>
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-sm pt-md border-t border-outline-variant">
          <button 
            onClick={() => navigate('/fixture')}
            className="w-full py-sm bg-[#FBBF24] text-[#111827] font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Pronosticar
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 p-sm md:p-md lg:p-lg max-w-[1280px] mx-auto w-full">
        {children}
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-base py-xs bg-surface dark:bg-inverse-surface border-t border-outline-variant dark:border-on-surface-variant shadow-lg rounded-t-xl">
        {navItems.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
            <span className="material-symbols-outlined">{item.icon === 'calendar_today' ? 'calendar_month' : item.icon}</span>
            <span className="font-label-bold text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
