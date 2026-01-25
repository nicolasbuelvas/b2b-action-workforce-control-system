import React, { useEffect, useState } from 'react';
import './pricingPage.css';
import StatCard from '../../components/cards/StatCard';

// --- Types ---
type Role =
  | 'Website Researcher'
  | 'LinkedIn Researcher'
  | 'Website Inquirer'
  | 'LinkedIn Inquirer'
  | 'Website Inquirer Auditor'
  | 'LinkedIn Inquirer Auditor'
  | 'Website Research Auditor'
  | 'LinkedIn Research Auditor';

type Status = 'active' | 'inactive';

interface PricingRule {
  id: string;
  actionType: string;
  role: Role;
  category: string;
  unitPrice: number;
  bonus: number;
  status: Status;
  effectiveDate: string;
}

interface WorkerBonus {
  id: string;
  workerId: string;
  role: Role;
  bonus: number;
  expiresAt?: string;
}

interface TopBonusRule {
  id: string;
  role: Role;
  rank: number;
  bonus: number;
}

interface WorkerPaymentOverview {
  workerId: string;
  name: string;
  role: Role;
  category: string;
  totalEarned: number;
  totalPaid: number;
  pending: number;
}

interface PaymentRecord {
  id: string;
  workerId: string;
  role: Role;
  category: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  paymentDate?: string;
  notes?: string;
}

interface TopWorker {
  workerId: string;
  name: string;
  role: Role;
  approvedActions: number;
  approvalRate: number;
  rank: number;
}

// --- API pattern: Use fetch directly, matching real endpoints ---
const API_BASE = '/api/pricing';

