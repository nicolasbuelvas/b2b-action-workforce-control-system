import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import ForbiddenPage from '../pages/system/ForbiddenPage';

/* ===== LAYOUTS ===== */
import SuperAdminLayout from '../layouts/super-admin/SuperAdminLayout';
import SubAdminLayout from '../layouts/sub-admin/SubAdminLayout';

import WebsiteResearcherLayout from '../layouts/researcher/website/WebsiteResearcherLayout';
import LinkedinResearcherLayout from '../layouts/researcher/linkedin/LinkedinResearcherLayout';

import WebsiteInquirerLayout from '../layouts/inquirer/website/WebsiteInquirerLayout';
import LinkedinInquirerLayout from '../layouts/inquirer/linkedin/LinkedinInquirerLayout';

import WebsiteInquirerAuditorLayout from '../layouts/audit-inquirer/website/WebsiteAuditorLayout';
import LinkedinInquirerAuditorLayout from '../layouts/audit-inquirer/linkedin/LinkedinAuditorLayout';

import WebsiteResearchAuditorLayout from '../layouts/audit-researcher/website/WebsiteResearchAuditorLayout';
import LinkedinResearchAuditorLayout from '../layouts/audit-researcher/linkedin/LinkedinResearchAuditorLayout';

/* ===== DASHBOARDS ===== */
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import SubAdminDashboard from '../pages/sub-admin/SubAdminDashboard';

import WebsiteResearcherDashboard from '../pages/research/website/WebsiteResearcherDashboard';
import LinkedinResearcherDashboard from '../pages/research/linkedin/LinkedinResearcherDashboard';

import WebsiteInquirerDashboard from '../pages/inquiry/website/WebsiteInquirerDashboard';
import LinkedinInquirerDashboard from '../pages/inquiry/linkedin/LinkedinInquirerDashboard';

import WebsiteAuditorDashboard from '../pages/audit-inquirer/website/WebsiteAuditorDashboard';
import LinkedinAuditorDashboard from '../pages/audit-inquirer/linkedin/LinkedinAuditorDashboard';

/* ===== ADMIN PAGES ===== */
import UsersPage from '../pages/admin/UsersPage';
import CreateUserPage from '../pages/admin/CreateUserPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import CategoryRulesPage from '../pages/admin/CategoryRulesPage';
import ActionConfigPage from '../pages/admin/ActionConfigPage';
import PricingPage from '../pages/admin/PricingPage';
import RolePerformancePage from '../pages/admin/RolePerformancePage';
import SystemLogsPage from '../pages/admin/SystemLogsPage';
import UserCategoryAssignment from '../pages/admin/UserCategoryAssignment';

/* ===== RESEARCH PAGES ===== */
import WebsiteResearchTasksPage from '../pages/research/website/WebsiteResearchTasksPage';
import LinkedinResearchTasksPage from '../pages/research/linkedin/LinkedinResearchTasksPage';

/* ===== INQUIRY PAGES ===== */
import WebsiteInquiryTasksPage from '../pages/inquiry/website/WebsiteInquiryTasksPage';
import WebsiteEvidenceUploadsPage from '../pages/inquiry/website/WebsiteEvidenceUploadsPage';

import LinkedinInquiryTasksPage from '../pages/inquiry/linkedin/LinkedinInquiryTasksPage';
import LinkedinEvidenceUploadsPage from '../pages/inquiry/linkedin/LinkedinEvidenceUploadsPage';

/* ===== AUDIT PAGES ===== */
import WebsiteAuditorPendingPage from '../pages/audit-inquirer/website/WebsiteAuditorPendingPage';
import WebsiteAuditorFlagsPage from '../pages/audit-inquirer/website/WebsiteAuditorFlagsPage';
import WebsiteAuditorHistoryPage from '../pages/audit-inquirer/website/WebsiteAuditorHistoryPage';

import LinkedinAuditorPendingPage from '../pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage';
import LinkedinAuditorFlagsPage from '../pages/audit-inquirer/linkedin/LinkedinAuditorFlagsPage';
import LinkedinAuditorHistoryPage from '../pages/audit-inquirer/linkedin/LinkedinAuditorHistoryPage';

import WebsiteResearchAuditorDashboard from '../pages/audit-researcher/website/WebsiteResearchAuditorDashboard';
import WebsiteResearchAuditorPendingPage from '../pages/audit-researcher/website/WebsiteResearchAuditorPendingPage';

