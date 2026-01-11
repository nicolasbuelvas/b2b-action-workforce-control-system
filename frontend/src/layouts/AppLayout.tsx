import { Outlet, NavLink } from 'react-router-dom';
import './appLayout.css';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">B2B Control</div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-item">
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className="nav-item">
            Tasks
          </NavLink>
          <NavLink to="/payments" className="nav-item">
            Payments
          </NavLink>
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="top-bar">
          <span>Logged in</span>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}