import React, { useState } from 'react';
import './LinkedinInquirerDashboard.css';

interface StatCard {
  label: string;
  value: string;
  trend?: string;
  icon?: string;
}

interface ActivityItem {
  id: string;
  target: string;
  company: string;
  status: string;
  type: string;
  time: string;
}

export default function LinkedinInquirerDashboard() {
  const [stats] = useState<StatCard[]>([]);
  const [recentActivity] = useState<ActivityItem[]>([]);
  const [username] = useState<string>('Inquirer');

  return (
    <div className="li-inq-dash-container">
      {/* HEADER */}
      <header className="li-inq-dash-header">
        <div className="welcome-section">
          <h1>Inquirer Intelligence Center</h1>
          <p>
            Welcome back, <strong>{username}</strong>. Monitor your LinkedIn outreach performance.
          </p>
        </div>

        <div className="header-actions">
          <div className="status-indicator online">
            <span className="dot" />
            Active Session
          </div>
          <button className="btn-sync">Sync LinkedIn Data</button>
        </div>
      </header>

      {/* STATS */}
      <section className="li-inq-stats-grid">
        {stats.length === 0 && (
          <div className="empty-block">No statistics available yet.</div>
        )}

        {stats.map((stat, idx) => (
          <div key={idx} className="li-stat-card">
            <div className="li-stat-icon-bg">{stat.icon ?? '📊'}</div>
            <div className="li-stat-info">
              <span className="li-stat-label">{stat.label}</span>
              <div className="li-stat-row">
                <h2 className="li-stat-value">{stat.value}</h2>
                {stat.trend && (
                  <span
                    className={`li-stat-trend ${
                      stat.trend.startsWith('+') ? 'up' : 'down'
                    }`}
                  >
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* MAIN LAYOUT */}
      <div className="li-inq-main-layout">
        {/* LEFT */}
        <div className="li-inq-content-left">
          <div className="li-inq-card">
            <div className="card-header">
              <h3>Active Task Queue</h3>
              <button className="btn-text">View All</button>
            </div>

            <div className="empty-block">
              Tasks will appear here once assigned.
            </div>
          </div>

          <div className="li-inq-card">
            <div className="card-header">
              <h3>Engagement Trend</h3>
            </div>

            <div className="fake-chart-container">
              <div className="empty-block">
                Engagement data not available.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="li-inq-content-right">
          <div className="li-inq-card">
            <div className="card-header">
              <h3>Recent Actions</h3>
            </div>

            {recentActivity.length === 0 && (
              <div className="empty-block">
                No recent activity recorded.
              </div>
            )}

            <div className="feed-list">
              {recentActivity.map(act => (
                <div key={act.id} className="feed-item">
                  <div className="feed-marker" />
                  <div className="feed-body">
                    <p className="feed-text">
                      <strong>{act.type}:</strong> {act.target} ({act.company})
                    </p>
                    <div className="feed-footer">
                      <span
                        className={`status-pill ${act.status
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
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
            <h3>Auditor Trust Score</h3>

            <div className="score-gauge">
              <svg viewBox="0 0 36 36" className="circular-chart blue">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray="0,100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">
                  —
                </text>
              </svg>
            </div>

            <p className="score-desc">
              Score will be calculated once audits are completed.
            </p>
          </div>
        </aside>
      </div>

      <footer className="li-inq-footer">
        © 2026 Internal Operations Terminal • Stable Build
      </footer>
    </div>
  );
}
