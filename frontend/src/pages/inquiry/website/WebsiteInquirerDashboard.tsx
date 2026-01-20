import React from 'react';
import './WebsiteInquirerDashboard.css';

interface WorkloadItem {
  day: string;
  tasks: number;
}

interface Props {
  pendingTasks?: number;
  qualityScore?: number;
  emailsDispatched?: number;
  verifiedActions?: number;
  pendingPayout?: string;
  workloadSummary?: WorkloadItem[];
}

export default function WebsiteInquirerDashboard({
  pendingTasks = 0,
  qualityScore = 0,
  emailsDispatched = 0,
  verifiedActions = 0,
  pendingPayout = '$0.00',
  workloadSummary = [],
}: Props) {
  return (
    <div className="wb-inq-dash">
      <div className="welcome-banner">
        <div className="banner-info">
          <h1>Website Outreach Dashboard</h1>
          <p>
            You have <strong>{pendingTasks}</strong> tasks requiring immediate
            action today.
          </p>
        </div>

        <div className="performance-chip">
          <span className="chip-label">Quality Score</span>
          <span className="chip-value">
            {qualityScore > 0 ? `${qualityScore}/10` : '—'}
          </span>
        </div>
      </div>

      <div className="dash-grid">
        <div className="main-stats-panel">
          <div className="stat-box">
            <span className="stat-icon">✉️</span>
            <div className="stat-content">
              <h3>{emailsDispatched}</h3>
              <p>Emails Dispatched</p>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-icon">✔️</span>
            <div className="stat-content">
              <h3>{verifiedActions}</h3>
              <p>Verified Actions</p>
            </div>
          </div>

          <div className="stat-box highlight">
            <span className="stat-icon">💰</span>
            <div className="stat-content">
              <h3>{pendingPayout}</h3>
              <p>Pending Payout</p>
            </div>
          </div>
        </div>

        <section className="chart-card">
          <h3>Daily Submission Activity</h3>

          {workloadSummary.length === 0 ? (
            <div className="empty-chart">
              <p>No activity data available.</p>
            </div>
          ) : (
            <div className="simple-bar-chart">
              {workloadSummary.map(item => (
                <div key={item.day} className="chart-column">
                  <div
                    className="column-bar"
                    style={{ height: `${item.tasks * 5}px` }}
                  >
                    <span className="tooltip">{item.tasks}</span>
                  </div>
                  <span className="column-label">{item.day}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="recent-feedback">
          <h3>Recent Auditor Feedback</h3>

          <div className="feedback-list">
            <div className="feedback-item success">
              <div className="f-icon">⭐</div>
              <p>
                <strong>Perfect Evidence:</strong> One of your submissions was
                approved with full score.
              </p>
              <span>Recently</span>
            </div>

            <div className="feedback-item warning">
              <div className="f-icon">⚠️</div>
              <p>
                <strong>Attention Required:</strong> Some screenshots may need
                higher resolution.
              </p>
              <span>Recently</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}