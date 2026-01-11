import { NavLink } from 'react-router-dom';

export default function WebsiteResearcherSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">WR</div>
        <span>WEBSITE RESEARCHER</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/researcher/website/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/researcher/website/tasks" className="sa-link">Tasks</NavLink>
      </nav>
    </aside>
  );
}
