import React, { useEffect, useRef } from "react";
import "./StartingMessage.css";

const StartingMessage = ({
  show,
  lesson,
  lessonCompleted,
  lastScore,
  onStart,
  onClose,
  position,
}) => {
  const cardRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target) && show) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  if (!show || !lesson) return null;

  return (
    <div
      ref={cardRef}
      className={`starting-message-card ${show ? "active" : ""}`}
      style={{
        top: position?.top || "0px",
        left: position?.left || "0px",
      }}
    >
      {/* Content */}
      <div className="starting-message-content">
        {/* Lesson Title */}
        <h3 className="starting-message-title">{lesson.title}</h3>

        {/* Last Score (if completed) */}
        {lessonCompleted && lastScore !== null && lastScore !== undefined && (
          <div className="starting-message-score">
            <span className="score-label">Last Score:</span>
            <span className="score-value">{Math.round(lastScore)}%</span>
          </div>
        )}

        {/* Arabic Description */}
        <p className="starting-message-description">
          {lesson.arabicDescription}
        </p>

        {/* Action Button */}
        <button
          className="starting-message-button"
          onClick={onStart}
          aria-label={lessonCompleted ? "Restart Lesson" : "Start Lesson"}
        >
          {lessonCompleted ? (
            <>
              <i className="fas fa-redo-alt"></i>
              <span>Restart</span>
            </>
          ) : (
            <>
              <i className="fas fa-play"></i>
              <span>Start Lesson</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StartingMessage;
