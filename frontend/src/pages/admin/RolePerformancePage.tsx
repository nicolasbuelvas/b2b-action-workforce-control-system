import { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import './rolePerformancePage.css';

type UserRole = 'Researcher' | 'Inquirer' | 'Auditor' | 'Reviewer';

interface RolePerformance {
  id: string;
  role: UserRole;
  category: string;
  tasksCompleted: number;
  successRate: number;
  avgTimeMinutes: number;
  earningsUSD: number;
  status: 'Active' | 'Inactive';
}

const API_BASE = '/api/admin';

async function fetchRolePerformance(): Promise<RolePerformance[]> {
  try {
    const res = await fetch(`${API_BASE}/top-workers`);
    if (!res.ok) return [];
    const data = await res.json();
    // Transform backend data to match RolePerformance interface
    if (Array.isArray(data)) {
      return data.map((worker, idx) => ({
        id: `PERF-${String(idx + 1).padStart(3, '0')}`,
        role: worker.role?.includes('Researcher') ? 'Researcher' 
              : worker.role?.includes('Inquirer') ? 'Inquirer'
              : worker.role?.includes('Auditor') ? 'Auditor'
              : 'Reviewer',
        category: worker.category || 'General',
        tasksCompleted: worker.approvedActions || 0,
        successRate: Math.round((worker.approvalRate || 0) * 100),
        avgTimeMinutes: worker.avgTimeMinutes || 0,
        earningsUSD: worker.totalEarned || 0,
        status: worker.status === 'active' ? 'Active' : 'Inactive',
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch role performance:', error);
    return [];
  }
}

export default function RolePerformancePage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [performance, setPerformance] = useState<RolePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    fetchRolePerformance().then(data => {
      setPerformance(data);
      setLoading(false);
    });
  }, []);

  // Filter performance data
  const filteredPerformance = performance.filter(p => {
    if (filterRole && p.role !== filterRole) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !p.role.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !p.id.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const totalTasks = filteredPerformance.reduce((a, p) => a + p.tasksCompleted, 0);
  const avgSuccess = filteredPerformance.length > 0
    ? filteredPerformance.reduce((a, p) => a + p.successRate, 0) / filteredPerformance.length
    : 0;

  const uniqueRoles = Array.from(new Set(performance.map(p => p.role)));
  const uniqueCategories = Array.from(new Set(performance.map(p => p.category)));

  return (
    <div className="categories-container">
      {/* HEADER */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Role Performance</h1>
          <p>Operational analytics by role and category across all workers.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => {
            const csv = [
              ['Role', 'Category', 'Tasks Completed', 'Success Rate (%)', 'Avg Time (min)', 'Earnings ($)', 'Status'].join(','),
              ...filteredPerformance.map(p => [
                p.role, p.category, p.tasksCompleted, p.successRate, p.avgTimeMinutes.toFixed(1), p.earningsUSD.toFixed(2), p.status
              ].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `role-performance-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Export Metrics
          </button>
        </div>
      </header>

      {/* STATS */}
      <section className="categories-stats-grid">
        <StatCard title="Total Tasks" value={totalTasks} />
        <StatCard title="Avg Success Rate" value={`${avgSuccess.toFixed(1)}%`} />
        <StatCard title="Active Roles" value={performance.filter(p => p.status === 'Active').length} />
        <StatCard title="Total Earnings ($)" value={`$${filteredPerformance.reduce((a, p) => a + p.earningsUSD, 0).toFixed(2)}`} />
      </section>

      {/* MANAGEMENT BAR */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by role, category or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Role: All</option>
            {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Category: All</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn-clear" onClick={() => { setSearchTerm(''); setFilterRole(''); setFilterCategory(''); }}>Clear</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="categories-card">
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center' }}>Loading performance data...</div>
          ) : filteredPerformance.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center' }}>No data found</div>
          ) : (
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Role / Category</th>
                  <th className="txt-center">Tasks</th>
                  <th className="txt-center">Success</th>
                  <th className="txt-center">Avg Time</th>
                  <th className="txt-center">Earnings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformance.map(p => (
                  <tr key={p.id} className="cat-row">
                    <td>
                      <div className="cat-info-cell">
                        <span className="cat-id">{p.id}</span>
                        <strong className="cat-name">{p.role}</strong>
                        <span className="perf-category">{p.category}</span>
                      </div>
                    </td>
                    <td className="txt-center">
                      <span className="count-badge">{p.tasksCompleted}</span>
                    </td>
                    <td className="txt-center">
                      <span className="success-rate">{p.successRate}%</span>
                    </td>
                    <td className="txt-center">
                      <span className="avg-time">{p.avgTimeMinutes.toFixed(1)} min</span>
                    </td>
                    <td className="txt-center">
                      <span className="earnings">${p.earningsUSD.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}