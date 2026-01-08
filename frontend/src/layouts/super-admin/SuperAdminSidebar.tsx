import { NavLink } from 'react-router-dom';

export default function SuperAdminSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">Super Admin</div>

      <nav className="sa-nav">
        <NavLink to="/super-admin/dashboard" className="sa-link">
          Dashboard
        </NavLink>

        <div className="sa-section">Users</div>
        <NavLink to="/super-admin/users" className="sa-link">
          All Users
        </NavLink>
        <NavLink to="/super-admin/users/create" className="sa-link">
          Create User
        </NavLink>

        <div className="sa-section">Categories</div>
        <NavLink to="/super-admin/categories" className="sa-link">
          Manage Categories
        </NavLink>
        <NavLink to="/super-admin/category-rules" className="sa-link">
          Category Rules
        </NavLink>

        <div className="sa-section">Configuration</div>
        <NavLink to="/super-admin/action-config" className="sa-link">
          Action Config
        </NavLink>
        <NavLink to="/super-admin/pricing" className="sa-link">
          Pricing & Payments
        </NavLink>

        <div className="sa-section">Analytics</div>
        <NavLink to="/super-admin/role-performance" className="sa-link">
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