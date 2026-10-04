import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AdminLoginPage from './pages/public/AdminLoginPage';

// User Dashboard Pages (Single Worker "My Safety")
import UserDashboardLayout from './pages/user/UserDashboardLayout';
import UserOverviewView from './pages/user/UserOverviewView';
import UserLiveMonitoringView from './pages/user/UserLiveMonitoringView';
import UserAlertsView from './pages/user/UserAlertsView';
import UserSafetyHistoryView from './pages/user/UserSafetyHistoryView';
import UserAnalyticsView from './pages/user/UserAnalyticsView';
import UserReportsView from './pages/user/UserReportsView';
import UserProfileView from './pages/user/UserProfileView';

// Admin Dashboard Pages (Multi-Helmet / Multi-Worker "System Safety")
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AdminOverviewView from './pages/admin/AdminOverviewView';
import AdminLiveView from './pages/admin/AdminLiveView';
import AdminHelmetsView from './pages/admin/AdminHelmetsView';
import AdminUsersView from './pages/admin/AdminUsersView';
import AdminAlertsView from './pages/admin/AdminAlertsView';
import AdminIncidentsView from './pages/admin/AdminIncidentsView';
import AdminAnalyticsView from './pages/admin/AdminAnalyticsView';
import AdminReportsView from './pages/admin/AdminReportsView';

// Protected Route Helpers
function UserProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Direct Route Aliases for User Dashboard */}
          <Route path="/live-monitoring" element={<Navigate to="/dashboard/live" replace />} />
          <Route path="/alerts" element={<Navigate to="/dashboard/alerts" replace />} />
          <Route path="/safety-history" element={<Navigate to="/dashboard/history" replace />} />
          <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
          <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
          <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />

          {/* Normal User Dashboard Experience ("My Safety" - 1 User + 1 Helmet) */}
          <Route
            path="/dashboard"
            element={
              <UserProtectedRoute>
                <UserDashboardLayout />
              </UserProtectedRoute>
            }
          >
            <Route index element={<UserOverviewView />} />
            <Route path="live" element={<UserLiveMonitoringView />} />
            <Route path="alerts" element={<UserAlertsView />} />
            <Route path="history" element={<UserSafetyHistoryView />} />
            <Route path="analytics" element={<UserAnalyticsView />} />
            <Route path="reports" element={<UserReportsView />} />
            <Route path="profile" element={<UserProfileView />} />
          </Route>

          {/* Admin Dashboard Experience ("System Safety" - Multi-Helmet / Multi-User) */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewView />} />
            <Route path="live" element={<AdminLiveView />} />
            <Route path="helmets" element={<AdminHelmetsView />} />
            <Route path="users" element={<AdminUsersView />} />
            <Route path="alerts" element={<AdminAlertsView />} />
            <Route path="incidents" element={<AdminIncidentsView />} />
            <Route path="analytics" element={<AdminAnalyticsView />} />
            <Route path="reports" element={<AdminReportsView />} />
            <Route path="system" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
