import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubAdminWebsiteInquiry.css';

type InquiryItem = {
  id: string;
  website: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  submittedBy: string;
  submittedAt: string;
};

const API_BASE = '/api/subadmin';

export default function SubAdminWebsiteInquiry(): JSX.Element {
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
      const res = await fetch(`${API_BASE}/inquiry/website`, {
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
      setItems(
        (Array.isArray(data) ? data : []).map((i: any) => ({
          id: String(i.id ?? i._id),
          website: String(i.website ?? ''),
          category: String(i.category ?? '—'),
          status: i.status ?? 'pending',
          submittedBy: String(i.submittedBy ?? '—'),
          submittedAt: String(i.submittedAt ?? i.createdAt ?? new Date().toISOString()),
        }))
      );
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load website inquiries');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <div className="subadmin-website-inquiry">
      <header className="hdr">
        <div>
          <h1>Website Inquiry</h1>
          <p className="muted">
            Incoming website inquiries awaiting validation or review.
          </p>
        </div>
        <button className="refresh" onClick={fetchInquiries}>
          Refresh
        </button>
      </header>

      {loading && <div className="loader">Loading inquiries…</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">No website inquiries found.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>Website</th>
              <th>Category</th>
              <th>Status</th>
              <th>Submitted By</th>
              <th>Submitted At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.website}</td>
                <td>{i.category}</td>
                <td>
                  <span className={`status ${i.status}`}>{i.status}</span>
                </td>
                <td>{i.submittedBy}</td>
                <td>{new Date(i.submittedAt).toLocaleString()}</td>
                <td className="actions">
                  <button
                    onClick={() =>
                      navigate(`/sub-admin/review/inquiry?type=website&id=${i.id}`)
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
