import { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { RiPlayCircleFill } from "react-icons/ri";
import { IoIosCheckmarkCircle } from "react-icons/io";

// FontAwesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faBook,
  faHandshake,
  faComments,
  faGraduationCap,
  faCoffee,
  faConciergeBell,
  faMugHot,
  faList,
  faCogs,
  faBlender,
  faHeart,
  faBookOpen,
  faShoppingBag,
  faSearch,
  faStore,
  faCalendarCheck,
  faUtensils,
  faWineGlass,
  faBus,
  faTaxi,
  faPlane,
  faUserMd,
  faPills,
  faAmbulance,
  faBriefcase,
  faUsers,
  faChartLine,
  faFilm,
  faDumbbell,
  faMusic,
  faSpinner,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

import "./TopicsPage.css";

export const TopicsPage = () => {
  const navigate = useNavigate();
  const { lessonNumber } = useParams();
  const {
    isConversationCompleted,
    isTopicCompleted,
    calculateTopicProgress,
    updateTopicProgress,
    calculateLessonProgressByTopics,
  } = useProgress();

  // Map icon names from data.json to FontAwesome icons
  const getTopicIcon = (iconName) => {
    const iconMap = {
      "fas fa-handshake": faHandshake,
      "fas fa-comments": faComments,
      "fas fa-graduation-cap": faGraduationCap,
      "fas fa-coffee": faCoffee,
      "fas fa-concierge-bell": faConciergeBell,
      "fas fa-mug-hot": faMugHot,
      "fas fa-list": faList,
      "fas fa-cogs": faCogs,
      "fas fa-blender": faBlender,
      "fas fa-heart": faHeart,
      "fas fa-book-open": faBookOpen,
      "fas fa-shopping-bag": faShoppingBag,
      "fas fa-search": faSearch,
      "fas fa-store": faStore,
      "fas fa-calendar-check": faCalendarCheck,
      "fas fa-utensils": faUtensils,
      "fas fa-wine-glass": faWineGlass,
      "fas fa-bus": faBus,
      "fas fa-taxi": faTaxi,
      "fas fa-plane": faPlane,
      "fas fa-user-md": faUserMd,
      "fas fa-pills": faPills,
      "fas fa-ambulance": faAmbulance,
      "fas fa-briefcase": faBriefcase,
      "fas fa-users": faUsers,
      "fas fa-chart-line": faChartLine,
      "fas fa-film": faFilm,
      "fas fa-dumbbell": faDumbbell,
      "fas fa-music": faMusic,
    };

    return iconMap[iconName] || faBook; // Default to book icon if not found
  };

  // Map conversation titles to appropriate icons
  const getConversationIcon = (conversationTitle) => {
    const title = conversationTitle.toLowerCase();

    // Welcome & Introduction
    if (title.includes("welcome") || title.includes("introduction")) {
      return faHandshake;
    }

    // Greetings
    if (title.includes("greeting") || title.includes("hello")) {
      return faHandshake;
    }

    // Daily expressions
    if (title.includes("daily") || title.includes("expression")) {
      return faComments;
    }

    // Common phrases
    if (title.includes("common") || title.includes("phrase")) {
      return faComments;
    }

    // Complex topics
    if (title.includes("complex") || title.includes("advanced")) {
      return faGraduationCap;
    }

    // Professional
    if (title.includes("professional") || title.includes("business")) {
      return faBriefcase;
    }

    // Coffee related
    if (title.includes("coffee") || title.includes("order")) {
      return faCoffee;
    }

    // Service
    if (title.includes("service") || title.includes("payment")) {
      return faConciergeBell;
    }

    // Menu/Selection
    if (title.includes("menu") || title.includes("selection")) {
      return faList;
    }

    // Varieties/Types
    if (
      title.includes("variety") ||
      title.includes("type") ||
      title.includes("origin")
    ) {
      return faCoffee;
    }

    // Preparation
    if (
      title.includes("preparation") ||
      title.includes("brewing") ||
      title.includes("equipment")
    ) {
      return faCogs;
    }

    // Smoothie
    if (title.includes("smoothie") || title.includes("blender")) {
      return faBlender;
    }

    // Health
    if (
      title.includes("health") ||
      title.includes("nutrition") ||
      title.includes("diet")
    ) {
      return faHeart;
    }

    // Recipe
    if (
      title.includes("recipe") ||
      title.includes("making") ||
      title.includes("tip")
    ) {
      return faBookOpen;
    }

    // Shopping
    if (
      title.includes("shopping") ||
      title.includes("buy") ||
      title.includes("list")
    ) {
      return faShoppingBag;
    }

    // Finding items
    if (title.includes("find") || title.includes("search")) {
      return faSearch;
    }

    // Product
    if (
      title.includes("product") ||
      title.includes("brand") ||
      title.includes("information")
    ) {
      return faStore;
    }

    // Experience
    if (
      title.includes("experience") ||
      title.includes("service") ||
      title.includes("customer")
    ) {
      return faStore;
    }

    // Reservation
    if (
      title.includes("reservation") ||
      title.includes("appointment") ||
      title.includes("booking")
    ) {
      return faCalendarCheck;
    }

    // Food ordering
    if (
      title.includes("order") ||
      title.includes("food") ||
      title.includes("menu")
    ) {
      return faUtensils;
    }

    // Dietary requirements
    if (
      title.includes("dietary") ||
      title.includes("allergy") ||
      title.includes("requirement")
    ) {
      return faUtensils;
    }

    // Dining experience
    if (
      title.includes("dining") ||
      title.includes("service") ||
      title.includes("bill")
    ) {
      return faWineGlass;
    }

    // Transportation
    if (
      title.includes("bus") ||
      title.includes("transport") ||
      title.includes("direction")
    ) {
      return faBus;
    }

    // Taxi/Rideshare
    if (
      title.includes("taxi") ||
      title.includes("uber") ||
      title.includes("ride")
    ) {
      return faTaxi;
    }

    // Airport/Travel
    if (
      title.includes("airport") ||
      title.includes("flight") ||
      title.includes("travel")
    ) {
      return faPlane;
    }

    // Medical
    if (
      title.includes("doctor") ||
      title.includes("appointment") ||
      title.includes("medical")
    ) {
      return faUserMd;
    }

    // Pharmacy
    if (
      title.includes("pharmacy") ||
      title.includes("prescription") ||
      title.includes("medication")
    ) {
      return faPills;
    }

    // Emergency
    if (
      title.includes("emergency") ||
      title.includes("ambulance") ||
      title.includes("hospital")
    ) {
      return faAmbulance;
    }

    // Work/Interview
    if (
      title.includes("interview") ||
      title.includes("job") ||
      title.includes("work")
    ) {
      return faBriefcase;
    }

    // Office/Meeting
    if (
      title.includes("meeting") ||
      title.includes("office") ||
      title.includes("team")
    ) {
      return faUsers;
    }

    // Email/Communication
    if (title.includes("email") || title.includes("communication")) {
      return faComments;
    }

    // Presentation
    if (
      title.includes("presentation") ||
      title.includes("chart") ||
      title.includes("business")
    ) {
      return faChartLine;
    }

    // Movies/Entertainment
    if (
      title.includes("movie") ||
      title.includes("cinema") ||
      title.includes("film")
    ) {
      return faFilm;
    }

    // Sports/Fitness
    if (
      title.includes("sport") ||
      title.includes("fitness") ||
      title.includes("gym") ||
      title.includes("workout")
    ) {
      return faDumbbell;
    }

    // Music/Arts
    if (
      title.includes("music") ||
      title.includes("art") ||
      title.includes("gallery")
    ) {
      return faMusic;
    }

    // Default to comment dots for general conversations
    return faCommentDots;
  };

  const [currentLesson, setCurrentLesson] = useState(null);
  const [topicsData, setTopicsData] = useState([]);
  const [lessonsData, setLessonsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // Add topics-page class to body
  useEffect(() => {
    document.body.classList.add("topics-page");
    return () => {
      document.body.classList.remove("topics-page");
    };
  }, []);

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        const response = await fetch("/assets/data.json");
        const data = await response.json();
        setLessonsData(data);
      } catch (error) {
        console.error("Error loading lessons data:", error);
      }
    };
    loadLessonsData();
  }, []);

  // Load lesson data and update topic progress
  useEffect(() => {
    const loadLessonData = async () => {
      if (!lessonsData?.lessons) return;

      try {
        setLoading(true);
        const lessonNum = parseInt(lessonNumber) || 1;
        const lesson = lessonsData.lessons.find(
          (lesson) => lesson.lessonNumber === lessonNum
        );

        if (!lesson) {
          console.error("Lesson not found:", lessonNum);
          return;
        }

        setCurrentLesson(lesson);
        setTopicsData(lesson.topics || []);

        // Update progress for all topics in this lesson
        lesson.topics?.forEach((topic) => {
          updateTopicProgress(topic.id, topic);
        });
      } catch (error) {
        console.error("Error loading lesson data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [lessonNumber, lessonsData, updateTopicProgress]);

  // Force styles with useLayoutEffect (before paint)
  useLayoutEffect(() => {
    const forceStyles = () => {
      // إنشاء CSS قوي
      const existingStyle = document.getElementById("force-topic-styles");
      if (existingStyle) existingStyle.remove();

      const style = document.createElement("style");
      style.id = "force-topic-styles";
      style.innerHTML = `
          .simple-topic-title {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: #2c3e50 !important;
            font-size: 1.3rem !important;
            font-weight: 600 !important;
            margin: 0 0 0.5rem 0 !important;
            line-height: 1.4 !important;
            text-align: left !important;
            font-family: inherit !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            text-decoration: none !important;
            text-transform: none !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
            white-space: normal !important;
            position: static !important;
            z-index: auto !important;
            width: auto !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
          
          .simple-topic-description {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: #6c757d !important;
            font-size: 0.9rem !important;
            font-weight: normal !important;
            margin: 0 !important;
            line-height: 1.4 !important;
            text-align: left !important;
            font-family: inherit !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            text-decoration: none !important;
            text-transform: none !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
            white-space: normal !important;
            position: static !important;
            z-index: auto !important;
            width: auto !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
      `;

      document.head.appendChild(style);
    };

    forceStyles();
  }, [topicsData]);

  // Calculate lesson progress based on topic completion
  const calculateLessonProgress = () => {
    if (!currentLesson || !lessonsData) return 0;
    return calculateLessonProgressByTopics(
      currentLesson.lessonNumber,
      lessonsData.lessons
    );
  };

  // Check if topic is locked (must complete previous topic first)
  const isTopicLocked = (topic, index) => {
    if (index === 0) return false; // First topic is always unlocked
    const previousTopic = topicsData[index - 1];
    return !isTopicCompleted(previousTopic.id);
  };

  // Calculate topic progress using the context function
  const getTopicProgress = (topic) => {
    return calculateTopicProgress(topic.id, topic);
  };

  // Toggle topic expansion
  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  // Open conversation
  const openConversation = (conversationId, topicId) => {
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      navigate(
        `/pronounce/mobile/${currentLesson.lessonNumber}/${topicId}/${conversationId}`
      );
    } else {
      navigate(
        `/pronounce/desktop/${currentLesson.lessonNumber}/${topicId}/${conversationId}`
      );
    }
  };

  // Handle back button
  const handleBackClick = () => {
    navigate("/pronounce/home");
  };

  // Render topics
  const renderTopics = () => {
    if (!topicsData.length) {
      return <div className="no-topics">No topics available</div>;
    }

    return topicsData.map((topic, index) => {
      const isLocked = isTopicLocked(topic, index);
      const isCompleted = isTopicCompleted(topic);
      const progress = getTopicProgress(topic);
      const isExpanded = expandedTopics.has(topic.id);

      return (
        <div
          key={topic.id}
          className={`topic-card ${
            isLocked ? "locked" : isCompleted ? "completed" : "available"
          }`}
          data-topic-id={topic.id}
        >
          <div
            className="topic-header"
            onClick={() => !isLocked && toggleTopic(topic.id)}
            style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
          >
            <div className="topic-icon">
              <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
            </div>
            <div className="topic-info">
              <div
                className="simple-topic-title"
                dangerouslySetInnerHTML={{
                  __html: topic.title || `Topic ${index + 1}`,
                }}
              />
              <div
                className="simple-topic-description"
                dangerouslySetInnerHTML={{
                  __html: topic.description || "No description available",
                }}
              />
            </div>
            <div className="topic-actions">
              {isLocked ? (
                <FontAwesomeIcon icon={faLock} className="lock-icon" />
              ) : (
                <span className="arrow-icon">
                  {isExpanded ? (
                    <IoIosArrowDown size={26} />
                  ) : (
                    <IoIosArrowForward size={26} />
                  )}
                </span>
              )}
            </div>
          </div>

          {!isLocked && (
            <div className={`topic-content ${isExpanded ? "expanded" : ""}`}>
              <div className="conversations-header">
                <span className="conversations-count">
                  Conversations ({topic.conversations?.length || 0})
                </span>
              </div>

              <div className="conversations-list">
                {topic.conversations?.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="conversation-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      openConversation(conversation.id, topic.id);
                    }}
                  >
                    <div className="conversation-icon">
                      <FontAwesomeIcon
                        icon={getConversationIcon(conversation.title)}
                      />
                    </div>
                    <div className="conversation-info">
                      <h4 className="conversation-title">
                        {conversation.title}
                      </h4>
                      <p className="conversation-description">
                        {conversation.description}
                      </p>
                    </div>
                    <div className="conversation-status">
                      {isConversationCompleted(conversation.id) ? (
                        <span className="completed-text completed-icon">
                          <IoIosCheckmarkCircle className={"text-2xl"} />
                        </span>
                      ) : (
                        <span className="play-icon">
                          <RiPlayCircleFill className={"text-2xl"} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="topic-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progress}% Complete</span>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="topics-page">
        <main className="main-container">
          <div className="loading-indicator">
            <FontAwesomeIcon icon={faSpinner} spin />
            <p>Loading topics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="topics-page">
        <main className="main-container">
          <div className="no-topics">Lesson not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="topics-page">
      <main className="main-container">
        {/* Lesson Header */}
        <div className="lesson-header">
          <button
            onClick={handleBackClick}
            title="Back to Lessons"
            style={{
              // Complete inline styles - no CSS dependencies
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.7)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flexShrink: "0",
              userSelect: "none",
              outline: "none",
              padding: "0",
              margin: "0",
              marginTop: "-0.5rem",
              position: "relative",
              zIndex: "1000",
              backdropFilter: "blur(10px)",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 0, 0, 0.9)";
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 0, 0, 0.7)";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "scale(1.1)";
            }}
          >
            <span>
              <FaArrowLeftLong size={20} />
            </span>
          </button>
          <div className="lesson-header-content">
            <h2>Lesson {currentLesson.lessonNumber}</h2>
            <p>{currentLesson.title}</p>
            <div className="lesson-progress">
              <span>{calculateLessonProgress()}% Complete</span>
            </div>
          </div>
        </div>

        {/* Topics Container */}
        <div className="topics-container">{renderTopics()}</div>
      </main>
    </div>
  );
};
