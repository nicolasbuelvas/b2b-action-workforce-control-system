import React, { useState } from 'react';
import './LinkedinAuditorFlagsPage.css';

const MOCK_FLAGS = [
  { id: 'FLG-001', worker: 'li_user_88', profile: 'Sarah Connors', reason: 'Screenshot Hash Collision', severity: 'High', date: '2026-01-11 14:00', duplicateOf: 'SUB-5521', img: 'https://via.placeholder.com/150/ef4444/ffffff?text=Duplicate' },
  { id: 'FLG-002', worker: 'li_user_12', profile: 'John Smith', reason: 'Cooldown Period Violation', severity: 'Medium', date: '2026-01-11 15:30', duplicateOf: 'N/A', img: 'https://via.placeholder.com/150/f59e0b/ffffff?text=Cooldown' },
  { id: 'FLG-003', worker: 'li_user_05', profile: 'Ellen Ripley', reason: 'Invalid Domain Mismatch', severity: 'Low', date: '2026-01-11 16:15', duplicateOf: 'N/A', img: 'https://via.placeholder.com/150/64748b/ffffff?text=Domain' },
];

export default function LinkedinAuditorFlagsPage() {
  const [selectedFlag, setSelectedFlag] = useState(MOCK_FLAGS[0]);

  return (
    <div className="flags-page-container">
      <header className="flags-header">
        <div className="title-area">
          <h1>System Integrity Flags</h1>
          <p>Automated detection of potential fraud and rule violations.</p>
        </div>
        <div className="risk-level-stats">
          <div className="risk-box high">2 Critical</div>
          <div className="risk-box medium">5 Warning</div>
        </div>
      </header>

      <div className="flags-grid">
        <aside className="flags-list">
          {MOCK_FLAGS.map(flag => (
            <div 
              key={flag.id} 
              className={`flag-item ${selectedFlag.id === flag.id ? 'active' : ''} ${flag.severity.toLowerCase()}`}
              onClick={() => setSelectedFlag(flag)}
            >
              <div className="flag-severity-bar"></div>
              <div className="flag-main-info">
                <div className="flag-row-top">
                  <span className="f-id">{flag.id}</span>
                  <span className="f-date">{flag.date}</span>
                </div>
                <p className="f-reason">{flag.reason}</p>
                <p className="f-worker">By: <strong>{flag.worker}</strong></p>
              </div>
            </div>
          ))}
        </aside>

        <main className="flag-details-viewer">
          <div className="viewer-card">
            <div className="viewer-header">
              <h2>Investigation: {selectedFlag.id}</h2>
              <span className={`status-pill ${selectedFlag.severity.toLowerCase()}`}>{selectedFlag.severity} RISK</span>
            </div>
            
            <div className="viewer-body">
              <div className="comparison-pane">
                <div className="pane-info">
                  <h3>Detection Metadata</h3>
                  <div className="meta-grid">
                    <div className="m-item"><label>Target Profile</label><p>{selectedFlag.profile}</p></div>
                    <div className="m-item"><label>Violation Type</label><p>{selectedFlag.reason}</p></div>
                    <div className="m-item"><label>Source Worker</label><p>{selectedFlag.worker}</p></div>
                    <div className="m-item"><label>Duplicate Of</label><p>{selectedFlag.duplicateOf}</p></div>
                  </div>
                </div>
                <div className="pane-visual">
                  <h3>Evidence Preview</h3>
                  <img src={selectedFlag.img} alt="Flagged Evidence" />
                </div>
              </div>

              <div className="investigation-actions">
                <div className="note-section">
                  <label>Auditor Investigation Notes</label>
                  <textarea placeholder="Explain the decision for the system logs..." />
                </div>
                <div className="button-group">
                  <button className="btn-ban">Ban Worker Account</button>
                  <button className="btn-dismiss">Dismiss Flag</button>
                  <button className="btn-confirm">Confirm Fraud & Reject</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}