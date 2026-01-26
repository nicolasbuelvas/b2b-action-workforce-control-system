import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';
import './SubAdminResearchReview.css';

type ResearchItem = {
  id: string;
  target?: string;
  source?: 'website' | 'linkedin';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  researcher?: string;
  createdAt?: string;
};

export default function SubAdminResearchReview(): JSX.Element {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchResearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/review/research', {
        params: { status: 'pending', limit: 50 },
      });
      const data = response.data;
      setItems(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load research items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  return (
    <div className="research-review-page">
      <header className="hdr">
        <div>
          <h1>Research Audit</h1>
          <p className="muted">
            Audit and validate completed research before it is used in inquiries.
          </p>
        </div>
        <button className="refresh" onClick={fetchResearch}>
          Refresh
        </button>
      </header>

      {loading && <div className="loader">Loading research…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">No research items awaiting review.</div>
      )}

      {!loading && items.length > 0 && (
        <table className="review-table">
          <thead>
            <tr>
              <th>Target</th>
              <th>Source</th>
              <th>Status</th>
              <th>Researcher</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.target || '—'}</td>
                <td>{it.source || '—'}</td>
                <td>
                  <span className={`status ${it.status}`}>{it.status}</span>
                </td>
                <td>{it.researcher || '—'}</td>
                <td>
                  {it.createdAt
                    ? new Date(it.createdAt).toLocaleString()
                    : '—'}
                </td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/sub-admin/review/research/${it.id}`)
                    }
                  >
                    Audit
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
