import { NavLink } from 'react-router-dom';

export default function SuperAdminSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">B2B Control</div>

      <nav className="sa-nav">
        <NavLink to="/super-admin/dashboard" className="sa-link">
          Dashboard
        </NavLink>

        <div className="sa-section">Categories</div>
        <NavLink to="/super-admin/categories" className="sa-link">
          Manage Categories
        </NavLink>
        <NavLink to="/super-admin/category-rules" className="sa-link">
          Category Rules
        </NavLink>

        <div className="sa-section">Admins</div>
        <NavLink to="/super-admin/sub-admins" className="sa-link">
          Sub-Admins
        </NavLink>

        <div className="sa-section">Configuration</div>
        <NavLink to="/super-admin/action-config" className="sa-link">
          Action Config
        </NavLink>

        <div className="sa-section">Analytics</div>
        <NavLink to="/super-admin/analytics" className="sa-link">
          Role Performance
        </NavLink>

        <div className="sa-section">System</div>
        <NavLink to="/super-admin/logs" className="sa-link">
          Logs
        </NavLink>
      </nav>
    </aside>
  );
}