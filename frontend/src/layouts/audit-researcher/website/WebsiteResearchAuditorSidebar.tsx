import { NavLink } from 'react-router-dom';

export default function WebsiteResearchAuditorSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">WRA</div>
        <span>WEBSITE RESEARCH AUDITOR</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/auditor-researcher/website/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/auditor-researcher/website/pending" className="sa-link">Pending</NavLink>
      </nav>
    </aside>
  );
}
