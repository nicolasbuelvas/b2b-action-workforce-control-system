import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';
import './SubAdminDashboard.css';

type Stats = {
  totalSubmissions: number;
  pendingSubmissions: number;
  approved: number;
  rejected: number;
  flagged: number;
  categoriesCovered: number;
  actionsRequiringApproval: number;
};

type AlertItem = {
  id: string;
  level: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string; // ISO
};

export default function SubAdminDashboardReal(): JSX.Element {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorAlerts, setErrorAlerts] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const response = await client.get('/subadmin/stats');
      const data = response.data;
      // Map strict shape defensively
      setStats({
        totalSubmissions: Number(data.totalSubmissions ?? 0),
        pendingSubmissions: Number(data.pendingSubmissions ?? 0),
        approved: Number(data.approved ?? 0),
        rejected: Number(data.rejected ?? 0),
        flagged: Number(data.flagged ?? 0),
        categoriesCovered: Number(data.categoriesCovered ?? 0),
        actionsRequiringApproval: Number(data.actionsRequiringApproval ?? 0),
      });
    } catch (err: any) {
      console.error('fetchStats error', err);
      setErrorStats(err.message || 'Failed to load stats');
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    setErrorAlerts(null);
    try {
      const response = await client.get('/subadmin/alerts', {
        params: { limit: 8 },
      });
      const data = response.data;
      // Expecting array of alerts
      const items: AlertItem[] = (Array.isArray(data) ? data : []).map((a: any) => ({
        id: String(a.id ?? a._id ?? Math.random()),
        level: a.level === 'high' ? 'high' : a.level === 'medium' ? 'medium' : 'low',
        title: String(a.title ?? a.event ?? 'Alert'),
        message: String(a.message ?? a.detail ?? ''),
        timestamp: String(a.timestamp ?? a.createdAt ?? new Date().toISOString()),
      }));
      setAlerts(items);
    } catch (err: any) {
      console.error('fetchAlerts error', err);
      setErrorAlerts(err.message || 'Failed to load alerts');
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchAlerts();

    // auto refresh every 30s (configurable)
    const interval = setInterval(() => {
      fetchStats();
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchAlerts]);

  return (
    <div className="subadmin-real-dashboard">
      <header className="hdr">
        <div className="hdr-left">
          <h1>Operations Overview</h1>
          <p className="muted">
            Live metrics for the categories you manage. All numbers come from the backend.
          </p>
        </div>

        <div className="hdr-right">
          <label className="period-label">Period</label>
          <select
            className="period-select"
            onChange={(e) => {
              const period = e.target.value;
              // If backend supports period param, re-fetch with query (example)
              // For now we just re-fetch; backend should respect last selected period via query if implemented
              fetchStats();
            }}
            defaultValue="last7"
          >
            <option value="last24">Last 24 hours</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
          </select>
          <button className="refresh" onClick={() => { fetchStats(); fetchAlerts(); }}>
            Refresh
          </button>
        </div>
      </header>

      <section className="cards" role="region" aria-label="Key metrics">
        {loadingStats && <div className="loader">Loading stats…</div>}
        {errorStats && <div className="error">Error: {errorStats}</div>}

        {!loadingStats && !errorStats && !stats && (
          <div className="empty">No stats available for your categories.</div>
        )}

        {stats && (
          <>
            <div className="card">
              <label>Total Submissions</label>
              <h2>{stats.totalSubmissions.toLocaleString()}</h2>
              <small>Pending: {stats.pendingSubmissions.toLocaleString()}</small>
            </div>

            <div className="card">
              <label>Approvals</label>
              <h2>{stats.approved.toLocaleString()}</h2>
              <small>Rejected: {stats.rejected.toLocaleString()}</small>
            </div>

            <div className="card">
              <label>Flagged</label>
              <h2>{stats.flagged.toLocaleString()}</h2>
              <small>Need review: {stats.actionsRequiringApproval.toLocaleString()}</small>
            </div>

            <div className="card">
              <label>Categories</label>
              <h2>{stats.categoriesCovered}</h2>
              <small>Assigned categories</small>
            </div>
          </>
        )}
      </section>

      <section className="quick-actions">
        <button className="primary" onClick={() => navigate('/sub-admin/review/inquiry')}>
          Open Inquiry Review
        </button>
        <button onClick={() => navigate('/sub-admin/review/research')}>
          Open Research Review
        </button>
        <button onClick={() => navigate('/sub-admin/categories')}>Open Categories & Rules</button>
      </section>

      <section className="main-grid">
        <div className="left-col">
          <div className="panel">
            <h3>Queued actions / Need attention</h3>
            <p className="muted">Items requiring manual review (backend-driven).</p>
            <QueuedActionsList />
          </div>

          <div className="panel">
            <h3>Top Pending Categories</h3>
            <p className="muted">Which categories are accumulating the most pending actions.</p>
            <TopCategoriesList />
          </div>
        </div>

        <aside className="right-col">
          <div className="panel alerts-panel">
            <h3>Critical Priority Flags</h3>
            {loadingAlerts && <div className="loader">Loading alerts…</div>}
            {errorAlerts && <div className="error">Error: {errorAlerts}</div>}
            {!loadingAlerts && !errorAlerts && alerts.length === 0 && (
              <div className="empty">No alerts in the last period.</div>
            )}
            <div className="alert-list">
              {alerts.map((a) => (
                <div key={a.id} className={`alert-item ${a.level}`}>
                  <div className="a-dot" />
                  <div className="a-body">
                    <p><strong>{a.title}</strong></p>
                    <small className="muted">{a.message}</small>
                    <div className="ts">{new Date(a.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="a-actions">
                    <button onClick={() => navigate(`/sub-admin/alerts/${a.id}`)}>Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Admin Shortcuts</h3>
            <div className="shortcuts">
              <button onClick={() => navigate('/sub-admin/templates')}>Templates</button>
              <button onClick={() => navigate('/sub-admin/disapproval-reasons')}>Disapproval Reasons</button>
              <button onClick={() => navigate('/sub-admin/messages')}>Messages</button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

/* ---------------------
   Helper small components
   --------------------- */

function QueuedActionsList() {
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await client.get('/subadmin/queued-actions', { params: { limit: 10 } });
        const data = res.data;
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error(e);
        setErr(e.message || 'Failed to load queued actions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="loader">Loading queued actions…</div>;
  if (err) return <div className="error">Error: {err}</div>;
  if (!items || items.length === 0) return <div className="empty">No queued actions.</div>;

  return (
    <ul className="queue-list">
      {items.map((it: any) => (
        <li key={it.id ?? it._id} className="queue-item">
          <div className="q-main">
            <strong>{it.event ?? it.type ?? 'Action'}</strong>
            <div className="muted small">{it.actor ?? it.user ?? '—'} • {it.target ?? ''}</div>
          </div>
          <div className="q-meta">
            <small className="muted">{it.timestamp ? new Date(it.timestamp).toLocaleString() : ''}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TopCategoriesList() {
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await client.get('/subadmin/top-categories', { params: { limit: 6 } });
        const data = res.data;
        if (!mounted) return;
        setList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="loader">Loading categories…</div>;
  if (!list || list.length === 0) return <div className="empty">No category data.</div>;

  return (
    <ul className="top-cat-list">
      {list.map(c => (
        <li key={c.id ?? c.slug} className="top-cat">
          <div className="cat-name">{c.name ?? c.slug}</div>
          <div className="cat-meta small muted">{(c.pending ?? 0).toLocaleString()} pending</div>
        </li>
      ))}
    </ul>
  );
}