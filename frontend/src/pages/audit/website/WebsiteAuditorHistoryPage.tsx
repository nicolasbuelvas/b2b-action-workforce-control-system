import React from 'react';
import './WebsiteAuditorHistoryPage.css';

const AUDIT_LOGS = [
  { id: 'LOG-4401', domain: 'titan-energy.com', worker: 'Elena R.', status: 'Paid', date: '2026-01-11', quality: 100 },
  { id: 'LOG-4402', domain: 'cyber-sec-pro.io', worker: 'Mario G.', status: 'Rejected', date: '2026-01-11', quality: 0 },
  { id: 'LOG-4403', domain: 'fresh-bites.net', worker: 'Elena R.', status: 'Paid', date: '2026-01-10', quality: 92 },
  { id: 'LOG-4404', domain: 'lunar-travel.com', worker: 'Chris P.', status: 'Paid', date: '2026-01-10', quality: 85 },
];

export default function WebsiteAuditorHistoryPage() {
  return (
    <div className="wb-history-view">
      <header className="wb-history-header">
        <div className="header-info">
          <h1>Audit History Archive</h1>
          <p>Full audit trail of all website validations performed in the last 90 days.</p>
        </div>
        <div className="filter-bar">
          <input type="text" placeholder="Search by Domain or Auditor..." />
          <button className="btn-filter">Filter</button>
        </div>
      </header>

      <div className="history-stats-row">
        <div className="h-stat-card">
          <span>Total Audits</span>
          <h3>1,429</h3>
        </div>
        <div className="h-stat-card">
          <span>Accuracy Avg.</span>
          <h3>94.2%</h3>
        </div>
        <div className="h-stat-card">
          <span>Total Payouts</span>
          <h3>$2,858.00</h3>
        </div>
      </div>

      <div className="wb-table-container">
        <table className="wb-history-table">
          <thead>
            <tr>
              <th>Internal ID</th>
              <th>Target Domain</th>
              <th>Investigator</th>
              <th>Decision</th>
              <th>Quality Score</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOGS.map(log => (
              <tr key={log.id}>
                <td className="id-col">{log.id}</td>
                <td className="domain-col"><strong>{log.domain}</strong></td>
                <td>{log.worker}</td>
                <td>
                  <span className={`decision-pill ${log.status.toLowerCase()}`}>
                    {log.status}
                  </span>
                </td>
                <td>
                  <div className="quality-meter">
                    <div className="q-bar">
                      <div className="q-fill" style={{ width: `${log.quality}%`, background: log.quality > 80 ? '#10b981' : '#f59e0b' }}></div>
                    </div>
                    <span>{log.quality}%</span>
                  </div>
                </td>
                <td>{log.date}</td>
                <td><button className="btn-view-details">Full Report</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="history-pagination">
        <button className="p-btn">Previous</button>
        <span className="p-info">Page 1 of 48</span>
        <button className="p-btn">Next</button>
      </div>
    </div>
  );
}