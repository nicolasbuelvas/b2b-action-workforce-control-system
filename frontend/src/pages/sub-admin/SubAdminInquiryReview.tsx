import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubAdminInquiryReview.css';

type InquiryItem = {
  id: string;
  channel?: 'website' | 'linkedin';
  target?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  worker?: string;
  category?: string;
  createdAt?: string;
};

const API_BASE = '/api/subadmin/review/inquiry';

export default function SubAdminInquiryReview(): JSX.Element {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('API did not return valid JSON');
    }
  };

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?status=pending&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Inquiry API ${res.status}: ${txt}`);
      }

      const data = await safeJson(res);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('fetchInquiries error', err);
      setError(err.message || 'Failed to load inquiries');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <div className="inquiry-review-page">
      <header className="hdr">
        <div>
          <h1>Inquiry Review</h1>
          <p className="muted">
            Review outbound inquiries before approval or rejection.
          </p>
        </div>

        <button className="refresh" onClick={fetchInquiries}>
          Refresh
        </button>
      </header>

      {loading && <div className="loader">Loading inquiries…</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">No inquiries awaiting review.</div>
      )}

      {!loading && items.length > 0 && (
        <table className="review-table">
          <thead>
            <tr>
              <th>Target</th>
              <th>Channel</th>
              <th>Category</th>
              <th>Status</th>
              <th>Worker</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.target || '—'}</td>
                <td>{it.channel || '—'}</td>
                <td>{it.category || '—'}</td>
                <td>
                  <span className={`status ${it.status}`}>{it.status}</span>
                </td>
                <td>{it.worker || '—'}</td>
                <td>
                  {it.createdAt
                    ? new Date(it.createdAt).toLocaleString()
                    : '—'}
                </td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/sub-admin/review/inquiry/${it.id}`)
                    }
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
