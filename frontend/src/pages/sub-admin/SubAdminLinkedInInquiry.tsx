import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInquiryTasks, getSubAdminCategories } from '../../api/subadmin.api';
import './SubAdminLinkedInInquiry.css';

interface InquiryItem {
  id: string;
  targetId: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
  [k: string]: any;
}

type Category = { id: string; name: string; isActive: boolean };

export default function SubAdminLinkedInInquiry(): JSX.Element {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const data = await getSubAdminCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load categories:', err);
      }
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInquiryTasks(
        categoryFilter === 'all' ? undefined : categoryFilter,
        'LINKEDIN',
        statusFilter === 'all' ? undefined : statusFilter,
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load LinkedIn inquiries');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="sa-linkedin-inquiry">
      <header className="page-header">
        <div>
          <h1>LinkedIn Inquiry</h1>
          <p className="muted">
            All LinkedIn inquiry tasks and their status.
          </p>
        </div>

        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Category: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button onClick={fetchData} disabled={loading}>Refresh</button>
        </div>
      </header>

      {loading && <div className="loader">Loading inquiries…</div>}
      {error && <div className="error">Error: {error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="empty">No LinkedIn inquiry tasks found.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <table className="sa-table">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.id.slice(0, 8)}</td>
                <td>{it.category || '—'}</td>
                <td>
                  <span className={`status ${it.status}`}>{it.status}</span>
                </td>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/sub-admin/review/inquiry/${it.id}`)}
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
