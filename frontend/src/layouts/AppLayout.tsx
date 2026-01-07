import { Outlet } from 'react-router-dom';
import './appLayout.css';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>B2B</h2>
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="#">Tasks</a>
          <a href="#">Payments</a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Logged in</span>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}