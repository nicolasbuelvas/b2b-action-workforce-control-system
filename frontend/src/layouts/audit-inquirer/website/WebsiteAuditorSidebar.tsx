import { NavLink } from 'react-router-dom';

export default function WebsiteAuditorSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">WA</div>
        <span>WEBSITE AUDITOR</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/auditor/website/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/auditor/website/pending" className="sa-link">Pending</NavLink>
        <NavLink to="/auditor/website/flags" className="sa-link">Flags</NavLink>
        <NavLink to="/auditor/website/history" className="sa-link">History</NavLink>
      </nav>
    </aside>
  );
}
