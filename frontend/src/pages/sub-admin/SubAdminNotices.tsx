import React, { useEffect, useState, useCallback } from 'react';
import './SubAdminNotices.css';

type Notice = {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
  expiresAt?: string | null;
  active: boolean;
};

const API_BASE = '/api/subadmin';

export default function SubAdminNotices(): JSX.Element {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/notices`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Notices API ${res.status}: ${txt}`);
      }
      const data = await safeJson(res);
      setNotices(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('fetchNotices error', e);
      setError(e.message || 'Failed to load notices');
      setNotices(null);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return (
    <div className="subadmin-notices">
      <header className="hdr">
        <div>
          <h1>System Notices</h1>
          <p className="muted">
            Official announcements visible to sub-admins and operators.
            Managed entirely by backend configuration.
          </p>
        </div>
        <button className="refresh" onClick={fetchNotices}>
          Refresh
        </button>
      </header>

      {loading && <div className="loader">Loading notices…</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && notices && notices.length === 0 && (
        <div className="empty">
          There are no active notices at this time.
        </div>
      )}

      {!loading && !error && notices && notices.length > 0 && (
        <ul className="notice-list">
          {notices.map((n) => (
            <li key={n.id} className={`notice-item ${n.priority}`}>
              <div className="notice-header">
                <h3>{n.title}</h3>
                <span className={`badge ${n.priority}`}>
                  {n.priority.toUpperCase()}
                </span>
              </div>

              <p className="notice-message">{n.message}</p>

              <div className="notice-meta">
                <span>
                  Created: {new Date(n.createdAt).toLocaleString()}
                </span>
                {n.expiresAt && (
                  <span>
                    Expires: {new Date(n.expiresAt).toLocaleString()}
                  </span>
                )}
                <span>Status: {n.active ? 'Active' : 'Inactive'}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
