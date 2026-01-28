import { useState, useEffect, useCallback, useRef } from "react";
import useSRTParser from "./useSRTParser";

/**
 * Custom hook for synchronizing subtitles with video playback
 * Based on the reference implementation in records.js
 */
const useSubtitleSync = (videoRef) => {
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [isSubtitlesActive, setIsSubtitlesActive] = useState(false);
  const [subtitleError, setSubtitleError] = useState(null);

  const {
    loadSRTFile,
    parseSRT,
    getCurrentSubtitle,
    isLoading: srtLoading,
    error: srtError,
  } = useSRTParser();

  const syncIntervalRef = useRef(null);
  const currentSubtitleIndexRef = useRef(-1);

  /**
   * Update current subtitle based on video time
   */
  const updateSubtitles = useCallback(() => {
    if (!videoRef?.current || !subtitles.length || !isSubtitlesActive) return;

    const video = videoRef.current;
    const currentTime = video.currentTime;

    const subtitle = getCurrentSubtitle(subtitles, currentTime);

    // Only update if subtitle changed to prevent unnecessary re-renders
    const newSubtitleIndex = subtitle ? subtitle.index : -1;
    if (newSubtitleIndex !== currentSubtitleIndexRef.current) {
      currentSubtitleIndexRef.current = newSubtitleIndex;
      setCurrentSubtitle(subtitle);
    }
  }, [subtitles, isSubtitlesActive, getCurrentSubtitle, videoRef]);

  /**
   * Start subtitle synchronization with video
   */
  const startSubtitleSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    setIsSubtitlesActive(true);

    syncIntervalRef.current = setInterval(() => {
      updateSubtitles();
    }, 100); // Update every 100ms for smooth synchronization
  }, [updateSubtitles]);

  /**
   * Stop subtitle synchronization
   */
  const stopSubtitleSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    setIsSubtitlesActive(false);
  }, []);

  /**
   * Load subtitles for current sentence (pronunciation tool)
   * @param {number} lessonNumber - Lesson number
   * @param {number} sentenceIndex - Sentence index (1-based)
   */
  const loadSubtitlesForSentence = useCallback(
    async (lessonNumber, sentenceIndex) => {
      setSubtitleError(null);

      try {
        // Stop current sync while loading
        stopSubtitleSync();

        const loadedSubtitles = await loadSRTFile(
          lessonNumber,
          sentenceIndex,
          "pronunciation"
        );

        if (loadedSubtitles && loadedSubtitles.length > 0) {
          setSubtitles(loadedSubtitles);
          setCurrentSubtitle(null);
          currentSubtitleIndexRef.current = -1;

          // Start sync after loading
          startSubtitleSync();
        } else {
          setSubtitles([]);
          setCurrentSubtitle(null);
        }
      } catch (error) {
        setSubtitleError(error.message);
        setSubtitles([]);
        setCurrentSubtitle(null);
      }
    },
    [loadSRTFile, startSubtitleSync, stopSubtitleSync]
  );

  /**
   * Load subtitles for listening tool question
   * @param {number} lessonId - Lesson ID
   * @param {number} questionId - Question ID
   */
  const loadSubtitlesForQuestion = useCallback(
    async (lessonId, questionId) => {
      setSubtitleError(null);

      try {
        // Stop current sync while loading
        stopSubtitleSync();

        // Create a custom loader for listening tool naming convention
        const fileName = `lesson${lessonId}_question${questionId}.srt`;
        const filePath = `/assets/subtitles/listening/${fileName}`;

        const response = await fetch(filePath);

        if (!response.ok) {
          throw new Error(
            `Failed to load SRT file: ${response.status} ${response.statusText}`
          );
        }

        const srtContent = await response.text();

        if (!srtContent.trim()) {
          throw new Error("SRT file is empty");
        }

        const loadedSubtitles = parseSRT(srtContent);

        if (loadedSubtitles && loadedSubtitles.length > 0) {
          setSubtitles(loadedSubtitles);
          setCurrentSubtitle(null);
          currentSubtitleIndexRef.current = -1;

          // Start sync after loading
          startSubtitleSync();
        } else {
          setSubtitles([]);
          setCurrentSubtitle(null);
        }
      } catch (error) {
        console.error("Error loading subtitles:", error.message);
        setSubtitleError(error.message);
        setSubtitles([]);
        setCurrentSubtitle(null);
      }
    },
    [parseSRT, startSubtitleSync, stopSubtitleSync]
  );

  /**
   * Clear all subtitles and stop sync
   */
  const clearSubtitles = useCallback(() => {
    stopSubtitleSync();
    setSubtitles([]);
    setCurrentSubtitle(null);
    setSubtitleError(null);
    currentSubtitleIndexRef.current = -1;
  }, [stopSubtitleSync]);

  /**
   * Handle video events
   */
  const handleVideoPlay = useCallback(() => {
    if (subtitles.length > 0) {
      startSubtitleSync();
    }
  }, [subtitles.length, startSubtitleSync]);

  const handleVideoPause = useCallback(() => {
    stopSubtitleSync();
  }, [stopSubtitleSync]);

  const handleVideoEnded = useCallback(() => {
    stopSubtitleSync();
    setCurrentSubtitle(null);
  }, [stopSubtitleSync]);

  const handleVideoSeeked = useCallback(() => {
    // Update subtitle immediately after seeking
    if (subtitles.length > 0 && videoRef?.current) {
      const subtitle = getCurrentSubtitle(
        subtitles,
        videoRef.current.currentTime
      );
      setCurrentSubtitle(subtitle);
      currentSubtitleIndexRef.current = subtitle ? subtitle.index : -1;
    }
  }, [subtitles, getCurrentSubtitle, videoRef]);

  // Attach video event listeners
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    video.addEventListener("play", handleVideoPlay);
    video.addEventListener("pause", handleVideoPause);
    video.addEventListener("ended", handleVideoEnded);
    video.addEventListener("seeked", handleVideoSeeked);

    return () => {
      video.removeEventListener("play", handleVideoPlay);
      video.removeEventListener("pause", handleVideoPause);
      video.removeEventListener("ended", handleVideoEnded);
      video.removeEventListener("seeked", handleVideoSeeked);
    };
  }, [
    videoRef,
    handleVideoPlay,
    handleVideoPause,
    handleVideoEnded,
    handleVideoSeeked,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSubtitleSync();
    };
  }, [stopSubtitleSync]);

  return {
    currentSubtitle,
    subtitles,
    isSubtitlesActive,
    isLoading: srtLoading,
    error: subtitleError || srtError,
    loadSubtitlesForSentence,
    loadSubtitlesForQuestion,
    clearSubtitles,
    startSubtitleSync,
    stopSubtitleSync,
  };
};

export default useSubtitleSync;
