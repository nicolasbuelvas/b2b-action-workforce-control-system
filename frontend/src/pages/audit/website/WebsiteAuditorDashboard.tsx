import React from 'react';
import './WebsiteAuditorDashboard.css';

export default function WebsiteAuditorDashboard() {
  return (
    <div className="wb-audit-dash">
      {/* HEADER */}
      <header className="dash-header">
        <div className="welcome-text">
          <h1>Website Quality Assurance</h1>
          <p>Real-time oversight of web data extraction and validation integrity.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Quality Reports</button>
          <button className="btn-primary">Start New Audit</button>
        </div>
      </header>

      {/* METRICS */}
      <section className="metrics-grid">
        <div className="metric-card empty">
          <span className="metric-label">Domains Verified</span>
          <h2 className="metric-value">—</h2>
        </div>
        <div className="metric-card empty">
          <span className="metric-label">Data Accuracy</span>
          <h2 className="metric-value">—</h2>
        </div>
        <div className="metric-card empty">
          <span className="metric-label">Avg. Audit Time</span>
          <h2 className="metric-value">—</h2>
        </div>
        <div className="metric-card empty">
          <span className="metric-label">Fraud Flag Rate</span>
          <h2 className="metric-value">—</h2>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="dash-content-layout">
        {/* QUEUE */}
        <section className="queue-status-card">
          <div className="card-header">
            <h3>Website Audit Queue</h3>
            <span className="badge-live">LIVE</span>
          </div>

          <div className="queue-empty">
            <p>No websites currently queued for audit.</p>
            <span>Waiting for backend data…</span>
          </div>
        </section>

        {/* CHART */}
        <section className="accuracy-chart-card">
          <h3>Accuracy by Category</h3>

          <div className="chart-placeholder empty">
            <p>Accuracy data unavailable</p>
          </div>

          <div className="chart-legend">
            <p>Charts will render automatically once metrics are received.</p>
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