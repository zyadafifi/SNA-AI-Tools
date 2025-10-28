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
      className={`bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#e5e7eb] transition-all duration-300 cursor-pointer relative overflow-hidden max-w-full w-full flex flex-col justify-start hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:border-[#FDCB3E]/30 ${
        !isUnlocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
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
      <div className="flex-1 flex flex-col gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-[#334155] leading-snug m-0 mb-1">
          {lesson.title}
        </h3>
        <p className="text-sm text-[#64748b] leading-relaxed m-0 mb-3 line-clamp-2">
          {lesson.description}
        </p>

        {/* Progress Section */}
        {isUnlocked && (
          <div className="my-2 mb-3">
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

        {/* Stats */}
        <div className="flex gap-2 text-xs text-[#64748b] font-medium mt-1 mb-2">
          <span>{lesson.duration}</span>
          <span className="text-[#cbd5e1]">•</span>
          <span>{lesson.exercises.length} exercises</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-2">
        <button
          className={`w-full bg-[#FDCB3E] text-white border-none px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(253,203,62,0.3)] hover:bg-[#ffd84d] hover:shadow-[0_6px_16px_rgba(253,203,62,0.4)] ${
            !isUnlocked ? "bg-gray-400 cursor-not-allowed opacity-60" : ""
          }`}
          disabled={!isUnlocked}
        >
          <span className="font-semibold">{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};

export default LessonCard;
