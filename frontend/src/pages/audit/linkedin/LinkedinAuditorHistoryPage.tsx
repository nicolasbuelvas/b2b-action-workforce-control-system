import React, { useState } from 'react';
import './LinkedinAuditorHistoryPage.css';

export default function LinkedinAuditorHistoryPage() {
  const [filter, setFilter] = useState<'All' | 'Approved' | 'Rejected' | 'Flagged'>('All');

  return (
    <div className="history-page">
      {/* HEADER */}
      <header className="history-header">
        <h1>Audit Archive</h1>
        <div className="history-actions">
          <button className="btn-export" disabled>
            Download CSV Report
          </button>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="filter-shelf">
        <div className="search-input">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by Profile, Worker or ID…"
            disabled
          />
        </div>

        <div className="tab-filters">
          {(['All', 'Approved', 'Rejected', 'Flagged'] as const).map(tab => (
            <button
              key={tab}
              className={filter === tab ? 'active' : ''}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Date</th>
              <th>Target LinkedIn</th>
              <th>Researcher</th>
              <th>Auditor</th>
              <th>Outcome</th>
              <th>Payment Status</th>
            </tr>
          </thead>

          <tbody>
            {/* EMPTY STATE — DATA COMES FROM BACKEND */}
            <tr className="empty-row">
              <td colSpan={7}>
                <div className="empty-state">
                  <strong>No audit history loaded</strong>
                  <p>
                    Records will appear here once audits are processed and
                    validated.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <footer className="history-footer">
        <p>Showing 0 records</p>

        <div className="pagination">
          <button disabled>Prev</button>
          <button className="active">1</button>
          <button disabled>Next</button>
        </div>
      </footer>
    </div>
  );
}