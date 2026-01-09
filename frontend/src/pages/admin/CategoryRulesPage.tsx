import { useState } from 'react';
import StatCard from '../../components/cards/StatCard';
import './categoryRulesPage.css';

interface CategoryRule {
  id: string;
  categoryName: string;
  categoryId: string;
  dailyLimit: number;
  cooldownDays: number;
  status: 'Active' | 'Inactive';
  assignedSubAdmins: string[];
}

export default function CategoryRulesPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [rules] = useState<CategoryRule[]>([
    {
      id: 'RULE-001',
      categoryId: 'CAT-001',
      categoryName: 'Product A',
      dailyLimit: 150,
      cooldownDays: 3,
      status: 'Active',
      assignedSubAdmins: ['Jane Smith', 'Mike Ross'],
    },
    {
      id: 'RULE-002',
      categoryId: 'CAT-002',
      categoryName: 'Product B',
      dailyLimit: 100,
      cooldownDays: 5,
      status: 'Active',
      assignedSubAdmins: ['Harvey Specter'],
    },
    {
      id: 'RULE-003',
      categoryId: 'CAT-003',
      categoryName: 'Product C',
      dailyLimit: 50,
      cooldownDays: 7,
      status: 'Inactive',
      assignedSubAdmins: [],
    },
  ]);

  const activeRules = rules.filter(r => r.status === 'Active').length;

  return (
    <div className="categories-container">
      {/* WIP */}
      <div className="wip-banner">
        <span>SYSTEM MODULE: WORK IN PROGRESS (W.I.P)</span>
      </div>

      {/* HEADER */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Category Rules</h1>
          <p>Define daily limits, cooldowns and enforcement per category.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export Rules</button>
          <button className="btn-add-category">+ Add Rule</button>
        </div>
      </header>

      {/* STATS */}
      <section className="categories-stats-grid">
        <StatCard title="Total Rules" value={rules.length} />
        <StatCard title="Active Rules" value={activeRules} />
        <StatCard title="Global Daily Limit" value={rules.reduce((a, r) => a + r.dailyLimit, 0)} />
        <StatCard title="Avg Cooldown (Days)" value={Math.round(rules.reduce((a, r) => a + r.cooldownDays, 0) / rules.length)} />
      </section>

      {/* MANAGEMENT BAR */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by rule ID, category or Sub-Admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select><option>Status: All</option></select>
          <select><option>Category: All</option></select>
          <button className="btn-clear">Clear</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>Rule / Category</th>
                <th>Assigned Sub-Admins</th>
                <th className="txt-center">Daily Limit</th>
                <th className="txt-center">Cooldown</th>
                <th>Status</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id} className="cat-row">
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="cat-info-cell">
                      <span className="cat-id">{rule.id}</span>
                      <strong className="cat-name">{rule.categoryName}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="subadmin-tags">
                      {rule.assignedSubAdmins.length > 0 ? (
                        rule.assignedSubAdmins.map(admin => (
                          <span key={admin} className="admin-tag">{admin}</span>
                        ))
                      ) : (
                        <span className="no-admins">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="txt-center">
                    <span className="count-badge">{rule.dailyLimit}</span>
                  </td>
                  <td className="txt-center">
                    <span className="cooldown-val">{rule.cooldownDays} days</span>
                  </td>
                  <td>
                    <span className={`status-pill ${rule.status.toLowerCase()}`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="txt-right">
                    <div className="action-buttons">
                      <button className="btn-icon-act edit">Edit</button>
                      <button className="btn-icon-act delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}