async function fetchPricingRules(): Promise<PricingRule[]> {
  try {
    const res = await fetch(`${API_BASE}/rules`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchWorkerBonuses(): Promise<WorkerBonus[]> {
  try {
    const res = await fetch(`${API_BASE}/worker-bonuses`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchTopBonusRules(): Promise<TopBonusRule[]> {
  try {
    const res = await fetch(`${API_BASE}/top-bonus-rules`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchPaymentOverview(): Promise<WorkerPaymentOverview[]> {
  try {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchPaymentRecords(): Promise<PaymentRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/records`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchTopWorkers(role: Role): Promise<TopWorker[]> {
  try {
    const res = await fetch(`${API_BASE}/top-workers?role=${encodeURIComponent(role)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// --- Main Component ---
const roles: Role[] = [
  'Website Researcher',
  'LinkedIn Researcher',
  'Website Inquirer',
  'LinkedIn Inquirer',
  'Website Inquirer Auditor',
  'LinkedIn Inquirer Auditor',
  'Website Research Auditor',
  'LinkedIn Research Auditor',
];

const PricingPage: React.FC = () => {
  // --- State ---
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [workerBonuses, setWorkerBonuses] = useState<WorkerBonus[]>([]);
  const [topBonusRules, setTopBonusRules] = useState<TopBonusRule[]>([]);
  const [paymentOverview, setPaymentOverview] = useState<WorkerPaymentOverview[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [topWorkers, setTopWorkers] = useState<Record<Role, TopWorker[]>>({
    'Website Researcher': [],
    'LinkedIn Researcher': [],
    'Website Inquirer': [],
    'LinkedIn Inquirer': [],
    'Website Inquirer Auditor': [],
    'LinkedIn Inquirer Auditor': [],
    'Website Research Auditor': [],
    'LinkedIn Research Auditor': [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWorker, setFilterWorker] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [editRule, setEditRule] = useState<PricingRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPricingRules(),
      fetchWorkerBonuses(),
      fetchTopBonusRules(),
      fetchPaymentOverview(),
      fetchPaymentRecords(),
      ...roles.map(role => fetchTopWorkers(role)),
    ]).then(
      ([rules, bonuses, topBonuses, overview, records, ...topWorkersArr]) => {
        setPricingRules(rules);
        setWorkerBonuses(bonuses);
        setTopBonusRules(topBonuses);
        setPaymentOverview(overview);
        setPaymentRecords(records);
        const topWorkersObj: Record<Role, TopWorker[]> = {
          'Website Researcher': [],
          'LinkedIn Researcher': [],
          'Website Inquirer': [],
          'LinkedIn Inquirer': [],
          'Website Inquirer Auditor': [],
          'LinkedIn Inquirer Auditor': [],
          'Website Research Auditor': [],
          'LinkedIn Research Auditor': [],
        };
        roles.forEach((role, idx) => {
          topWorkersObj[role] = topWorkersArr[idx];
        });
        setTopWorkers(topWorkersObj);
        setLoading(false);
      }
    );
  }, []);

  // --- Filtering ---
  const filteredPricingRules = pricingRules.filter(rule => {
    if (filterRole && rule.role !== filterRole) return false;
    if (filterCategory && rule.category !== filterCategory) return false;
    if (filterStatus && rule.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !rule.actionType.toLowerCase().includes(q) &&
        !rule.role.toLowerCase().includes(q) &&
        !rule.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const filteredPayments = paymentOverview.filter(p => {
    if (filterRole && p.role !== filterRole) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterWorker && !p.name.toLowerCase().includes(filterWorker.toLowerCase())) return false;
    return true;
  });

  // --- Stats ---
  const totalPending = paymentOverview.reduce((acc, p) => acc + p.pending, 0);
  const totalPaid = paymentOverview.reduce((acc, p) => acc + p.totalPaid, 0);
  const outstanding = paymentOverview.reduce((acc, p) => acc + p.totalEarned - p.totalPaid, 0);

  // --- Handlers ---
  const handleEdit = (rule: PricingRule) => setEditRule(rule);
  const handleDelete = async (id: string) => {
    // TODO: Implement API call to delete pricing rule
    setPricingRules(prev => prev.filter(r => r.id !== id));
  };
  const handleEnableToggle = async (id: string, status: Status) => {
    // TODO: Implement API call to enable/disable pricing rule
    setPricingRules(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );
  };
  const handleSaveEdit = async (updated: PricingRule) => {
    // TODO: Implement API call to update pricing rule
    setPricingRules(prev =>
      prev.map(r => (r.id === updated.id ? updated : r))
    );
    setEditRule(null);
  };
  const handleCreate = async (newRule: PricingRule) => {
    // TODO: Implement API call to create pricing rule
    setPricingRules(prev => [...prev, newRule]);
    setShowCreateModal(false);
  };

  // --- Render ---
  if (loading)
    return <div className="page-loader">Loading Pricing & Payments...</div>;

  return (
    <div className="categories-container">
      {/* Header */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Pricing & Payment Configuration</h1>
          <p>
            Manage action-based pricing, bonuses, and payment lifecycle for all roles and categories.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => alert('Export coming soon!')}>Export Payments</button>
          <button className="btn-add-category" onClick={() => setShowCreateModal(true)}>
            + Add Pricing Rule
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="categories-stats-grid">
        <StatCard title="Total Pending Payments" value={totalPending.toFixed(2)} />
        <StatCard title="Total Paid" value={totalPaid.toFixed(2)} />
        <StatCard title="Outstanding Balance" value={outstanding.toFixed(2)} />
      </section>

      {/* Filters */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by action, role, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value as Role | '')}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input
            type="text"
            placeholder="Category"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          />
          <input
            type="text"
            placeholder="Worker"
            value={filterWorker}
            onChange={e => setFilterWorker(e.target.value)}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | '')}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn-clear" onClick={() => {
            setSearch('');
            setFilterRole('');
            setFilterCategory('');
            setFilterWorker('');
            setFilterStatus('');
          }}>Clear</button>
        </div>
      </div>

      {/* Pricing Rules Table */}
      <div className="categories-card">
        <h3>Pricing Rules</h3>
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Role</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Bonus</th>
                <th>Status</th>
                <th>Effective Date</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPricingRules.map(rule => (
                <tr key={rule.id}>
                  <td>{rule.actionType}</td>
                  <td><span className="category-tag">{rule.role}</span></td>
                  <td>{rule.category}</td>
                  <td>
                    <span className="price-badge">${rule.unitPrice.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="bonus-badge">+${rule.bonus.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${rule.status}`}>
                      {rule.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{rule.effectiveDate ? new Date(rule.effectiveDate).toLocaleDateString() : '-'}</td>
                  <td className="txt-right">
                    <button className="btn-icon-act edit" onClick={() => handleEdit(rule)}>Edit</button>
                    <button className="btn-icon-act delete" onClick={() => handleDelete(rule.id)}>Delete</button>
                    <button
                      className="btn-icon-act"
                      onClick={() => handleEnableToggle(rule.id, rule.status === 'active' ? 'inactive' : 'active')}
                    >
                      {rule.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bonus Management */}
      <div className="categories-card">
        <h3>Bonus Management</h3>
        <div>
          <h4>Worker-Specific Bonuses</h4>
          <table className="categories-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                <th>Bonus</th>
                <th>Expires At</th>
              </tr>
            </thead>
            <tbody>
              {workerBonuses.map(b => (
                <tr key={b.id}>
                  <td>{b.workerId}</td>
                  <td>{b.role}</td>
                  <td><span className="bonus-badge">+${b.bonus.toFixed(2)}</span></td>
                  <td>{b.expiresAt ? new Date(b.expiresAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 24 }}>
          <h4>Top-3 Bonus per Role</h4>
          {roles.map(role => (
            <div key={role} style={{ marginBottom: 16 }}>
              <h5>{role} Top 3</h5>
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Worker</th>
                    <th>Approved Actions</th>
                    <th>Approval Rate</th>
                    <th>Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {(topWorkers[role] || []).map(w => (
                    <tr key={w.workerId}>
                      <td>{w.rank}</td>
                      <td>{w.name}</td>
                      <td>{w.approvedActions}</td>
                      <td>{(w.approvalRate * 100).toFixed(1)}%</td>
                      <td>
                        <span className="bonus-badge">
                          +${(topBonusRules.find(b => b.role === role && b.rank === w.rank)?.bonus ?? 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Overview */}
      <div className="categories-card">
        <h3>Payment Overview</h3>
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                <th>Category</th>
                <th>Total Earned</th>
                <th>Total Paid</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p.workerId + p.role + p.category}>
                  <td>{p.name}</td>
                  <td>{p.role}</td>
                  <td>{p.category}</td>
                  <td>${p.totalEarned.toFixed(2)}</td>
                  <td>${p.totalPaid.toFixed(2)}</td>
                  <td>${p.pending.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Records */}
      <div className="categories-card">
        <h3>Payment History</h3>
        <div className="table-responsive">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                <th>Category</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {paymentRecords.map(r => (
                <tr key={r.id}>
                  <td>{r.workerId}</td>
                  <td>{r.role}</td>
                  <td>{r.category}</td>
                  <td>
                    {new Date(r.periodStart).toLocaleDateString()} - {new Date(r.periodEnd).toLocaleDateString()}
                  </td>
                  <td>${r.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${r.status === 'paid' ? 'active' : 'inactive'}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td>{r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '-'}</td>
                  <td>{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editRule) && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <h2>{editRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const newRule: PricingRule = {
                  id: editRule ? editRule.id : Date.now().toString(),
                  actionType: fd.get('actionType') as string,
                  role: fd.get('role') as Role,
                  category: fd.get('category') as string,
                  unitPrice: Number(fd.get('unitPrice')),
                  bonus: Number(fd.get('bonus')),
                  status: fd.get('status') as Status,
                  effectiveDate: fd.get('effectiveDate') as string,
                };
                if (editRule) handleSaveEdit(newRule);
                else handleCreate(newRule);
              }}
            >
              <div className="form-group">
                <label>Action Type</label>
                <input name="actionType" defaultValue={editRule?.actionType || ''} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" defaultValue={editRule?.role || roles[0]}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input name="category" defaultValue={editRule?.category || ''} required />
              </div>
              <div className="form-group">
                <label>Unit Price (USD)</label>
                <input type="number" name="unitPrice" min={0} step={0.01} defaultValue={editRule?.unitPrice || 0} required />
              </div>
              <div className="form-group">
                <label>Bonus (USD)</label>
                <input type="number" name="bonus" min={0} step={0.01} defaultValue={editRule?.bonus || 0} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue={editRule?.status || 'active'}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Effective Date</label>
                <input type="date" name="effectiveDate" defaultValue={editRule?.effectiveDate ? editRule.effectiveDate.slice(0,10) : ''} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => { setEditRule(null); setShowCreateModal(false); }}>Cancel</button>
                <button type="submit">{editRule ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;