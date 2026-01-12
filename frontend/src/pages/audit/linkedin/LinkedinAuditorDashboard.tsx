import React from 'react';
import './LinkedinAuditorDashboard.css';

const STATS = [
  { label: 'Pending Reviews', value: '42', icon: '⏳', color: '#6366f1' },
  { label: 'Approved Today', value: '128', icon: '✅', color: '#10b981' },
  { label: 'Rejected (Fraud)', value: '3', icon: '⚠️', color: '#ef4444' },
  { label: 'Avg. Decision Time', value: '54s', icon: '⏱️', color: '#f59e0b' }
];

const RECENT_WORKERS = [
  { name: 'Michael C.', submissions: 12, quality: '98%', status: 'Active' },
  { name: 'Sarah L.', submissions: 8, quality: '92%', status: 'Away' },
  { name: 'Kevin J.', submissions: 24, quality: '100%', status: 'Active' }
];

export default function LinkedinAuditorDashboard() {
  return (
    <div className="li-dash-container">
      <header className="dash-header">
        <div>
          <h1>LinkedIn Audit Command Center</h1>
          <p>Real-time oversight of multi-action outreach workflows.</p>
        </div>
        <button className="btn-primary-action">Start New Review Session</button>
      </header>

      <div className="stats-row">
        {STATS.map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
            <div className="stat-data">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="dash-section performance">
          <div className="section-header">
            <h3>Recent Submissions Queue</h3>
            <button className="btn-text">View All</button>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Worker</th>
                <th>Steps</th>
                <th>Time Elapsed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sarah Jenkins</strong></td>
                <td>@worker_li_09</td>
                <td><span className="step-tag">2 / 3</span></td>
                <td>14 mins ago</td>
                <td><button className="btn-row-action">Audit</button></td>
              </tr>
              <tr>
                <td><strong>Mark Zuckerberg</strong></td>
                <td>@worker_li_22</td>
                <td><span className="step-tag">1 / 3</span></td>
                <td>32 mins ago</td>
                <td><button className="btn-row-action">Audit</button></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="dash-section active-researchers">
          <h3>Top Active Researchers</h3>
          <div className="researcher-list">
            {RECENT_WORKERS.map(w => (
              <div key={w.name} className="res-item">
                <div className="res-avatar">{w.name[0]}</div>
                <div className="res-info">
                  <p className="res-name">{w.name}</p>
                  <p className="res-subs">{w.submissions} submissions today</p>
                </div>
                <div className="res-metrics">
                  <span className="res-quality">{w.quality}</span>
                  <span className={`status-dot ${w.status.toLowerCase()}`}></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}