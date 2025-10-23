import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ImHeadphones } from "react-icons/im";
import { IoPlay } from "react-icons/io5";

export const ShowLessonsBySlugListening = ({ listeningLesson }) => {
  return (
    <div className="container container-md">
      <Link
        to={`/listening/lesson/${listeningLesson?.id}`}
        className="block group relative overflow-hidden p-6 rounded-3xl mb-5 hover:shadow-2xl transition-all duration-300 border-2 border-gray-400"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

        {/* Main Content Wrapper */}
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Left Side: Icon + Badge */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <ImHeadphones className="text-3xl text-[var(--main-text-color)]" />
            </div>
          </div>

          {/* Center: Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-[var(--primary-color)] rounded-full" />
              <h1 className="text-lg sm:text-xl font-bold text-[var(--main-text-color)] line-clamp-1 group-hover:text-[var(--primary-color)] transition-colors">
                {listeningLesson?.title}
              </h1>
            </div>
            <p className="text-sm text-[var(--main-text-color)] line-clamp-2 leading-relaxed">
              {listeningLesson?.description}
            </p>

            {/* Progress Indicator (Optional) */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 bg-gray-300 rounded-full overflow-hidden max-w-[200px]">
                <div className="h-full w-0 bg-[var(--primary-color)] rounded-full group-hover:w-full transition-all duration-1000" />
              </div>
              <span className="text-xs text-[var(--main-text-color)] font-medium">
                Start
              </span>
            </div>
          </div>

          {/* Right Side: Play Button */}
          <div className="relative shrink-0 self-center sm:self-auto">
            <div className="absolute inset-0 bg-[var(--primary-color)] rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <button className="relative w-14 h-14 bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/30 flex items-center justify-center rounded-full shadow-lg group-hover:shadow-[var(--primary-color)]/50 group-hover:scale-110 transition-all duration-300">
              <IoPlay className="text-2xl text-[var(--main-text-color)] ml-1 group-hover:scale-125 transition-transform" />
            </button>
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary-color)] animate-ping opacity-0 group-hover:opacity-75" />
          </div>
        </div>

        {/* Bottom Shine Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </Link>
    </div>
  );
};

ShowLessonsBySlugListening.propTypes = {
  listeningLesson: PropTypes.object,
};