import LinkedinResearchAuditorDashboard from '../pages/audit-researcher/linkedin/LinkedinResearchAuditorDashboard';
import LinkedinResearchAuditorPendingPage from '../pages/audit-researcher/linkedin/LinkedinResearchAuditorPendingPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      {/* ========= SUPER ADMIN ========= */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/create" element={<CreateUserPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="user-categories" element={<UserCategoryAssignment />} />
          <Route path="category-rules" element={<CategoryRulesPage />} />
          <Route path="action-config" element={<ActionConfigPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="role-performance" element={<RolePerformancePage />} />
          <Route path="logs" element={<SystemLogsPage />} />
        </Route>
      </Route>

      {/* ========= SUB ADMIN ========= */}
      <Route element={<ProtectedRoute allowedRoles={['sub_admin']} />}>
        <Route path="/sub-admin" element={<SubAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SubAdminDashboard />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="category-rules" element={<CategoryRulesPage />} />
          <Route path="role-performance" element={<RolePerformancePage />} />
        </Route>
      </Route>

      {/* ========= WEBSITE RESEARCHER ========= */}
      <Route element={<ProtectedRoute allowedRoles={['website_researcher']} />}>
        <Route path="/researcher/website" element={<WebsiteResearcherLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WebsiteResearcherDashboard />} />
          <Route path="tasks" element={<WebsiteResearchTasksPage />} />
        </Route>
      </Route>

      {/* ========= LINKEDIN RESEARCHER ========= */}
      <Route element={<ProtectedRoute allowedRoles={['linkedin_researcher']} />}>
        <Route path="/researcher/linkedin" element={<LinkedinResearcherLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LinkedinResearcherDashboard />} />
          <Route path="tasks" element={<LinkedinResearchTasksPage />} />
        </Route>
      </Route>

      {/* ========= WEBSITE INQUIRER ========= */}
      <Route element={<ProtectedRoute allowedRoles={['website_inquirer']} />}>
        <Route path="/inquirer/website" element={<WebsiteInquirerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WebsiteInquirerDashboard />} />
          <Route path="tasks" element={<WebsiteInquiryTasksPage />} />
          <Route path="uploads" element={<WebsiteEvidenceUploadsPage />} />
        </Route>
      </Route>

      {/* ========= LINKEDIN INQUIRER ========= */}
      <Route element={<ProtectedRoute allowedRoles={['linkedin_inquirer']} />}>
        <Route path="/inquirer/linkedin" element={<LinkedinInquirerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LinkedinInquirerDashboard />} />
          <Route path="tasks" element={<LinkedinInquiryTasksPage />} />
          <Route path="uploads" element={<LinkedinEvidenceUploadsPage />} />
        </Route>
      </Route>

      {/* ========= WEBSITE INQUIRER AUDITOR ========= */}
      <Route element={<ProtectedRoute allowedRoles={['website_inquirer_auditor']} />}>
        <Route path="/auditor/website" element={<WebsiteInquirerAuditorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WebsiteAuditorDashboard />} />
          <Route path="pending" element={<WebsiteAuditorPendingPage />} />
          <Route path="flags" element={<WebsiteAuditorFlagsPage />} />
          <Route path="history" element={<WebsiteAuditorHistoryPage />} />
        </Route>
      </Route>

      {/* ========= LINKEDIN INQUIRER AUDITOR ========= */}
      <Route element={<ProtectedRoute allowedRoles={['linkedin_inquirer_auditor']} />}>
        <Route path="/auditor/linkedin" element={<LinkedinInquirerAuditorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LinkedinAuditorDashboard />} />
          <Route path="pending" element={<LinkedinAuditorPendingPage />} />
          <Route path="flags" element={<LinkedinAuditorFlagsPage />} />
          <Route path="history" element={<LinkedinAuditorHistoryPage />} />
        </Route>
      </Route>

      {/* ========= WEBSITE RESEARCH AUDITOR ========= */}
      <Route element={<ProtectedRoute allowedRoles={['website_research_auditor']} />}>
        <Route path="/auditor-researcher/website" element={<WebsiteResearchAuditorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WebsiteResearchAuditorDashboard />} />
          <Route path="pending" element={<WebsiteResearchAuditorPendingPage />} />
        </Route>
      </Route>

      {/* ========= LINKEDIN RESEARCH AUDITOR ========= */}
      <Route element={<ProtectedRoute allowedRoles={['linkedin_research_auditor']} />}>
        <Route path="/auditor-researcher/linkedin" element={<LinkedinResearchAuditorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LinkedinResearchAuditorDashboard />} />
          <Route path="pending" element={<LinkedinResearchAuditorPendingPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}