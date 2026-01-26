import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminTopWorkers.css';

type WorkerStats = {
  userId: string;
  name: string;
  email: string;
  totalActions: number;
  approved: number;
  rejected: number;
  avgReviewTimeMinutes: number;
  lastActiveAt: string;
};

export default function SubAdminTopWorkers(): JSX.Element {
  const [period, setPeriod] = useState('last7');
  const [workers, setWorkers] = useState<WorkerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/top-workers', {
        params: { period },
      });
      setWorkers(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load top workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return (
    <div className="sa-top-workers">
      <header className="hdr">
        <div>
          <h1>Top Workers</h1>
          <p className="muted">
            Productivity and quality metrics per reviewer. Backend-sourced.
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

      {loading && <div className="loader">Loading workers…</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && workers.length === 0 && (
        <div className="empty">No worker data for this period.</div>
      )}

      {!loading && !error && workers.length > 0 && (
        <table className="workers-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Actions</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Approval %</th>
              <th>Avg Review Time</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => {
              const approvalRate =
                w.totalActions > 0
                  ? Math.round((w.approved / w.totalActions) * 100)
                  : 0;

              return (
                <tr key={w.userId}>
                  <td>
                    <div className="worker">
                      <strong>{w.name}</strong>
                      <span className="muted small">{w.email}</span>
                    </div>
                  </td>
                  <td>{w.totalActions}</td>
                  <td>{w.approved}</td>
                  <td>{w.rejected}</td>
                  <td>
                    <span
                      className={
                        approvalRate >= 85
                          ? 'rate good'
                          : approvalRate >= 65
                          ? 'rate warn'
                          : 'rate bad'
                      }
                    >
                      {approvalRate}%
                    </span>
                  </td>
                  <td>{w.avgReviewTimeMinutes} min</td>
                  <td className="small muted">
                    {new Date(w.lastActiveAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
