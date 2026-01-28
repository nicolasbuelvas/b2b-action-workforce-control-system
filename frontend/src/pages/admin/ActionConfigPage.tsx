import React, { useEffect, useState } from 'react';
import './actionConfigPage.css';
import StatCard from '../../components/cards/StatCard';

// --- Types ---
type Role =
  | 'Super Admin'
  | 'Sub-Admin'
  | 'Website Researcher'
  | 'LinkedIn Researcher'
  | 'Website Inquirer'
  | 'Backlink Outreacher'
  | 'LinkedIn Inquirer'
  | 'Website Inquirer Auditor'
  | 'LinkedIn Inquirer Auditor'
  | 'Website Research Auditor'
  | 'LinkedIn Research Auditor'
  | 'Website Reviewer'
  | 'Backlink Website Reviewer'
  | 'LinkedIn Reviewer';

type ActionType = 'research' | 'inquiry' | 'review' | 'outreach';

interface ActionInput {
  id: string;
  actionId: string;
  inputKey: string;
  label: string;
  type: string;
  required: boolean;
  optionsSource?: string;
  validationRules?: string;
  order: number;
}

interface EvidenceRule {
  actionId: string;
  requiresScreenshot: boolean;
  screenshotType: 'image' | 'pdf';
  screenshotContext: string;
  maxSizeMb: number;
}

interface ApprovalRule {
  actionId: string;
  requiresApproval: boolean;
  approvalRole: Role;
  approvalCriteria: string;
  rejectionReasonGroupId: string;
}

interface ActionConfig {
  id: string;
  name: string;
  role: Role;
  category: string;
  actionType: ActionType;
  enabled: boolean;
  inputs: ActionInput[];
  evidence: EvidenceRule;
  approval: ApprovalRule;
  guidelines: string;
}

interface GlobalListItem {
  id: string;
  name: string;
}

interface NoticeConfig {
  id: string;
  recipientRole: Role;
  category: string;
  userId?: string;
  message: string;
  createdAt: string;
}

// --- API pattern: Use fetch directly, matching other pages ---
const API_BASE = '/api/actions';

