import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminTopWorkers.css';

type WorkerStats = {
  userId: string;
  name: string;
  email: string;
  roleName: string;
  totalCompleted: number;
  researchCompleted: number;
  inquiryCompleted: number;
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

  // Group workers by role
  const workersByRole = workers.reduce((acc, worker) => {
    const role = worker.roleName;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(worker);
    return acc;
  }, {} as Record<string, WorkerStats[]>);

  const formatRoleName = (roleName: string): string => {
    return roleName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="sa-top-workers">
      <header className="hdr">
        <div>
          <h1>Top Workers by Role</h1>
          <p className="muted">
            Top 3 performers per role based on completed tasks
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
        <div className="empty">No worker data available for your categories.</div>
      )}

      {!loading && !error && workers.length > 0 && (
        <div className="roles-container">
          {Object.entries(workersByRole).map(([role, roleWorkers]) => (
            <section key={role} className="role-section">
              <h2 className="role-title">{formatRoleName(role)}</h2>
              <div className="workers-grid">
                {roleWorkers.map((worker, index) => (
                  <div key={worker.userId} className="worker-card">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="worker-info">
                      <h3>{worker.name}</h3>
                      <p className="worker-email">{worker.email}</p>
                    </div>
                    <div className="worker-stats">
                      <div className="stat">
                        <label>Total Completed</label>
                        <span className="stat-value">{worker.totalCompleted}</span>
                      </div>
                      <div className="stat">
                        <label>Research</label>
                        <span className="stat-value">{worker.researchCompleted}</span>
                      </div>
                      <div className="stat">
                        <label>Inquiry</label>
                        <span className="stat-value">{worker.inquiryCompleted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
