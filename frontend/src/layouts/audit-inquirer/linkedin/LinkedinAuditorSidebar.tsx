import { NavLink } from 'react-router-dom';

export default function LinkedinAuditorSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">LA</div>
        <span>LINKEDIN AUDITOR</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/auditor/linkedin/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/auditor/linkedin/pending" className="sa-link">Pending</NavLink>
        <NavLink to="/auditor/linkedin/flags" className="sa-link">Flags</NavLink>
        <NavLink to="/auditor/linkedin/history" className="sa-link">History</NavLink>
      </nav>
    </aside>
  );
}