async function fetchActionsConfig(): Promise<ActionConfig[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// For global lists, use safe placeholders (empty arrays) if endpoints do not exist
async function fetchGlobalList(type: string): Promise<GlobalListItem[]> {
  return [];
}
async function fetchNotices(): Promise<NoticeConfig[]> {
  return [];
}

// --- Main Component ---
const roles: Role[] = [
  'Super Admin',
  'Sub-Admin',
  'Website Researcher',
  'LinkedIn Researcher',
  'Website Inquirer',
  'Backlink Outreacher',
  'LinkedIn Inquirer',
  'Website Inquirer Auditor',
  'LinkedIn Inquirer Auditor',
  'Website Research Auditor',
  'LinkedIn Research Auditor',
  'Website Reviewer',
  'Backlink Website Reviewer',
  'LinkedIn Reviewer',
];

const actionTypes: ActionType[] = ['research', 'inquiry', 'review', 'outreach'];

const ActionConfigPage: React.FC = () => {
  // --- State ---
  const [actions, setActions] = useState<ActionConfig[]>([]);
  const [filteredActions, setFilteredActions] = useState<ActionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editAction, setEditAction] = useState<ActionConfig | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [globalLists, setGlobalLists] = useState<{
    blacklist: GlobalListItem[];
  }>({
    blacklist: [],
  });
  const [globalListType, setGlobalListType] = useState<'blacklist'>('blacklist');
  const [showGlobalListModal, setShowGlobalListModal] = useState(false);
  const [globalListInput, setGlobalListInput] = useState('');
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [notices, setNotices] = useState<NoticeConfig[]>([]);
  const [noticeForm, setNoticeForm] = useState<Partial<NoticeConfig>>({});

  // --- Fetch Data ---
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchActionsConfig(),
      fetchGlobalList('blacklist'),
      fetchNotices(),
    ]).then(
      ([actions, blacklist, notices]) => {
        setActions(actions);
        setFilteredActions(actions);
        setGlobalLists({ blacklist });
        setNotices(notices);
        setLoading(false);
      }
    );
  }, []);

  // --- Filtering ---
  useEffect(() => {
    if (!search) {
      setFilteredActions(actions);
    } else {
      const q = search.toLowerCase();
      setFilteredActions(
        actions.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.role.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            a.actionType.toLowerCase().includes(q) ||
            a.id.toLowerCase().includes(q)
        )
      );
    }
  }, [search, actions]);

  // --- Handlers ---
  // For create/update/delete, use safe stubs that do nothing if API does not exist
  const handleEdit = (action: ActionConfig) => setEditAction(action);
  const handleDelete = async (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    setFilteredActions((prev) => prev.filter((a) => a.id !== id));
    // TODO: Implement API call if endpoint exists
  };
  const handleEnableToggle = async (id: string, enabled: boolean) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled } : a))
    );
    setFilteredActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled } : a))
    );
    // TODO: Implement API call if endpoint exists
  };
  const handleSaveEdit = async (updated: ActionConfig) => {
    setActions((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    setFilteredActions((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    setEditAction(null);
    // TODO: Implement API call if endpoint exists
  };
  const handleCreate = async (newConfig: ActionConfig) => {
    setActions((prev) => [...prev, newConfig]);
    setFilteredActions((prev) => [...prev, newConfig]);
    setShowCreateModal(false);
    // TODO: Implement API call if endpoint exists
  };

  // --- Global List Handlers ---
  const handleAddGlobalListItem = async () => {
    if (!globalListInput.trim()) return;
    setGlobalLists((prev) => ({
      ...prev,
      [globalListType]: [
        ...prev[globalListType],
        { id: Date.now().toString(), name: globalListInput.trim() },
      ],
    }));
    setGlobalListInput('');
    // TODO: Implement API call if endpoint exists
  };
  const handleDeleteGlobalListItem = async (id: string) => {
    setGlobalLists((prev) => ({
      ...prev,
      [globalListType]: prev[globalListType].filter((item) => item.id !== id),
    }));
    // TODO: Implement API call if endpoint exists
  };
  const handleEditGlobalListItem = async (id: string, name: string) => {
    setGlobalLists((prev) => ({
      ...prev,
      [globalListType]: prev[globalListType].map((item) =>
        item.id === id ? { ...item, name } : item
      ),
    }));
    // TODO: Implement API call if endpoint exists
  };

  // --- Notice Handlers ---
  const handleAddNotice = async () => {
    if (!noticeForm.message || !noticeForm.recipientRole || !noticeForm.category)
      return;
    setNotices((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        recipientRole: noticeForm.recipientRole!,
        category: noticeForm.category!,
        userId: noticeForm.userId,
        message: noticeForm.message!,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNoticeModalOpen(false);
    setNoticeForm({});
    // TODO: Implement API call if endpoint exists
  };

  // --- Stats ---
  const totalActions = actions.length;
  const enabledActions = actions.filter((a) => a.enabled).length;
  const rolesCovered = Array.from(new Set(actions.map((a) => a.role))).length;
  const approvalRequiredCount = actions.filter((a) => a.approval.requiresApproval)
    .length;

  // --- Render ---
  if (loading)
    return <div className="page-loader">Loading Action Configurations...</div>;

  return (
    <div className="categories-container">
      {/* Header */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Action Configuration</h1>
          <p>
            Define how system actions behave across all roles. Changes here affect
            every task and role instantly.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-export"
            onClick={() => alert('Export coming soon!')}
          >
            Export All
          </button>
          <button
            className="btn-add-category"
            onClick={() => setShowCreateModal(true)}
          >
            + Add Action
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="categories-stats-grid">
        <StatCard title="Total Actions" value={totalActions} />
        <StatCard title="Enabled" value={enabledActions} />
        <StatCard title="Roles Covered" value={rolesCovered} />
        <StatCard title="Actions Requiring Approval" value={approvalRequiredCount} />
      </section>

      {/* Global Management */}
      <section style={{ margin: '20px 0' }}>
        <h3>Global Management</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setGlobalListType('blacklist');
              setShowGlobalListModal(true);
            }}
          >
            Company Blacklist
          </button>
        </div>
      </section>

      {/* Search/Filter */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by action, role, category, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className="btn-clear" onClick={() => setSearch('')}>
            Clear
          </button>
        </div>
      </div>

      {/* Actions Table */}
      <div className="categories-card">
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Action Name</th>
                <th>Role</th>
                <th>Category</th>
                <th>Action Type</th>
                <th>Inputs Count</th>
                <th>Screenshot Required</th>
                <th>Approval Required</th>
                <th>Status</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((cfg) => (
                <tr key={cfg.id}>
                  <td>{cfg.name}</td>
                  <td>
                    <span className="role-tag">{cfg.role}</span>
                  </td>
                  <td>{cfg.category}</td>
                  <td>{cfg.actionType}</td>
                  <td>{cfg.inputs.length}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        cfg.evidence.requiresScreenshot ? 'enabled' : 'disabled'
                      }`}
                    >
                      {cfg.evidence.requiresScreenshot ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        cfg.approval.requiresApproval ? 'enabled' : 'disabled'
                      }`}
                    >
                      {cfg.approval.requiresApproval ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${cfg.enabled ? 'enabled' : 'disabled'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEnableToggle(cfg.id, !cfg.enabled)}
                    >
                      {cfg.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="txt-right">
                    <button
                      className="btn-icon-act edit"
                      onClick={() => handleEdit(cfg)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-icon-act delete"
                      onClick={() => handleDelete(cfg.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editAction) && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <h2>{editAction ? 'Edit Action' : 'Create Action'}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const newConfig: ActionConfig = {
                  id: editAction ? editAction.id : '',
                  name: fd.get('name') as string,
                  role: fd.get('role') as Role,
                  category: fd.get('category') as string,
                  actionType: fd.get('actionType') as ActionType,
                  enabled: fd.get('enabled') === 'on',
                  inputs: editAction ? editAction.inputs : [],
                  evidence: editAction
                    ? editAction.evidence
                    : {
                        actionId: '',
                        requiresScreenshot: fd.get('requiresScreenshot') === 'on',
                        screenshotType: fd.get('screenshotType') as 'image' | 'pdf',
                        screenshotContext: fd.get('screenshotContext') as string,
                        maxSizeMb: Number(fd.get('maxSizeMb')) || 1,
                      },
                  approval: editAction
                    ? editAction.approval
                    : {
                        actionId: '',
                        requiresApproval: fd.get('requiresApproval') === 'on',
                        approvalRole: fd.get('approvalRole') as Role,
                        approvalCriteria: fd.get('approvalCriteria') as string,
                        rejectionReasonGroupId: '',
                      },
                  guidelines: fd.get('guidelines') as string,
                };
                if (editAction) await handleSaveEdit(newConfig);
                else await handleCreate(newConfig);
              }}
            >
              <div className="form-group">
                <label>Action Name</label>
                <input name="name" defaultValue={editAction?.name || ''} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" defaultValue={editAction?.role || roles[0]}>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
                  defaultValue={editAction?.category || ''}
                  required
                />
              </div>
              <div className="form-group">
                <label>Action Type</label>
                <select
                  name="actionType"
                  defaultValue={editAction?.actionType || actionTypes[0]}
                >
                  {actionTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Enabled</label>
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={editAction ? editAction.enabled : true}
                />
              </div>
              <div className="form-group">
                <label>Guidelines</label>
                <textarea
                  name="guidelines"
                  defaultValue={editAction?.guidelines || ''}
                  rows={2}
                />
              </div>
              {/* Inputs Config */}
              <div className="form-group">
                <label>Inputs (configured in detail below)</label>
                <div>
                  {editAction?.inputs?.map((input, idx) => (
                    <div key={input.id} style={{ marginBottom: 8 }}>
                      <span>
                        {input.label} ({input.type})
                      </span>
                      <span style={{ marginLeft: 8 }}>
                        {input.required ? 'Required' : 'Optional'}
                      </span>
                      <span style={{ marginLeft: 8 }}>Order: {input.order}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => alert('Input schema editing coming soon!')}
                  >
                    Edit Inputs
                  </button>
                </div>
              </div>
              {/* Evidence Config */}
              <div className="form-group">
                <label>Screenshot Required</label>
                <input
                  type="checkbox"
                  name="requiresScreenshot"
                  defaultChecked={editAction?.evidence?.requiresScreenshot || false}
                />
                <select
                  name="screenshotType"
                  defaultValue={editAction?.evidence?.screenshotType || 'image'}
                >
                  <option value="image">Image</option>
                  <option value="pdf">PDF</option>
                </select>
                <input
                  name="screenshotContext"
                  placeholder="Screenshot must show..."
                  defaultValue={editAction?.evidence?.screenshotContext || ''}
                />
                <input
                  type="number"
                  name="maxSizeMb"
                  min={0}
                  defaultValue={editAction?.evidence?.maxSizeMb || 1}
                />
              </div>
              {/* Approval Config */}
              <div className="form-group">
                <label>Approval Required</label>
                <input
                  type="checkbox"
                  name="requiresApproval"
                  defaultChecked={editAction?.approval?.requiresApproval || false}
                />
                <select
                  name="approvalRole"
                  defaultValue={editAction?.approval?.approvalRole || roles[0]}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <input
                  name="approvalCriteria"
                  placeholder="Describe approval criteria..."
                  defaultValue={editAction?.approval?.approvalCriteria || ''}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditAction(null);
                    setShowCreateModal(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit">{editAction ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global List Modal */}
      {showGlobalListModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Company Blacklist</h2>
            <div>
              <ul>
                {globalLists[globalListType].map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <input
                      value={item.name}
                      onChange={(e) =>
                        handleEditGlobalListItem(item.id, e.target.value)
                      }
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => handleDeleteGlobalListItem(item.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <input
                  value={globalListInput}
                  onChange={(e) => setGlobalListInput(e.target.value)}
                  placeholder="Add new item..."
                  style={{ flex: 1 }}
                />
                <button onClick={handleAddGlobalListItem}>Add</button>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowGlobalListModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice System */}
      <section style={{ margin: '30px 0' }}>
        <h3>Notice System</h3>
        <button onClick={() => setNoticeModalOpen(true)}>Configure Notice</button>
        {noticeModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Send Notice</h2>
              <div className="form-group">
                <label>Recipient Role</label>
                <select
                  value={noticeForm.recipientRole || ''}
                  onChange={(e) =>
                    setNoticeForm((f) => ({
                      ...f,
                      recipientRole: e.target.value as Role,
                    }))
                  }
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  value={noticeForm.category || ''}
                  onChange={(e) =>
                    setNoticeForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="Category"
                />
              </div>
              <div className="form-group">
                <label>Specific User (optional)</label>
                <input
                  value={noticeForm.userId || ''}
                  onChange={(e) =>
                    setNoticeForm((f) => ({ ...f, userId: e.target.value }))
                  }
                  placeholder="Enter user email or ID"
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows={3}
                  value={noticeForm.message || ''}
                  onChange={(e) =>
                    setNoticeForm((f) => ({ ...f, message: e.target.value }))
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setNoticeModalOpen(false)}>
                  Close
                </button>
                <button type="button" onClick={handleAddNotice}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <h4>Sent Notices</h4>
          <ul>
            {notices.map((n) => (
              <li key={n.id}>
                <b>{n.recipientRole}</b> | {n.category} |{' '}
                {n.userId ? n.userId : 'All'}
                <br />
                <span>{n.message}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: '#999',
                    marginLeft: 8,
                  }}
                >
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ActionConfigPage;