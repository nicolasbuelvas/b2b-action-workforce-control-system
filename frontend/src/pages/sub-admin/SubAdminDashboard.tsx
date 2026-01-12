import React from 'react';
import './SubAdminDashboard.css';

const PERFORMANCE_DATA = [
  { role: 'LinkedIn Auditors', efficiency: '94%', volume: '1,240 cases' },
  { role: 'Website Auditors', efficiency: '88%', volume: '850 cases' },
  { role: 'Researchers', efficiency: '99%', volume: '5,000 leads' }
];

export default function SubAdminDashboard() {
  return (
    <div className="subadmin-dashboard">
      <header className="sa-header">
        <div>
          <h1>Operations Overview</h1>
          <p>Supervising the efficiency of active audit and research teams.</p>
        </div>
        <div className="sa-date-selector">
          <span>Reporting Period:</span>
          <select><option>Last 24 Hours</option><option>Last 7 Days</option></select>
        </div>
      </header>

      <div className="sa-top-stats">
        <div className="sa-stat-card">
          <label>Total Submissions</label>
          <h3>14,209</h3>
          <span className="trend positive">+12% vs last period</span>
        </div>
        <div className="sa-stat-card">
          <label>Avg. Audit Time</label>
          <h3>1.2 mins</h3>
          <span className="trend negative">+5s vs target</span>
        </div>
        <div className="sa-stat-card">
          <label>Fraud Catch Rate</label>
          <h3>3.8%</h3>
          <span className="trend positive">Improved by 0.4%</span>
        </div>
      </div>

      <div className="sa-grid">
        <section className="sa-card performance-table">
          <h3>Team Performance Matrix</h3>
          <table className="sa-table">
            <thead>
              <tr>
                <th>Role Category</th>
                <th>Avg. Efficiency</th>
                <th>Volume Handled</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_DATA.map(row => (
                <tr key={row.role}>
                  <td><strong>{row.role}</strong></td>
                  <td>{row.efficiency}</td>
                  <td>{row.volume}</td>
                  <td><div className="health-bar"><div className="fill" style={{width: row.efficiency}}></div></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="sa-card recent-alerts">
          <h3>Critical Priority Flags</h3>
          <div className="alert-list">
            <div className="alert-item high">
              <div className="a-dot"></div>
              <div className="a-body">
                <p><strong>Mass Rejection:</strong> Auditor Admin_2 rejected 45 tasks in 2 mins.</p>
                <span>Potential Error • 14:02 PM</span>
              </div>
              <button className="btn-investigate">Review</button>
            </div>
            <div className="alert-item medium">
              <div className="a-dot"></div>
              <div className="a-body">
                <p><strong>Capacity Alert:</strong> Website queue exceeded 200 items.</p>
                <span>Scaling Required • 13:45 PM</span>
              </div>
              <button className="btn-investigate">Review</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}