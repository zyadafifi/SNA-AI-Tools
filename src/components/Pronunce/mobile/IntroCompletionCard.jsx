import React from "react";

const IntroCompletionCard = ({ show, onContinue, onBackToHome }) => {
  if (!show) return null;

  return (
    <div className="mobile-completion-card show">
      <div className="completion-content intro-completion-content">
        <div className="intro-completion-buttons">
          <button className="completion-btn" onClick={onContinue}>
            Continue
          </button>
          <button
            className="completion-btn completion-btn-secondary"
            onClick={onBackToHome}
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroCompletionCard;
