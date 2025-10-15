import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { BiLoaderCircle } from "react-icons/bi";
import { IoIosArrowForward } from "react-icons/io";
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";
import HeaderBanner from "../components/Pronunce/HeaderBanner";
import {
  FaBook,
  FaGraduationCap,
  FaLanguage,
  FaMicrophone,
  FaHeadphones,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBookOpen,
  FaSpellCheck,
  FaVolumeUp,
  FaPencilAlt,
  FaClipboard,
  FaPen,
  FaEdit,
  FaFileAlt,
  FaRuler,
  FaHighlighter,
  FaMarker,
  FaStickyNote,
  FaPaperPlane,
  FaLightbulb,
  FaBrain,
  FaAward,
  FaTrophy,
  FaStar,
} from "react-icons/fa";

import "./PronounceHomePage.css";

export const PronounceHomePage = () => {
  const navigate = useNavigate();
  const updateXarrow = useXarrow();
  const {
    getLessonProgress,
    isLessonCompleted,
    isLessonUnlocked,
    calculateLessonProgressByTopics,
    updateLessonProgressByTopics,
    batchUpdateProgress,
  } = useProgress();
  const [lessons, setLessons] = useState([]);
  const [lessonsData, setLessonsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get lesson icon function - exact copy from script.js
  const getLessonIcon = useCallback((lessonId) => {
    switch (lessonId) {
      case 1:
        return "fas fa-handshake";
      case 2:
        return "fas fa-coffee";
      case 3:
        return "fas fa-mug-hot";
      case 4:
        return "fas fa-blender";
      case 5:
        return "fas fa-shopping-bag";
      case 6:
        return "fas fa-store";
      case 7:
        return "fas fa-map-marked-alt";
      case 8:
        return "fas fa-route";
      case 9:
        return "fas fa-plane";
      case 10:
        return "fas fa-bullseye";
      default:
        return "fas fa-book-open";
    }
  }, []);

  // Calculate path positions - exact copy from script.js
  const calculatePathPositions = useCallback((lessonsToRender) => {
    const positions = [];
    const containerWidth = window.innerWidth;
    const containerHeight = Math.max(800, lessonsToRender.length * 220); // Exact from script.js

    // Ensure minimum dimensions
    const finalContainerWidth = Math.max(300, containerWidth);
    const finalContainerHeight = Math.max(800, containerHeight);

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    let padding, availableWidth, availableHeight;

    if (isMobile) {
      padding = 120; // Exact from script.js
      availableWidth = finalContainerWidth - padding * 2;
      availableHeight = finalContainerHeight - padding * 2;
    } else {
      padding = 150; // Exact from script.js
      availableWidth = finalContainerWidth - padding * 2;
      availableHeight = finalContainerHeight - padding * 2;
    }

    lessonsToRender.forEach((lesson, index) => {
      if (isMobile) {
        // Mobile alternating layout
        const y =
          padding +
          (index / Math.max(lessonsToRender.length - 1, 1)) * availableHeight;
        const centerX = finalContainerWidth / 2;

        const lessonInfoWidth = 180; // Exact from script.js
        const circleRadius = 35; // Exact from script.js
        const safeMargin = 20; // Exact from script.js

        const maxSafeOffset = Math.min(
          finalContainerWidth / 2 - lessonInfoWidth - circleRadius - safeMargin,
          finalContainerWidth * 0.2 // Exact from script.js
        );

        const offsetDistance = Math.max(maxSafeOffset, 40); // Exact from script.js

        let x, side;
        if (index % 2 === 0) {
          x = centerX - offsetDistance;
          side = "left";
        } else {
          x = centerX + offsetDistance;
          side = "right";
        }

        x = Math.max(
          circleRadius + safeMargin,
          Math.min(finalContainerWidth - circleRadius - safeMargin, x)
        );

        positions.push({ x, y, side });
      } else {
        // Desktop layout
        const progress = index / Math.max(lessonsToRender.length - 1, 1);
        const baseY = padding + progress * availableHeight;

        const centerX = finalContainerWidth / 2;
        const maxOffset = availableWidth * 0.3; // Exact from script.js

        let xOffset;
        const cycle = index % 6; // Exact from script.js

        switch (cycle) {
          case 0:
            xOffset = -maxOffset * 0.8; // Exact from script.js
            break;
          case 1:
            xOffset = maxOffset * 0.9; // Exact from script.js
            break;
          case 2:
            xOffset = -maxOffset * 0.6; // Exact from script.js
            break;
          case 3:
            xOffset = maxOffset * 0.7; // Exact from script.js
            break;
          case 4:
            xOffset = -maxOffset * 0.4; // Exact from script.js
            break;
          case 5:
            xOffset = maxOffset * 0.5; // Exact from script.js
            break;
          default:
            xOffset = 0;
        }

        const x = centerX + xOffset;
        const y = baseY;

        const finalX = Math.max(
          padding,
          Math.min(finalContainerWidth - padding, x)
        );
        const finalY = Math.max(
          padding,
          Math.min(finalContainerHeight - padding, y)
        );

        positions.push({
          x: finalX,
          y: finalY,
          side: finalX < finalContainerWidth / 2 ? "left" : "right",
        });
      }
    });

    return {
      positions,
      containerWidth: finalContainerWidth,
      containerHeight: finalContainerHeight,
    };
  }, []);

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/assets/data.json");
        const data = await response.json();
        setLessonsData(data);
      } catch (error) {
        console.error("Error loading lessons data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLessonsData();
  }, []);

  // Update lessons with progress - exact copy from script.js logic
  const updateLessonsWithProgress = useCallback(() => {
    if (!lessonsData || !lessonsData.lessons) {
      return;
    }

    const updatedLessons = lessonsData.lessons.map((lesson, index) => {
      // Use topic-based progress calculation
      const topicBasedProgress = calculateLessonProgressByTopics(
        lesson.lessonNumber,
        lessonsData.lessons
      );
      const isCompleted =
        isLessonCompleted(lesson.lessonNumber) || topicBasedProgress >= 100;
      const isUnlocked = isLessonUnlocked(
        lesson.lessonNumber,
        lessonsData.lessons
      );
      const progress = Math.max(
        getLessonProgress(lesson.lessonNumber),
        topicBasedProgress
      );

      // Update lesson progress if topics indicate completion but lesson isn't marked complete
      if (
        topicBasedProgress >= 100 &&
        !isLessonCompleted(lesson.lessonNumber)
      ) {
        updateLessonProgressByTopics(lesson.lessonNumber, lessonsData.lessons);
      }

      // Add avatar URLs for each lesson
      const avatarUrls = [
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
      ];

      const updatedLesson = {
        id: lesson.lessonNumber,
        lessonNumber: lesson.lessonNumber, // Add lessonNumber property
        title: lesson.title,
        subtitle: `Learn ${lesson.title.toLowerCase()}`,
        level:
          index === 0 ? "Beginner" : index < 3 ? "Elementary" : "Intermediate",
        progress: progress,
        completed: isCompleted,
        locked: !isUnlocked,
        avatar: avatarUrls[(lesson.lessonNumber - 1) % avatarUrls.length],
        topics: lesson.topics,
      };

      return updatedLesson;
    });

    setLessons(updatedLessons);
  }, [getLessonProgress, isLessonCompleted, isLessonUnlocked, lessonsData]);

  // Update lessons when data is loaded and batch update progress
  useEffect(() => {
    if (lessonsData) {
      // First batch update all progress to ensure consistency
      batchUpdateProgress(lessonsData);
      // Then update the lessons display
      updateLessonsWithProgress();
    }
  }, [lessonsData, updateLessonsWithProgress, batchUpdateProgress]);

  // Calculate positions for lessons
  const [lessonPositions, setLessonPositions] = useState([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [elementsReady, setElementsReady] = useState(false);

  // Calculate lesson positions when lessons change
  useEffect(() => {
    if (lessons.length === 0) return;

    const { positions, containerWidth, containerHeight } =
      calculatePathPositions(lessons);
    setLessonPositions(positions);
    setContainerDimensions({ width: containerWidth, height: containerHeight });

    // Trigger Xarrow update after positions are set
    setTimeout(() => {
      updateXarrow();
    }, 500);
  }, [lessons, calculatePathPositions, updateXarrow]);

  // Additional effect to ensure Xarrows are updated when positions change
  useEffect(() => {
    if (lessonPositions.length > 0) {
      setTimeout(() => {
        // Check if all lesson elements exist
        const allElementsExist = lessons.every((lesson) =>
          document.getElementById(`lesson-circle-${lesson.lessonNumber}`)
        );

        if (allElementsExist) {
          setElementsReady(true);
          updateXarrow();
        } else {
          // Try again after a short delay
          setTimeout(() => {
            setElementsReady(true);
            updateXarrow();
          }, 200);
        }
      }, 600);
    }
  }, [lessonPositions, updateXarrow, lessons]);

  useEffect(() => {
    updateLessonsWithProgress();
  }, [updateLessonsWithProgress]);

  // Add window resize listener to update Xarrows
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        updateXarrow();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateXarrow]);

  if (loading) {
    return (
      <div className="home-page">
        <main className="main-container">
          <div className="loading-indicator">
            <BiLoaderCircle
              size={43}
              className={"animate-spin text-[var(--primary-color)]"}
            />
            <p>Loading lessons...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Header Banner */}
      <div className="block md:hidden">
        <HeaderBanner lessons={lessons} />
      </div>

      {/* Educational Background Icons */}
      <div className="educational-background">
        <FaBook className="bg-icon icon-1" />
        <FaGraduationCap className="bg-icon icon-2" />
        <FaLanguage className="bg-icon icon-3" />
        <FaMicrophone className="bg-icon icon-4" />
        <FaHeadphones className="bg-icon icon-5" />
        <FaChalkboardTeacher className="bg-icon icon-6" />
        <FaUserGraduate className="bg-icon icon-7" />
        <FaBookOpen className="bg-icon icon-8" />
        <FaSpellCheck className="bg-icon icon-9" />
        <FaVolumeUp className="bg-icon icon-10" />
        <FaPencilAlt className="bg-icon icon-11" />
        <FaClipboard className="bg-icon icon-12" />
        <FaPen className="bg-icon icon-13" />
        <FaEdit className="bg-icon icon-14" />
        <FaFileAlt className="bg-icon icon-15" />
        <FaRuler className="bg-icon icon-16" />
        <FaHighlighter className="bg-icon icon-17" />
        <FaStickyNote className="bg-icon icon-18" />
        <FaLightbulb className="bg-icon icon-19" />
        <FaBrain className="bg-icon icon-20" />
        <FaAward className="bg-icon icon-21" />
        <FaTrophy className="bg-icon icon-22" />
        <FaStar className="bg-icon icon-23" />
        <FaBook className="bg-icon icon-24" />
        <FaGraduationCap className="bg-icon icon-25" />
      </div>
      <main className="main-container">
        <Xwrapper>
          <div
            className="lessons-path-container"
            style={{
              height: `${containerDimensions.height}px`,
              width: `${containerDimensions.width}px`,
            }}
          >
            {/* Render lesson nodes */}
            {lessons.map((lesson, index) => {
              const position = lessonPositions[index];
              if (!position) return null;

              const isCurrent =
                !lesson.locked &&
                !lesson.completed &&
                index === lessons.findIndex((l) => !l.completed && !l.locked);

              return (
                <div key={lesson.id}>
                  <div
                    className={`lesson-node ${position.side}`}
                    data-lesson-id={lesson.lessonNumber}
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      position: "absolute",
                    }}
                    onClick={() => {
                      if (!lesson.locked) {
                        navigate(`/pronounce/topics/${lesson.lessonNumber}`);
                      }
                    }}
                  >
                    {/* Lesson Circle with unique ID for Xarrow */}
                    <div
                      id={`lesson-circle-${lesson.lessonNumber}`}
                      className={`lesson-circle ${
                        lesson.completed
                          ? "completed"
                          : lesson.progress > 0
                          ? "in-progress"
                          : lesson.locked
                          ? "locked"
                          : "current"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!lesson.locked) {
                          navigate(`/pronounce/topics/${lesson.lessonNumber}`);
                        }
                      }}
                    >
                      {lesson.avatar ? (
                        <div
                          className="lesson-avatar"
                          style={{ backgroundImage: `url(${lesson.avatar})` }}
                        />
                      ) : (
                        <i
                          className={`lesson-icon ${getLessonIcon(lesson.id)}`}
                        />
                      )}

                      {lesson.completed && (
                        <div className="lesson-checkmark">
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 512 512"
                            height="20px"
                            width="20px"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div
                      className={`lesson-info ${lesson.locked ? "locked" : ""}`}
                    >
                      <div className="lesson-content">
                        <h3 className="lesson-title">
                          Lesson {lesson.lessonNumber}
                        </h3>
                        <p className="lesson-subtitle">{lesson.title}</p>
                      </div>
                      <svg
                        className="lesson-arrow"
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        height="30px"
                        width="30px"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Xarrow connections between lessons - render only when elements are ready */}
            {elementsReady &&
              lessonPositions.length > 0 &&
              lessons.map((lesson, index) => {
                if (index >= lessons.length - 1) return null;

                const nextLesson = lessons[index + 1];
                const isPathCompleted = lesson.progress >= 100;

                return (
                  <Xarrow
                    key={`arrow-${lesson.lessonNumber}-${nextLesson.lessonNumber}`}
                    start={`lesson-circle-${lesson.lessonNumber}`}
                    end={`lesson-circle-${nextLesson.lessonNumber}`}
                    startAnchor="bottom"
                    endAnchor="top"
                    strokeWidth={2}
                    color={isPathCompleted ? "#63a29b" : "#9ca3af"}
                    dashness={
                      isPathCompleted
                        ? false
                        : { strokeLen: 8, nonStrokeLen: 4 }
                    }
                    curveness={0.8}
                    path="smooth"
                    showHead={false}
                  />
                );
              })}
          </div>
        </Xwrapper>
      </main>
    </div>
  );
};
