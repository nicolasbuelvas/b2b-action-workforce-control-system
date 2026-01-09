import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin.api';
import StatCard from '../../components/cards/StatCard';
import './superAdminDashboard.css';

interface DashboardData {
  usersCount: number;
  subAdminsCount: number;
}

type RankingCategory = 
  | 'Website Researcher' | 'LinkedIn Researcher' 
  | 'Website Inquirer' | 'LinkedIn Inquirer' 
  | 'Website Auditor' | 'LinkedIn Auditor';

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRank, setSelectedRank] = useState<RankingCategory>('Website Researcher');

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader">Loading System...</div>;

  return (
    <div className="sa-container">
      {/* HEADER */}
      <header className="sa-header-banner">
        <div className="sa-header-content">
          <h1>Super Admin Control Center</h1>
          <p>Global monitoring, rule enforcement and workforce productivity</p>
        </div>
        <span className="sa-live-indicator">SYSTEM LIVE</span>
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
        {/* LEFT COLUMN */}
        <div className="sa-layout-column">
          {/* QUICK ACTIONS */}
          <div className="sa-card">
            <div className="sa-card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-grid">
              <button className="btn-action-tile">Add User</button>
              <button className="btn-action-tile">Add Category</button>
              <button className="btn-action-tile">Set Pricing</button>
              <button className="btn-action-tile">Export Data</button>
            </div>
          </div>

          {/* ACTIVE RULES */}
          <div className="sa-card">
            <div className="sa-card-header">
              <h3>Active Rules</h3>
              <button className="btn-link">Edit Rules</button>
            </div>
            <div className="rules-scroll-container">
              <div className="rule-row">
                <div className="rule-info">
                  <strong>Cooldown</strong>
                  <span>30 days</span>
                </div>
                <span className="status-tag">Active</span>
              </div>
              <div className="rule-row">
                <div className="rule-info">
                  <strong>Screenshot Hashing</strong>
                  <span>Enabled</span>
                </div>
                <span className="status-tag">Active</span>
              </div>
              <div className="rule-row">
                <div className="rule-info">
                  <strong>New Worker Audit</strong>
                  <span>100%</span>
                </div>
                <span className="status-tag">Active</span>
              </div>
            </div>
          </div>

          {/* TOP PERFORMANCE */}
          <div className="sa-card">
            <div className="sa-card-header">
              <h3>Top Performance (Monthly)</h3>
              <select 
                className="sa-select"
                value={selectedRank} 
                onChange={(e) => setSelectedRank(e.target.value as RankingCategory)}
              >
                <option value="Website Researcher">Website Researcher</option>
                <option value="LinkedIn Researcher">LinkedIn Researcher</option>
                <option value="Website Inquirer">Website Inquirer</option>
                <option value="LinkedIn Inquirer">LinkedIn Inquirer</option>
                <option value="Website Auditor">Website Auditor</option>
                <option value="LinkedIn Auditor">LinkedIn Auditor</option>
              </select>
            </div>
            <div className="ranking-table-wrapper">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Worker</th>
                    <th>Approved %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Worker #100</td>
                    <td className="txt-emerald">96%</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Worker #106</td>
                    <td className="txt-emerald">94%</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Worker #107</td>
                    <td className="txt-emerald">91%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="sa-layout-column">
          <div className="sa-card sa-full-height">
            <div className="sa-card-header">
              <h3>System Activity Logs</h3>
              <button className="btn-link">View All Logs</button>
            </div>
            
            <div className="activity-feed">
              {[
                { event: 'Website Research Submitted', worker: 'Worker #442', target: 'Company: TechCorp', status: 'pending', action: 'Process' },
                { event: 'LinkedIn Inquiry Uploaded', worker: 'Worker #891', target: 'LinkedIn: John Doe', status: 'pending', action: 'Take Action' },
                { event: 'Duplicate Screenshot Flagged', worker: 'Worker #102', target: 'Task ID: 5590', status: 'flagged', action: 'Audit' },
                { event: 'New Category Created', worker: 'Admin', target: 'Product C', status: 'approved', action: 'Details' }
              ].map((item, i) => (
                <div className="activity-item" key={i}>
                  <div className={`status-indicator ${item.status}`} />
                  <div className="activity-content">
                    <div className="activity-main">
                      <strong>{item.event}</strong>
                      <span className={`badge-status ${item.status}`}>{item.status.toUpperCase()}</span>
                    </div>
                    <div className="activity-sub">
                      <span>{item.worker}</span>
                      <span className="separator">|</span>
                      <span>{item.target}</span>
                      <span className="separator">|</span>
                      <span>2 mins ago</span>
                    </div>
                  </div>
                  <div className="activity-actions">
                    <button className="btn-process">{item.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}