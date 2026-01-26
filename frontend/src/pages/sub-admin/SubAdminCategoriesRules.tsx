import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminCategoriesRules.css';

type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  rulesCount: number;
  updatedAt?: string;
};

type Rule = {
  id: string;
  field: string;
  operator: string;
  value: string;
  action: 'approve' | 'reject' | 'flag';
};

export default function SubAdminCategoriesRules(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRules = useCallback(
    async (categoryId: string) => {
      try {
        const res = await fetch(`${API_BASE}/${categoryId}/rules`, {
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        });
        if (!res.ok) throw new Error(`Rules ${res.status}`);
        const data = await safeJson(res);
        setRules(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setRules([]);
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selected) fetchRules(selected.id);
  }, [selected, fetchRules]);

  return (
    <div className="categories-page">
      <header className="hdr">
        <div>
          <h1>Categories & Rules</h1>
          <p className="muted">
            Define how submissions are automatically approved, rejected or flagged.
          </p>
        </div>
        <button className="refresh" onClick={fetchCategories}>
          Refresh
        </button>
      </header>

      {loading && <div className="loader">Loading categories…</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && categories.length === 0 && (
        <div className="empty">No categories configured.</div>
      )}

      {!loading && categories.length > 0 && (
        <div className="layout">
          <aside className="category-list">
            {categories.map((c) => (
              <button
                key={c.id}
                className={`cat-item ${selected?.id === c.id ? 'active' : ''}`}
                onClick={() => setSelected(c)}
              >
                <div className="cat-name">{c.name}</div>
                <div className="cat-meta">
                  <span>{c.rulesCount} rules</span>
                  <span className={c.active ? 'on' : 'off'}>
                    {c.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </button>
            ))}
          </aside>

          <section className="rules-panel">
            {!selected && (
              <div className="empty">
                Select a category to view and manage its rules.
              </div>
            )}

            {selected && (
              <>
                <header className="rules-hdr">
                  <h2>{selected.name}</h2>
                  <small className="muted">
                    Last update:{' '}
                    {selected.updatedAt
                      ? new Date(selected.updatedAt).toLocaleString()
                      : '—'}
                  </small>
                </header>

                {rules.length === 0 && (
                  <div className="empty">
                    This category has no rules defined.
                  </div>
                )}

                {rules.length > 0 && (
                  <table className="rules-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Operator</th>
                        <th>Value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((r) => (
                        <tr key={r.id}>
                          <td>{r.field}</td>
                          <td>{r.operator}</td>
                          <td>{r.value}</td>
                          <td>
                            <span className={`action ${r.action}`}>
                              {r.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
