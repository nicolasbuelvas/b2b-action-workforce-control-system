import React, { useEffect, useState, useCallback } from 'react';
import './SubAdminCountryStats.css';

type CountryStat = {
  countryCode: string;
  countryName: string;
  totalSubmissions: number;
  approved: number;
  rejected: number;
  flagged: number;
  activeWorkers: number;
};

const API_BASE = '/api/subadmin/country-stats';

export default function SubAdminCountryStats(): JSX.Element {
  const [period, setPeriod] = useState('last7');
  const [countries, setCountries] = useState<CountryStat[]>([]);
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
      throw new Error('Invalid JSON from API');
    }
  };

  const fetchCountryStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?period=${period}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt}`);
      }
      const data = await safeJson(res);
      setCountries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load country stats');
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, [period, getAuthHeaders]);

  useEffect(() => {
    fetchCountryStats();
  }, [fetchCountryStats]);

  return (
    <div className="sa-country-stats">
      <header className="hdr">
        <div>
          <h1>Country Statistics</h1>
          <p className="muted">
            Operational performance aggregated by country. Backend-sourced.
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

      {loading && <div className="loader">Loading country stats…</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && countries.length === 0 && (
        <div className="empty">No data available for this period.</div>
      )}

      {!loading && !error && countries.length > 0 && (
        <table className="country-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Total</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Flagged</th>
              <th>Approval %</th>
              <th>Active Workers</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => {
              const approvalRate =
                c.totalSubmissions > 0
                  ? Math.round((c.approved / c.totalSubmissions) * 100)
                  : 0;

              return (
                <tr key={c.countryCode}>
                  <td>
                    <strong>{c.countryName}</strong>
                    <div className="muted small">{c.countryCode}</div>
                  </td>
                  <td>{c.totalSubmissions}</td>
                  <td>{c.approved}</td>
                  <td>{c.rejected}</td>
                  <td>{c.flagged}</td>
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
                  <td>{c.activeWorkers}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}