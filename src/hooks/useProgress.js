import { useEffect, useState } from "react";
import dataService from "../services/dataService";

// Custom hook for managing lesson progress
export const useProgress = (lessonId) => {
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    // Load progress when component mounts
    const loadInitialProgress = async () => {
      await dataService.loadProgress();
      const overallProgress = await dataService.getOverallProgress();
      setProgress(overallProgress);
    };
    loadInitialProgress();
  }, []);

  const updateProgress = async (progress) => {
    await dataService.updateLessonProgress(lessonId, progress);
    // Refresh overall progress
    const overallProgress = await dataService.getOverallProgress();
    setProgress(overallProgress);
  };

  const completeLesson = async (lessonId) => {
    await dataService.completeLesson(lessonId);
    // Refresh overall progress
    const overallProgress = await dataService.getOverallProgress();
    setProgress(overallProgress);
  };

  const getProgress = () => {
    // Return cached progress state
    return progress;
  };

  const refreshProgress = async () => {
    const overallProgress = await dataService.getOverallProgress();
    setProgress(overallProgress);
  };

  return {
    updateProgress,
    completeLesson,
    getProgress,
    refreshProgress,
    progress,
  };
};

export default useProgress;
