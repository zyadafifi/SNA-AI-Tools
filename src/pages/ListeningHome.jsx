import { useState, useEffect } from "react";
import dataService from "../services/dataService";
import LessonCard from "../components/Listening/LessonCard";
import TipsPanel from "../components/Listening/TipsPanel";
import useProgress from "../hooks/useProgress";
import snaLogo from "/assets/images/sna logo.png";
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

  const lessonsPerPage = 20;
  const { getProgress, refreshProgress } = useProgress();

  useEffect(() => {
    loadLessons();
    updateProgress().catch(console.error);
  }, [currentPage]);

  // Refresh progress when component becomes visible (returning from lesson)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        updateProgress();
        // Reload lessons to get updated progress
        const pageLessons = await dataService.getLessons(
          currentPage,
          lessonsPerPage
        );
        setLessons(pageLessons || []);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentPage]);

  const updateProgress = async () => {
    if (refreshProgress) {
      await refreshProgress();
      setProgress(getProgress());
    } else {
      setProgress(getProgress());
    }
  };

  const loadLessons = async () => {
    setLoading(true);
    try {
      const pageLessons = await dataService.getLessons(
        currentPage,
        lessonsPerPage
      );
      const totalLessons = await dataService.getTotalLessons();

      if (currentPage === 1) {
        setLessons(pageLessons || []);
      } else {
        setLessons((prev) => [...(prev || []), ...(pageLessons || [])]);
      }

      setHasMore(currentPage * lessonsPerPage < totalLessons);
    } catch (error) {
      console.error("Error loading lessons:", error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="gradient-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="relative">
          <div className="bg-gradient-to-br from-[#f8edd6]/30 via-[#d3995e]/20 to-[#96b0c0]/25 rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-14 pb-20 sm:pb-24 lg:pb-28 xl:pb-32 mb-6 sm:mb-8 lg:mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-center">
            <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4">
              <img
                src={snaLogo}
                alt="SNA Academy"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
              />
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#64748b] mb-0 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Master fundamental English vowel
              <br /> sounds with clear pronunciation
            </p>

            {/* PROGRESS – two cards with pill-shaped inner edges and square outer edges */}
            <div
              className="
        absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-4 lg:bottom-6
        w-screen sm:w-[calc(100%+3rem)] lg:w-[calc(100%+5rem)] xl:w-[calc(100%+8rem)]
        max-w-none px-0 sm:px-0
      "
              aria-hidden="true"
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                {/* LEFT card — pill-shaped on right (inner edge), square on left (outer edge) */}
                <div
                  className="
            bg-white rounded-r-full rounded-l-xl sm:rounded-l-2xl
            border-t border-b border-r border-slate-200
            shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.12)]
            h-12 sm:h-14 lg:h-16 xl:h-18 flex items-center justify-end px-4 sm:px-6 lg:px-8 xl:px-12
          "
                  aria-label={`${progress.completed} completed lessons`}
                >
                  <div className="text-center leading-tight flex flex-col justify-center">
                    <div className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-slate-700">
                      {progress.completed}
                    </div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
                      completed
                    </div>
                  </div>
                </div>

                {/* RIGHT card — pill-shaped on left (inner edge), square on right (outer edge) */}
                <div
                  className="
            bg-white rounded-l-full rounded-r-xl sm:rounded-r-2xl
            border-t border-b border-l border-slate-200
            shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.12)]
            h-12 sm:h-14 lg:h-16 xl:h-18 flex items-center justify-start px-4 sm:px-6 lg:px-8 xl:px-12
          "
                  aria-label={`${
                    progress.total - progress.completed
                  } remaining lessons`}
                >
                  <div className="text-center leading-tight flex flex-col justify-center">
                    <div className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-slate-700">
                      {progress.total - progress.completed}
                    </div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 p-0">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="animate-fade-in-up h-full flex"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <LessonCard
                  lesson={lesson}
                  isUnlocked={lesson.isUnlocked}
                  isCompleted={lesson.isCompleted}
                  progress={lesson.progress}
                  className="h-full w-full"
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
