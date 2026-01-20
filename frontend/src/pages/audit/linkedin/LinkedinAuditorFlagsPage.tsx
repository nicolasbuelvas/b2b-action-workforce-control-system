import React, { useState } from 'react';
import './LinkedinAuditorFlagsPage.css';

type Severity = 'High' | 'Medium' | 'Low';

export default function LinkedinAuditorFlagsPage() {
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);

  return (
    <div className="flags-page-container">
      {/* HEADER */}
      <header className="flags-header">
        <div className="title-area">
          <h1>System Integrity Flags</h1>
          <p>Automated detection of potential fraud and rule violations.</p>
        </div>

        <div className="risk-level-stats">
          <div className="risk-box high">0 Critical</div>
          <div className="risk-box medium">0 Warning</div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="flags-grid">
        {/* FLAGS LIST */}
        <aside className="flags-list">
          <div className="flags-empty">
            <strong>No flags detected</strong>
            <p>
              When the system detects suspicious activity, flags will appear
              here for investigation.
            </p>
          </div>
        </aside>

        {/* DETAILS VIEWER */}
        <main className="flag-details-viewer">
          <div className="viewer-card empty">
            <div className="viewer-empty-state">
              <strong>No flag selected</strong>
              <p>
                Select a flag from the list to review evidence, metadata and
                take action.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
