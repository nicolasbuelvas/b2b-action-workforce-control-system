import React, { useState, useEffect } from 'react';
import { 
  getSubAdminCategoryRules,
  updateCategoryRuleDailyLimit,
  updateCategoryRuleCooldown,
  CategoryRule 
} from '../../api/subadmin.api';
import './SubAdminCRUD.css';

export default function SubAdminDailyLimits(): JSX.Element {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterActionType, setFilterActionType] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const rulesData = await getSubAdminCategoryRules();
      setRules(rulesData);
    } catch (err: any) {
      console.error('Failed to load category rules', err);
      alert('Failed to load daily limits data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRule = (rule: CategoryRule) => {
    setEditingRule({ ...rule });
  };

  const handleSaveAll = async () => {
    if (!editingRule) return;

    try {
      await Promise.all([
        updateCategoryRuleDailyLimit(editingRule.id, editingRule.dailyLimitOverride),
        updateCategoryRuleCooldown(editingRule.id, editingRule.cooldownDaysOverride),
      ]);
      await loadData();
      setEditingRule(null);
      alert('Daily limit settings updated successfully');
    } catch (err: any) {
      console.error('Failed to update settings', err);
      alert('Failed to update settings');
    }
  };

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(rules.map(r => r.category.name)));
  const uniqueRoles = Array.from(new Set(rules.map(r => r.role)));
  const uniqueActionTypes = Array.from(new Set(rules.map(r => r.actionType)));

  // Filter rules
  const filteredRules = rules.filter(rule => {
    const matchesCategory = !filterCategory || rule.category.name === filterCategory;
    const matchesRole = !filterRole || rule.role === filterRole;
    const matchesActionType = !filterActionType || rule.actionType === filterActionType;
    return matchesCategory && matchesRole && matchesActionType;
  });

  return (
    <div className="sa-crud-page">
      <header className="sa-page-header">
        <div>
          <h2>Daily Task Limits</h2>
          <p className="muted">
            Configure daily limits and cooldown periods for roles in your assigned categories
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="sa-filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <select 
          value={filterActionType}
          onChange={(e) => setFilterActionType(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Action Types</option>
          {uniqueActionTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <main className="sa-main">
        {loading && <div className="loading-state">Loading limits...</div>}

        {!loading && (
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Action Type</th>
                  <th>Role</th>
                  <th>Daily Limit</th>
                  <th>Cooldown (Days)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="font-semibold">{rule.category.name}</td>
                    <td>{rule.actionType}</td>
                    <td>{rule.role}</td>
                    <td>
                      {rule.dailyLimitOverride !== null 
                        ? rule.dailyLimitOverride 
                        : <span className="muted">Not set</span>
                      }
                    </td>
                    <td>
                      {rule.cooldownDaysOverride !== null 
                        ? rule.cooldownDaysOverride 
                        : <span className="muted">Not set</span>
                      }
                    </td>
                    <td>
                      <span className={`badge ${rule.status === 'active' ? 'badge-success' : 'badge-inactive'}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-sm btn-secondary"
                          onClick={() => handleEditRule(rule)}
                        >
                          Edit Limits
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRules.length === 0 && (
              <div className="empty-state">
                <p>No rules found for your assigned categories{filterCategory || filterRole || filterActionType ? ' with the selected filters' : ''}.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingRule && (
        <div className="modal-overlay" onClick={() => setEditingRule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Daily Limits</h3>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
              <p><strong>Category:</strong> {editingRule.category.name}</p>
              <p><strong>Action Type:</strong> {editingRule.actionType}</p>
              <p><strong>Role:</strong> {editingRule.role}</p>
            </div>

            <div className="form-group">
              <label htmlFor="dailyLimit">Daily Task Limit</label>
              <input
                type="number"
                id="dailyLimit"
                value={editingRule.dailyLimitOverride ?? ''}
                onChange={(e) => setEditingRule({
                  ...editingRule,
                  dailyLimitOverride: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="No limit (leave empty)"
                min="0"
                max="1000"
              />
              <small className="muted">Maximum tasks per day for this role in this category. Leave empty for no limit.</small>
            </div>

            <div className="form-group">
              <label htmlFor="cooldown">Cooldown Period (Days)</label>
              <input
                type="number"
                id="cooldown"
                value={editingRule.cooldownDaysOverride ?? ''}
                onChange={(e) => setEditingRule({
                  ...editingRule,
                  cooldownDaysOverride: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="No cooldown (leave empty)"
                min="0"
                max="365"
              />
              <small className="muted">Minimum days between contacting the same company/URL. Leave empty for no cooldown.</small>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setEditingRule(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleSaveAll}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
