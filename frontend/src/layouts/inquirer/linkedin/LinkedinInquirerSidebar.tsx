import { NavLink } from 'react-router-dom';

export default function LinkedinInquirerSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">LI</div>
        <span>LINKEDIN INQUIRER</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/inquirer/linkedin/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/inquirer/linkedin/tasks" className="sa-link">Tasks</NavLink>
        <NavLink to="/inquirer/linkedin/uploads" className="sa-link">Uploads</NavLink>
      </nav>
    </aside>
  );
}
