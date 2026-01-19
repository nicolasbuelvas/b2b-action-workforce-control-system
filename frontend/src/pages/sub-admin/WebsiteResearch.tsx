import React, { useEffect, useState, useCallback } from 'react';
import './WebsiteResearch.css';

type ResearchItem = {
  id: string;
  companyName: string;
  companyLink?: string;
  country?: string;
  language?: string;
  submittedBy?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  categoryId?: string;
  // any additional fields returned by backend will be accessible as index signature
  [k: string]: any;
};

type Category = { id: string; name: string; slug?: string };

const API_BASE = '/api/subadmin'; // adjust if backend prefix differs

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('API returned invalid JSON');
  }
}

export default function WebsiteResearchPage(): JSX.Element {
  // list state
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters / ui
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [total, setTotal] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  // detail modal
  const [detail, setDetail] = useState<ResearchItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Categories API ${res.status}: ${txt}`);
      }
      const data = await safeJson(res);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('fetchCategories', err);
      // don't set fatal error; categories optional
      setCategories([]);
    }
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('type', 'website'); // ensure backend returns website research only
    params.set('limit', String(pageSize));
    params.set('page', String(page));
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);
    if (q.trim()) params.set('q', q.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (countryFilter !== 'all') params.set('country', countryFilter);
    if (categoryFilter !== 'all') params.set('categoryId', categoryFilter);
    return params.toString();
  };

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery();
      const res = await fetch(`${API_BASE}/research/website?${query}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Research list ${res.status}: ${txt}`);
      }
      const data = await safeJson(res);
      // Expect structure: { items: [...], total: number }
      setItems(Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []));
      setTotal(typeof data.total === 'number' ? data.total : (Array.isArray(data) ? data.length : 0));
    } catch (err: any) {
      console.error('fetchList', err);
      setError(err.message || 'Failed to load research items');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, statusFilter, countryFilter, categoryFilter, sortBy, sortDir]);

  useEffect(() => {
    // initial loads
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, statusFilter, countryFilter, categoryFilter, sortBy, sortDir]);

  // detail loader
  const openDetail = async (id: string) => {
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/research/website/${encodeURIComponent(id)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Detail API ${res.status}: ${txt}`);
      }
      const data = await safeJson(res);
      setDetail(data);
    } catch (err: any) {
      console.error('openDetail', err);
      setError(err.message || 'Failed to load item detail');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // approve / reject actions
  const performAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    setActionBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/research/website/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${action} failed: ${res.status} ${txt}`);
      }
      // refresh list & detail
      await fetchList();
      if (detail?.id === id) {
        await openDetail(id);
      }
    } catch (err: any) {
      console.error('performAction', err);
      setError(err.message || `Failed to ${action}`);
    } finally {
      setActionBusyId(null);
    }
  };

  // helpers for pagination
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const gotoPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="sa-page research-website-page">
      <header className="sa-page-header">
        <div>
          <h2>Website Research</h2>
          <p className="muted">Submissions from website researchers for your assigned categories.</p>
        </div>
        <div className="header-actions">
          <input
            aria-label="Search submissions"
            placeholder="Search company, link, or user..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="sa-input"
          />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}>
            <option value="all">Country: All</option>
            <option value="CO">Colombia</option>
            <option value="US">USA</option>
            <option value="CN">China</option>
            {/* Backend-driven country list would be better; kept as quick filters */}
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="all">Category: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={`${sortBy}:${sortDir}`} onChange={(e) => {
            const [s, d] = e.target.value.split(':');
            setSortBy(s); setSortDir((d as 'asc'|'desc') ?? 'desc');
          }}>
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="companyName:asc">Company A→Z</option>
            <option value="companyName:desc">Company Z→A</option>
          </select>
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
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>When</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td className="nowrap"><strong>{it.companyName || '—'}</strong></td>
                    <td className="mono">{it.companyLink ? <a href={it.companyLink} target="_blank" rel="noreferrer">{it.companyLink}</a> : '—'}</td>
                    <td>{it.country ?? '—'}</td>
                    <td>{it.submittedBy ?? '—'}</td>
                    <td>
                      <span className={`status-pill ${it.status ?? 'pending'}`}>
                        {(it.status ?? 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td>{(categories.find(c => c.id === it.categoryId)?.name) ?? (it.categoryName ?? '—')}</td>
                    <td>{it.createdAt ? new Date(it.createdAt).toLocaleString() : '—'}</td>
                    <td className="actions-col">
                      <button onClick={() => openDetail(it.id)}>Details</button>
                      {it.status !== 'approved' && (
                        <button
                          disabled={actionBusyId === it.id}
                          onClick={() => performAction(it.id, 'approve')}
                          className="approve"
                        >{actionBusyId === it.id ? 'Working…' : 'Approve'}</button>
                      )}
                      {it.status !== 'rejected' && (
                        <button
                          disabled={actionBusyId === it.id}
                          onClick={() => {
                            const reason = window.prompt('Reject reason (short):') ?? '';
                            if (reason.trim().length === 0) {
                              if (!window.confirm('Reject without reason?')) return;
                            }
                            performAction(it.id, 'reject', reason.trim() || undefined);
                          }}
                          className="reject"
                        >{actionBusyId === it.id ? 'Working…' : 'Reject'}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <div>Showing page {page} / {totalPages} — {total.toLocaleString()} items</div>
              <div className="pager-controls">
                <button onClick={() => gotoPage(1)} disabled={page === 1}>« First</button>
                <button onClick={() => gotoPage(page - 1)} disabled={page === 1}>‹ Prev</button>
                <button onClick={() => gotoPage(page + 1)} disabled={page >= totalPages}>Next ›</button>
                <button onClick={() => gotoPage(totalPages)} disabled={page >= totalPages}>Last »</button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Detail drawer/modal */}
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
              {detailLoading ? <div className="loader">Loading…</div> : (
                <>
                  <section className="detail-section">
                    <label>Company Link</label>
                    <div className="mono">{detail.companyLink ?? '—'}</div>
                  </section>

                  <section className="detail-section two-col">
                    <div>
                      <label>Submitted By</label>
                      <div>{detail.submittedBy ?? '—'}</div>
                    </div>
                    <div>
                      <label>Category</label>
                      <div>{categories.find(c => c.id === detail.categoryId)?.name ?? (detail.categoryName ?? '—')}</div>
                    </div>
                  </section>

                  <section className="detail-section">
                    <label>Status & Timestamps</label>
                    <div>
                      <span className={`status-pill ${detail.status ?? 'pending'}`}>{(detail.status ?? 'pending').toUpperCase()}</span>
                      <div className="muted small">{detail.createdAt ? `Created: ${new Date(detail.createdAt).toLocaleString()}` : ''}</div>
                      <div className="muted small">{detail.updatedAt ? `Updated: ${new Date(detail.updatedAt).toLocaleString()}` : ''}</div>
                    </div>
                  </section>

                  <section className="detail-section">
                    <label>Notes</label>
                    <div className="notes">{detail.notes ?? '—'}</div>
                  </section>

                  {/* any extra fields provided by backend */}
                  <section className="detail-section">
                    <label>Raw Data</label>
                    <pre className="raw">{JSON.stringify(detail, null, 2)}</pre>
                  </section>
                </>
              )}
            </div>

            <footer className="drawer-foot">
              <div className="foot-left">
                <small className="muted">ID: {detail.id}</small>
              </div>
              <div className="foot-actions">
                {detail.status !== 'approved' && (
                  <button
                    className="approve"
                    onClick={() => performAction(detail.id, 'approve')}
                    disabled={actionBusyId === detail.id}
                  >Approve</button>
                )}
                {detail.status !== 'rejected' && (
                  <button
                    className="reject"
                    onClick={() => {
                      const reason = window.prompt('Reject reason (short):') ?? '';
                      if (reason.trim().length === 0) {
                        if (!window.confirm('Reject without reason?')) return;
                      }
                      performAction(detail.id, 'reject', reason.trim() || undefined);
                    }}
                    disabled={actionBusyId === detail.id}
                  >Reject</button>
                )}
                <button onClick={() => setDetail(null)}>Close</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
