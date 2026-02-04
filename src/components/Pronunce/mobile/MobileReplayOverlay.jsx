import React from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";

const MobileReplayOverlay = ({ show, onReplayClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReplayClick) {
      onReplayClick();
    }
  };

  const overlay = (
    <div className={`mobile-replay-overlay ${show ? "show" : ""}`}>
      <button
        className="mobile-replay-btn"
        onClick={handleClick}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onReplayClick) {
            onReplayClick();
          }
        }}
      >
        <FontAwesomeIcon icon={faRedo} /> Replay
      </button>
    </div>
  );

  // Render via portal to ensure it's above everything else
  return typeof document !== "undefined"
    ? createPortal(overlay, document.body)
    : overlay;
};

export default MobileReplayOverlay;
