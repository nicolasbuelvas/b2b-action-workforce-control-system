import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PaymentSummaryCard.css';

interface PaymentSummary {
  pending: { count: number; total: number };
  inProcess: { count: number; total: number };
  completed: { count: number; total: number };
  totalEarnings: number;
}

interface PaymentSummaryCardProps {
  userId?: string;
  compact?: boolean;
}

/**
 * Reusable payment summary card for all worker pages
 * Shows: Pending, In-Process, Completed payments
 * Workers NEVER see individual action prices
 */
export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  userId,
  compact = false,
}) => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentSummary();
  }, [userId]);

  const loadPaymentSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/payments/summary/${userId || 'current'}`,
      );
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`payment-card ${compact ? 'compact' : ''}`}>
        <div className="loading">Loading earnings...</div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  if (compact) {
    return (
      <div className="payment-card compact">
        <div className="payment-grid">
          <div className="payment-item">
            <div className="label">Pending</div>
            <div className="value">${summary.pending.total.toFixed(2)}</div>
          </div>
          <div className="payment-item">
            <div className="label">In-Process</div>
            <div className="value">${summary.inProcess.total.toFixed(2)}</div>
          </div>
          <div className="payment-item">
            <div className="label">Completed</div>
            <div className="value">${summary.completed.total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-card">
      <h3 className="card-title">💰 Earnings Summary</h3>

      <div className="payment-grid">
        {/* Pending */}
        <div className="payment-section pending">
          <div className="section-header">
            <div className="icon">⏳</div>
            <div className="section-title">Pending Payment</div>
          </div>
          <div className="amount">${summary.pending.total.toFixed(2)}</div>
          <div className="count">{summary.pending.count} action(s)</div>
          <div className="status-text">Awaiting auditor approval</div>
        </div>

        {/* In-Process */}
        <div className="payment-section in-process">
          <div className="section-header">
            <div className="icon">⚙️</div>
            <div className="section-title">In-Process Payment</div>
          </div>
          <div className="amount">${summary.inProcess.total.toFixed(2)}</div>
          <div className="count">{summary.inProcess.count} action(s)</div>
          <div className="status-text">Approved, awaiting processing</div>
        </div>

        {/* Completed */}
        <div className="payment-section completed">
          <div className="section-header">
            <div className="icon">✅</div>
            <div className="section-title">Completed Payment</div>
          </div>
          <div className="amount">${summary.completed.total.toFixed(2)}</div>
          <div className="count">{summary.completed.count} action(s)</div>
          <div className="status-text">Payment received</div>
        </div>
      </div>

      {/* Total */}
      <div className="total-section">
        <div className="total-label">Total Lifetime Earnings</div>
        <div className="total-amount">${summary.totalEarnings.toFixed(2)}</div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        💡 Prices shown are aggregated totals. Individual action rates are determined by the super admin.
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
