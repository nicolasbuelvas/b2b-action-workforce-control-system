import React, { useEffect, useState } from "react";
import "./WebsiteAuditorFlagsPage.css";

/* =========================
   Data Contracts
========================= */

export type FlagSeverity = "CRITICAL" | "WARNING" | "MEDIUM";

export interface WebsiteAuditFlag {
  id: string;
  domain: string;
  type: string;
  severity: FlagSeverity;
  workerId: string;
  timestamp: string;
  reportedBy: string;
  violatedRule: string;
  technicalEvidence: string;
}

/* =========================
   Component
========================= */

export default function WebsiteAuditorFlagsPage() {
  const [flags, setFlags] = useState<WebsiteAuditFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<WebsiteAuditFlag | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     Data Injection Placeholder
     (Backend-owned)
  ========================= */
  useEffect(() => {
    /*
      Backend must populate:
      - flags[]
      - selectedFlag (optional default)
    */
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="wb-state-screen">
        <p>Loading security flags…</p>
      </div>
    );
  }

  return (
    <div className="wb-flags-page">
      {/* =========================
          Header
      ========================= */}
      <header className="flags-header">
        <h1>Website Security & Integrity Flags</h1>

        <div className="header-stats">
          <div className="stat-pill critical">Critical</div>
          <div className="stat-pill warning">Warnings</div>
        </div>
      </header>

      <div className="flags-main-grid">
        {/* =========================
            Sidebar
        ========================= */}
        <aside className="flags-sidebar">
          {flags.length === 0 && (
            <div className="empty-sidebar">
              <p>No active flags detected.</p>
            </div>
          )}

          {flags.map((flag) => (
            <div
              key={flag.id}
              className={`flag-item-card ${
                selectedFlag?.id === flag.id ? "active" : ""
              }`}
              onClick={() => setSelectedFlag(flag)}
            >
              <div
                className={`severity-indicator ${flag.severity.toLowerCase()}`}
              />
              <div className="flag-info">
                <h4>{flag.domain}</h4>
                <p>{flag.type}</p>
                <div className="flag-bottom">
                  <span>{flag.id}</span>
                  <span>{flag.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </aside>

        {/* =========================
            Investigation Panel
        ========================= */}
        <main className="flag-investigation">
          {!selectedFlag && (
            <div className="investigation-empty">
              <p>Select a flag to start investigation.</p>
            </div>
          )}

          {selectedFlag && (
            <div className="investigation-card">
              <div className="inv-header">
                <h2>Investigation: {selectedFlag.id}</h2>
                <span
                  className={`badge-severity ${selectedFlag.severity.toLowerCase()}`}
                >
                  {selectedFlag.severity}
                </span>
              </div>

              <div className="inv-body">
                <section className="inv-section">
                  <h3>Incident Context</h3>
                  <div className="metadata-grid">
                    <div className="meta-item">
                      <label>Domain</label>
                      <p>{selectedFlag.domain}</p>
                    </div>
                    <div className="meta-item">
                      <label>Reported By</label>
                      <p>{selectedFlag.reportedBy}</p>
                    </div>
                    <div className="meta-item">
                      <label>Worker Involved</label>
                      <p>{selectedFlag.workerId}</p>
                    </div>
                    <div className="meta-item">
                      <label>Rule Violated</label>
                      <p>{selectedFlag.violatedRule}</p>
                    </div>
                  </div>
                </section>

                <section className="inv-section">
                  <h3>Technical Evidence</h3>
                  <div className="evidence-placeholder">
                    <code>{selectedFlag.technicalEvidence}</code>
                  </div>
                </section>

                <section className="inv-actions">
                  <div className="notes-box">
                    <label>Auditor Investigation Notes</label>
                    <textarea placeholder="Document findings for SuperAdmin review…" />
                  </div>

                  <div className="button-group">
                    <button className="btn-secondary">
                      Whitelist Submission
                    </button>
                    <button className="btn-danger">
                      Blacklist Worker
                    </button>
                    <button className="btn-primary">
                      Reject & Reassign
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}