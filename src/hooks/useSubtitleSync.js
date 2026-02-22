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
    parseSRT,
    getCurrentSubtitle,
    isLoading: srtLoading,
    error: srtError,
  } = useSRTParser();

  const syncIntervalRef = useRef(null);
  const currentSubtitleIndexRef = useRef(-1);
  const subtitlesRef = useRef([]);

  // Keep ref in sync so interval always reads latest subtitles (avoids stale closure)
  useEffect(() => {
    subtitlesRef.current = subtitles;
  }, [subtitles]);

  /**
   * Core update logic: read from ref and sync current subtitle to state
   * @param {boolean} skipActiveCheck - If true, run even when isSubtitlesActive is false (e.g. after load)
   */
  const performSubtitleUpdate = useCallback(
    (skipActiveCheck = false) => {
      const subs = subtitlesRef.current;
      if (!videoRef?.current || !subs?.length) return;
      if (!skipActiveCheck && !isSubtitlesActive) return;

      const currentTime = videoRef.current.currentTime;
      const subtitle = getCurrentSubtitle(subs, currentTime);

      const newSubtitleIndex = subtitle ? subtitle.index : -1;
      if (newSubtitleIndex !== currentSubtitleIndexRef.current) {
        currentSubtitleIndexRef.current = newSubtitleIndex;
        setCurrentSubtitle(subtitle);
      }
    },
    [isSubtitlesActive, getCurrentSubtitle, videoRef]
  );

  /**
   * Update current subtitle based on video time (reads from ref to avoid stale closure)
   */
  const updateSubtitles = useCallback(() => {
    performSubtitleUpdate(false);
  }, [performSubtitleUpdate]);

  /**
   * Start subtitle synchronization with video
   */
  const startSubtitleSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    setIsSubtitlesActive(true);

    syncIntervalRef.current = setInterval(() => {
      performSubtitleUpdate(false);
    }, 50);
  }, [performSubtitleUpdate]);

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
   * Same methodology as loadSubtitlesForQuestion: direct fetch + parseSRT
   * @param {number} lessonNumber - Lesson number
   * @param {number} sentenceIndex - Sentence index (1-based)
   */
  const loadSubtitlesForSentence = useCallback(
    async (lessonNumber, sentenceIndex) => {
      setSubtitleError(null);

      try {
        // Stop current sync while loading
        stopSubtitleSync();

        const fileName = `lesson${lessonNumber}_sentence${sentenceIndex}.srt`;
        const filePath = `/assets/subtitles/pronunciation/${fileName}`;

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
          subtitlesRef.current = loadedSubtitles;
          setSubtitles(loadedSubtitles);
          setCurrentSubtitle(null);
          currentSubtitleIndexRef.current = -1;

          startSubtitleSync();
          performSubtitleUpdate(true);
        } else {
          subtitlesRef.current = [];
          setSubtitles([]);
          setCurrentSubtitle(null);
        }
      } catch (error) {
        console.error("Error loading subtitles:", error.message);
        setSubtitleError(error.message);
        subtitlesRef.current = [];
        setSubtitles([]);
        setCurrentSubtitle(null);
      }
    },
    [parseSRT, startSubtitleSync, stopSubtitleSync, performSubtitleUpdate]
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
          subtitlesRef.current = loadedSubtitles;
          setSubtitles(loadedSubtitles);
          setCurrentSubtitle(null);
          currentSubtitleIndexRef.current = -1;

          startSubtitleSync();
          performSubtitleUpdate(true);
        } else {
          subtitlesRef.current = [];
          setSubtitles([]);
          setCurrentSubtitle(null);
        }
      } catch (error) {
        console.error("Error loading subtitles:", error.message);
        setSubtitleError(error.message);
        subtitlesRef.current = [];
        setSubtitles([]);
        setCurrentSubtitle(null);
      }
    },
    [parseSRT, startSubtitleSync, stopSubtitleSync, performSubtitleUpdate]
  );

  /**
   * Clear all subtitles and stop sync
   */
  const clearSubtitles = useCallback(() => {
    stopSubtitleSync();
    subtitlesRef.current = [];
    setSubtitles([]);
    setCurrentSubtitle(null);
    setSubtitleError(null);
    currentSubtitleIndexRef.current = -1;
  }, [stopSubtitleSync]);

  /**
   * Handle video events
   */
  const handleVideoPlay = useCallback(() => {
    if (subtitlesRef.current.length > 0) {
      startSubtitleSync();
    }
  }, [startSubtitleSync]);

  const handleVideoPause = useCallback(() => {
    stopSubtitleSync();
  }, [stopSubtitleSync]);

  const handleVideoEnded = useCallback(() => {
    stopSubtitleSync();
    setCurrentSubtitle(null);
  }, [stopSubtitleSync]);

  const handleVideoSeeked = useCallback(() => {
    const subs = subtitlesRef.current;
    if (subs?.length > 0 && videoRef?.current) {
      const subtitle = getCurrentSubtitle(
        subs,
        videoRef.current.currentTime
      );
      setCurrentSubtitle(subtitle);
      currentSubtitleIndexRef.current = subtitle ? subtitle.index : -1;
    }
  }, [getCurrentSubtitle, videoRef]);

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
