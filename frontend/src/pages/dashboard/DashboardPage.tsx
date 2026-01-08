import './DashboardPage.css';
import { useAuthContext } from '../../context/AuthContext';
import StatCard from '../../components/cards/StatCard';

export default function DashboardPage() {
  const { logout } = useAuthContext();

  return (
    <div className="dashboard-container">
      <header className="welcome-banner">
        <h2>Welcome back, Admin!</h2>
        <p>Here’s a snapshot of your workforce and task verification status.</p>
      </header>

      <section className="stats-grid">
        <StatCard title="Approved Actions" value={128} />
        <StatCard title="Pending Review" value={14} />
        <StatCard title="Rejected Actions" value={6} />
        <StatCard title="Active Workers" value={32} />
      </section>

      <div className="section-header">
        <h3>Top Performance Workers</h3>
        <button className="btn-primary">+ View Full Ranking</button>
      </div>

      <section className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Worker ID</th>
              <th>Category</th>
              <th>Accuracy Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#1023</td>
              <td>LinkedIn Inquirer</td>
              <td>98%</td>
              <td>
                <span className="badge badge-active">High Trust</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <button onClick={logout} className="btn-primary" style={{ marginTop: 24 }}>
        Logout
      </button>
    </div>
  );
}