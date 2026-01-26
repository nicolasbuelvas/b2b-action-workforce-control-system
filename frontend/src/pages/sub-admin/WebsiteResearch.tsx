import React, { useEffect, useState, useCallback } from 'react';
import { getWebsiteResearchTasks, getSubAdminCategories } from '../../api/subadmin.api';
import './WebsiteResearch.css';

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

type Category = { id: string; name: string; isActive: boolean };

export default function WebsiteResearchPage(): JSX.Element {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Detail modal
  const [detail, setDetail] = useState<ResearchItem | null>(null);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const data = await getSubAdminCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      }
    })();
  }, []);

  // Load research items
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWebsiteResearchTasks(
        categoryFilter === 'all' ? undefined : categoryFilter,
        statusFilter === 'all' ? undefined : statusFilter,
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load website research');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedCategory = categories.find(c => c.id === categoryFilter);

  return (
    <div className="sa-page research-website-page">
      <header className="sa-page-header">
        <div>
          <h2>Website Research</h2>
          <p className="muted">Submissions from website researchers for your assigned categories.</p>
        </div>
        <div className="header-actions">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
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

      <main className="sa-main">
        {loading && <div className="loader">Loading submissions…</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && items.length === 0 && (
          <div className="empty">No website research submissions found for your filters.</div>
        )}

        {!loading && items.length > 0 && (
          <>
            <table className="sa-table research-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Link</th>
                  <th>Country</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>When</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td className="nowrap"><strong>{it.companyName || '—'}</strong></td>
                    <td className="mono">{it.profileUrl ? <a href={it.profileUrl} target="_blank" rel="noreferrer">{it.profileUrl}</a> : '—'}</td>
                    <td>{it.country ?? '—'}</td>
                    <td>{it.category ?? '—'}</td>
                    <td>
                      <span className={`status-pill ${it.status}`}>
                        {it.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{it.createdAt ? new Date(it.createdAt).toLocaleString() : '—'}</td>
                    <td className="actions-col">
                      <button onClick={() => setDetail(it)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>

      {/* Detail modal */}
      {detail !== null && (
        <div className="detail-drawer" role="dialog" aria-modal="true">
          <div className="drawer-backdrop" onClick={() => setDetail(null)} />
          <div className="drawer">
            <header className="drawer-head">
              <h3>{detail.companyName ?? 'Detail'}</h3>
              <div className="drawer-actions">
                <button onClick={() => setDetail(null)}>Close</button>
              </div>
            </header>

            <div className="drawer-body">
              <section className="detail-section">
                <label>Company Link</label>
                <div className="mono">{detail.profileUrl ? <a href={detail.profileUrl} target="_blank" rel="noreferrer">{detail.profileUrl}</a> : '—'}</div>
              </section>

              <section className="detail-section two-col">
                <div>
                  <label>Country</label>
                  <div>{detail.country ?? '—'}</div>
                </div>
                <div>
                  <label>Category</label>
                  <div>{detail.category ?? '—'}</div>
                </div>
              </section>

              <section className="detail-section">
                <label>Status</label>
                <div>
                  <span className={`status-pill ${detail.status}`}>{detail.status.toUpperCase()}</span>
                  <div className="muted small">Created: {new Date(detail.createdAt).toLocaleString()}</div>
                </div>
              </section>

              <section className="detail-section">
                <label>Raw Data</label>
                <pre className="raw">{JSON.stringify(detail, null, 2)}</pre>
              </section>
            </div>

            <footer className="drawer-foot">
              <div className="foot-left">
                <small className="muted">ID: {detail.id}</small>
              </div>
              <div className="foot-actions">
                <button onClick={() => setDetail(null)}>Close</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
