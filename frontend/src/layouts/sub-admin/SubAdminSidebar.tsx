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

      </nav>
    </aside>
  );
}