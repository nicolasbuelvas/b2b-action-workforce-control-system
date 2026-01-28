import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './SuperAdminSidebar.css';

export default function AppSidebar() {
  const { user } = useAuthContext();
  const role = user?.role ?? '';

  const isSuperAdmin = role === 'super_admin';
  const isSubAdmin = role === 'sub_admin';
  const isAdminGroup = isSuperAdmin || isSubAdmin;

  const isResearcher = role.includes('researcher');
  const isInquirer = role.includes('inquirer');
  const isAuditor = role.includes('auditor');

  const isWeb = role.includes('website');
  const isLinkedIn = role.includes('linkedin');

  const getBase = () => {
    if (isAdminGroup) return '/super-admin';
    if (isAuditor) return '/auditor';
    return '/worker';
  };

  // Build the message path based on role
  const getMessagesPath = () => {
    if (isSuperAdmin) return '/super-admin/messages';
    if (isSubAdmin) return '/sub-admin/messages';
    
    // Researchers
    if (role === 'website_researcher') return '/researcher/website/messages';
    if (role === 'linkedin_researcher') return '/researcher/linkedin/messages';
    
    // Inquirers
    if (role === 'website_inquirer') return '/inquirer/website/messages';
    if (role === 'linkedin_inquirer') return '/inquirer/linkedin/messages';
    
    // Auditors
    if (role === 'website_inquirer_auditor') return '/auditor/website/messages';
    if (role === 'linkedin_inquirer_auditor') return '/auditor/linkedin/messages';
    if (role === 'website_research_auditor') return '/auditor-researcher/website/messages';
    if (role === 'linkedin_research_auditor') return '/auditor-researcher/linkedin/messages';
    
    return '/messages';
  };

  const base = getBase();
  const messagesPath = getMessagesPath();

  // Genera el label y las iniciales para el logo dinámico
  const roleLabel = role.replace(/_/g, ' ').toUpperCase();
  const roleInitials = role
    .split('_')
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="sa-sidebar">
      {/* LOGO DINÁMICO SEGÚN ROL */}
      <div className="sa-logo">
        <div className="logo-box">{isAdminGroup ? 'SA' : roleInitials}</div>
        <span>{roleLabel}</span>
      </div>

      <nav className="sa-nav">
        {/* DASHBOARD ACCESIBLE PARA TODOS */}
        <NavLink to={`${base}/dashboard`} className="sa-link">
          Dashboard
        </NavLink>

        {/* ========== SECCIÓN EXCLUSIVA: SUPER / SUB ADMIN ========== */}
        {isAdminGroup && (
          <>
            <div className="sa-section">USERS</div>
            <NavLink to="/super-admin/users" className="sa-link">
              All Users
            </NavLink>
            <NavLink to="/super-admin/users/create" className="sa-link">
              Create User
            </NavLink>

            <div className="sa-section">CATEGORIES</div>
            <NavLink to="/super-admin/categories" className="sa-link">
              Categories
            </NavLink>
            <NavLink to="/super-admin/user-categories" className="sa-link">
              Assign Users
            </NavLink>
            <NavLink to="/super-admin/category-rules" className="sa-link">
              Rules
            </NavLink>

            <div className="sa-section">SYSTEM</div>
            <NavLink to="/super-admin/action-config" className="sa-link">
              Config
            </NavLink>
            <NavLink to="/super-admin/company-blacklist" className="sa-link">
              Company Blacklist
            </NavLink>
            <NavLink to="/super-admin/disapproval-reasons" className="sa-link">
              Rejection Reasons
            </NavLink>
            <NavLink to="/super-admin/company-types" className="sa-link">
              Company Types
            </NavLink>
            <NavLink to="/super-admin/job-types" className="sa-link">
              Job Types
            </NavLink>
            <NavLink to="/super-admin/pricing" className="sa-link">
              Pricing
            </NavLink>
            <NavLink to="/super-admin/role-performance" className="sa-link">
              Role Performance
            </NavLink>
            <NavLink to="/super-admin/logs" className="sa-link">
              Logs
            </NavLink>

            <div className="sa-section">COMMUNICATION</div>
            <NavLink to={`${isSuperAdmin ? '/super-admin' : '/sub-admin'}/notices`} className="sa-link">
              Notices
            </NavLink>
            <NavLink to={`${isSuperAdmin ? '/super-admin' : '/sub-admin'}/messages`} className="sa-link">
              Messages
            </NavLink>
          </>
        )}

        {/* ========== SECCIÓN: RESEARCHER Tools ========== */}
        {isResearcher && (
          <>
            <div className="sa-section">RESEARCHER TOOLS</div>
            <NavLink to="/worker/research/tasks" className="sa-link">
              Available Tasks
            </NavLink>
            <NavLink to="/worker/research/duplicates" className="sa-link">
              Check Duplicates
            </NavLink>
            <NavLink to="/worker/history" className="sa-link">
              My Submissions
            </NavLink>
            <NavLink to="/worker/ranking" className="sa-link">
              Top 3 Ranking 
            </NavLink>
            <NavLink to={messagesPath} className="sa-link">
              Messages
            </NavLink>
          </>
        )}

        {/* ========== SECCIÓN: INQUIRY Pipeline ========== */}
        {isInquirer && (
          <>
            <div className="sa-section">INQUIRY PIPELINE</div>
            <NavLink to="/worker/inquiry/tasks" className="sa-link">
              Active Outreach
            </NavLink>
            <NavLink to="/worker/uploads" className="sa-link">
              Evidence (Screenshots)
            </NavLink>
            <NavLink to="/worker/ranking" className="sa-link">
              Top 3 Ranking 
            </NavLink>
            <NavLink to={messagesPath} className="sa-link">
              Messages
            </NavLink>
          </>
        )}

        {/* ========== SECCIÓN: VERIFICATION (Auditors) ========== */}
        {isAuditor && (
          <>
            <div className="sa-section">VERIFICATION</div>
            <NavLink to="/auditor/pending" className="sa-link">
              Review Queue
            </NavLink>
            <NavLink to="/auditor/flags" className="sa-link">
              Fraud Detection
            </NavLink>
            <NavLink to="/auditor/history" className="sa-link">
              Audit History
            </NavLink>
            <NavLink to={messagesPath} className="sa-link">
              Messages
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}