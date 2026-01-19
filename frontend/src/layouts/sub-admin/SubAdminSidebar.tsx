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

        <span className="sa-section">Review / Audit</span>
        <NavLink to="/sub-admin/review/research" className="sa-link">
          Research Review
        </NavLink>
        <NavLink to="/sub-admin/review/inquiry" className="sa-link">
          Inquiry Review
        </NavLink>

        <span className="sa-section">Operations</span>
        <NavLink to="/sub-admin/categories" className="sa-link">
          Categories & Rules
        </NavLink>
        <NavLink to="/sub-admin/disapproval-reasons" className="sa-link">
          Disapproval Reasons
        </NavLink>
        <NavLink to="/sub-admin/templates" className="sa-link">
          Message Templates
        </NavLink>

        <span className="sa-section">Analytics</span>
        <NavLink to="/sub-admin/performance" className="sa-link">
          Performance
        </NavLink>
        <NavLink to="/sub-admin/top-workers" className="sa-link">
          Top Workers
        </NavLink>
        <NavLink to="/sub-admin/country-stats" className="sa-link">
          Country Stats
        </NavLink>

        <span className="sa-section">Communication</span>
        <NavLink to="/sub-admin/notices" className="sa-link">
          Notices
        </NavLink>
        <NavLink to="/sub-admin/messages" className="sa-link">
          Internal Messages
        </NavLink>

      </nav>
    </aside>
  );
}