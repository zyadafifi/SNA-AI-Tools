import { useState, useCallback } from "react";

/**
 * Custom hook for parsing SRT subtitle files
 * Based on the reference implementation in records.js
 */
const useSRTParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Parse SRT content into subtitle objects
   * Handles both formats:
   * - New pronunciation format: 2 blocks (1 English + 1 Arabic with same timestamps)
   * - Listening format: 6+ blocks (3 English + 3 Arabic with different timestamps)
   * @param {string} srtContent - Raw SRT file content
   * @returns {Array} Array of subtitle objects with timing and text
   */
  const parseSRT = useCallback((srtContent) => {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\n\s*\n/);

    // Handle new pronunciation format (2 blocks: 1 English + 1 Arabic)
    if (blocks.length === 2) {
      const englishBlock = blocks[0];
      const arabicBlock = blocks[1];

      if (englishBlock && arabicBlock) {
        const englishLines = englishBlock.split("\n");
        const arabicLines = arabicBlock.split("\n");

        if (englishLines.length >= 3 && arabicLines.length >= 3) {
          const timingLine = englishLines[1];
          const timingMatch = timingLine.match(
            /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
          );

          if (timingMatch) {
            const startTime = parseTimeToMs(
              timingMatch[1],
              timingMatch[2],
              timingMatch[3],
              timingMatch[4]
            );
            const endTime = parseTimeToMs(
              timingMatch[5],
              timingMatch[6],
              timingMatch[7],
              timingMatch[8]
            );

            const englishText = englishLines.slice(2).join(" ").trim();
            const arabicText = arabicLines.slice(2).join(" ").trim();

            if (englishText && arabicText) {
              subtitles.push({
                startTime,
                endTime,
                englishText,
                arabicText,
                index: 0,
              });
            }
          }
        }
      }
    }
    // Handle listening format (6+ blocks: 3 English + 3 Arabic)
    else if (blocks.length >= 6) {
      const englishBlocks = blocks.slice(0, 3);
      const arabicBlocks = blocks.slice(3, 6);

      for (let i = 0; i < 3; i++) {
        const englishBlock = englishBlocks[i];
        const arabicBlock = arabicBlocks[i];

        if (englishBlock && arabicBlock) {
          const englishLines = englishBlock.split("\n");
          const arabicLines = arabicBlock.split("\n");

          if (englishLines.length >= 3 && arabicLines.length >= 3) {
            const timingLine = englishLines[1];
            const timingMatch = timingLine.match(
              /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
            );

            if (timingMatch) {
              const startTime = parseTimeToMs(
                timingMatch[1],
                timingMatch[2],
                timingMatch[3],
                timingMatch[4]
              );
              const endTime = parseTimeToMs(
                timingMatch[5],
                timingMatch[6],
                timingMatch[7],
                timingMatch[8]
              );

              const englishText = englishLines.slice(2).join(" ").trim();
              const arabicText = arabicLines.slice(2).join(" ").trim();

              if (englishText && arabicText) {
                subtitles.push({
                  startTime,
                  endTime,
                  englishText,
                  arabicText,
                  index: subtitles.length,
                });
              }
            }
          }
        }
      }
    } else {
      console.warn(
        `SRT file has unexpected format with ${blocks.length} blocks (expected 2 or 6+)`
      );
    }

    return subtitles;
  }, []);

  /**
   * Convert time components to milliseconds
   * @param {string} hours - Hours component
   * @param {string} minutes - Minutes component
   * @param {string} seconds - Seconds component
   * @param {string} milliseconds - Milliseconds component
   * @returns {number} Total time in milliseconds
   */
  const parseTimeToMs = (hours, minutes, seconds, milliseconds) => {
    return (
      parseInt(hours) * 3600000 +
      parseInt(minutes) * 60000 +
      parseInt(seconds) * 1000 +
      parseInt(milliseconds)
    );
  };

  /**
   * Load and parse SRT file from public/subtitles directory
   * @param {number} lessonNumber - Lesson number
   * @param {number} sentenceIndex - Sentence index (1-based)
   * @param {string} folderPath - Subfolder path (default: "pronunciation")
   * @returns {Promise<Array>} Promise resolving to parsed subtitles array
   */
  const loadSRTFile = useCallback(
    async (
      lessonNumber,
      sentenceIndex,
      folderPath = "pronunciation"
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        // Construct SRT file path using simplified naming convention
        const fileName = `lesson${lessonNumber}_sentence${sentenceIndex}.srt`;
        const filePath = `/assets/subtitles/${folderPath}/${fileName}`;

        console.log(`Loading SRT file: ${filePath}`);

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

        const parsedSubtitles = parseSRT(srtContent);

        setIsLoading(false);
        return parsedSubtitles;
      } catch (err) {
        console.error(`Error loading SRT file:`, err);
        setError(err.message);
        setIsLoading(false);
        return [];
      }
    },
    [parseSRT]
  );

  /**
   * Find the current subtitle based on video time
   * @param {Array} subtitles - Array of parsed subtitles
   * @param {number} currentTime - Current video time in seconds
   * @returns {Object|null} Current subtitle object or null
   */
  const getCurrentSubtitle = useCallback((subtitles, currentTime) => {
    if (!subtitles || subtitles.length === 0) return null;

    const currentTimeMs = currentTime * 1000;

    return (
      subtitles.find(
        (subtitle) =>
          currentTimeMs >= subtitle.startTime &&
          currentTimeMs <= subtitle.endTime
      ) || null
    );
  }, []);

  return {
    isLoading,
    error,
    parseSRT,
    loadSRTFile,
    getCurrentSubtitle,
  };
};

export default useSRTParser;
