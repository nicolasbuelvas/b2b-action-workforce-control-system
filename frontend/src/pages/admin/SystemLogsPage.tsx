import React, { useEffect, useState } from 'react';
import './systemLogsPage.css';

type Severity = 'INFO' | 'WARNING' | 'CRITICAL';
type EntityType =
  | 'USER'
  | 'TASK'
  | 'ACTION'
  | 'INQUIRY'
  | 'CATEGORY'
  | 'ROLE'
  | 'PRICING'
  | 'PAYMENT'
  | 'NOTICE'
  | 'SYSTEM';

interface SystemLog {
  id: string;
  categoryId: string | null;
  actorId: string;
  actorRole: string;
  actorName: string;
  entityType: EntityType;
  entityId: string | null;
  actionType: string;
  shortDescription: string;
  beforeState: any | null;
  afterState: any | null;
  severity: Severity;
  requiresAttention: boolean;
  createdAt: string;
}

interface LogFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  role: string;
  actionType: string;
  entityType: string;
  severity: string;
  requiresAttention: string;
  category: string;
  page: number;
  pageSize: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    role: '',
    actionType: '',
    entityType: '',
    severity: '',
    requiresAttention: '',
    category: '',
    page: 1,
    pageSize: 25,
  });
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  // --- Fetch logs ---
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.role) params.append('role', filters.role);
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.requiresAttention) params.append('requiresAttention', filters.requiresAttention);
    if (filters.category) params.append('category', filters.category);
    params.append('page', filters.page.toString());
    params.append('pageSize', filters.pageSize.toString());

    fetch(`/api/admin/system-logs?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setLoading(false);
      });
  }, [JSON.stringify(filters)]);

  // --- Filter options (could be fetched from backend if needed) ---
  const severityOptions: Severity[] = ['INFO', 'WARNING', 'CRITICAL'];
  const entityTypeOptions: EntityType[] = [
    'USER', 'TASK', 'ACTION', 'INQUIRY', 'CATEGORY', 'ROLE', 'PRICING', 'PAYMENT', 'NOTICE', 'SYSTEM'
  ];

  // --- Pagination ---
  const totalPages = Math.ceil(total / filters.pageSize);

  // --- Render ---
  return (
    <div className="categories-container">
      <header className="categories-header">
        <div className="header-left">
          <h1>System Logs</h1>
          <p>All system changes, approvals, and critical events are recorded here for audit and traceability.</p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="logs-filter-bar">
        <input
          type="text"
          placeholder="Search event, actor, entity..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
        />
        <div className="logs-filters">
          <select value={filters.entityType} onChange={e => setFilters(f => ({ ...f, entityType: e.target.value, page: 1 }))}>
            <option value="">All Entities</option>
            {entityTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value, page: 1 }))}>
            <option value="">All Severity</option>
            {severityOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}>
            <option value="">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Sub Admin">Sub Admin</option>
            <option value="Website Researcher">Website Researcher</option>
            <option value="LinkedIn Researcher">LinkedIn Researcher</option>
            <option value="Website Inquirer">Website Inquirer</option>
            <option value="LinkedIn Inquirer">LinkedIn Inquirer</option>
            <option value="Website Reviewer">Website Reviewer</option>
            <option value="LinkedIn Reviewer">LinkedIn Reviewer</option>
          </select>
          <select value={filters.actionType} onChange={e => setFilters(f => ({ ...f, actionType: e.target.value, page: 1 }))}>
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="FLAG">FLAG</option>
          </select>
          <select value={filters.requiresAttention} onChange={e => setFilters(f => ({ ...f, requiresAttention: e.target.value, page: 1 }))}>
            <option value="">Attention?</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value, page: 1 }))}
            style={{ width: 120 }}
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value, page: 1 }))}
            style={{ width: 120 }}
          />
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
            style={{ width: 120 }}
          />
          <select value={filters.pageSize} onChange={e => setFilters(f => ({ ...f, pageSize: Number(e.target.value), page: 1 }))}>
            {PAGE_SIZE_OPTIONS.map(sz => <option key={sz} value={sz}>{sz}/page</option>)}
          </select>
        </div>
        <button className="btn-clear" onClick={() => setFilters({
          search: '', dateFrom: '', dateTo: '', role: '', actionType: '', entityType: '', severity: '', requiresAttention: '', category: '', page: 1, pageSize: 25
        })}>Clear</button>
      </div>

      {/* Logs Table */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table activity-feed extended">
            <thead>
              <tr>
                <th>Time</th>
                <th>Severity</th>
                <th>Event</th>
                <th>Entity</th>
                <th>Actor</th>
                <th>Category</th>
                <th>Attention</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8}>No logs found.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`status-pill ${log.severity.toLowerCase()}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td>
                    <b>{log.actionType}</b>
                    <br />
                    <span style={{ fontSize: 12 }}>{log.shortDescription}</span>
                  </td>
                  <td>
                    <span className="category-tag">{log.entityType}</span>
                    <br />
                    <span style={{ fontSize: 12 }}>{log.entityId || '-'}</span>
                  </td>
                  <td>
                    <span>{log.actorName}</span>
                    <br />
                    <span style={{ fontSize: 12, color: '#64748b' }}>{log.actorRole}</span>
                  </td>
                  <td>{log.categoryId || '-'}</td>
                  <td>
                    {log.requiresAttention ? (
                      <span className="status-pill warning">Yes</span>
                    ) : (
                      <span className="status-pill">No</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-icon-act" onClick={() => setSelectedLog(log)}>
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Prev</button>
          <span>Page {filters.page} / {totalPages || 1}</span>
          <button disabled={filters.page === totalPages || totalPages === 0} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</button>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <h2>Log Details</h2>
            <div style={{ marginBottom: 12 }}>
              <b>{selectedLog.actionType}</b> — {selectedLog.shortDescription}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Actor:</b> {selectedLog.actorName} ({selectedLog.actorRole})<br />
              <b>Entity:</b> {selectedLog.entityType} {selectedLog.entityId ? `(${selectedLog.entityId})` : ''}<br />
              <b>Category:</b> {selectedLog.categoryId || '-'}<br />
              <b>Severity:</b> <span className={`status-pill ${selectedLog.severity.toLowerCase()}`}>{selectedLog.severity}</span><br />
              <b>Requires Attention:</b> {selectedLog.requiresAttention ? 'Yes' : 'No'}<br />
              <b>Timestamp:</b> {new Date(selectedLog.createdAt).toLocaleString()}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Before State:</b>
              <pre style={{ background: '#f3f4f6', padding: 8, borderRadius: 6, maxHeight: 180, overflow: 'auto' }}>
                {selectedLog.beforeState ? JSON.stringify(selectedLog.beforeState, null, 2) : '-'}
              </pre>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>After State:</b>
              <pre style={{ background: '#f3f4f6', padding: 8, borderRadius: 6, maxHeight: 180, overflow: 'auto' }}>
                {selectedLog.afterState ? JSON.stringify(selectedLog.afterState, null, 2) : '-'}
              </pre>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {/* Example: Take action button (conditional, only for Super Admin and actionable logs) */}
              {/* You can extend with more logic as needed */}
              <button type="button" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}