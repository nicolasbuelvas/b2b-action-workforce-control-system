import React, { useState } from 'react';
import './LinkedinAuditorPendingPage.css';

export default function LinkedinAuditorPendingPage() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="li-audit-container">
      {/* HEADER */}
      <header className="li-audit-header">
        <div className="li-header-main">
          <h1>
            Pending Review: <span className="text-id">—</span>
          </h1>

          <div className="worker-badge empty">
            <span className="worker-icon">👤</span>
            <div>
              <p className="w-name">Worker not loaded</p>
              <p className="w-rank">—</p>
            </div>
          </div>
        </div>

        <div className="audit-timer">Waiting…</div>
      </header>

      {/* CONTENT */}
      <div className="li-audit-content">
        {/* SIDEBAR */}
        <aside className="li-sidebar-data">
          <section className="li-data-card">
            <h3>Target Profile Details</h3>

            <div className="data-grid empty">
              <div className="data-item">
                <label>Full Name</label>
                <span>—</span>
              </div>
              <div className="data-item">
                <label>Role</label>
                <span>—</span>
              </div>
              <div className="data-item">
                <label>Company</label>
                <span>—</span>
              </div>

              <span className="li-external-link disabled">
                LinkedIn profile unavailable
              </span>
            </div>
          </section>

          <section className="li-data-card">
            <h3>Multi-Action Progress</h3>

            <div className="li-timeline empty">
              <p>No actions loaded for review.</p>
            </div>
          </section>

          <section className="li-data-card">
            <h3>Step Verification</h3>

            <div className="verification-details empty">
              <div className="v-row">
                <span>Action Type:</span>
                <strong>—</strong>
              </div>
              <div className="v-row">
                <span>Image Hash:</span>
                <code className="v-hash">—</code>
              </div>
              <div className="v-row">
                <span>Status:</span>
                <span className="v-badge pending">PENDING</span>
              </div>
              <p className="v-notes">
                Evidence details will appear once loaded.
              </p>
            </div>
          </section>

          <section className="li-audit-decision">
            <div className="decision-actions">
              <button className="btn-approve" disabled>
                Approve Step
              </button>
              <button className="btn-fraud" disabled>
                Report Fraud
              </button>
            </div>

            <div className="rejection-box">
              <textarea
                placeholder="Reason for rejection…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled
              />
              <button className="btn-reject" disabled>
                Reject Item
              </button>
            </div>
          </section>
        </aside>

        {/* EVIDENCE */}
        <main className="li-evidence-view">
          <div className="evidence-toolbar">
            <button onClick={() => setIsZoomed(!isZoomed)}>
              {isZoomed ? 'Actual Size' : 'Zoom In'}
            </button>
            <button disabled>Download Evidence</button>

            <div className="evidence-info">
              Screenshot unavailable
            </div>
          </div>

          <div className={`screenshot-container ${isZoomed ? 'zoomed' : ''}`}>
            <div className="evidence-empty">
              <p>No evidence loaded</p>
              <span>Waiting for backend payload…</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}