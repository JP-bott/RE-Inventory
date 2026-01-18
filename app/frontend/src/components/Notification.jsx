import React from 'react';

function Notification({ error, success, onClose }) {
  if (!error && !success) return null;

  return (
    <div className="notification-container">
      {error && (
        <div className="notification notification-error">
          <span>{error}</span>
          <button onClick={onClose} aria-label="Close error message">
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="notification notification-success">
          <span>{success}</span>
          <button onClick={onClose} aria-label="Close success message">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Notification;
