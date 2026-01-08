import StatCard from '../../components/cards/StatCard';

export default function SuperAdminDashboard() {
  return (
    <div className="dashboard-container">
      <header className="welcome-banner">
        <h2>Welcome back, Super Admin</h2>
        <p>System-wide overview of workforce and task execution.</p>
      </header>

      <section className="stats-grid">
        <StatCard title="Total Actions" value={1240} />
        <StatCard title="Active Workers" value={86} />
        <StatCard title="Categories" value={5} />
        <StatCard title="Approval Rate" value="92%" />
      </section>

      <div className="section-header">
        <h3>Top Performing Roles</h3>
        <button className="btn-primary">View Details</button>
      </div>

      <section className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Workers</th>
              <th>Approval Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>LinkedIn Inquirers</td>
              <td>24</td>
              <td>94%</td>
              <td>
                <span className="badge badge-active">Healthy</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}