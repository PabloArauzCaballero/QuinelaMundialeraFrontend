import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial del perfil al iniciar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Error al inicializar sesión:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data;
      
      localStorage.setItem('token', accessToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error de credenciales.';
      const status = error.response?.status;
      const requestId = error.response?.data?.requestId;
      const isInactive = error.response?.data?.errorCode === 'ACCOUNT_INACTIVE' || errorMsg.toLowerCase().includes('inactiv');

      return { 
        success: false, 
        message: errorMsg,
        requestId,
        isInactive
      };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await api.post('/auth/register', { name: fullName, email, password });
      const { accessToken, user: userData } = response.data;
      
      localStorage.setItem('token', accessToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al registrarse.';
      const requestId = error.response?.data?.requestId;
      return { 
        success: false, 
        message: errorMsg,
        requestId 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error durante logout en servidor:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.roles?.includes('admin') || false
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
