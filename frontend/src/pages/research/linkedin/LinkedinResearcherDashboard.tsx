import React from 'react';
import './LinkedinInquirerDashboard.tsx.css'; 

const INCOME_HISTORY = [
  { day: 'Mon', amount: 45.00 },
  { day: 'Tue', amount: 32.50 },
  { day: 'Wed', amount: 67.80 },
  { day: 'Thu', amount: 12.00 },
  { day: 'Fri', amount: 55.20 }
];

export default function LinkedinInquirerDashboard() {
  return (
    <div className="inq-dash-container">
      <div className="inq-welcome">
        <div>
          <h1>Welcome, Researcher 402</h1>
          <p>Your quality score is 98% this week. Keep it up!</p>
        </div>
        <div className="wallet-card">
          <label>Pending Balance</label>
          <h3>$245.50</h3>
          <button className="btn-withdraw">Request Payout</button>
        </div>
      </div>

      <div className="inq-stats-grid">
        <div className="i-stat-card">
          <span className="i-icon">📋</span>
          <div className="i-data">
            <span className="i-val">12</span>
            <span className="i-lab">Tasks Pending Action</span>
          </div>
        </div>
        <div className="i-stat-card">
          <span className="i-icon">⏳</span>
          <div className="i-data">
            <span className="i-val">8</span>
            <span className="i-lab">Waiting for Auditor</span>
          </div>
        </div>
        <div className="i-stat-card">
          <span className="i-icon">🚫</span>
          <div className="i-data">
            <span className="i-val">1</span>
            <span className="i-lab">Rejections to Fix</span>
          </div>
        </div>
      </div>

      <div className="inq-content-row">
        <section className="earnings-chart-card">
          <h3>Income Visualization (Last 5 Days)</h3>
          <div className="chart-mockup">
            {INCOME_HISTORY.map(item => (
              <div key={item.day} className="chart-bar-wrap">
                <div className="bar" style={{ height: `${item.amount * 2}px` }}>
                  <span className="bar-tooltip">${item.amount}</span>
                </div>
                <span className="bar-label">{item.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="notifications-card">
          <h3>Recent Notifications</h3>
          <div className="notif-list">
            <div className="notif-item approved">
              <div className="n-icon">✔</div>
              <div className="n-text">
                <p>Task <strong>SUB-882</strong> approved by Auditor.</p>
                <span>10 mins ago • +$1.50</span>
              </div>
            </div>
            <div className="notif-item rejected">
              <div className="n-icon">✖</div>
              <div className="n-text">
                <p>Task <strong>SUB-710</strong> rejected: Blurry Image.</p>
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}