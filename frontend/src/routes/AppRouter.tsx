import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';

import SuperAdminLayout from '../layouts/super-admin/SuperAdminLayout';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';

import UsersPage from '../pages/admin/UsersPage';
import CreateUserPage from '../pages/admin/CreateUserPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import CategoryRulesPage from '../pages/admin/CategoryRulesPage';
import ActionConfigPage from '../pages/admin/ActionConfigPage';
import PricingPage from '../pages/admin/PricingPage';
import RolePerformancePage from '../pages/admin/RolePerformancePage';
import SystemLogsPage from '../pages/admin/SystemLogsPage';

import ForbiddenPage from '../pages/system/ForbiddenPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      {/* Super Admin (PROTECTED) */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />

          <Route path="users" element={<UsersPage />} />
          <Route path="users/create" element={<CreateUserPage />} />

          <Route path="categories" element={<CategoriesPage />} />
          <Route path="category-rules" element={<CategoryRulesPage />} />

          <Route path="action-config" element={<ActionConfigPage />} />
          <Route path="pricing" element={<PricingPage />} />

          <Route path="role-performance" element={<RolePerformancePage />} />
          <Route path="logs" element={<SystemLogsPage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}