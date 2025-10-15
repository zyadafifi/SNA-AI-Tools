import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

const DesktopProgressSection = ({
  currentSentenceIndex,
  totalSentences,
  progressPercentage,
}) => {
  return (
    <div className="learning-progress-section">
      <div className="progress-header">
        <div className="progress-icon">
          <FontAwesomeIcon icon={faChartLine} className="fas fa-chart-line" />
        </div>
        <span className="progress-label">Learning Progress</span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            id="progressBarFill"
            style={{ width: `${progressPercentage}%` }}
          >
            <span className="progress-percentage">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="sentence-counter">
        <span className="current-sentence">{currentSentenceIndex + 1}</span>
        <span className="counter-separator">of</span>
        <span className="total-sentences">{totalSentences}</span>
        <span className="counter-label">sentences</span>
      </div>
    </div>
  );
};

export default DesktopProgressSection;
