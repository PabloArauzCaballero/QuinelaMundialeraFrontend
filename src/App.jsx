import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Admin from './pages/Admin';
import AdminMatchDetail from './pages/AdminMatchDetail';
import AdminMatches from './pages/AdminMatches';
import AdminSyncHistory from './pages/AdminSyncHistory';
import CreateOrJoinGroup from './pages/CreateOrJoinGroup';
import Dashboard from './pages/Dashboard';
import Fixture from './pages/Fixture';
import GroupDetail from './pages/GroupDetail';
import GroupPredictions from './pages/GroupPredictions';
import GroupRanking from './pages/GroupRanking';
import Groups from './pages/Groups';
import History from './pages/History';
import Login from './pages/Login';
import Map from './pages/Map';
import MatchDetail from './pages/MatchDetail';
import MyPredictions from './pages/MyPredictions';
import Profile from './pages/Profile';
import Ranking from './pages/Ranking';
import RegisterPrediction from './pages/RegisterPrediction';

const ProtectedPage = ({ children, adminOnly = false }) => (
  <ProtectedRoute adminOnly={adminOnly}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login initialMode="register" />} />

          <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
          <Route path="/groups" element={<ProtectedPage><Groups /></ProtectedPage>} />
          <Route path="/groups/new" element={<ProtectedPage><CreateOrJoinGroup /></ProtectedPage>} />
          <Route path="/groups/:groupId" element={<ProtectedPage><GroupDetail /></ProtectedPage>} />
          <Route path="/groups/:groupId/ranking" element={<ProtectedPage><GroupRanking /></ProtectedPage>} />
          <Route path="/groups/:groupId/predictions" element={<ProtectedPage><GroupPredictions /></ProtectedPage>} />

          <Route path="/fixture" element={<ProtectedPage><Fixture /></ProtectedPage>} />
          <Route path="/calendar" element={<Navigate to="/fixture" replace />} />
          <Route path="/matches/:matchId" element={<ProtectedPage><MatchDetail /></ProtectedPage>} />
          <Route path="/matches/:matchId/predict" element={<ProtectedPage><RegisterPrediction /></ProtectedPage>} />
          <Route path="/predictions" element={<ProtectedPage><MyPredictions /></ProtectedPage>} />
          <Route path="/history" element={<ProtectedPage><History /></ProtectedPage>} />
          <Route path="/ranking" element={<ProtectedPage><Ranking /></ProtectedPage>} />
          <Route path="/map" element={<ProtectedPage><Map /></ProtectedPage>} />
          <Route path="/profile" element={<ProtectedPage><Profile /></ProtectedPage>} />

          <Route path="/admin" element={<ProtectedPage adminOnly><Admin /></ProtectedPage>} />
          <Route path="/admin/matches" element={<ProtectedPage adminOnly><AdminMatches /></ProtectedPage>} />
          <Route path="/admin/matches/:matchId" element={<ProtectedPage adminOnly><AdminMatchDetail /></ProtectedPage>} />
          <Route path="/admin/sync-history" element={<ProtectedPage adminOnly><AdminSyncHistory /></ProtectedPage>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
