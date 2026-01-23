import { NavLink } from 'react-router-dom';

export default function LinkedinResearchAuditorSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">LRA</div>
        <span>LINKEDIN RESEARCH AUDITOR</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/auditor-researcher/linkedin/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/auditor-researcher/linkedin/pending" className="sa-link">Pending</NavLink>
      </nav>
    </aside>
  );
}
