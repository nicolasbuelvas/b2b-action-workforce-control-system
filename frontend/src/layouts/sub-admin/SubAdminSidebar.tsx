import { NavLink } from 'react-router-dom';

export default function SubAdminSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">SA</div>
        <span>SUB ADMIN</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/sub-admin/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/sub-admin/categories" className="sa-link">Categories</NavLink>
        <NavLink to="/sub-admin/category-rules" className="sa-link">Rules</NavLink>
        <NavLink to="/sub-admin/role-performance" className="sa-link">Performance</NavLink>
      </nav>
    </aside>
  );
}
