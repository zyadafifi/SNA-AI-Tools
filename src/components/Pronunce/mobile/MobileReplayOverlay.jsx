import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";

const MobileReplayOverlay = ({ show, onReplayClick }) => {
  return (
    <div className={`mobile-replay-overlay ${show ? "show" : ""}`}>
      <button
        className="mobile-replay-btn"
        onClick={onReplayClick}
        onTouchStart={(e) => e.preventDefault()}
        onTouchEnd={(e) => {
          e.preventDefault();
          onReplayClick();
        }}
      >
        <FontAwesomeIcon icon={faRedo} /> Replay
      </button>
    </div>
  );
};

export default MobileReplayOverlay;
