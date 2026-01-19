import { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import { 
  getCategoryRules, 
  createCategoryRule, 
  updateCategoryRule, 
  toggleCategoryRuleStatus, 
  deleteCategoryRule, 
  getAdminCategories 
} from '../../api/admin.api';
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
    // Logic remains for future implementation
  };

  const handleBulkDelete = async () => {
    // Logic remains for future implementation
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
        <p>Loading rules...</p>
      </div>
    );
  }

  return (
    <div className="category-rules-page">
      {/* HEADER SECTION */}
      <header className="page-header">
        <div className="header-content">
          <h1>Category Rules</h1>
          <p className="subtitle">Configure automated behavior and restrictions for task categories.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Add New Rule
          </button>
        </div>
      </header>

      {/* STATS SECTION */}
      <div className="stats-grid">
        <StatCard title="Total Rules" value={rules.length} />
        <StatCard title="Active Rules" value={activeRules} />
        <StatCard title="Linked Categories" value={categories.length} />
      </div>

      {/* TOOLBAR */}
      <div className="management-bar">
        <div className="bar-left">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by category, action or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select className="select-input">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="bar-right">
          {selectedRules.length > 0 && (
            <div className="bulk-actions-area">
              <span className="selection-label">{selectedRules.length} items selected</span>
              <div className="button-group">
                <button className="btn-secondary btn-sm" onClick={() => handleBulkToggleStatus(true)}>Enable</button>
                <button className="btn-secondary btn-sm" onClick={() => handleBulkToggleStatus(false)}>Disable</button>
                <button className="btn-danger btn-sm" onClick={handleBulkDelete}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="rules-table">
            <thead>
              <tr>
                <th className="col-check">
                  <input
                    type="checkbox"
                    checked={selectedRules.length === filteredRules.length && filteredRules.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Category</th>
                <th>Action Type</th>
                <th>Role</th>
                <th className="text-center">Daily Limit</th>
                <th className="text-center">Cooldown</th>
                <th className="text-center">Required</th>
                <th className="text-center">Screenshot</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} className={selectedRules.includes(rule.id) ? 'row-selected' : ''}>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={selectedRules.includes(rule.id)}
                      onChange={(e) => handleSelectRule(rule.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className="td-category-info">
                      <span className="category-name">{rule.category.name}</span>
                      <span className="rule-id-tag">ID: {rule.id.slice(0, 6)}</span>
                    </div>
                  </td>
                  <td><span className="tag-type">{rule.actionType}</span></td>
                  <td><span className="tag-role">{rule.role}</span></td>
                  <td className="text-center">
                    {rule.dailyLimitOverride ?? <span className="default-label">Default</span>}
                  </td>
                  <td className="text-center">
                    {rule.cooldownDaysOverride !== null ? `${rule.cooldownDaysOverride}d` : <span className="default-label">Default</span>}
                  </td>
                  <td className="text-center font-medium">{rule.requiredActions}</td>
                  <td className="text-center">
                    <span className={`boolean-indicator ${rule.screenshotRequired ? 'is-true' : 'is-false'}`}>
                      {rule.screenshotRequired ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${rule.status}`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button className="btn-table" onClick={() => setEditingRule(rule)}>Edit</button>
                      <button className="btn-table" onClick={() => handleToggleStatus(rule.id)}>
                        {rule.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn-table btn-delete" onClick={() => handleDeleteRule(rule.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRules.length === 0 && (
            <div className="empty-state">
              <p>No category rules found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <header className="modal-header">
              <h2>Create Category Rule</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </header>
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
                screenshotRequired: formData.get('screenshotRequired') === 'true',
                status: 'active' as const,
                priority: Number(formData.get('priority')) || 0,
              };
              handleCreateRule(data);
            }}>
              <div className="modal-body">
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Target Category</label>
                      <select name="categoryId" required>
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Action Type</label>
                      <select name="actionType" required>
                        <option value="Website Research">Website Research</option>
                        <option value="LinkedIn Inquiry">LinkedIn Inquiry</option>
                        <option value="Email Outreach">Email Outreach</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Assigned Role</label>
                      <select name="role" required>
                        <option value="Researcher">Researcher</option>
                        <option value="Inquirer">Inquirer</option>
                        <option value="Auditor">Auditor</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-separator">Rule Configuration Overrides</div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Daily Limit</label>
                      <input type="number" name="dailyLimitOverride" placeholder="Use system default" />
                    </div>
                    <div className="form-group">
                      <label>Cooldown (Days)</label>
                      <input type="number" name="cooldownDaysOverride" placeholder="Use system default" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Required Actions</label>
                      <input type="number" name="requiredActions" defaultValue={1} min={1} required />
                    </div>
                    <div className="form-group">
                      <label>Screenshot Proof</label>
                      <select name="screenshotRequired">
                        <option value="false">Not Required</option>
                        <option value="true">Mandatory</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Rule</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRule && (
        <div className="modal-overlay">
          <div className="modal-container">
            <header className="modal-header">
              <h2>Edit Rule Configuration</h2>
              <button className="btn-close" onClick={() => setEditingRule(null)}>&times;</button>
            </header>
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
                screenshotRequired: formData.get('screenshotRequired') === 'true',
                priority: Number(formData.get('priority')),
              };
              handleEditRule(updatedRule);
            }}>
              <div className="modal-body">
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Category</label>
                      <select name="categoryId" defaultValue={editingRule.categoryId} required>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
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
                  </div>

                  <div className="form-separator">Overrides & Requirements</div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Daily Limit</label>
                      <input type="number" name="dailyLimitOverride" defaultValue={editingRule.dailyLimitOverride || ''} placeholder="System default" />
                    </div>
                    <div className="form-group">
                      <label>Cooldown (Days)</label>
                      <input type="number" name="cooldownDaysOverride" defaultValue={editingRule.cooldownDaysOverride || ''} placeholder="System default" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Required Actions</label>
                      <input type="number" name="requiredActions" defaultValue={editingRule.requiredActions} required />
                    </div>
                    <div className="form-group">
                      <label>Screenshot?</label>
                      <select name="screenshotRequired" defaultValue={editingRule.screenshotRequired.toString()}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingRule(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}