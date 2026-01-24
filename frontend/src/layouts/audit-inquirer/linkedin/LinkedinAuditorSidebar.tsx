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
      </nav>
    </aside>
  );
}
