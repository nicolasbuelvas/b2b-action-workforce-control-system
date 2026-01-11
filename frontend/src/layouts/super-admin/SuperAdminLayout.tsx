import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import './superAdminLayout.css';

export default function SuperAdminLayout() {
  return (
    <div className="sa-shell">
      <SuperAdminSidebar />

      <div className="sa-main">
        <header className="sa-topbar">
          <span className="sa-topbar-title">Super Admin Panel</span>

          <div className="sa-topbar-actions">
            <button className="sa-logout-btn">Logout</button>
          </div>
        </header>

        <main className="sa-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}