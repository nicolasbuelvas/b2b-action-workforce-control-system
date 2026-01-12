import React, { useState } from 'react';
import './WebsiteAuditorFlagsPage.css';

const MOCK_FLAGS = [
  { id: 'WB-FLG-01', target: 'quantum-sys.com', type: 'Broken Evidence', severity: 'Critical', worker: 'W_44', timestamp: '2026-01-11 14:00' },
  { id: 'WB-FLG-02', target: 'helios-logistics.io', type: 'Invalid Tech Stack', severity: 'Warning', worker: 'W_12', timestamp: '2026-01-11 15:30' },
  { id: 'WB-FLG-03', target: 'nexus-global.net', type: 'Possible AI Text', severity: 'Medium', worker: 'W_09', timestamp: '2026-01-11 16:20' },
];

export default function WebsiteAuditorFlagsPage() {
  const [selectedFlag, setSelectedFlag] = useState(MOCK_FLAGS[0]);

  return (
    <div className="wb-flags-page">
      <header className="flags-header">
        <h1>Website Security & Integrity Flags</h1>
        <div className="header-stats">
          <div className="stat-pill critical">3 Critical</div>
          <div className="stat-pill warning">8 Warnings</div>
        </div>
      </header>

      <div className="flags-main-grid">
        <aside className="flags-sidebar">
          {MOCK_FLAGS.map(flag => (
            <div 
              key={flag.id} 
              className={`flag-item-card ${selectedFlag.id === flag.id ? 'active' : ''}`}
              onClick={() => setSelectedFlag(flag)}
            >
              <div className={`severity-indicator ${flag.severity.toLowerCase()}`}></div>
              <div className="flag-info">
                <h4>{flag.target}</h4>
                <p>{flag.type}</p>
                <div className="flag-bottom">
                  <span>{flag.id}</span>
                  <span>{flag.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </aside>

        <main className="flag-investigation">
          <div className="investigation-card">
            <div className="inv-header">
              <h2>Investigation: {selectedFlag.id}</h2>
              <span className={`badge-severity ${selectedFlag.severity.toLowerCase()}`}>
                {selectedFlag.severity}
              </span>
            </div>
            
            <div className="inv-body">
              <section className="inv-section">
                <h3>Incident Context</h3>
                <div className="metadata-grid">
                  <div className="meta-item"><label>Domain</label><p>{selectedFlag.target}</p></div>
                  <div className="meta-item"><label>Reported By</label><p>System_Scan_v2</p></div>
                  <div className="meta-item"><label>Worker Involved</label><p>{selectedFlag.worker}</p></div>
                  <div className="meta-item"><label>Rule Violated</label><p>Evidence Consistency v4.2</p></div>
                </div>
              </section>

              <section className="inv-section">
                <h3>Technical Evidence</h3>
                <div className="evidence-placeholder">
                  <code>
                    Detection Log: [2026-01-11] Image Hash Collision detected in Submission_{selectedFlag.id}. 
                    Evidence screenshot matches 99% with task #99281.
                  </code>
                </div>
              </section>

              <section className="inv-actions">
                <div className="notes-box">
                  <label>Auditor Investigation Notes</label>
                  <textarea placeholder="Document your findings for the SuperAdmin review..."></textarea>
                </div>
                <div className="button-group">
                  <button className="btn-secondary">White-list Submission</button>
                  <button className="btn-danger">Black-list Worker & Ban</button>
                  <button className="btn-primary">Reject & Re-assign</button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}