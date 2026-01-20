import React from 'react';
import './LinkedinAuditorDashboard.css';

export default function LinkedinAuditorDashboard() {
  return (
    <div className="li-dash-container">
      {/* HEADER */}
      <header className="dash-header">
        <div>
          <h1>LinkedIn Audit Command Center</h1>
          <p>Real-time oversight of multi-action outreach workflows.</p>
        </div>
        <button className="btn-primary-action">
          Start New Review Session
        </button>
      </header>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card empty">
          <div className="stat-icon placeholder" />
          <div className="stat-data">
            <h3>—</h3>
            <p>Pending Reviews</p>
          </div>
        </div>

        <div className="stat-card empty">
          <div className="stat-icon placeholder" />
          <div className="stat-data">
            <h3>—</h3>
            <p>Approved Today</p>
          </div>
        </div>

        <div className="stat-card empty">
          <div className="stat-icon placeholder" />
          <div className="stat-data">
            <h3>—</h3>
            <p>Rejected (Fraud)</p>
          </div>
        </div>

        <div className="stat-card empty">
          <div className="stat-icon placeholder" />
          <div className="stat-data">
            <h3>—</h3>
            <p>Avg. Decision Time</p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="dash-grid">
        {/* QUEUE */}
        <section className="dash-section performance">
          <div className="section-header">
            <h3>Recent Submissions Queue</h3>
            <button className="btn-text" disabled>
              View All
            </button>
          </div>

          <div className="table-empty">
            <strong>No submissions in queue</strong>
            <p>
              Incoming LinkedIn reviews will appear here when researchers submit
              new work.
            </p>
          </div>
        </section>

        {/* ACTIVE RESEARCHERS */}
        <section className="dash-section active-researchers">
          <h3>Top Active Researchers</h3>

          <div className="researcher-empty">
            <strong>No activity yet</strong>
            <p>
              Researcher performance metrics will populate as submissions are
              processed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}