import React, { useState } from 'react';
import './LinkedinAuditorHistoryPage.css';

const MOCK_HISTORY = [
  { id: 'REC-550', date: '2026-01-11', target: 'Robert Fox', worker: 'li_user_02', auditor: 'Admin_1', status: 'Approved', pay: '$1.50' },
  { id: 'REC-549', date: '2026-01-10', target: 'Jane Doe', worker: 'li_user_12', auditor: 'Admin_1', status: 'Rejected', pay: '$0.00' },
  { id: 'REC-548', date: '2026-01-10', target: 'Arlene McCoy', worker: 'li_user_02', auditor: 'System_Auto', status: 'Approved', pay: '$1.50' },
  { id: 'REC-547', date: '2026-01-09', target: 'Cody Fisher', worker: 'li_user_09', auditor: 'Admin_2', status: 'Flagged', pay: '$0.00' },
];

export default function LinkedinAuditorHistoryPage() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="history-page">
      <header className="history-header">
        <h1>Audit Archive</h1>
        <div className="history-actions">
          <button className="btn-export">Download CSV Report</button>
        </div>
      </header>

      <div className="filter-shelf">
        <div className="search-input">
          <span>🔍</span>
          <input type="text" placeholder="Search by Profile, Worker or ID..." />
        </div>
        <div className="tab-filters">
          {['All', 'Approved', 'Rejected', 'Flagged'].map(t => (
            <button key={t} className={filter === t ? 'active' : ''} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

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
            {MOCK_HISTORY.map(row => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.date}</td>
                <td className="profile-cell">{row.target}</td>
                <td>{row.worker}</td>
                <td><span className="auditor-tag">{row.auditor}</span></td>
                <td><span className={`status-pill ${row.status.toLowerCase()}`}>{row.status}</span></td>
                <td className="pay-cell">{row.pay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="history-footer">
        <p>Showing 50 records per page</p>
        <div className="pagination">
          <button disabled>Prev</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>Next</button>
        </div>
      </footer>
    </div>
  );
}