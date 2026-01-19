import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubAdminLinkedInResearch.css';

type ResearchItem = {
  id: string;
  profileUrl: string;
  companyName: string;
  country: string;
  category: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
};

const API_BASE = '/api/subadmin/research/linkedin';

export default function SubAdminLinkedInResearch(): JSX.Element {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ResearchItem['status']>('all');
  const navigate = useNavigate();

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetch(`${API_BASE}${qs}`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt}`);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load LinkedIn research');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="sa-linkedin-research">
      <header className="page-header">
        <div>
          <h1>LinkedIn Research</h1>
          <p className="muted">
            All LinkedIn profiles submitted for research. Data is fetched live from the backend.
          </p>
        </div>

        <div className="filters">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
          <button onClick={fetchData}>Refresh</button>
        </div>
      </header>

      {loading && <div className="loader">Loading LinkedIn research…</div>}
      {error && <div className="error">Error: {error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="empty">No LinkedIn research entries found.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <table className="sa-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Company</th>
              <th>Category</th>
              <th>Country</th>
              <th>Status</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>
                  <a href={it.profileUrl} target="_blank" rel="noreferrer">
                    LinkedIn Profile
                  </a>
                </td>
                <td>{it.companyName}</td>
                <td>{it.category}</td>
                <td>{it.country}</td>
                <td>
                  <span className={`status ${it.status}`}>{it.status}</span>
                </td>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/sub-admin/review/research/${it.id}`)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}