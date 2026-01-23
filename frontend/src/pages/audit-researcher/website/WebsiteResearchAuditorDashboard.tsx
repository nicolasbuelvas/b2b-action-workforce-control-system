import React from 'react';
import '../website/WebsiteResearchAuditorDashboard.css';

export default function WebsiteResearchAuditorDashboard() {
  return (
    <div className="wb-audit-dash">
      {/* HEADER */}
      <header className="dash-header">
        <div className="welcome-text">
          <h1>Website Research Quality Assurance</h1>
          <p>Review and validate researcher submissions for website targets.</p>
        </div>
      </header>

      {/* METRICS */}
      <section className="metrics-grid">
        <div className="metric-card empty">
          <span className="metric-label">Pending Reviews</span>
          <h2 className="metric-value">—</h2>
        </div>
        <div className="metric-card empty">
          <span className="metric-label">Approved Submissions</span>
          <h2 className="metric-value">—</h2>
        </div>
        <div className="metric-card empty">
          <span className="metric-label">Rejected Submissions</span>
          <h2 className="metric-value">—</h2>
        </div>
        <div className="metric-card empty">
          <span className="metric-label">Avg. Review Time</span>
          <h2 className="metric-value">—</h2>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="dash-content-layout">
        <section className="queue-status-card">
          <div className="card-header">
            <h3>Research Submissions Queue</h3>
            <span className="badge-live">LIVE</span>
          </div>

          <div className="queue-empty">
            <p>No submissions currently queued for review.</p>
            <span>Waiting for backend data…</span>
          </div>
        </section>

        <section className="accuracy-chart-card">
          <h3>Submissions by Category</h3>

          <div className="chart-placeholder empty">
            <p>Submission data unavailable</p>
          </div>

          <div className="chart-legend">
            <p>Charts will render automatically once data is received.</p>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="dash-footer">
        <div className="system-status">
          <span className="status-dot green"></span>
          Waiting for system status update…
        </div>
      </footer>
    </div>
  );
}
