import React from 'react';
import './WebsiteResearcherDashboard.css';

export default function WebsiteResearcherDashboard() {
  return (
    <div className="wb-res-dash">
      <header className="res-header">
        <div className="header-text">
          <h1>Researcher Workspace</h1>
          <p>Find new high-value corporate targets and extract technical insights.</p>
        </div>
        <div className="res-quota-card">
          <div className="quota-top">
            <span>Daily Quota</span>
            <strong>42 / 50</strong>
          </div>
          <div className="quota-progress-container">
            <div className="quota-fill" style={{ width: '84%' }}></div>
          </div>
          <p className="quota-hint">8 more domains to reach your daily bonus.</p>
        </div>
      </header>

      <div className="res-content-grid">
        <section className="discovery-stats">
          <div className="res-card-small">
            <h4>Total Leads</h4>
            <span className="val">1,829</span>
          </div>
          <div className="res-card-small">
            <h4>Validation Rate</h4>
            <span className="val text-green">99.2%</span>
          </div>
          <div className="res-card-small">
            <h4>Earnings (Jan)</h4>
            <span className="val">$2,450.00</span>
          </div>
        </section>

        <section className="target-map">
          <div className="map-header">
            <h3>Targets by Industry</h3>
            <button className="btn-text">View Full Map</button>
          </div>
          <div className="industry-bubbles">
            <div className="bubble x-large">SaaS</div>
            <div className="bubble large">Fintech</div>
            <div className="bubble medium">Health</div>
            <div className="bubble small">AI</div>
          </div>
        </section>

        <section className="current-goals">
          <h3>Campaign Objectives</h3>
          <div className="goal-item">
            <div className="goal-info">
              <strong>Fortune 500 Sweep</strong>
              <p>Identify CTO contact for 50 specific firms.</p>
            </div>
            <span className="goal-status">60%</span>
          </div>
          <div className="goal-item">
            <div className="goal-info">
              <strong>Tech Stack Audit</strong>
              <p>Map AWS vs Azure usage in Fintech sector.</p>
            </div>
            <span className="goal-status locked">🔒</span>
          </div>
        </section>
      </div>
    </div>
  );
}