import { useState, useEffect } from "react";
import dataService from "../services/dataService";
import LessonCard from "../components/Listening/LessonCard";
import Header from "../components/Listening/Header";
import TipsPanel from "../components/Listening/TipsPanel";
import useProgress from "../hooks/useProgress";

export const ListeningHome = () => {
  const [showTips, setShowTips] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  console.log(dataService);

  const lessonsPerPage = 20;
  const { getProgress } = useProgress();

  useEffect(() => {
    loadLessons();
    updateProgress();
  }, [currentPage]);

  // Refresh progress when component becomes visible (returning from lesson)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateProgress();
        // Reload lessons to get updated progress
        const pageLessons = dataService.getLessons(currentPage, lessonsPerPage);
        setLessons(pageLessons);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentPage]);

  const updateProgress = () => {
    setProgress(getProgress());
  };

  const loadLessons = () => {
    setLoading(true);
    const pageLessons = dataService.getLessons(currentPage, lessonsPerPage);
    const totalLessons = dataService.getTotalLessons();

    if (currentPage === 1) {
      setLessons(pageLessons);
    } else {
      setLessons((prev) => [...prev, ...pageLessons]);
    }

    setHasMore(currentPage * lessonsPerPage < totalLessons);
    setLoading(false);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleTips={() => setShowTips(!showTips)} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="relative">
          <div className="bg-gradient-to-r from-[#f5e6d3] to-[#fef3e2] rounded-2xl sm:rounded-3xl p-8 sm:p-12 pb-24 sm:pb-28 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#334155] mb-3 sm:mb-4">
              SNA Academy
            </h1>
            <p className="text-base sm:text-lg text-[#64748b] mb-0 max-w-2xl mx-auto">
              Master fundamental English vowel sounds with clear pronunciation
            </p>

            {/* PROGRESS – two cards with pill-shaped inner edges and square outer edges */}
            <div
              className="
        absolute left-1/2 -translate-x-1/2 bottom-6
        w-[calc(100%+3rem)] sm:w-[calc(100%+5rem)] lg:w-[calc(100%+8rem)]
        max-w-none
      "
              aria-hidden="true"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* LEFT card — pill-shaped on right (inner edge), square on left (outer edge) */}
                <div
                  className="
            bg-white rounded-r-full rounded-l-2xl
            border-t border-b border-r border-slate-200
            shadow-[0_12px_30px_rgba(0,0,0,0.12)]
            h-16 sm:h-18 flex items-center justify-end px-8 sm:px-12
          "
                  aria-label={`${progress.completed} completed lessons`}
                >
                  <div className="text-center leading-tight flex flex-col justify-center">
                    <div className="text-lg sm:text-xl font-semibold text-slate-700">
                      {progress.completed}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      completed
                    </div>
                  </div>
                </div>

                {/* RIGHT card — pill-shaped on left (inner edge), square on right (outer edge) */}
                <div
                  className="
            bg-white rounded-l-full rounded-r-2xl
            border-t border-b border-l border-slate-200
            shadow-[0_12px_30px_rgba(0,0,0,0.12)]
            h-16 sm:h-18 flex items-center justify-start px-8 sm:px-12
          "
                  aria-label={`${
                    progress.total - progress.completed
                  } remaining lessons`}
                >
                  <div className="text-center leading-tight flex flex-col justify-center">
                    <div className="text-lg sm:text-xl font-semibold text-slate-700">
                      {progress.total - progress.completed}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /PROGRESS */}
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="lessons-section">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FDCB3E] mb-6 sm:mb-8 text-center drop-shadow-sm">
            Available Lessons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10 p-0">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <LessonCard
                  lesson={lesson}
                  isUnlocked={lesson.isUnlocked}
                  isCompleted={lesson.isCompleted}
                  progress={lesson.progress}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-[#FDCB3E] text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-xl border-none cursor-pointer transition-all duration-300 text-sm sm:text-base shadow-[0_4px_12px_rgba(253,203,62,0.3)] hover:bg-[#ffd84d] hover:shadow-[0_6px_16px_rgba(253,203,62,0.4)] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Load More Lessons</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tips Panel */}
      <TipsPanel isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
};
