import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Validaciones locales de la contraseña para registro
  const hasMinLength = password.length >= 10;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRequestId(null);
    setIsSubmitting(true);

    if (activeTab === 'login') {
      const result = await login(email, password);
      setIsSubmitting(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.isInactive 
          ? 'Su cuenta ha sido desactivada. Comuníquese con el administrador.' 
          : result.message
        );
        setRequestId(result.requestId);
      }
    } else {
      // Registrar
      if (!hasMinLength || !hasUppercase || !hasNumber) {
        setError('La contraseña no cumple con los requisitos de seguridad mínimos.');
        setIsSubmitting(false);
        return;
      }

      const result = await register(fullName, email, password);
      setIsSubmitting(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
        setRequestId(result.requestId);
      }
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-[1000px] md:h-[650px] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row bg-surface border border-outline-variant">
        
        {/* Sección Izquierda: Hero con imagen del estadio */}
        <section className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden flex flex-col justify-center items-center text-center p-6">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6P8DAF-GT0S6YNxPKUBx8PcQJ2ZY6rtJK7RA-ZdPNSVLZ7rQzM_pDTSsr0gKakvthVa218y3StntYnJ18XNSx_onr-ckwRPg4BFk546low9AhLjxMuySJeNoj20EJsvojgli-DO5cLXLavECh77CC7hDZtXjbU_JxkwMFT2B27Zfe5X_bYfUqmpYdQPyyzbFW3IuQIXfFPW1jM6q2dJAghnRYEdPnfgiM5Z-KprMOLanvbmunExwQz1iSi7eSaNXmcdH8l97X3XyT')` 
            }}
          ></div>
          <div className="absolute inset-0 z-10 auth-hero-gradient mix-blend-multiply"></div>
          <div className="relative z-20 text-on-primary flex flex-col items-center">
            <span className="material-symbols-outlined text-[64px] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
            <h1 className="font-display-lg text-[32px] md:text-[40px] font-bold mb-2 tracking-tight">Quiniela Mundial 2026</h1>
            <p className="font-body-sm text-[14px] max-w-xs opacity-90 hidden md:block">
              Únete al predictor del torneo más importante del mundo. Pronostica partidos, compite con amigos y lidera la clasificación.
            </p>
          </div>
        </section>

        {/* Sección Derecha: Formularios de Autenticación */}
        <section className="w-full md:w-1/2 h-full flex flex-col p-6 md:p-10 bg-surface relative justify-center">
          
          {/* Pestanas superiores */}
          <div className="flex border-b border-outline-variant mb-6 relative">
            <button 
              className={`flex-1 pb-2 font-label-bold text-label-bold transition-colors border-b-2 text-center ${
                activeTab === 'login' 
                  ? 'text-primary border-primary' 
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`flex-1 pb-2 font-label-bold text-label-bold transition-colors border-b-2 text-center ${
                activeTab === 'register' 
                  ? 'text-primary border-primary' 
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Banner de errores con Request ID de Soporte */}
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error rounded-lg flex items-start gap-3" id="error-message">
              <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <div className="flex-1">
                <strong className="font-label-bold text-[12px] block mb-1">Error de Operación</strong>
                <span className="font-body-sm text-[13px] block">{error}</span>
                {requestId && (
                  <span className="text-[10px] text-on-error-container opacity-70 block mt-1">ID Soporte: {requestId}</span>
                )}
              </div>
            </div>
          )}

          {/* Formulario de Login */}
          {activeTab === 'login' ? (
            <div className="flex flex-col">
              <div className="mb-6">
                <h2 className="font-headline-md text-[22px] font-bold text-on-surface mb-1">¡Bienvenido de vuelta!</h2>
                <p className="font-body-sm text-[13px] text-on-surface-variant">Introduce tus credenciales para ingresar.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block font-label-bold text-[12px] text-on-surface mb-1" htmlFor="login-email">Correo Electrónico</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input 
                      className="w-full pl-[40px] pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
                      id="login-email" 
                      placeholder="correo@ejemplo.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-bold text-[12px] text-on-surface mb-1" htmlFor="login-password">Contraseña</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                    <input 
                      className="w-full pl-[40px] pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
                      id="login-password" 
                      placeholder="••••••••" 
                      required 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  className="mt-4 w-full py-2 px-4 bg-[#1e40af] text-white font-label-bold text-sm rounded-lg hover:bg-primary transition-all shadow-sm flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Iniciando...' : 'Ingresar al Dashboard'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            </div>
          ) : (
            /* Formulario de Registro */
            <div className="flex flex-col">
              <div className="mb-4">
                <h2 className="font-headline-md text-[22px] font-bold text-on-surface mb-1">Crea tu Cuenta</h2>
                <p className="font-body-sm text-[13px] text-on-surface-variant">Regístrate para pronosticar marcadores.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="block font-label-bold text-[12px] text-on-surface mb-1" htmlFor="reg-name">Nombre Completo</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                    <input 
                      className="w-full pl-[40px] pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
                      id="reg-name" 
                      placeholder="Juan Pérez" 
                      required 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-bold text-[12px] text-on-surface mb-1" htmlFor="reg-email">Correo Electrónico</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input 
                      className="w-full pl-[40px] pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
                      id="reg-email" 
                      placeholder="correo@ejemplo.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-bold text-[12px] text-on-surface mb-1" htmlFor="reg-password">Contraseña Segura</label>
                  <div className="relative mb-2">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                    <input 
                      className="w-full pl-[40px] pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface" 
                      id="reg-password" 
                      placeholder="Mínimo 10 caracteres" 
                      required 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {/* Lista de chequeo visual para requisitos de contraseña */}
                  <ul className="font-body-sm text-[11px] text-on-surface-variant flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <li className={`flex items-center gap-1 ${hasMinLength ? 'text-success' : 'text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[13px]">{hasMinLength ? 'check_circle' : 'circle'}</span> 10+ Caracteres
                    </li>
                    <li className={`flex items-center gap-1 ${hasUppercase ? 'text-success' : 'text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[13px]">{hasUppercase ? 'check_circle' : 'circle'}</span> 1 Mayúscula
                    </li>
                    <li className={`flex items-center gap-1 ${hasNumber ? 'text-success' : 'text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[13px]">{hasNumber ? 'check_circle' : 'circle'}</span> 1 Número
                    </li>
                  </ul>
                </div>

                <button 
                  className="mt-2 w-full py-2 px-4 bg-[#1e40af] text-white font-label-bold text-sm rounded-lg hover:bg-primary transition-all shadow-sm flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Registrando...' : 'Registrar Cuenta'}</span>
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Login;
