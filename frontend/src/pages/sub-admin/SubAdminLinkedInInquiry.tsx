import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubAdminLinkedInInquiry.css';

type InquiryItem = {
  id: string;
  company?: string;
  profileUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  assignedTo?: string;
  createdAt?: string;
};

const API_BASE = '/api/subadmin/inquiry/linkedin';

export default function SubAdminLinkedInInquiry(): JSX.Element {
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
      throw new Error('Invalid JSON from API');
    }
  };

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?limit=50`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        throw new Error(`API ${res.status}`);
      }
      const data = await safeJson(res);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load LinkedIn inquiries');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <div className="li-inquiry-page">
      <header className="hdr">
        <div>
          <h1>LinkedIn Inquiry</h1>
          <p className="muted">
            Incoming LinkedIn-based inquiries awaiting validation or decision.
          </p>
        </div>
        <button className="refresh" onClick={fetchInquiries}>
          Refresh
        </button>
      </header>

      {loading && <div className="loader">Loading inquiries…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">No LinkedIn inquiries available.</div>
      )}

      {!loading && items.length > 0 && (
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Profile</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.company || '—'}</td>
                <td>
                  {it.profileUrl ? (
                    <a href={it.profileUrl} target="_blank" rel="noreferrer">
                      View profile
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <span className={`status ${it.status}`}>{it.status}</span>
                </td>
                <td>{it.assignedTo || 'Unassigned'}</td>
                <td>
                  {it.createdAt
                    ? new Date(it.createdAt).toLocaleString()
                    : '—'}
                </td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/sub-admin/inquiry/linkedin/${it.id}`)
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
