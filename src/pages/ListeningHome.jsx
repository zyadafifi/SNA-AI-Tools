import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dataService from "../services/dataService";
import useProgress from "../hooks/useProgress";
import { BiLoaderCircle } from "react-icons/bi";
import { IoIosArrowForward } from "react-icons/io";
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";
import HeaderBanner from "../components/Pronunce/HeaderBanner";
import StartingMessage from "../components/Pronunce/StartingMessage/StartingMessage";
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

import "../pages/PronounceHomePage.css";

export const ListeningHome = () => {
  const navigate = useNavigate();
  const updateXarrow = useXarrow();
  const { getProgress, refreshProgress } = useProgress();
  
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [lessonPositions, setLessonPositions] = useState([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [elementsReady, setElementsReady] = useState(false);
  const [showStartingMessage, setShowStartingMessage] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [messagePosition, setMessagePosition] = useState({ top: 0, left: 0 });

  // Avatar URLs for lesson circles (same as pronunciation tool)
  const avatarUrls = [
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Airport.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Cafe.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Class.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Hospital.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Kitchen.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Market.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Office.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Outdoor.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/Store.jpg",
    "https://cdn13674550.b-cdn.net/assets/SNA%20media/speaking%20tool%20home%20page/10.jpg",
  ];

  // Update progress
  const updateProgress = async () => {
    if (refreshProgress) {
      await refreshProgress();
      setProgress(getProgress());
    } else {
      setProgress(getProgress());
    }
  };

  // Calculate path positions - adapted from PronounceHomePage
  const calculatePathPositions = useCallback((lessonsToRender) => {
    const positions = [];
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const containerWidth = isMobile
      ? window.innerWidth
      : Math.min(window.innerWidth, 1200);
    const containerHeight = Math.max(800, lessonsToRender.length * 200);

    const finalContainerWidth = Math.max(300, containerWidth);
    const finalContainerHeight = Math.max(800, containerHeight);

    let padding, availableWidth, availableHeight;

    if (isMobile) {
      padding = 120;
      availableWidth = finalContainerWidth - padding * 2;
      availableHeight = finalContainerHeight - padding * 2;
    } else {
      padding = 120;
      availableWidth = finalContainerWidth - padding * 2;
      availableHeight = finalContainerHeight - padding * 2;
    }

    lessonsToRender.forEach((lesson, index) => {
      if (isMobile) {
        const y =
          padding +
          (index / Math.max(lessonsToRender.length - 1, 1)) * availableHeight;
        const centerX = finalContainerWidth / 2;
        const lessonInfoWidth = 180;
        const circleRadius = 35;
        const safeMargin = 20;

        const maxSafeOffset = Math.min(
          finalContainerWidth / 2 - lessonInfoWidth - circleRadius - safeMargin,
          finalContainerWidth * 0.2
        );

        const offsetDistance = Math.max(maxSafeOffset, 40);

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
        const progress = index / Math.max(lessonsToRender.length - 1, 1);
        const baseY = padding + progress * availableHeight;
        const centerX = finalContainerWidth / 2 + 30;
        const maxOffset = Math.min(availableWidth * 0.22, 160);

        let xOffset;
        const cycle = index % 4;

        switch (cycle) {
          case 0:
            xOffset = -maxOffset * 0.3;
            break;
          case 1:
            xOffset = maxOffset * 0.4;
            break;
          case 2:
            xOffset = -maxOffset * 0.2;
            break;
          case 3:
            xOffset = maxOffset * 0.3;
            break;
          default:
            xOffset = 0;
        }

        const x = centerX + xOffset;
        const y = baseY;

        const lessonWidth = 300;
        const margin = 20;

        const finalX = Math.max(
          margin,
          Math.min(finalContainerWidth - lessonWidth - margin, x)
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

  // Load lessons
  const loadLessons = async () => {
    setLoading(true);
    try {
      // Load all lessons at once (no pagination)
      const allLessons = await dataService.getLessons(1, 100); // Get up to 100 lessons
      
      // Transform lessons to match pronunciation format
      const transformedLessons = await Promise.all(
        (allLessons || []).map(async (lesson, index) => {
          const isUnlocked = await dataService.isLessonUnlocked(lesson.id);
          const isCompleted = lesson.isCompleted || lesson.progress === 100;
          
          return {
            id: lesson.id,
            lessonNumber: lesson.id, // Map id to lessonNumber for consistency
            title: lesson.title,
            subtitle: lesson.description || `Learn ${lesson.title.toLowerCase()}`,
            level: index === 0 ? "Beginner" : index < 3 ? "Elementary" : "Intermediate",
            progress: lesson.progress || 0,
            completed: isCompleted,
            locked: !isUnlocked,
            avatar: avatarUrls[(lesson.id - 1) % avatarUrls.length],
            description: lesson.description,
            arabicDescription: lesson.arabicDescription || lesson.description || "تعلم اللغة الإنجليزية", // Fallback to description or default Arabic text
          };
        })
      );

      setLessons(transformedLessons);
      await updateProgress();
    } catch (error) {
      console.error("Error loading lessons:", error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle lesson click - show starting message
  const handleLessonClick = useCallback(
    (lesson, event) => {
      if (!lesson.locked) {
        // Get the lesson node position
        const lessonNode = document.getElementById(
          `lesson-circle-${lesson.id}`
        );
        if (lessonNode) {
          const rect = lessonNode.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;

          // Calculate position: center below the lesson circle
          const cardWidth = 360; // Width of the card
          const padding = 20; // Padding from viewport edges
          const top = rect.bottom + scrollTop + 20; // 20px below the circle
          let left = rect.left + scrollLeft + rect.width / 2 - cardWidth / 2;

          // Ensure card doesn't go off-screen
          const viewportWidth = window.innerWidth;
          const minLeft = padding;
          const maxLeft = viewportWidth - cardWidth - padding;

          // Clamp left position to keep card within bounds
          left = Math.max(minLeft, Math.min(left, maxLeft));

          setMessagePosition({ top: `${top}px`, left: `${left}px` });
        }

        setSelectedLesson(lesson);
        setShowStartingMessage(true);
      }
    },
    []
  );

  // Handle start/restart lesson
  const handleStartLesson = useCallback(() => {
    if (selectedLesson) {
      setShowStartingMessage(false);
      navigate(`/listening/lesson/${selectedLesson.id}`);
    }
  }, [selectedLesson, navigate]);

  // Handle close starting message
  const handleCloseStartingMessage = useCallback(() => {
    setShowStartingMessage(false);
    setSelectedLesson(null);
  }, []);

  // Load lessons on mount
  useEffect(() => {
    loadLessons();
  }, []);

  // Refresh progress when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        await loadLessons();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Calculate lesson positions when lessons change
  useEffect(() => {
    if (lessons.length === 0) return;

    const { positions, containerWidth, containerHeight } =
      calculatePathPositions(lessons);
    setLessonPositions(positions);
    setContainerDimensions({ width: containerWidth, height: containerHeight });

    setTimeout(() => {
      updateXarrow();
    }, 500);
  }, [lessons, calculatePathPositions, updateXarrow]);

  // Update Xarrows when positions change
  useEffect(() => {
    if (lessonPositions.length > 0) {
      setTimeout(() => {
        const allElementsExist = lessons.every((lesson) =>
          document.getElementById(`lesson-circle-${lesson.id}`)
        );

        if (allElementsExist) {
          setElementsReady(true);
          updateXarrow();
        } else {
          setTimeout(() => {
            setElementsReady(true);
            updateXarrow();
          }, 200);
        }
      }, 600);
    }
  }, [lessonPositions, updateXarrow, lessons]);

  // Add window resize listener
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
      {/* Header Banner - Mobile Only */}
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
                    data-lesson-id={lesson.id}
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      position: "absolute",
                    }}
                    onClick={(e) => handleLessonClick(lesson, e)}
                  >
                    {/* Lesson Circle with unique ID for Xarrow */}
                    <div
                      id={`lesson-circle-${lesson.id}`}
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
                        handleLessonClick(lesson, e);
                      }}
                    >
                      {lesson.avatar ? (
                        <div
                          className="lesson-avatar"
                          style={{ backgroundImage: `url(${lesson.avatar})` }}
                        />
                      ) : (
                        <i className="lesson-icon fas fa-book-open" />
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

            {/* Xarrow connections between lessons */}
            {elementsReady &&
              lessonPositions.length > 0 &&
              lessons.map((lesson, index) => {
                if (index >= lessons.length - 1) return null;

                const nextLesson = lessons[index + 1];
                const isPathCompleted = lesson.progress >= 100;

                return (
                  <Xarrow
                    key={`arrow-${lesson.id}-${nextLesson.id}`}
                    start={`lesson-circle-${lesson.id}`}
                    end={`lesson-circle-${nextLesson.id}`}
                    startAnchor="bottom"
                    endAnchor="top"
                    strokeWidth={2}
                    color={isPathCompleted ? "#ffc515" : "#9ca3af"}
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

      {/* Starting Message Card */}
      {selectedLesson && (
        <StartingMessage
          show={showStartingMessage}
          lesson={selectedLesson}
          lessonCompleted={selectedLesson.completed}
          lastScore={selectedLesson.progress}
          onStart={handleStartLesson}
          onClose={handleCloseStartingMessage}
          position={messagePosition}
        />
      )}
    </div>
  );
};
