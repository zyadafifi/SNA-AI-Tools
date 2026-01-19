import React from "react";

const ListeningProgressBar = ({
  currentPart = 0,
  totalParts = 5,
  currentStage = 1,
  stageNames = ["Listening", "Dictation", "Result", "Speaking", "Result"],
}) => {
  // Calculate overall progress percentage based on current part
  // Progress should fill proportionally: Part 2/5 = ~40% (since we're on part 2, we've completed part 1)
  const progressPercentage = totalParts > 0 ? ((currentPart) / totalParts) * 100 : 0;

  // Stage configuration (5 stages total)
  const stages = stageNames.map((name, index) => ({
    id: index + 1,
    name: name,
    status: index + 1 < currentStage ? "completed" : index + 1 === currentStage ? "current" : "pending",
  }));

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-[24px] px-6 py-5 shadow-lg">
      {/* Top Section - Part Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Checkmark Icon */}
          <div className="w-12 h-12 rounded-full bg-[#ffc515] flex items-center justify-center shadow-md">
            <svg
              className="w-7 h-7 text-white"
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
            </svg>
          </div>
          
          {/* Part Text */}
          <h2 className="text-3xl font-bold text-gray-700">
            Part <span className="text-gray-800">{currentPart + 1}</span> / {totalParts}
          </h2>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ffc515] via-[#ffd84d] to-[#ffc515] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Middle Section - Stage Progression Flow */}
      <div className="mb-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              {/* Stage Indicator */}
              <div className="flex items-center gap-2">
                {stage.status === "completed" ? (
                  // Completed - Checkmark only (no circle)
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-5 h-5 text-[#ffc515]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">{stage.name}</span>
                  </div>
                ) : stage.status === "current" ? (
                  // Current - Golden circle with white number
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-[#ffc515] flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">{stage.id}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{stage.name}</span>
                  </div>
                ) : (
                  // Pending - Light gray text
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-400">{stage.name}</span>
                  </div>
                )}
              </div>

              {/* Arrow Separator (not after last stage) */}
              {index < stages.length - 1 && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bottom Section - Current Stage Detail */}
      <div className="text-center">
        <p className="text-2xl text-gray-600">
          Stage: <span className="text-gray-500">({currentStage} / {stages.length})</span>
        </p>
      </div>
    </div>
  );
};

export default ListeningProgressBar;
