import { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import { getCategoryRules, createCategoryRule, updateCategoryRule, toggleCategoryRuleStatus, deleteCategoryRule, getAdminCategories } from '../../api/admin.api';
import './categoryRulesPage.css';

interface CategoryRule {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  actionType: string;
  role: string;
  dailyLimitOverride: number | null;
  cooldownDaysOverride: number | null;
  requiredActions: number;
  screenshotRequired: boolean;
  status: 'active' | 'inactive';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CategoryRulesPage() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rulesData, categoriesData] = await Promise.all([
        getCategoryRules(),
        getAdminCategories(),
      ]);
      setRules(rulesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (data: Omit<CategoryRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createCategoryRule(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const handleEditRule = async (rule: CategoryRule) => {
    try {
      await updateCategoryRule(rule.id, rule);
      await loadData();
      setEditingRule(null);
    } catch (error) {
      console.error('Failed to update rule:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleCategoryRuleStatus(id);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await deleteCategoryRule(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleBulkToggleStatus = async (activate: boolean) => {
    // TODO: implement bulk operations
  };

  const handleBulkDelete = async () => {
    // TODO: implement bulk delete
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRules(checked ? filteredRules.map(r => r.id) : []);
  };

  const handleSelectRule = (id: string, checked: boolean) => {
    setSelectedRules(prev =>
      checked ? [...prev, id] : prev.filter(rid => rid !== id)
    );
  };

  const filteredRules = rules.filter(rule =>
    rule.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeRules = rules.filter(r => r.status === 'active').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="category-rules-page">
      {/* HEADER SECTION */}
      <div className="page-header">
        <div className="header-left">
          <h1>Category Rules</h1>
          <p className="subtitle">Manage automated restrictions and requirements per category.</p>
        </div>
        <div className="header-stats-row">
            <div className="stat-item">
                <span className="stat-label">Total Rules</span>
                <span className="stat-value">{rules.length}</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">Active Rules</span>
                <span className="stat-value">{activeRules}</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">Categories</span>
                <span className="stat-value">{categories.length}</span>
            </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="management-bar">
        <div className="bar-left">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <select className="select-filter"><option>Status: All</option></select>
            <button className="btn-secondary">Reset</button>
          </div>
        </div>

        <div className="bar-right">
          {selectedRules.length > 0 && (
            <div className="bulk-actions fade-in">
              <span className="selection-count">{selectedRules.length} selected</span>
              <button className="btn-secondary small" onClick={() => handleBulkToggleStatus(true)}>Enable</button>
              <button className="btn-secondary small" onClick={() => handleBulkToggleStatus(false)}>Disable</button>
              <button className="btn-danger small" onClick={handleBulkDelete}>Delete</button>
            </div>
          )}
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Rule
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-container">
          <table className="rules-table">
            {/* COLGROUP: Controls column widths strictly */}
            <colgroup>
                <col style={{ width: '40px' }} />  {/* Checkbox */}
                <col style={{ width: '100px' }} /> {/* ID */}
                <col style={{ width: '180px' }} /> {/* Category */}
                <col style={{ width: '160px' }} /> {/* Action Type */}
                <col style={{ width: '120px' }} /> {/* Role */}
                <col style={{ width: '100px' }} /> {/* Limit */}
                <col style={{ width: '100px' }} /> {/* Cooldown */}
                <col style={{ width: '80px' }} />  {/* Req Actions */}
                <col style={{ width: '100px' }} /> {/* Screenshot */}
                <col style={{ width: '100px' }} /> {/* Status */}
                <col style={{ width: '80px' }} />  {/* Priority */}
                <col style={{ width: '220px' }} /> {/* Actions */}
            </colgroup>
            <thead>
              <tr>
                <th className="th-center">
                  <input
                    type="checkbox"
                    checked={selectedRules.length === filteredRules.length && filteredRules.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>ID</th>
                <th>Category</th>
                <th>Action Type</th>
                <th>Role</th>
                <th className="th-center">Daily Limit</th>
                <th className="th-center">Cooldown</th>
                <th className="th-center">Req.</th>
                <th className="th-center">Screenshot</th>
                <th>Status</th>
                <th className="th-center">Priority</th>
                <th className="th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} className={selectedRules.includes(rule.id) ? 'selected-row' : ''}>
                  <td className="td-center">
                    <input
                      type="checkbox"
                      checked={selectedRules.includes(rule.id)}
                      onChange={(e) => handleSelectRule(rule.id, e.target.checked)}
                    />
                  </td>
                  <td className="td-id" title={rule.id}>{rule.id.slice(0, 8)}...</td>
                  <td className="td-strong">{rule.category.name}</td>
                  <td><span className="badge-gray">{rule.actionType}</span></td>
                  <td><span className="badge-gray">{rule.role}</span></td>
                  
                  <td className={`td-center ${rule.dailyLimitOverride ? 'text-dark' : 'text-light'}`}>
                    {rule.dailyLimitOverride !== null ? rule.dailyLimitOverride : '-'}
                  </td>
                  <td className={`td-center ${rule.cooldownDaysOverride ? 'text-dark' : 'text-light'}`}>
                    {rule.cooldownDaysOverride !== null ? rule.cooldownDaysOverride + 'd' : '-'}
                  </td>
                  
                  <td className="td-center">{rule.requiredActions}</td>
                  <td className="td-center">
                    {rule.screenshotRequired && <span className="badge-blue">REQ</span>}
                    {!rule.screenshotRequired && <span className="text-light">-</span>}
                  </td>
                  <td>
                    <span className={`status-pill ${rule.status}`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="td-center">{rule.priority}</td>
                  <td className="td-actions">
                      <button className="btn-icon" onClick={() => setEditingRule(rule)}>Edit</button>
                      <button className="btn-icon" onClick={() => handleToggleStatus(rule.id)}>
                        {rule.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDeleteRule(rule.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredRules.length === 0 && (
                  <tr className="empty-row">
                      <td colSpan={12}>No rules found.</td>
                  </tr>
              )}
            </tbody>
          </table>
      </div>

      {/* MODALS REMAIN THE SAME - Logic Unchanged */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Create New Rule</h2>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = {
                categoryId: formData.get('categoryId') as string,
                actionType: formData.get('actionType') as string,
                role: formData.get('role') as string,
                dailyLimitOverride: formData.get('dailyLimitOverride') ? Number(formData.get('dailyLimitOverride')) : null,
                cooldownDaysOverride: formData.get('cooldownDaysOverride') ? Number(formData.get('cooldownDaysOverride')) : null,
                requiredActions: Number(formData.get('requiredActions')) || 1,
                screenshotRequired: (formData.get('screenshotRequired') as string) === 'true',
                status: 'active' as const,
                priority: Number(formData.get('priority')) || 0,
              };
              handleCreateRule(data);
            }}>
              <div className="form-grid">
                <div className="form-group span-2">
                    <label>Category</label>
                    <select name="categoryId" required>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Action Type</label>
                    <select name="actionType" required>
                    <option value="Website Research">Website Research</option>
                    <option value="LinkedIn Inquiry">LinkedIn Inquiry</option>
                    <option value="Email Outreach">Email Outreach</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select name="role" required>
                    <option value="Researcher">Researcher</option>
                    <option value="Inquirer">Inquirer</option>
                    <option value="Auditor">Auditor</option>
                    </select>
                </div>
                <div className="form-divider span-2">Overrides</div>
                <div className="form-group">
                    <label>Daily Limit</label>
                    <input type="number" name="dailyLimitOverride" placeholder="Default" />
                </div>
                <div className="form-group">
                    <label>Cooldown (Days)</label>
                    <input type="number" name="cooldownDaysOverride" placeholder="Default" />
                </div>
                <div className="form-group">
                    <label>Req. Actions</label>
                    <input type="number" name="requiredActions" defaultValue={1} required />
                </div>
                <div className="form-group">
                    <label>Screenshot?</label>
                    <select name="screenshotRequired">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Priority</label>
                    <input type="number" name="priority" defaultValue={0} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRule && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Edit Rule</h2>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedRule = {
                ...editingRule,
                categoryId: formData.get('categoryId') as string,
                actionType: formData.get('actionType') as string,
                role: formData.get('role') as string,
                dailyLimitOverride: formData.get('dailyLimitOverride') ? Number(formData.get('dailyLimitOverride')) : null,
                cooldownDaysOverride: formData.get('cooldownDaysOverride') ? Number(formData.get('cooldownDaysOverride')) : null,
                requiredActions: Number(formData.get('requiredActions')),
                screenshotRequired: (formData.get('screenshotRequired') as string) === 'true',
                priority: Number(formData.get('priority')),
              };
              handleEditRule(updatedRule);
            }}>
              <div className="form-grid">
                <div className="form-group span-2">
                    <label>Category</label>
                    <select name="categoryId" defaultValue={editingRule.categoryId} required>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Action Type</label>
                    <select name="actionType" defaultValue={editingRule.actionType} required>
                    <option value="Website Research">Website Research</option>
                    <option value="LinkedIn Inquiry">LinkedIn Inquiry</option>
                    <option value="Email Outreach">Email Outreach</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select name="role" defaultValue={editingRule.role} required>
                    <option value="Researcher">Researcher</option>
                    <option value="Inquirer">Inquirer</option>
                    <option value="Auditor">Auditor</option>
                    </select>
                </div>
                <div className="form-divider span-2">Overrides</div>
                <div className="form-group">
                    <label>Daily Limit</label>
                    <input type="number" name="dailyLimitOverride" defaultValue={editingRule.dailyLimitOverride || ''} placeholder="Default" />
                </div>
                <div className="form-group">
                    <label>Cooldown (Days)</label>
                    <input type="number" name="cooldownDaysOverride" defaultValue={editingRule.cooldownDaysOverride || ''} placeholder="Default" />
                </div>
                <div className="form-group">
                    <label>Req. Actions</label>
                    <input type="number" name="requiredActions" defaultValue={editingRule.requiredActions} required />
                </div>
                <div className="form-group">
                    <label>Screenshot?</label>
                    <select name="screenshotRequired" defaultValue={editingRule.screenshotRequired.toString()}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Priority</label>
                    <input type="number" name="priority" defaultValue={editingRule.priority} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingRule(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}