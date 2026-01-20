import React, { useEffect, useState } from "react";
import "./WebsiteAuditorHistoryPage.css";

/* =========================
   Data Contracts
========================= */

export type AuditDecision = "PAID" | "REJECTED";

export interface WebsiteAuditLog {
  id: string;
  domain: string;
  auditorName: string;
  decision: AuditDecision;
  qualityScore: number; // 0–100
  timestamp: string; // ISO or formatted
}

/* =========================
   Component
========================= */

export default function WebsiteAuditorHistoryPage() {
  const [logs, setLogs] = useState<WebsiteAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* =========================
     Data Injection Placeholder
     (Backend-owned)
  ========================= */
  useEffect(() => {
    /*
      Backend must populate:
      - logs[]
      - totalPages
    */
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="wb-state-screen">
        <p>Loading audit history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wb-state-screen error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="wb-history-view">
      {/* =========================
          Header
      ========================= */}
      <header className="wb-history-header">
        <div className="header-info">
          <h1>Audit History</h1>
          <p>
            Complete record of website audits performed by this auditor.
          </p>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by domain or auditor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-filter">Apply</button>
        </div>
      </header>

      {/* =========================
          Table
      ========================= */}
      <div className="wb-table-container">
        <table className="wb-history-table">
          <thead>
            <tr>
              <th>Audit ID</th>
              <th>Domain</th>
              <th>Auditor</th>
              <th>Decision</th>
              <th>Quality</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  No audit records found.
                </td>
              </tr>
            )}

            {logs.map((log) => (
              <tr key={log.id}>
                <td className="id-col">{log.id}</td>

                <td className="domain-col">
                  <strong>{log.domain}</strong>
                </td>

                <td>{log.auditorName}</td>

                <td>
                  <span
                    className={`decision-pill ${
                      log.decision === "PAID" ? "paid" : "rejected"
                    }`}
                  >
                    {log.decision}
                  </span>
                </td>

                <td>
                  <div className="quality-meter">
                    <div className="q-bar">
                      <div
                        className="q-fill"
                        style={{ width: `${log.qualityScore}%` }}
                      />
                    </div>
                    <span>{log.qualityScore}%</span>
                  </div>
                </td>

                <td>{log.timestamp}</td>

                <td>
                  <button className="btn-view-details">
                    Full Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================
          Pagination
      ========================= */}
      <div className="history-pagination">
        <button
          className="p-btn"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>

        <span className="p-info">
          Page {page} of {totalPages}
        </span>

        <button
          className="p-btn"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}