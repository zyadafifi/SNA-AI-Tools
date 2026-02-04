import { createContext, useContext, useState, useEffect, useMemo } from "react";

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

export const WritingProgressProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({});

  // Fetch topics from data.json on mount
  useEffect(() => {
    fetch("/assets/writingData.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load topics data");
        return res.json();
      })
      .then((data) => {
        setTopics(data.topics);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Generate default progress dynamically from topics
  const defaultProgress = useMemo(() => {
    if (topics.length === 0) return {};

    return topics.reduce((acc, topic, index) => {
      acc[topic.id] = {
        isUnlocked: index === 0, // Only first topic unlocked
        phase: "not-started",
        isInProgress: false,
      };
      return acc;
    }, {});
  }, [topics]);

  // Initialize progress from localStorage after topics are loaded
  useEffect(() => {
    if (topics.length === 0) return;

    try {
      const savedProgress = localStorage.getItem("sna-writing-tool-progress");
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        // Merge with default to ensure all topics exist
        setProgress({ ...defaultProgress, ...parsed });
      } else {
        setProgress(defaultProgress);
      }
    } catch (error) {
      console.error("Error loading progress from localStorage:", error);
      setProgress(defaultProgress);
    }
  }, [defaultProgress, topics.length]);

  const updateProgress = (topicId, updates) => {
    setProgress((prev) => {
      const newProgress = {
        ...prev,
        [topicId]: {
          ...prev[topicId],
          ...updates,
        },
      };

      // Save to localStorage
      try {
        localStorage.setItem(
          "sna-writing-tool-progress",
          JSON.stringify(newProgress)
        );
      } catch (error) {
        console.error("Error saving progress to localStorage:", error);
      }

      return newProgress;
    });
  };

  const advancePhase = (topicId) => {
    const currentTopic = progress[topicId];
    if (!currentTopic) return;

    let nextPhase;
    switch (currentTopic.phase) {
      case "not-started":
        nextPhase = "article-read";
        break;
      case "article-read":
        nextPhase = "questions-completed";
        // Unlock next topic
        unlockNextTopic(topicId);
        break;
      default:
        return;
    }

    updateProgress(topicId, { phase: nextPhase });
  };

  const unlockNextTopic = (completedTopicId) => {
    const topicOrder = topics.map((t) => t.id);
    const currentIndex = topicOrder.indexOf(completedTopicId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < topicOrder.length) {
      const nextTopicId = topicOrder[nextIndex];
      updateProgress(nextTopicId, { isUnlocked: true });
    }
  };

  const startTopic = (topicId) => {
    updateProgress(topicId, {
      isInProgress: true,
      phase: "not-started",
    });
  };

  const getTopicProgress = (topicId) => {
    return (
      progress[topicId] || {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      }
    );
  };

  const resetProgress = () => {
    try {
      localStorage.removeItem("sna-writing-tool-progress");
      setProgress(defaultProgress);
    } catch (error) {
      console.error("Error resetting progress:", error);
    }
  };

  // Show loading state while fetching topics
  if (loading) {
    return (
      <ProgressContext.Provider value={{ loading: true, error: null }}>
        {children}
      </ProgressContext.Provider>
    );
  }

  // Show error state if loading failed
  if (error) {
    return (
      <ProgressContext.Provider value={{ loading: false, error }}>
        {children}
      </ProgressContext.Provider>
    );
  }

  const value = {
    progress,
    topics,
    loading: false,
    error: null,
    updateProgress,
    advancePhase,
    startTopic,
    getTopicProgress,
    resetProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
