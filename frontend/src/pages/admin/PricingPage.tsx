import { useState } from 'react';
import StatCard from '../../components/cards/StatCard';
import './pricingPage.css';

type PricingStatus = 'Active' | 'Inactive';

interface PricingRule {
  id: string;
  itemName: string;
  category: string;
  unitPrice: number;
  bonus: number;
  currency: 'USD';
  status: PricingStatus;
}

export default function PricingPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [pricingRules] = useState<PricingRule[]>([
    {
      id: 'PRICE-001',
      itemName: 'Website Submission',
      category: 'Product A',
      unitPrice: 0.25,
      bonus: 0.05,
      currency: 'USD',
      status: 'Active',
    },
    {
      id: 'PRICE-002',
      itemName: 'LinkedIn Profile',
      category: 'Product B',
      unitPrice: 0.40,
      bonus: 0.1,
      currency: 'USD',
      status: 'Active',
    },
    {
      id: 'PRICE-003',
      itemName: 'Manual Review',
      category: 'Product C',
      unitPrice: 1.0,
      bonus: 0,
      currency: 'USD',
      status: 'Inactive',
    },
  ]);

  const activePricing = pricingRules.filter(p => p.status === 'Active').length;
  const avgPrice =
    pricingRules.reduce((acc, p) => acc + p.unitPrice, 0) / pricingRules.length;

  return (
    <div className="categories-container">
      {/* WIP */}
      <div className="wip-banner">
        <span>SYSTEM MODULE: WORK IN PROGRESS (W.I.P)</span>
      </div>

      {/* HEADER */}
      <header className="categories-header">
        <div className="header-left">
          <h1>Pricing & Payments</h1>
          <p>Define unit prices, bonuses and payout rules.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export Pricing</button>
          <button className="btn-add-category">+ Add Pricing Rule</button>
        </div>
      </header>

      {/* STATS */}
      <section className="categories-stats-grid">
        <StatCard title="Pricing Rules" value={pricingRules.length} />
        <StatCard title="Active Rules" value={activePricing} />
        <StatCard title="Avg Unit Price ($)" value={avgPrice.toFixed(2)} />
        <StatCard title="Bonuses Defined" value={pricingRules.filter(p => p.bonus > 0).length} />
      </section>

      {/* MANAGEMENT BAR */}
      <div className="management-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by item, category or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select><option>Category: All</option></select>
          <select><option>Status: All</option></select>
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
                <th>Item</th>
                <th>Category</th>
                <th className="txt-center">Unit Price</th>
                <th className="txt-center">Bonus</th>
                <th>Status</th>
                <th className="txt-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricingRules.map(rule => (
                <tr key={rule.id} className="cat-row">
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="cat-info-cell">
                      <span className="cat-id">{rule.id}</span>
                      <strong className="cat-name">{rule.itemName}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{rule.category}</span>
                  </td>
                  <td className="txt-center">
                    <span className="price-badge">${rule.unitPrice.toFixed(2)}</span>
                  </td>
                  <td className="txt-center">
                    <span className="bonus-badge">
                      {rule.bonus > 0 ? `+$${rule.bonus.toFixed(2)}` : '—'}
                    </span>
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