import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin.api';
import StatCard from '../../components/cards/StatCard';
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
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader">Loading system…</div>;

  return (
    <div className="sa-container">

      {/* HEADER */}
      <header className="sa-header-banner">
        <div>
          <h1>Super Admin Control Center</h1>
          <p>Global monitoring and rule enforcement</p>
        </div>
        <span className="sa-live-indicator">LIVE</span>
      </header>

      {/* STATS */}
      <section className="sa-stats-grid">
        <StatCard title="Total Workforce" value={data?.usersCount ?? 0} />
        <StatCard title="Sub-Admins" value={data?.subAdminsCount ?? 0} />
        <StatCard title="Categories" value={3} />
        <StatCard title="Pending Audits" value={24} variant="highlight" />
        <StatCard title="Approvals Today" value={142} />
        <StatCard title="Monthly Payout" value="$1,240" />
      </section>

      <div className="sa-main-layout">

        {/* ACTIVITY */}
        <div>
          <div className="sa-card">
            <div className="sa-card-header">
              <h3>System Activity Logs</h3>
              <button className="btn-link">View all</button>
            </div>

            <ul className="activity-list">
              {[
                'Website Research submitted',
                'LinkedIn Inquiry screenshot uploaded',
                'Duplicate screenshot flagged',
              ].map((text, i) => (
                <li key={i}>
                  <div className="activity-dot" />
                  <div className="activity-info">
                    <strong>{text}</strong>
                    <span>2 minutes ago</span>
                  </div>
                  <div className="activity-actions">
                    <button className="btn-outline">Details</button>
                    <button className="btn-primary">Review</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RANKING */}
          <div className="sa-card">
            <div className="sa-card-header">
              <h3>Top Performance (Monthly)</h3>
            </div>

            <ul className="ranking-list">
              {[
                'Website Researcher',
                'LinkedIn Researcher',
                'Website Inquirer',
                'LinkedIn Inquirer',
                'Website Auditor',
                'LinkedIn Auditor',
              ].map((role, i) => (
                <li key={i}>
                  <span className="rank-index">{i + 1}</span>
                  <div>
                    <strong>Worker #{100 + i}</strong>
                    <span>{role}</span>
                  </div>
                  <span className="rank-score">96%</span>
                  <button className="btn-outline">Review</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SIDE */}
        <aside>
          <div className="sa-card">
            <h3>Quick Actions</h3>
            <div className="quick-grid">
              <button>Create User</button>
              <button>Create Category</button>
              <button>Pricing</button>
              <button>Export</button>
            </div>
          </div>

          <div className="sa-card">
            <h3>Active Rules</h3>
            <div className="rule-item"><span>Cooldown</span><strong>30 days</strong></div>
            <div className="rule-item"><span>Screenshot Hashing</span><strong>Enabled</strong></div>
            <div className="rule-item"><span>New Worker Audit</span><strong>100%</strong></div>
            <button className="btn-primary full">Edit Rules</button>
          </div>
        </aside>

      </div>
    </div>
  );
}