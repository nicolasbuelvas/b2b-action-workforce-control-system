import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import './systemLogsPage.css';

interface SystemLog {
  id: string;
  type: 'action' | 'audit';
  status?: string;
  decision?: string;
  createdAt: string;
  performedByUserId?: string;
  auditorUserId?: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);

  // --- Fetch logs ---
  useEffect(() => {
    setLoading(true);
    axios
      .get('/admin/system-logs')
      .then(res => {
        const allLogs = res.data || [];
        setLogs(allLogs);
        setFilteredLogs(allLogs);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching logs:', error);
        setLogs([]);
        setFilteredLogs([]);
        setLoading(false);
      });
  }, []);

  // --- Filter logs by search ---
  useEffect(() => {
    if (!search) {
      setFilteredLogs(logs);
    } else {
      const q = search.toLowerCase();
      setFilteredLogs(
        logs.filter(
          (log) =>
            log.id.toLowerCase().includes(q) ||
            log.type.toLowerCase().includes(q) ||
            (log.status && log.status.toLowerCase().includes(q)) ||
            (log.decision && log.decision.toLowerCase().includes(q)) ||
            (log.performedByUserId && log.performedByUserId.toLowerCase().includes(q)) ||
            (log.auditorUserId && log.auditorUserId.toLowerCase().includes(q))
        )
      );
    }
  }, [search, logs]);

  // --- Render ---
  return (
    <div className="categories-container">
      <header className="categories-header">
        <div className="header-left">
          <h1>System Logs</h1>
          <p>All inquiry actions and research audits recorded here for audit and traceability.</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="logs-filter-bar">
        <input
          type="text"
          placeholder="Search by ID, type, status, user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-clear" onClick={() => setSearch('')}>Clear</button>
      </div>

      {/* Logs Table */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table activity-feed">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Status/Decision</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No logs found.</td></tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`status-pill ${log.type}`}>
                      {log.type.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${(log.status || log.decision || 'pending').toLowerCase()}`}>
                      {(log.status || log.decision || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td>{log.performedByUserId || log.auditorUserId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, padding: '12px', color: '#64748b', fontSize: 12 }}>
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </div>
    </div>
  );
}