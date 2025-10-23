import PropTypes from "prop-types";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MdMenuBook } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { ChevronDown, Lock, BookOpen } from "lucide-react";
import { IoPlay } from "react-icons/io5";

export const ShowLessonsBySlugReading = ({ readingLesson }) => {
  const [openLessonId, setOpenLessonId] = useState(null);

  // Toggle accordion
  const toggleLesson = (lessonId, isLocked) => {
    if (isLocked) return;
    setOpenLessonId(openLessonId === lessonId ? null : lessonId);
  };

  // Check if lesson is locked (first lesson always unlocked)
  const isLessonLocked = (lessonId, lessonIndex) => {
    if (lessonIndex === 0) return false;
    // يمكن تضيف logic لل progress هنا
    return false;
  };

  return (
    <div className="bg-gradient-to-br from-[var(--third-color)] to-[var(--third-color)] p-6 rounded-3xl mb-5 hover:shadow-2xl transition-all duration-300 border border-white/10">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="group relative rounded-3xl mb-8 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <MdMenuBook className="text-3xl text-[var(--main-text-color)]" />
              </div>
              <div className="absolute -bottom-2 -left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
                <p className="text-xs font-bold text-[var(--main-text-color)]">
                  Reading
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1.5 h-8 bg-[var(--primary-color)] rounded-full" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
                    {readingLesson.levelTitle}
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    {readingLesson.levelDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Accordion */}
        <div className="space-y-4">
          {readingLesson.lessons?.map((lesson, lessonIndex) => {
            const isOpen = openLessonId === lesson.id;
            const isLocked = isLessonLocked(lesson.id, lessonIndex);

            return (
              <div
                key={lesson.id}
                className={`bg-[var(--third-color)] rounded-2xl border border-[var(--primary-color)] overflow-hidden transition-all duration-300 ${
                  isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:border-[var(--secondary-color)] hover:shadow-lg hover:shadow-purple-500/10"
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleLesson(lesson.id, isLocked)}
                  disabled={isLocked}
                  className={`w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left transition-colors ${
                    isLocked
                      ? "cursor-not-allowed"
                      : "hover:bg-[var(--third-color)]"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div
                      className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-2xl shadow-lg relative ${
                        !isLocked &&
                        "group-hover:scale-110 group-hover:rotate-3"
                      } transition-all duration-300`}
                    >
                      {isLocked ? (
                        <Lock className="text-black text-lg" />
                      ) : (
                        <FontAwesomeIcon
                          className="text-black text-lg"
                          icon={faBook}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1">
                          {lesson.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                        {isLocked
                          ? "🔒 Complete previous lesson to unlock"
                          : lesson.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                        <span className="text-xs text-gray-400">
                          {lesson.storyData?.content?.length || 0} Story Parts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  {!isLocked && (
                    <ChevronDown
                      className={`w-6 h-6 text-[var(--primary-color)] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Accordion Content */}
                {!isLocked && (
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "max-h-[3000px] opacity-100"
                        : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mb-4" />

                      {/* Story Preview Card */}
                      <Link
                        to={`/reading/show-lesson-first-round/${readingLesson.id}/${lesson.id}`}
                        className="block bg-slate rounded-xl overflow-hidden border border-[var(--primary-color)] transition-all hover:shadow-md"
                      >
                        <div className="p-4 transition-all hover:bg-[var(--third-color)]">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              {/* Story Icon */}
                              <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-lg shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <FontAwesomeIcon
                                  className="text-black text-xs"
                                  icon={faBook}
                                />
                              </div>

                              {/* Story Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold line-clamp-1 text-sm sm:text-base mb-1">
                                  Start Reading
                                </h4>
                                <p className="text-xs text-gray-400">
                                  Read the full story with word definitions
                                </p>
                              </div>
                            </div>

                            {/* Play Button */}
                            <button className="relative w-8 h-8 bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] flex items-center justify-center rounded-full shadow-lg group-hover:shadow-[var(--primary-color)]/50 group-hover:scale-110 transition-all duration-300">
                              <IoPlay className="text-xl text-[var(--main-text-color)] ml-1 group-hover:scale-125 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ShowLessonsBySlugReading.propTypes = {
  readingLesson: PropTypes.object,
};
