import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import SuperAdminLayout from '../layouts/super-admin/SuperAdminLayout';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

        <Route
        path="/super-admin"
        element={
            <ProtectedRoute>
            <SuperAdminLayout />
            </ProtectedRoute>
        }
        >
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        </Route>


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}