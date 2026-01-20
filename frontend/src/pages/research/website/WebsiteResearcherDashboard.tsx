import React from 'react';
import './WebsiteResearcherDashboard.css';

export default function WebsiteResearcherDashboard() {
  /**
   * IMPORTANT:
   * All values in this dashboard must be injected by backend/state management.
   * No mock data, no temporary numbers, no fake progress.
   */

  return (
    <div className="wb-res-dash">
      {/* HEADER */}
      <header className="res-header">
        <div className="header-text">
          <h1>Researcher Workspace</h1>
          <p>Discover new corporate targets and analyze technology footprints.</p>
        </div>

        <div className="res-quota-card">
          <div className="quota-top">
            <span>Daily Quota</span>
            <strong>—</strong>
          </div>

          <div className="quota-progress-container">
            <div className="quota-fill" />
          </div>

          <p className="quota-hint">
            Quota progress will appear once tasks are assigned.
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="res-content-grid">
        {/* STATS */}
        <section className="discovery-stats">
          <div className="res-card-small">
            <h4>Total Leads</h4>
            <span className="val">—</span>
          </div>

          <div className="res-card-small">
            <h4>Validation Rate</h4>
            <span className="val">—</span>
          </div>

          <div className="res-card-small">
            <h4>Earnings</h4>
            <span className="val">—</span>
          </div>
        </section>

        {/* TARGET MAP */}
        <section className="target-map">
          <div className="map-header">
            <h3>Targets by Industry</h3>
            <button className="btn-text">View Details</button>
          </div>

          <div className="industry-bubbles">
            <div className="bubble x-large">—</div>
            <div className="bubble large">—</div>
            <div className="bubble medium">—</div>
            <div className="bubble small">—</div>
          </div>
        </section>

        {/* GOALS */}
        <section className="current-goals">
          <h3>Campaign Objectives</h3>

          <div className="goal-item">
            <div className="goal-info">
              <strong>—</strong>
              <p>Objective details will load here.</p>
            </div>
            <span className="goal-status">—</span>
          </div>

          <div className="goal-item">
            <div className="goal-info">
              <strong>—</strong>
              <p>Locked or upcoming campaign.</p>
            </div>
            <span className="goal-status locked">🔒</span>
          </div>
        </section>
      </div>
    </div>
  );
}