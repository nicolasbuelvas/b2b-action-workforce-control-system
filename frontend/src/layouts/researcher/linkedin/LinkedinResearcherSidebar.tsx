import { NavLink } from 'react-router-dom';

export default function LinkedinResearcherSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">LR</div>
        <span>LINKEDIN RESEARCHER</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/researcher/linkedin/dashboard" className="sa-link">
          Dashboard
        </NavLink>
        <NavLink to="/researcher/linkedin/tasks" className="sa-link">
          Tasks
        </NavLink>
      </nav>
    </aside>
  );
}
