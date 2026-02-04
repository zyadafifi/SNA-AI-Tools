import React from "react";
import { createPortal } from "react-dom";

const MobileAlertContainer = ({ show, message, onClose }) => {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  const alertContent = (
    <div className="mobile-alert-container" onClick={handleBackdropClick}>
      <div className="mobile-alert-content" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <button 
          className="mobile-alert-close" 
          onClick={handleButtonClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onClose) {
              onClose();
            }
          }}
        >
          OK
        </button>
      </div>
    </div>
  );

  // Render via portal to ensure it's above everything else
  return typeof document !== "undefined"
    ? createPortal(alertContent, document.body)
    : alertContent;
};

export default MobileAlertContainer;


