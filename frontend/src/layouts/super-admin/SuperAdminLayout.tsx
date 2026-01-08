import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import './superAdminLayout.css';

export default function SuperAdminLayout() {
  return (
    <div className="sa-shell">
      <SuperAdminSidebar />

      <div className="sa-main">
        <header className="sa-topbar">
          <span>Super Admin Panel</span>
        </header>

        <main className="sa-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}