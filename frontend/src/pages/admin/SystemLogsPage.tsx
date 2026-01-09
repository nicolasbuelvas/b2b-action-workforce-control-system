import { useState } from 'react';
import StatCard from '../../components/cards/StatCard';
import './systemLogsPage.css';

type LogStatus = 'pending' | 'approved' | 'flagged';

interface SystemLog {
  id: string;
  event: string;
  actor: string;
  target: string;
  status: LogStatus;
  timestamp: string;
}

export default function SystemLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [logs] = useState<SystemLog[]>([
    {
      id: 'LOG-001',
      event: 'Website Research Submitted',
      actor: 'Worker #442',
      target: 'Company: TechCorp',
      status: 'pending',
      timestamp: '2 mins ago',
    },
    {
      id: 'LOG-002',
      event: 'LinkedIn Inquiry Uploaded',
      actor: 'Worker #891',
      target: 'LinkedIn: John Doe',
      status: 'pending',
      timestamp: '6 mins ago',
    },
    {
      id: 'LOG-003',
      event: 'Duplicate Screenshot Flagged',
      actor: 'Worker #102',
      target: 'Task ID: 5590',
      status: 'flagged',
      timestamp: '12 mins ago',
    },
    {
      id: 'LOG-004',
      event: 'New Category Created',
      actor: 'Admin',
      target: 'Product C',
      status: 'approved',
      timestamp: '1 hour ago',
    },
  ]);

  return (
    <div className="sa-container">
      {/* HEADER */}
      <header className="sa-header-banner">
        <div className="sa-header-content">
          <h1>System Logs</h1>
          <p>Audit trail of system activity, actions and rule enforcement</p>
        </div>
        <span className="sa-live-indicator">SYSTEM LIVE</span>
      </header>

      {/* STATS */}
      <section className="sa-stats-grid">
        <StatCard title="Total Events" value={logs.length} />
        <StatCard title="Pending Actions" value={logs.filter(l => l.status === 'pending').length} />
        <StatCard title="Flagged Events" value={logs.filter(l => l.status === 'flagged').length} />
        <StatCard title="Admins Actions" value={logs.filter(l => l.actor === 'Admin').length} />
      </section>

      {/* FILTER BAR */}
      <div className="logs-filter-bar">
        <input
          type="text"
          placeholder="Search by event, actor or target..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="logs-filters">
          <select><option>Status: All</option></select>
          <select><option>Actor: All</option></select>
          <button className="btn-clear">Clear</button>
        </div>
      </div>

      {/* LOG FEED */}
      <div className="sa-card sa-full-height">
        <div className="sa-card-header">
          <h3>System Activity</h3>
        </div>

        <div className="activity-feed extended">
          {logs.map(log => (
            <div className="activity-item" key={log.id}>
              <div className={`status-indicator ${log.status}`} />
              <div className="activity-content">
                <div className="activity-main">
                  <strong>{log.event}</strong>
                  <span className={`badge-status ${log.status}`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
                <div className="activity-sub">
                  <span>{log.actor}</span>
                  <span className="separator">|</span>
                  <span>{log.target}</span>
                  <span className="separator">|</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
              <div className="activity-actions">
                <button className="btn-process">Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}