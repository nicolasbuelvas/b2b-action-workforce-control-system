import { useState } from 'react';
import StatCard from '../../components/cards/StatCard';
import './rolePerformancePage.css';

type UserRole = 'Researcher' | 'Inquirer' | 'Reviewer';

interface RolePerformance {
  id: string;
  role: UserRole;
  category: string;
  tasksCompleted: number;
  successRate: number;
  avgTimeMinutes: number;
  earningsUSD: number;
  status: 'Active' | 'Inactive';
}

export default function RolePerformancePage() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [performance] = useState<RolePerformance[]>([
    {
      id: 'PERF-001',
      role: 'Researcher',
      category: 'Product A',
      tasksCompleted: 1240,
      successRate: 92,
      avgTimeMinutes: 3.4,
      earningsUSD: 310,
      status: 'Active',
    },
    {
      id: 'PERF-002',
      role: 'Inquirer',
      category: 'Product B',
      tasksCompleted: 540,
      successRate: 88,
      avgTimeMinutes: 5.2,
      earningsUSD: 216,
      status: 'Active',
    },
    {
      id: 'PERF-003',
      role: 'Reviewer',
      category: 'Product C',
      tasksCompleted: 310,
      successRate: 95,
      avgTimeMinutes: 2.1,
      earningsUSD: 465,
      status: 'Inactive',
    },
  ]);

  const totalTasks = performance.reduce((a, p) => a + p.tasksCompleted, 0);
  const avgSuccess =
    performance.reduce((a, p) => a + p.successRate, 0) / performance.length;

  return (
    <div className="categories-container">
      {/* WIP */}
      <div className="wip-banner">
        <span>SYSTEM MODULE: WORK IN PROGRESS (W.I.P)</span>
      </div>

      {/* HEADER */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Role Performance</h1>
          <p>Operational analytics by role and category.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export Metrics</button>
        </div>
      </header>

      {/* STATS */}
      <section className="categories-stats-grid">
        <StatCard title="Total Tasks" value={totalTasks} />
        <StatCard title="Avg Success Rate" value={`${avgSuccess.toFixed(1)}%`} />
        <StatCard title="Active Roles" value={performance.filter(p => p.status === 'Active').length} />
        <StatCard title="Total Earnings ($)" value={performance.reduce((a, p) => a + p.earningsUSD, 0)} />
      </section>

      {/* MANAGEMENT BAR */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by role, category or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select><option>Role: All</option></select>
          <select><option>Category: All</option></select>
          <button className="btn-clear">Clear</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Role / Category</th>
                <th className="txt-center">Tasks</th>
                <th className="txt-center">Success</th>
                <th className="txt-center">Avg Time</th>
                <th className="txt-center">Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {performance.map(p => (
                <tr key={p.id} className="cat-row">
                  <td>
                    <div className="cat-info-cell">
                      <span className="cat-id">{p.id}</span>
                      <strong className="cat-name">{p.role}</strong>
                      <span className="perf-category">{p.category}</span>
                    </div>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{p.tasksCompleted}</span>
                  </td>
                  <td className="txt-center">
                    <span className="success-rate">{p.successRate}%</span>
                  </td>
                  <td className="txt-center">
                    <span className="avg-time">{p.avgTimeMinutes} min</span>
                  </td>
                  <td className="txt-center">
                    <span className="earnings">${p.earningsUSD}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}