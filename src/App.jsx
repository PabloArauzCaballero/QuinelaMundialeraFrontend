import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Fixture from './pages/Fixture';
import History from './pages/History';
import Map from './pages/Map';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública de Autenticación */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas / Protegidas envueltas en Layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Groups />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/fixture" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Fixture />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/map" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Map />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Ruta Administrativa Protegida */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
