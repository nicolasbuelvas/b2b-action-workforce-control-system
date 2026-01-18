import { useEffect, useState } from 'react';
import { getAdminDashboard, getAdminCategories, getTopWorkers, getSystemLogs } from '../../api/admin.api';
import StatCard from '../../components/cards/StatCard';
import DataTable from '../../components/tables/DataTable';
import './superAdminDashboard.css';

interface DashboardData {
  totalUsers: number;
  totalResearchers: number;
  totalInquirers: number;
  totalAuditors: number;
  totalActionsSubmitted: number;
  totalActionsApproved: number;
  totalActionsRejected: number;
  approvalRate: number;
}

interface CategoryData {
  id: string;
  name: string;
  totalActions: number;
  approvedActions: number;
  rejectedActions: number;
  cooldownRules: Record<string, number>;
  dailyLimits: any;
}

interface TopWorkersData {
  researchers: Array<{ userId: string; count: number }>;
  inquirers: Array<{ userId: string; count: number }>;
  auditors: Array<{ userId: string; count: number }>;
}

interface LogData {
  id: string;
  type: string;
  status?: string;
  decision?: string;
  createdAt: string;
  performedByUserId?: string;
  auditorUserId?: string;
}

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [topWorkers, setTopWorkers] = useState<TopWorkersData | null>(null);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminDashboard().then(setDashboardData),
      getAdminCategories().then(setCategories),
      getTopWorkers().then(setTopWorkers),
      getSystemLogs().then(setLogs),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader">Loading System...</div>;

  const formatCooldownRules = (rules: Record<string, number>) => {
    if (!rules || Object.keys(rules).length === 0) return 'No cooldowns';
    
    const humanReadable: Record<string, string> = {
      website_inquiry: 'Website Inquiry',
      linkedin_inquiry: 'LinkedIn Inquiry',
      // Add more mappings as needed
    };
    
    return Object.entries(rules)
      .map(([key, days]) => `${humanReadable[key] || key}: ${days}d`)
      .join(', ');
  };

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
        <StatCard title="Total Users" value={dashboardData?.totalUsers ?? 0} />
        <StatCard title="Total Researchers" value={dashboardData?.totalResearchers ?? 0} />
        <StatCard title="Total Inquirers" value={dashboardData?.totalInquirers ?? 0} />
        <StatCard title="Total Auditors" value={dashboardData?.totalAuditors ?? 0} />
        <StatCard title="Actions Submitted" value={dashboardData?.totalActionsSubmitted ?? 0} />
        <StatCard title="Actions Approved" value={dashboardData?.totalActionsApproved ?? 0} />
        <StatCard title="Actions Rejected" value={dashboardData?.totalActionsRejected ?? 0} />
        <StatCard title="Approval Rate %" value={`${dashboardData?.approvalRate ?? 0}%`} />
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

          {/* CATEGORIES OVERVIEW */}
          <div className="sa-card">
            <div className="sa-card-header">
              <h3>Categories Overview</h3>
            </div>
            <div className="ranking-table-wrapper">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Actions</th>
                    <th>Approved</th>
                    <th>Rejected</th>
                    <th>Cooldown Rules</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length ? categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>{cat.totalActions}</td>
                      <td>{cat.approvedActions}</td>
                      <td>{cat.rejectedActions}</td>
                      <td>{formatCooldownRules(cat.cooldownRules)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5}>No categories yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
              <h3>Top Workers by Approved Count</h3>
            </div>
            <div className="ranking-table-wrapper">
              <h4>Researchers</h4>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User ID</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topWorkers?.researchers.length ? topWorkers.researchers.map((worker, index) => (
                    <tr key={worker.userId}>
                      <td>{index + 1}</td>
                      <td>{worker.userId}</td>
                      <td>{worker.count}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3}>No ranking data yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <h4>Inquirers</h4>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User ID</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topWorkers?.inquirers.length ? topWorkers.inquirers.map((worker, index) => (
                    <tr key={worker.userId}>
                      <td>{index + 1}</td>
                      <td>{worker.userId}</td>
                      <td>{worker.count}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3}>No ranking data yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <h4>Auditors</h4>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User ID</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topWorkers?.auditors.length ? topWorkers.auditors.map((worker, index) => (
                    <tr key={worker.userId}>
                      <td>{index + 1}</td>
                      <td>{worker.userId}</td>
                      <td>{worker.count}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3}>No ranking data yet</td>
                    </tr>
                  )}
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
              {logs.length ? logs.map((log) => (
                <div className="activity-item" key={log.id}>
                  <div className={`status-indicator ${log.status || log.decision?.toLowerCase() || 'pending'}`} />
                  <div className="activity-content">
                    <div className="activity-main">
                      <strong>{log.type === 'action' ? `Action ${log.status}` : `Audit ${log.decision}`}</strong>
                      <span className={`badge-status ${log.status || log.decision?.toLowerCase() || 'pending'}`}>{(log.status || log.decision || 'pending').toUpperCase()}</span>
                    </div>
                    <div className="activity-sub">
                      <span>User: {log.performedByUserId || log.auditorUserId}</span>
                      <span className="separator">|</span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="activity-actions">
                    <button className="btn-process">View</button>
                  </div>
                </div>
              )) : (
                <div className="activity-item">
                  <div className="activity-content">
                    <div className="activity-main">
                      <strong>No activity yet</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}