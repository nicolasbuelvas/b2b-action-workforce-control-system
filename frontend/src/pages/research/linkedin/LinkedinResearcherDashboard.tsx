import React from 'react';
import './LinkedinResearcherDashboard.css';

export default function LinkedinResearcherDashboard() {
  /**
   * IMPORTANT:
   * This dashboard contains NO mock data.
   * All values must be injected via backend / global state.
   * UI components are stable and ready for real data binding.
   */

  return (
    <div className="lnk-dash-container">
      {/* HEADER */}
      <div className="lnk-welcome">
        <div>
          <h1>Researcher Dashboard</h1>
          <p>Your performance metrics and task status will appear here.</p>
        </div>

        <div className="wallet-card">
          <label>Pending Balance</label>
          <h3>—</h3>
          <button className="btn-withdraw" disabled>
            Request Payout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="lnk-stats-grid">
        <div className="l-stat-card">
          <span className="l-icon">📋</span>
          <div className="l-data">
            <span className="l-val">—</span>
            <span className="l-lab">Tasks Pending Action</span>
          </div>
        </div>

        <div className="l-stat-card">
          <span className="l-icon">⏳</span>
          <div className="l-data">
            <span className="l-val">—</span>
            <span className="l-lab">Waiting for Audit</span>
          </div>
        </div>

        <div className="l-stat-card">
          <span className="l-icon">🚫</span>
          <div className="l-data">
            <span className="l-val">—</span>
            <span className="l-lab">Rejections to Fix</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="lnk-content-row">
        {/* EARNINGS */}
        <section className="earnings-chart-card">
          <h3>Income Overview</h3>

          <div className="chart-empty-state">
            <p>Income data will be displayed once activity is recorded.</p>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="notifications-card">
          <h3>Recent Notifications</h3>

          <div className="notif-empty-state">
            <p>No notifications available.</p>
          </div>
        </section>
      </div>
    </div>
  );
}