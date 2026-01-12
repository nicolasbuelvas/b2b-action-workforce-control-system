import React, { useState } from 'react';
import './LinkedinInquirerDashboard.css';

const MOCK_STATS = [
  { label: 'Connections Req.', value: '145', trend: '+12%', icon: '🤝' },
  { label: 'Messages Sent', value: '89', trend: '+5%', icon: '📩' },
  { label: 'Response Rate', value: '24%', trend: '-2%', icon: '📈' },
  { label: 'Daily Earnings', value: '$42.50', trend: '+$8.00', icon: '💰' }
];

const RECENT_ACTIVITY = [
  { id: 1, target: 'John Doe', company: 'Tech Corp', status: 'Pending Approval', type: 'Outreach', time: '10m ago' },
  { id: 2, target: 'Jane Smith', company: 'Innova Inc', status: 'Verified', type: 'Evidence', time: '1h ago' },
  { id: 3, target: 'Mike Ross', company: 'Pearson Hardman', status: 'Flagged', type: 'Upload', time: '3h ago' },
];

export default function LinkedinInquirerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="li-inq-dash-container">
      <header className="li-inq-dash-header">
        <div className="welcome-section">
          <h1>Inquirer Intelligence Center</h1>
          <p>Welcome back, <strong>L-Inquirer_42</strong>. Your LinkedIn outreach performance is optimal today.</p>
        </div>
        <div className="header-actions">
          <div className="status-indicator online">
            <span className="dot"></span> Active Session
          </div>
          <button className="btn-sync">Sync LinkedIn Data</button>
        </div>
      </header>

      <section className="li-inq-stats-grid">
        {MOCK_STATS.map((stat, index) => (
          <div key={index} className="li-stat-card">
            <div className="li-stat-icon-bg">{stat.icon}</div>
            <div className="li-stat-info">
              <span className="li-stat-label">{stat.label}</span>
              <div className="li-stat-row">
                <h2 className="li-stat-value">{stat.value}</h2>
                <span className={`li-stat-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="li-inq-main-layout">
        <div className="li-inq-content-left">
          <div className="li-inq-card active-tasks-summary">
            <div className="card-header">
              <h3>Active Task Queue</h3>
              <button className="btn-text">View All Tasks</button>
            </div>
            <div className="task-mini-list">
              {[1, 2, 3].map((task) => (
                <div key={task} className="task-mini-item">
                  <div className="task-avatar">LI</div>
                  <div className="task-details">
                    <p className="task-title">Profile Inquiry #{4500 + task}</p>
                    <p className="task-meta">Reward: $1.50 • Time left: 2h 15m</p>
                  </div>
                  <button className="btn-resume">Execute</button>
                </div>
              ))}
            </div>
          </div>

          <div className="li-inq-card performance-chart-area">
            <div className="card-header">
              <h3>Engagement Trend (Last 7 Days)</h3>
            </div>
            <div className="fake-chart-container">
              {/* Representación visual de barras */}
              <div className="chart-bar-wrap">
                {[40, 70, 55, 90, 65, 80, 45].map((h, i) => (
                  <div key={i} className="chart-bar-group">
                    <div className="chart-bar" style={{ height: `${h}%` }}>
                      <span className="tooltip">{h}%</span>
                    </div>
                    <span className="bar-day">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="li-inq-content-right">
          <div className="li-inq-card activity-feed">
            <div className="card-header">
              <h3>Recent Actions</h3>
            </div>
            <div className="feed-list">
              {RECENT_ACTIVITY.map((act) => (
                <div key={act.id} className="feed-item">
                  <div className="feed-marker"></div>
                  <div className="feed-body">
                    <p className="feed-text">
                      <strong>{act.type}:</strong> {act.target} from {act.company}
                    </p>
                    <div className="feed-footer">
                      <span className={`status-pill ${act.status.toLowerCase().replace(' ', '-')}`}>
                        {act.status}
                      </span>
                      <span className="feed-time">{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="li-inq-card quality-score-card">
            <h3>Auditor's Trust Score</h3>
            <div className="score-gauge">
              <svg viewBox="0 0 36 36" className="circular-chart blue">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="percentage">92%</text>
              </svg>
            </div>
            <p className="score-desc">Your evidence quality is higher than 85% of other inquirers.</p>
          </div>
        </aside>
      </div>

      <footer className="li-inq-footer">
        <p>© 2026 Internal Operations Terminal • System Version 4.0.2-stable</p>
      </footer>
    </div>
  );
}