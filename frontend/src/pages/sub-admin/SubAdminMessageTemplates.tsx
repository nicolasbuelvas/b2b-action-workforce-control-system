import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminMessageTemplates.css';

type MessageTemplate = {
  id: string;
  key: string;
  subject: string;
  body: string;
  channel: 'email' | 'internal' | 'notification';
  active: boolean;
  updatedAt: string;
};

export default function SubAdminMessageTemplates(): JSX.Element {
  const [items, setItems] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<MessageTemplate | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/templates');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load templates');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const saveTemplate = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`${API_BASE}/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error(`PUT ${res.status}`);
      setEditing(null);
      loadTemplates();
    } catch (e) {
      console.error(e);
      alert('Failed to save template');
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error(`PATCH ${res.status}`);
      loadTemplates();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  return (
    <div className="sa-templates-page">
      <header className="hdr">
        <h1>Message Templates</h1>
        <p className="muted">
          Canonical templates used by the system. Changes affect live communications.
        </p>
      </header>

      {loading && <div className="loader">Loading templates…</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="empty">No message templates configured.</div>
      )}

      {items.length > 0 && (
        <table className="sa-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Channel</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id}>
                <td className="mono">{t.key}</td>
                <td>{t.channel}</td>
                <td className="truncate">{t.subject}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={t.active}
                      onChange={e => toggleActive(t.id, e.target.checked)}
                    />
                    <span />
                  </label>
                </td>
                <td className="muted small">
                  {new Date(t.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <button className="link" onClick={() => setEditing(t)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="editor">
          <h3>Edit Template</h3>

          <label>Key</label>
          <input value={editing.key} disabled />

          <label>Channel</label>
          <input value={editing.channel} disabled />

          <label>Subject</label>
          <input
            value={editing.subject}
            onChange={e => setEditing({ ...editing, subject: e.target.value })}
          />

          <label>Body</label>
          <textarea
            value={editing.body}
            onChange={e => setEditing({ ...editing, body: e.target.value })}
          />

          <div className="editor-actions">
            <button className="primary" onClick={saveTemplate}>
              Save Changes
            </button>
            <button onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
