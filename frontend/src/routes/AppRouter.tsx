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

/* ===== SUB-ADMIN PAGES ===== */
import SubAdminWebsiteResearch from '../pages/sub-admin/WebsiteResearch';
import SubAdminLinkedInResearch from '../pages/sub-admin/SubAdminLinkedInResearch';
import SubAdminCreateResearchTasks from '../pages/sub-admin/SubAdminCreateResearchTasks';
import SubAdminWebsiteInquiry from '../pages/sub-admin/SubAdminWebsiteInquiry';
import SubAdminLinkedInInquiry from '../pages/sub-admin/SubAdminLinkedInInquiry';
import SubAdminCreateInquiryTasks from '../pages/sub-admin/SubAdminCreateInquiryTasks';
import WebsiteResearchReview from '../pages/sub-admin/WebsiteResearchReview';
import LinkedInResearchReview from '../pages/sub-admin/LinkedInResearchReview';
import WebsiteInquiryReview from '../pages/sub-admin/WebsiteInquiryReview';
import LinkedInInquiryReview from '../pages/sub-admin/LinkedInInquiryReview';
import SubAdminResearchReview from '../pages/sub-admin/SubAdminResearchReview';
import SubAdminInquiryReview from '../pages/sub-admin/SubAdminInquiryReview';
import SubAdminMessages from '../pages/sub-admin/SubAdminMessages';
import SubAdminPerformance from '../pages/sub-admin/SubAdminPerformance';
import SubAdminTopWorkers from '../pages/sub-admin/SubAdminTopWorkers';
import SubAdminCompanyTypes from '../pages/sub-admin/SubAdminCompanyTypes';
import SubAdminJobTypes from '../pages/sub-admin/SubAdminJobTypes';
import SubAdminDisapprovalReasons from '../pages/sub-admin/SubAdminDisapprovalReasons';
import SubAdminNotices from '../pages/sub-admin/SubAdminNotices';
import SubAdminUsers from '../pages/sub-admin/SubAdminUsers';
import SubAdminDailyLimits from '../pages/sub-admin/SubAdminDailyLimits';
import SubAdminCreateTasks from '../pages/sub-admin/SubAdminCreateTasks';

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

import LinkedinAuditorPendingPage from '../pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage';

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
          
          {/* Management */}
          <Route path="users" element={<SubAdminUsers />} />
          <Route path="company-types" element={<SubAdminCompanyTypes />} />
          <Route path="job-types" element={<SubAdminJobTypes />} />
          <Route path="disapproval-reasons" element={<SubAdminDisapprovalReasons />} />
          <Route path="daily-limits" element={<SubAdminDailyLimits />} />
          <Route path="create-tasks" element={<SubAdminCreateTasks />} />
          
          {/* Research Tasks */}
          <Route path="research/website" element={<SubAdminWebsiteResearch />} />
          <Route path="research/linkedin" element={<SubAdminLinkedInResearch />} />
          <Route path="research/create" element={<SubAdminCreateResearchTasks />} />
          
          {/* Inquiry Tasks */}
          <Route path="inquiry/website" element={<SubAdminWebsiteInquiry />} />
          <Route path="inquiry/linkedin" element={<SubAdminLinkedInInquiry />} />
          <Route path="inquiry/create" element={<SubAdminCreateInquiryTasks />} />
          
          {/* Audit - List Pages (4 separate auditor types) */}
          <Route path="audit/website-research" element={<SubAdminResearchReview />} />
          <Route path="audit/linkedin-research" element={<SubAdminResearchReview />} />
          <Route path="audit/website-inquiry" element={<SubAdminInquiryReview />} />
          <Route path="audit/linkedin-inquiry" element={<SubAdminInquiryReview />} />
          
          {/* Review/Audit - Detail Pages */}
          <Route path="review/research/website/:taskId" element={<WebsiteResearchReview />} />
          <Route path="review/research/linkedin/:taskId" element={<LinkedInResearchReview />} />
          <Route path="review/inquiry/website/:taskId" element={<WebsiteInquiryReview />} />
          <Route path="review/inquiry/linkedin/:taskId" element={<LinkedInInquiryReview />} />
          
          {/* Performance & Analytics */}
          <Route path="performance" element={<SubAdminPerformance />} />
          <Route path="top-workers" element={<SubAdminTopWorkers />} />
          
          {/* Communication */}
          <Route path="notices" element={<SubAdminNotices />} />
          <Route path="messages" element={<SubAdminMessages />} />
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
        </Route>
      </Route>

      {/* ========= LINKEDIN INQUIRER AUDITOR ========= */}
      <Route element={<ProtectedRoute allowedRoles={['linkedin_inquirer_auditor']} />}>
        <Route path="/auditor/linkedin" element={<LinkedinInquirerAuditorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LinkedinAuditorDashboard />} />
          <Route path="pending" element={<LinkedinAuditorPendingPage />} />
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