import React, { useEffect, useState, useCallback } from 'react';
import './SubAdminDisapprovalReasons.css';

type DisapprovalReason = {
  id: string;
  code: string;
  label: string;
  description: string;
  active: boolean;
  createdAt: string;
};

const API_BASE = '/api/subadmin/disapproval-reasons';

export default function SubAdminDisapprovalReasons(): JSX.Element {
  const [items, setItems] = useState<DisapprovalReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    code: '',
    label: '',
    description: '',
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const safeJson = async (res: Response) => {
    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      throw new Error('Invalid JSON from API');
    }
  };

  const loadReasons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(`GET ${res.status}`);
      const data = await safeJson(res);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load reasons');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadReasons();
  }, [loadReasons]);

  const createReason = async () => {
    if (!newItem.code || !newItem.label) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error(`POST ${res.status}`);
      setNewItem({ code: '', label: '', description: '' });
      loadReasons();
    } catch (e) {
      console.error(e);
      alert('Failed to create reason');
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
      loadReasons();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  return (
    <div className="sa-disapproval-page">
      <header className="hdr">
        <h1>Disapproval Reasons</h1>
        <p className="muted">
          Canonical reasons used by reviewers when rejecting submissions.
        </p>
      </header>

      <section className="create-box">
        <h3>Add New Reason</h3>
        <div className="form-row">
          <input
            placeholder="Code (e.g. INVALID_DOMAIN)"
            value={newItem.code}
            onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
          />
          <input
            placeholder="Label"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
          />
        </div>
        <textarea
          placeholder="Description (shown to internal reviewers)"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        <button className="primary" onClick={createReason}>
          Create Reason
        </button>
      </section>

      <section className="table-section">
        {loading && <div className="loader">Loading…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="empty">No disapproval reasons configured.</div>
        )}

        {items.length > 0 && (
          <table className="sa-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Label</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.code}</td>
                  <td>{r.label}</td>
                  <td className="muted">{r.description}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={r.active}
                        onChange={(e) => toggleActive(r.id, e.target.checked)}
                      />
                      <span />
                    </label>
                  </td>
                  <td className="muted small">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}