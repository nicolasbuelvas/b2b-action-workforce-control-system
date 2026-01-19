import React, { useEffect, useState, useCallback } from 'react';
import './SubAdminPerformance.css';

type PerformanceStats = {
  totalActions: number;
  approved: number;
  rejected: number;
  avgReviewTimeMinutes: number;
  researchCount: number;
  inquiryCount: number;
};

const API_BASE = '/api/subadmin/performance';

export default function SubAdminPerformance(): JSX.Element {
  const [period, setPeriod] = useState('last7');
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const safeJson = async (res: Response) => {
    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      throw new Error('Invalid JSON');
    }
  };

  const loadPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?period=${period}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await safeJson(res);
      setStats({
        totalActions: Number(data.totalActions ?? 0),
        approved: Number(data.approved ?? 0),
        rejected: Number(data.rejected ?? 0),
        avgReviewTimeMinutes: Number(data.avgReviewTimeMinutes ?? 0),
        researchCount: Number(data.researchCount ?? 0),
        inquiryCount: Number(data.inquiryCount ?? 0),
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load performance');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [period, getAuthHeaders]);

  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  const approvalRate =
    stats && stats.totalActions > 0
      ? Math.round((stats.approved / stats.totalActions) * 100)
      : 0;

  return (
    <div className="sa-performance-page">
      <header className="hdr">
        <div>
          <h1>Performance</h1>
          <p className="muted">
            Operational efficiency and quality metrics. Backend-driven.
          </p>
        </div>

        <select
          className="period-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="last24">Last 24 hours</option>
          <option value="last7">Last 7 days</option>
          <option value="last30">Last 30 days</option>
        </select>
      </header>

      {loading && <div className="loader">Loading performance…</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && !stats && (
        <div className="empty">No performance data available.</div>
      )}

      {stats && (
        <>
          <section className="cards">
            <div className="card">
              <label>Total Actions</label>
              <h2>{stats.totalActions.toLocaleString()}</h2>
            </div>

            <div className="card">
              <label>Approval Rate</label>
              <h2>{approvalRate}%</h2>
              <small>
                {stats.approved} approved / {stats.rejected} rejected
              </small>
            </div>

            <div className="card">
              <label>Avg Review Time</label>
              <h2>{stats.avgReviewTimeMinutes} min</h2>
              <small>End-to-end</small>
            </div>

            <div className="card">
              <label>Action Mix</label>
              <h2>{stats.researchCount + stats.inquiryCount}</h2>
              <small>
                Research: {stats.researchCount} • Inquiry: {stats.inquiryCount}
              </small>
            </div>
          </section>

          <section className="notes">
            <h3>Interpretation</h3>
            <ul>
              <li>Low approval rate usually signals unclear rules or bad intake.</li>
              <li>High review time indicates bottlenecks or overloaded reviewers.</li>
              <li>Skewed action mix often predicts backlog growth.</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}