import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin.api';
import './superAdminDashboard.css';

interface DashboardData {
  usersCount: number;
  subAdminsCount: number;
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (!data) return <div className="page-error">Failed to load dashboard</div>;

  return (
    <div className="sa-dashboard">
      {/* Header */}
      <section className="sa-dashboard-header">
        <div>
          <h1>Welcome back, Super Admin</h1>
          <p>System-wide overview of workforce, actions, approvals and payments.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="sa-stats-grid">
        <Stat title="Total Users" value={data.usersCount} />
        <Stat title="Sub Admins" value={data.subAdminsCount} />
        <Stat title="Active Categories" value="3" />
        <Stat title="Pending Reviews" value="—" />
        <Stat title="Approved Actions (Today)" value="—" />
        <Stat title="Total Payments (This Month)" value="—" />
      </section>

      {/* Main Grid */}
      <section className="sa-dashboard-grid">
        {/* Left */}
        <div className="sa-card">
          <h3>System Activity</h3>
          <ul className="sa-list">
            <li>Website Research submissions pending review</li>
            <li>LinkedIn Inquiry screenshots awaiting audit</li>
            <li>New users awaiting approval</li>
            <li>Cooldown rules currently active</li>
          </ul>
        </div>

        {/* Right */}
        <div className="sa-card">
          <h3>Quick Actions</h3>
          <div className="sa-actions">
            <button>Create User</button>
            <button>Create Category</button>
            <button>Set Prices</button>
            <button>View Logs</button>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="sa-dashboard-grid">
        <div className="sa-card">
          <h3>Top Workers (Placeholder)</h3>
          <p>Top 3 researchers, inquirers and auditors will appear here.</p>
        </div>

        <div className="sa-card">
          <h3>System Rules Summary</h3>
          <ul className="sa-list">
            <li>Cooldown: 30 days (editable)</li>
            <li>Screenshots auto-deleted after approval</li>
            <li>Hash-based screenshot anti-reuse enabled</li>
            <li>Daily limits enforced per role</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="sa-stat">
      <span className="sa-stat-title">{title}</span>
      <strong className="sa-stat-value">{value}</strong>
    </div>
  );
}