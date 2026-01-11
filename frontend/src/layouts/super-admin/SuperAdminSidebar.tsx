import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './SuperAdminSidebar.css';

export default function AppSidebar() {
  const { user } = useAuthContext();
  const role = user?.role;

  const getBase = () => {
    if (role === 'super_admin' || role === 'sub_admin') return '/super-admin';
    if (role?.includes('auditor')) return '/auditor';
    return '/worker';
  };

  const base = getBase();

  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">
          {role?.split('_').map((w: string) => w[0]).join('').toUpperCase()}
        </div>
        <span>{role?.replace('_', ' ').toUpperCase()}</span>
      </div>

      <nav className="sa-nav">
        <NavLink to={`${base}/dashboard`} className="sa-link">Dashboard</NavLink>

        {(role === 'super_admin' || role === 'sub_admin') && (
          <>
            <div className="sa-section">Users</div>
            <NavLink to="/super-admin/users" className="sa-link">All Users</NavLink>
            <NavLink to="/super-admin/users/create" className="sa-link">Create User</NavLink>

            <div className="sa-section">Categories</div>
            <NavLink to="/super-admin/categories" className="sa-link">Categories</NavLink>
            <NavLink to="/super-admin/category-rules" className="sa-link">Rules</NavLink>

            <div className="sa-section">System</div>
            <NavLink to="/super-admin/action-config" className="sa-link">Config</NavLink>
            <NavLink to="/super-admin/pricing" className="sa-link">Pricing</NavLink>
            <NavLink to="/super-admin/logs" className="sa-link">Logs</NavLink>
          </>
        )}

        {(role?.includes('researcher') || role?.includes('inquirer')) && (
          <>
            <div className="sa-section">My Tasks</div>
            <NavLink to="/worker/dashboard" className="sa-link">View Tasks</NavLink>
          </>
        )}

        {role?.includes('auditor') && (
          <>
            <div className="sa-section">Audits</div>
            <NavLink to="/auditor/dashboard" className="sa-link">Pending Reviews</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}