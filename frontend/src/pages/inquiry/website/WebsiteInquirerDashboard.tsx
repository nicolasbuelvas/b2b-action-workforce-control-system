import React from 'react';
import './WebsiteInquirerDashboard.css';

const WORKLOAD_SUMMARY = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 19 },
  { day: 'Wed', tasks: 15 },
  { day: 'Thu', tasks: 22 },
  { day: 'Fri', tasks: 18 },
];

export default function WebsiteInquirerDashboard() {
  return (
    <div className="wb-inq-dash">
      <div className="welcome-banner">
        <div className="banner-info">
          <h1>Website Outreach Dashboard</h1>
          <p>You have <strong>8 tasks</strong> requiring immediate action today.</p>
        </div>
        <div className="performance-chip">
          <span className="chip-label">Quality Score</span>
          <span className="chip-value">9.8/10</span>
        </div>
      </div>

      <div className="dash-grid">
        <div className="main-stats-panel">
          <div className="stat-box">
            <span className="stat-icon">✉️</span>
            <div className="stat-content">
              <h3>245</h3>
              <p>Emails Dispatched</p>
            </div>
          </div>
          <div className="stat-box">
            <span className="stat-icon">✔️</span>
            <div className="stat-content">
              <h3>192</h3>
              <p>Verified Actions</p>
            </div>
          </div>
          <div className="stat-box highlight">
            <span className="stat-icon">💰</span>
            <div className="stat-content">
              <h3>$1,120.50</h3>
              <p>Pending Payout</p>
            </div>
          </div>
        </div>

        <section className="chart-card">
          <h3>Daily Submission Activity</h3>
          <div className="simple-bar-chart">
            {WORKLOAD_SUMMARY.map(item => (
              <div key={item.day} className="chart-column">
                <div className="column-bar" style={{ height: `${item.tasks * 5}px` }}>
                  <span className="tooltip">{item.tasks}</span>
                </div>
                <span className="column-label">{item.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-feedback">
          <h3>Recent Auditor Feedback</h3>
          <div className="feedback-list">
            <div className="feedback-item success">
              <div className="f-icon">⭐</div>
              <p><strong>Perfect Evidence:</strong> Submission WB-992 was used as a training example.</p>
              <span>2 hours ago</span>
            </div>
            <div className="feedback-item warning">
              <div className="f-icon">⚠️</div>
              <p><strong>Blurry Image:</strong> Please re-upload screenshot for Nexus task.</p>
              <span>5 hours ago</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}