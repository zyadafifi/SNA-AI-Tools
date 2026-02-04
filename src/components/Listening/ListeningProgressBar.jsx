import React from "react";

const ListeningProgressBar = ({
  currentPart = 0,
  totalParts = 5,
  currentStage = 1,
  stageNames = ["Listening", "Dictation", "Result", "Speaking", "Result"],
  onBackClick,
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
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg sm:rounded-[24px] sm:px-4 sm:py-3">
      {/* Top Section - Part Progress */}
      <div className="mb-1.5 sm:mb-2">
        <div className="flex items-center justify-start gap-1.5 mb-1.5 sm:gap-2 sm:mb-2">
          {/* Back Button */}
          <button 
            onClick={onBackClick}
            className="w-7 h-7 rounded-full bg-[#ffc515] border border-white text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-100 sm:w-8 sm:h-8"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="12" width="12" className="sm:w-3.5 sm:h-3.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path>
            </svg>
          </button>
          
          {/* Part Text */}
          <h2 className="text-sm font-bold text-gray-700 sm:text-base">
            Part <span className="text-gray-800">{currentPart + 1}</span> / {totalParts}
          </h2>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden sm:h-2">
          <div
            className="h-full bg-gradient-to-r from-[#ffc515] via-[#ffd84d] to-[#ffc515] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Middle Section - Stage Progression Flow */}
      <div className="mb-1 sm:mb-1.5">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              {/* Stage Indicator */}
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                {stage.status === "completed" ? (
                  // Completed - Checkmark only (no circle)
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <svg
                      className="w-3 h-3 text-[#ffc515] sm:w-4 sm:h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-[10px] font-medium text-gray-600 sm:text-xs whitespace-nowrap">{stage.name}</span>
                  </div>
                ) : stage.status === "current" ? (
                  // Current - Golden circle with white number
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <div className="w-4 h-4 rounded-full bg-[#ffc515] flex items-center justify-center shadow-sm sm:w-5 sm:h-5">
                      <span className="text-white font-bold text-[10px] sm:text-xs">{stage.id}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-800 sm:text-xs whitespace-nowrap">{stage.name}</span>
                  </div>
                ) : (
                  // Pending - Light gray text
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className="text-[10px] font-medium text-gray-400 sm:text-xs whitespace-nowrap">{stage.name}</span>
                  </div>
                )}
              </div>

              {/* Arrow Separator (not after last stage) */}
              {index < stages.length - 1 && (
                <svg
                  className="w-2.5 h-2.5 text-gray-400 sm:w-3 sm:h-3 flex-shrink-0"
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
        <p className="text-xs text-gray-600 sm:text-sm">
          Stage: <span className="text-gray-500">({currentStage} / {stages.length})</span>
        </p>
      </div>
    </div>
  );
};

export default ListeningProgressBar;
