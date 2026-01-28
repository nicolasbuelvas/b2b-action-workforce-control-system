import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import './SessionTimeoutNotification.css';

export default function SessionTimeoutNotification() {
  const { showSessionExpiredMessage, setShowSessionExpiredMessage } = useAuthContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showSessionExpiredMessage) {
      setVisible(true);
    }
  }, [showSessionExpiredMessage]);

  const handleClose = () => {
    setVisible(false);
    setShowSessionExpiredMessage(false);
  };

  if (!visible) return null;

  return (
    <div className="session-timeout-notification">
      <div className="session-timeout-content">
        <button 
          className="session-timeout-close" 
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
        <div className="session-timeout-icon">⏱️</div>
        <div className="session-timeout-text">
          <strong>Session Expired</strong>
          <p>Your session has ended. Please login again to continue working.</p>
        </div>
      </div>
    </div>
  );
}
