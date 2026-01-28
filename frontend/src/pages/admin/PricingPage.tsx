import React, { useEffect, useState } from 'react';
import './pricingPage.css';
import StatCard from '../../components/cards/StatCard';
import axios from '../../api/axios';

// --- Types ---
interface ActionPrice {
  id: string;
  roleId: string;
  actionType: string;
  amount: number;
  bonusMultiplier: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentRecord {
  id: string;
  userId: string;
  role: string;
  actionId: string;
  actionType: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  category?: string;
  createdAt?: string;
}

interface PaymentStats {
  byStatus: Record<string, number>;
  byRole: Record<string, { count: number; total: number }>;
  totalAmount: number;
}

// --- API pattern: Use fetch directly, matching real endpoints ---
const ROLES = [
  'website_researcher',
  'linkedin_researcher',
  'website_inquirer',
  'linkedin_inquirer',
  'research_auditor',
  'inquiry_auditor',
  'linkedin_inquiry_auditor',
  'linkedin_research_auditor',
];

const ACTION_TYPES = {
  website_researcher: ['submit'],
  linkedin_researcher: ['submit'],
  website_inquirer: ['submit'],
  linkedin_inquirer: ['submit'],
  research_auditor: ['approve'],
  inquiry_auditor: ['approve'],
  linkedin_inquiry_auditor: ['approve'],
  linkedin_research_auditor: ['approve'],
};

const PricingPage: React.FC = () => {
  // --- State ---
  const [prices, setPrices] = useState<ActionPrice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pricing' | 'payments'>('pricing');

  // Filter/Search
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ActionPrice | null>(null);
  const [formRole, setFormRole] = useState('');
  const [formActionType, setFormActionType] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formBonus, setFormBonus] = useState('1.0');
  const [formDescription, setFormDescription] = useState('');

  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());

  // --- Load Data ---
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pricesRes, paymentsRes, statsRes] = await Promise.all([
        axios.get('/api/payments/prices'),
        axios.get('/api/payments/all?limit=1000'),
        axios.get('/api/payments/stats'),
      ]);

      setPrices(pricesRes.data);
      setPayments(paymentsRes.data?.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Price Management ---

  const handleCreatePrice = () => {
    setEditingPrice(null);
    setFormRole('');
    setFormActionType('');
    setFormAmount('');
    setFormBonus('1.0');
    setFormDescription('');
    setShowPriceModal(true);
  };

  const handleEditPrice = (price: ActionPrice) => {
    setEditingPrice(price);
    setFormRole(price.roleId);
    setFormActionType(price.actionType);
    setFormAmount(price.amount.toString());
    setFormBonus(price.bonusMultiplier.toString());
    setFormDescription(price.description || '');
    setShowPriceModal(true);
  };

  const handleSavePrice = async () => {
    try {
      setSaving(true);

      if (!formRole || !formActionType || !formAmount) {
        alert('Please fill in all required fields');
        return;
      }

      const data = {
        roleId: formRole,
        actionType: formActionType,
        amount: parseFloat(formAmount),
        bonusMultiplier: parseFloat(formBonus),
        description: formDescription,
      };

      if (editingPrice) {
        await axios.patch(`/api/payments/prices/${editingPrice.id}`, {
          amount: data.amount,
          bonusMultiplier: data.bonusMultiplier,
          description: data.description,
        });
      } else {
        await axios.post('/api/payments/prices', data);
      }

      setShowPriceModal(false);
      loadAllData();
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Failed to save pricing rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrice = async (id: string) => {
    if (!window.confirm('Delete this pricing rule?')) return;

    try {
      await axios.delete(`/api/payments/prices/${id}`);
      loadAllData();
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('Failed to delete pricing rule');
    }
  };

  // --- Payment Management ---

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await axios.patch(`/api/payments/approve/${paymentId}`);
      loadAllData();
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const handleProcessPayments = async () => {
    if (selectedPayments.size === 0) {
      alert('Select payments to process');
      return;
    }

    try {
      await axios.patch('/api/payments/process', {
        paymentIds: Array.from(selectedPayments),
      });
      setSelectedPayments(new Set());
      loadAllData();
    } catch (error) {
      console.error('Error processing payments:', error);
      alert('Failed to process payments');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!window.confirm('Reject this payment?')) return;

    try {
      await axios.patch(`/api/payments/reject/${paymentId}`);
      loadAllData();
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  // --- Filtering ---

  const filteredPrices = prices.filter(p => {
    if (filterRole && p.roleId !== filterRole) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!p.actionType.includes(q) && !p.roleId.includes(q)) return false;
    }
    return true;
  });

  const filteredPayments = payments.filter(p => {
    if (filterRole && p.role !== filterRole) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  // --- Render ---

  if (loading) {
    return <div className="page-loader">Loading Pricing & Payments...</div>;
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFC107',
      approved: '#2196F3',
      paid: '#4CAF50',
      rejected: '#F44336',
    };
    return <span style={{ color: colors[status] || '#999', fontWeight: 'bold' }}>● {status}</span>;
  };
  return (
    <div className="pricing-container">
      {/* Header */}
      <header className="pricing-header">
        <div className="header-left">
          <h1>💰 Pricing & Payment Management</h1>
          <p>Configure action pricing for all roles and manage payment lifecycle</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreatePrice}>
            + Add Pricing Rule
          </button>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <section className="pricing-stats">
          <StatCard
            title="Pending Payments"
            value={`${stats.byStatus.pending || 0}`}
            subtitle={`Amount: $${Object.values(payments)
              .filter(p => p.status === 'pending')
              .reduce((sum, p) => sum + p.amount, 0)
              .toFixed(2)}`}
          />
          <StatCard
            title="Approved (In-Process)"
            value={`${stats.byStatus.approved || 0}`}
            subtitle={`Amount: $${Object.values(payments)
              .filter(p => p.status === 'approved')
              .reduce((sum, p) => sum + p.amount, 0)
              .toFixed(2)}`}
          />
          <StatCard
            title="Paid (Completed)"
            value={`${stats.byStatus.paid || 0}`}
            subtitle={`Amount: $${Object.values(payments)
              .filter(p => p.status === 'paid')
              .reduce((sum, p) => sum + p.amount, 0)
              .toFixed(2)}`}
          />
          <StatCard
            title="Total Amount"
            value={`$${stats.totalAmount?.toFixed(2) || '0.00'}`}
            subtitle={`Across all roles`}
          />
        </section>
      )}

      {/* Tabs */}
      <div className="pricing-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing Rules
          </button>
          <button 
            className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payment Records
          </button>
        </div>

        {/* Pricing Rules Tab */}
        {activeTab === 'pricing' && (
          <div className="tab-content">
            {/* Filters */}
            <div className="pricing-filters">
              <input
                type="text"
                placeholder="Search actions or roles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Table */}
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Action Type</th>
                  <th>Unit Price</th>
                  <th>Bonus Multiplier</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      No pricing rules found
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map(price => (
                    <tr key={price.id}>
                      <td>
                        <strong>{price.roleId}</strong>
                      </td>
                      <td>{price.actionType}</td>
                      <td>${price.amount.toFixed(2)}</td>
                      <td>{price.bonusMultiplier.toFixed(2)}x</td>
                      <td>{price.description || '-'}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditPrice(price)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeletePrice(price.id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Records Tab */}
        {activeTab === 'payments' && (
          <div className="tab-content">
            <div className="pricing-filters">
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
              {selectedPayments.size > 0 && (
                <button className="btn-primary" onClick={handleProcessPayments}>
                  Mark {selectedPayments.size} as Paid
                </button>
              )}
            </div>

            {/* Payments Table */}
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={e => {
                        if (e.target.checked) {
                          const newSet = new Set(
                            filteredPayments.map(p => p.id)
                          );
                          setSelectedPayments(newSet);
                        } else {
                          setSelectedPayments(new Set());
                        }
                      }}
                      checked={selectedPayments.size === filteredPayments.length && filteredPayments.length > 0}
                    />
                  </th>
                  <th>User ID</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => (
                    <tr key={payment.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPayments.has(payment.id)}
                          onChange={e => {
                            const newSet = new Set(selectedPayments);
                            if (e.target.checked) {
                              newSet.add(payment.id);
                            } else {
                              newSet.delete(payment.id);
                            }
                            setSelectedPayments(newSet);
                          }}
                        />
                      </td>
                      <td>{payment.userId.substring(0, 8)}...</td>
                      <td>{payment.role}</td>
                      <td>{payment.actionType}</td>
                      <td>${payment.amount.toFixed(2)}</td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>{new Date(payment.createdAt || '').toLocaleDateString()}</td>
                      <td className="actions-cell">
                        {payment.status === 'pending' && (
                          <button
                            className="btn-approve"
                            onClick={() => handleApprovePayment(payment.id)}
                          >
                            Approve
                          </button>
                        )}
                        {payment.status !== 'paid' && payment.status !== 'rejected' && (
                          <button
                            className="btn-reject"
                            onClick={() => handleRejectPayment(payment.id)}
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Modal */}
      {showPriceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPrice ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</h2>
              <button
                className="modal-close"
                onClick={() => setShowPriceModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formRole}
                  onChange={e => {
                    setFormRole(e.target.value);
                    setFormActionType('');
                  }}
                  disabled={!!editingPrice}
                >
                  <option value="">Select Role</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Action Type *</label>
                <select
                  value={formActionType}
                  onChange={e => setFormActionType(e.target.value)}
                  disabled={!formRole || !!editingPrice}
                >
                  <option value="">Select Action</option>
                  {formRole && (ACTION_TYPES[formRole] || [])?.map((action: string) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value)}
                  placeholder="e.g., 10.50"
                />
              </div>

              <div className="form-group">
                <label>Bonus Multiplier (for top 3)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formBonus}
                  onChange={e => setFormBonus(e.target.value)}
                  placeholder="e.g., 1.5"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="e.g., Standard research submission"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowPriceModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSavePrice}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;