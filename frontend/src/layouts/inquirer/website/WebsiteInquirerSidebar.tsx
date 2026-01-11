import { NavLink } from 'react-router-dom';

export default function WebsiteInquirerSidebar() {
  return (
    <aside className="sa-sidebar">
      <div className="sa-logo">
        <div className="logo-box">WI</div>
        <span>WEBSITE INQUIRER</span>
      </div>

      <nav className="sa-nav">
        <NavLink to="/inquirer/website/dashboard" className="sa-link">Dashboard</NavLink>
        <NavLink to="/inquirer/website/tasks" className="sa-link">Tasks</NavLink>
        <NavLink to="/inquirer/website/uploads" className="sa-link">Uploads</NavLink>
      </nav>
    </aside>
  );
}