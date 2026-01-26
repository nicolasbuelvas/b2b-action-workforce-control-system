import { NavLink } from 'react-router-dom';

export default function SubAdminSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">SA</div>
        <span>SUB ADMIN</span>
      </div>

      <nav className="sa-nav">

        <span className="sa-section">Dashboard</span>
        <NavLink to="/sub-admin/dashboard" className="sa-link">
          Dashboard
        </NavLink>

        <span className="sa-section">Management</span>
        <NavLink to="/sub-admin/users" className="sa-link">
          Users
        </NavLink>
        <NavLink to="/sub-admin/company-types" className="sa-link">
          Company Types
        </NavLink>
        <NavLink to="/sub-admin/job-types" className="sa-link">
          Job Types
        </NavLink>
        <NavLink to="/sub-admin/disapproval-reasons" className="sa-link">
          Disapproval Reasons
        </NavLink>
        <NavLink to="/sub-admin/daily-limits" className="sa-link">
          Daily Limits
        </NavLink>
        <NavLink to="/sub-admin/create-tasks" className="sa-link">
          Create Tasks
        </NavLink>

        <span className="sa-section">Research</span>
        <NavLink to="/sub-admin/research/website" className="sa-link">
          Website Research
        </NavLink>
        <NavLink to="/sub-admin/research/linkedin" className="sa-link">
          LinkedIn Research
        </NavLink>

        <span className="sa-section">Inquiry</span>
        <NavLink to="/sub-admin/inquiry/website" className="sa-link">
          Website Inquiry
        </NavLink>
        <NavLink to="/sub-admin/inquiry/linkedin" className="sa-link">
          LinkedIn Inquiry
        </NavLink>

        <span className="sa-section">Audit</span>
        <NavLink to="/sub-admin/audit/website-research" className="sa-link">
          Website Research Auditor
        </NavLink>
        <NavLink to="/sub-admin/audit/linkedin-research" className="sa-link">
          LinkedIn Research Auditor
        </NavLink>
        <NavLink to="/sub-admin/audit/website-inquiry" className="sa-link">
          Website Inquirer Auditor
        </NavLink>
        <NavLink to="/sub-admin/audit/linkedin-inquiry" className="sa-link">
          LinkedIn Inquirer Auditor
        </NavLink>

        <span className="sa-section">Analytics</span>
        <NavLink to="/sub-admin/performance" className="sa-link">
          Performance
        </NavLink>
        <NavLink to="/sub-admin/top-workers" className="sa-link">
          Top Workers
        </NavLink>

        <span className="sa-section">Communication</span>
        <NavLink to="/sub-admin/notices" className="sa-link">
          Notices
        </NavLink>
        <NavLink to="/sub-admin/messages" className="sa-link">
          Messages
        </NavLink>

      </nav>
    </aside>
  );
}