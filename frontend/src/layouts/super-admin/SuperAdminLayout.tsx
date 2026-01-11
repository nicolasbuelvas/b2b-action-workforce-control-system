import { Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext'; 
import AppSidebar from './SuperAdminSidebar';
import './superAdminLayout.css';

export default function AppLayout() {
  const { user, logout } = useAuthContext();

  return (
    <div className="sa-shell">
      <AppSidebar />

      <div className="sa-main">
        <header className="sa-topbar">
          <span className="sa-topbar-title">
            {user?.role.replace('_', ' ').toUpperCase()} PANEL
          </span>

          <div className="sa-topbar-actions">
            <span className="user-email-topbar">{user?.id}</span>
            <button className="sa-logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="sa-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}