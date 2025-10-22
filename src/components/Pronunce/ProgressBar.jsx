import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProgressBar = ({
  currentSentenceIndex = 0,
  sentenceProgress = 0,
  sentences = [],
  completedSentences,
  onDotClick = null,
  showLabels = false,
  labels = [],
}) => {
  const [hoveredDot, setHoveredDot] = useState(null);
  const [focusedDot, setFocusedDot] = useState(null);
  const [touchedDot, setTouchedDot] = useState(null);

  // Early return for empty state
  if (sentences.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            height: "8px",
            width: "100%",
            backgroundColor: "#F3F4F6",
            borderRadius: "9999px",
          }}
        />
      </div>
    );
  }

  const total = sentences.length;
  const completedCount =
    typeof completedSentences === "number"
      ? completedSentences
      : completedSentences?.size || 0;

  // Calculate bullet positions: bullets are evenly distributed
  // For n bullets, positions are at: 0/(n-1), 1/(n-1), 2/(n-1), ..., (n-1)/(n-1)
  // This means: 0%, 25%, 50%, 75%, 100% for 5 bullets
  const getBulletPosition = (index) => {
    if (total === 1) return 100;
    return (index / (total - 1)) * 100;
  };

  // Calculate progress based on completed sentences and current position
  let progressPercentage;

  if (completedCount === 0 && currentSentenceIndex === 0) {
    // First sentence, not completed: show 50% of the way to first bullet
    const firstBulletPos = getBulletPosition(0);
    progressPercentage = firstBulletPos * 0.5;
  } else {
    // Show progress up to the last completed bullet
    const completedBulletPos =
      completedCount > 0 ? getBulletPosition(completedCount - 1) : 0;
    const currentBulletPos = getBulletPosition(currentSentenceIndex);

    if (currentSentenceIndex > completedCount) {
      // On a new sentence: show 50% between completed and current bullet
      const nextBulletPos = getBulletPosition(completedCount);
      progressPercentage =
        completedBulletPos + (nextBulletPos - completedBulletPos) * 0.5;
    } else {
      // Show progress to completed bullet
      progressPercentage = completedBulletPos;
    }
  }

  // SNA brand colors with fallbacks
  const progressColor = "var(--sna-primary, #ffc515)";
  const currentColor = "var(--sna-secondary, #275151)";

  const handleDotInteraction = (index) => {
    if (onDotClick && getDotState(index) === "completed") {
      onDotClick(index);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDotInteraction(index);
    }
  };

  const getDotState = (index) => {
    if (typeof completedSentences === "number") {
      // Handle number-based completed sentences
      if (index < completedSentences) return "completed";
      if (index === currentSentenceIndex) return "current";
      return "upcoming";
    } else {
      // Handle Set-based completed sentences
      if (completedSentences?.has(index)) return "completed";
      if (index === currentSentenceIndex) return "current";
      return "upcoming";
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "16px",
        paddingBottom: "16px",
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progressPercentage}
      aria-label="Learning progress"
    >
      {/* Background track */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "8px",
            backgroundColor: "#E5E7EB",
            borderRadius: "9999px",
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              borderRadius: "9999px",
              background: `linear-gradient(90deg, ${progressColor} 0%, ${currentColor} 100%)`,
              width: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
            }}
            initial={{ width: "0%" }}
            animate={{
              width: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Progress dots container */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          {sentences.map((_, i) => {
            const dotState = getDotState(i);
            const isCompleted = dotState === "completed";
            const isCurrent = dotState === "current";
            const isActive =
              hoveredDot === i || focusedDot === i || touchedDot === i;
            const isInteractive = onDotClick && isCompleted;
            const label = labels[i] || `Step ${i + 1}`;

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Touch/Click area */}
                <motion.button
                  type="button"
                  onClick={() => handleDotInteraction(i)}
                  onMouseEnter={() => setHoveredDot(i)}
                  onMouseLeave={() => setHoveredDot(null)}
                  onTouchStart={() => setTouchedDot(i)}
                  onTouchEnd={() => setTouchedDot(null)}
                  onFocus={() => setFocusedDot(i)}
                  onBlur={() => setFocusedDot(null)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  disabled={!isInteractive}
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: "24px",
                    height: "24px",
                    borderRadius: "9999px",
                    border: "2px solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    cursor: isInteractive ? "pointer" : "default",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    padding: 0,
                    outline:
                      focusedDot === i
                        ? "2px solid var(--sna-primary-light)"
                        : "none",
                    outlineOffset: "2px",
                    transition: "box-shadow 0.2s",
                  }}
                  animate={{
                    backgroundColor: isCompleted
                      ? progressColor
                      : isCurrent
                      ? "#FFFFFF"
                      : "#F3F4F6",
                    borderColor: isCompleted
                      ? progressColor
                      : isCurrent
                      ? currentColor
                      : "#D1D5DB",
                    scale: isActive ? 1.2 : isCurrent ? 1.15 : 1,
                    borderWidth: isCurrent ? 3 : 2,
                  }}
                  transition={{ duration: 0.2 }}
                  aria-label={`${label}${
                    isCompleted
                      ? " - completed"
                      : isCurrent
                      ? " - in progress"
                      : " - upcoming"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {/* Checkmark for completed */}
                  <AnimatePresence>
                    {isCompleted && (
                      <motion.svg
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          width: "12px",
                          height: "12px",
                          color: "white",
                        }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    )}
                  </AnimatePresence>

                  {/* Light animation for current bullet */}
                  {isCurrent && (
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "9999px",
                        border: "2px solid var(--sna-primary-light)",
                        boxShadow: "0 0 8px rgba(99, 162, 155, 0.3)",
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 0.3, 0.6],
                        boxShadow: [
                          "0 0 8px rgba(99, 162, 155, 0.3)",
                          "0 0 12px rgba(99, 162, 155, 0.5)",
                          "0 0 8px rgba(99, 162, 155, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.button>

                {/* Tooltip on hover/focus/touch */}
                <AnimatePresence>
                  {isActive && showLabels && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        top: "100%",
                        marginTop: "8px",
                        paddingLeft: "8px",
                        paddingRight: "8px",
                        paddingTop: "4px",
                        paddingBottom: "4px",
                        backgroundColor: "#111827",
                        color: "white",
                        fontSize: "12px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        boxShadow:
                          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        zIndex: 20,
                        pointerEvents: "none",
                      }}
                    >
                      {label}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 0,
                          height: 0,
                          borderLeft: "4px solid transparent",
                          borderRight: "4px solid transparent",
                          borderBottom: "4px solid #111827",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
