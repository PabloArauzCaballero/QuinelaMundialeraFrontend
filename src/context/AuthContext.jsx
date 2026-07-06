/* eslint-disable react/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import api, {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthToken,
  extractAuthToken,
  extractAuthUser,
  getStoredAuthToken,
  saveAuthToken,
} from '../services/api';
import { useAutoRefresh } from '../services/useAutoRefresh';

const AuthContext = createContext(null);

const getRoleName = (role) => (typeof role === 'string' ? role : role?.name);
const hasAdminRole = (user) => (Array.isArray(user?.roles) ? user.roles.map(getRoleName).includes('admin') : false);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial del perfil al iniciar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredAuthToken();
      if (token) {
        try {
          saveAuthToken(token);
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Error al inicializar sesión:', error);
          clearAuthToken();
          setUser(null);
        }
      } else {
        clearAuthToken();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthToken();
      setUser(null);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const completeAuth = async (payload) => {
    const token = extractAuthToken(payload);
    if (!token) {
      clearAuthToken();
      return {
        success: false,
        message: 'El servidor autenticó la solicitud, pero no devolvió un token válido.',
      };
    }

    saveAuthToken(token);

    const userFromResponse = extractAuthUser(payload);
    if (userFromResponse) {
      setUser(userFromResponse);
      return { success: true };
    }

    const me = await api.get('/auth/me');
    setUser(me.data);
    return { success: true };
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password }, { skipAuth: true });
      return await completeAuth(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error de credenciales.';
      const requestId = error.response?.data?.requestId;
      const isInactive = error.response?.data?.errorCode === 'ACCOUNT_INACTIVE' || errorMsg.toLowerCase().includes('inactiv');

      return {
        success: false,
        message: errorMsg,
        requestId,
        isInactive,
      };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await api.post('/auth/register', { name: fullName, email, password }, { skipAuth: true });
      return await completeAuth(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al registrarse.';
      const requestId = error.response?.data?.requestId;
      return {
        success: false,
        message: errorMsg,
        requestId,
      };
    }
  };

  const logout = async () => {
    try {
      if (getStoredAuthToken()) await api.post('/auth/logout');
    } catch (error) {
      console.error('Error durante logout en servidor:', error);
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!getStoredAuthToken()) {
      clearAuthToken();
      setUser(null);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error al refrescar perfil:', error);
      if (error.response?.status === 401) {
        clearAuthToken();
        setUser(null);
      }
    }
  };

  useAutoRefresh(refreshUser, Boolean(user));

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin: hasAdminRole(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
