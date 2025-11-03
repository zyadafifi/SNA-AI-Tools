import { useNavigate } from "react-router-dom";

const LessonCard = ({ lesson, isUnlocked, isCompleted, progress }) => {
  const navigate = useNavigate();

  const handleStartLesson = () => {
    if (isUnlocked) {
      navigate(`/listening/lesson/${lesson.id}`);
    }
  };

  const getCardStatus = () => {
    if (isCompleted) return "completed";
    if (isUnlocked) return "unlocked";
    return "locked";
  };

  const getButtonText = () => {
    if (isCompleted) return "Review";
    if (isUnlocked) return "Start";
    return "Locked";
  };

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#e5e7eb] transition-all duration-300 cursor-pointer relative overflow-hidden w-full flex flex-col h-full ${
        !isUnlocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-[#FDCB3E]/30`}
      onClick={handleStartLesson}
      role="button"
      tabIndex={isUnlocked ? 0 : -1}
      aria-label={`${lesson.title} - ${
        isUnlocked ? "Click to start" : "Locked lesson"
      }`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleStartLesson();
        }
      }}
    >
      {/* Card Content */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Title Section - Fixed height */}
        <div className="mb-3 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-[#334155] leading-snug line-clamp-2 min-h-[2.5rem] flex items-start">
            {lesson.title}
          </h3>
        </div>

        {/* Description Section - Fixed height */}
        <div className="mb-4 flex-shrink-0">
          <p className="text-sm text-[#64748b] leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {lesson.description}
          </p>
        </div>

        {/* Progress Section - Fixed height */}
        <div className="mb-4 flex-shrink-0">
          {isUnlocked && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                  Progress
                </span>
                <span className="text-xs font-bold text-[#334155]">
                  {progress}%
                </span>
              </div>
              <div
                className="bg-[#e5e7eb] h-2.5 rounded-full overflow-hidden relative"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`Lesson progress: ${progress}% complete`}
              >
                <div
                  className="bg-[#FDCB3E] h-full rounded-full transition-[width] duration-[0.6s] ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section - Fixed height */}
        <div className="mt-auto mb-3 flex-shrink-0">
          <div className="flex gap-2 text-xs text-[#64748b] font-medium">
            <span>{lesson.duration}</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>
              {lesson.questions?.length || lesson.exercises?.length || 0}{" "}
              questions
            </span>
          </div>
        </div>
      </div>

      {/* Action Button - Fixed at bottom */}
      <div className="flex-shrink-0 pt-2">
        <button
          className={`w-full text-white border-none px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
            !isUnlocked
              ? "bg-gray-400 cursor-not-allowed opacity-60"
              : "bg-gradient-to-r from-[#FDCB3E] via-[#ffd84d] to-[#FDCB3E] shadow-[0_4px_12px_rgba(253,203,62,0.3)] hover:shadow-[0_6px_16px_rgba(253,203,62,0.4)]"
          }`}
          disabled={!isUnlocked}
        >
          {/* Shining effect overlay */}
          {isUnlocked && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full animate-shine"></div>
          )}
          <span className="font-semibold relative z-10">{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};

export default LessonCard;
