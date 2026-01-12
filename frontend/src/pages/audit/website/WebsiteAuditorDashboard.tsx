import React from 'react';
import './WebsiteAuditorDashboard.css';

const AUDIT_METRICS = [
  { label: 'Domains Verified', value: '1,284', change: '+12%', status: 'up' },
  { label: 'Data Accuracy', value: '96.4%', change: '-0.2%', status: 'down' },
  { label: 'Avg. Audit Time', value: '4m 12s', change: '-30s', status: 'up' },
  { label: 'Fraud Flag Rate', value: '2.1%', change: '+0.5%', status: 'neutral' },
];

export default function WebsiteAuditorDashboard() {
  return (
    <div className="wb-audit-dash">
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

      <section className="metrics-grid">
        {AUDIT_METRICS.map((metric, i) => (
          <div key={i} className="metric-card">
            <span className="metric-label">{metric.label}</span>
            <div className="metric-value-row">
              <h2 className="metric-value">{metric.value}</h2>
              <span className={`metric-change ${metric.status}`}>{metric.change}</span>
            </div>
            <div className="metric-progress-bg">
              <div className="metric-progress-fill" style={{ width: '70%' }}></div>
            </div>
          </div>
        ))}
      </section>

      <div className="dash-content-layout">
        <section className="queue-status-card">
          <div className="card-header">
            <h3>Website Audit Queue</h3>
            <span className="badge-live">LIVE</span>
          </div>
          <div className="queue-list">
            {[1, 2, 3, 4, 5].map(item => (
              <div key={item} className="queue-item">
                <div className="domain-info">
                  <strong>enterprise-solutions-0{item}.com</strong>
                  <span>Submitted by Researcher_{item + 10}</span>
                </div>
                <div className="queue-meta">
                  <span className="priority-tag high">High Priority</span>
                  <button className="btn-audit-now">Verify</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="accuracy-chart-card">
          <h3>Accuracy by Category</h3>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[80, 40, 95, 70, 60, 85].map((h, i) => (
                <div key={i} className="bar-wrapper">
                  <div className="bar-value" style={{ height: `${h}%` }}></div>
                  <span className="bar-label">C{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <p>Data indicates a 15% increase in capture quality after the new guidelines.</p>
          </div>
        </section>
      </div>

      <footer className="dash-footer">
        <div className="system-status">
          <span className="status-dot green"></span>
          All validation servers are operational (2026-01-11 22:50)
        </div>
      </footer>
    </div>
  );
}