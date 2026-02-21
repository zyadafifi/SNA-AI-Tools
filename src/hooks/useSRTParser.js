import { useState, useCallback } from "react";

/**
 * Custom hook for parsing SRT subtitle files
 * Based on the reference implementation in records.js
 */
const useSRTParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Detect if text contains Arabic script
   * @param {string} text - Text to check
   * @returns {boolean}
   */
  const isArabicText = (text) => /[\u0600-\u06FF]/.test(text);

  /**
   * Parse a single SRT block into { startTime, endTime, text }
   * @param {string} block - Raw block content (seq, timestamp line, text lines)
   * @returns {{ startTime: number, endTime: number, text: string }|null}
   */
  const parseBlock = useCallback((block) => {
    const lines = block.trim().split("\n");
    if (lines.length < 3) return null;

    const timingMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );
    if (!timingMatch) return null;

    const startTime =
      parseInt(timingMatch[1]) * 3600000 +
      parseInt(timingMatch[2]) * 60000 +
      parseInt(timingMatch[3]) * 1000 +
      parseInt(timingMatch[4]);
    const endTime =
      parseInt(timingMatch[5]) * 3600000 +
      parseInt(timingMatch[6]) * 60000 +
      parseInt(timingMatch[7]) * 1000 +
      parseInt(timingMatch[8]);
    const text = lines.slice(2).join(" ").trim();

    return text ? { startTime, endTime, text } : null;
  }, []);

  /**
   * Parse SRT content into subtitle objects
   * Handles both formats:
   * - Pronunciation format: 2 blocks (1 English + 1 Arabic with same timestamps)
   * - Listening format: alternating Eng/Ar pairs (blocks 0+1, 2+3, 4+5, ...)
   * @param {string} srtContent - Raw SRT file content
   * @returns {Array} Array of subtitle objects with timing and text
   */
  const parseSRT = useCallback((srtContent) => {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\n\s*\n/).filter(Boolean);

    // Handle pronunciation format (2 blocks: 1 English + 1 Arabic)
    if (blocks.length === 2) {
      const parsed0 = parseBlock(blocks[0]);
      const parsed1 = parseBlock(blocks[1]);
      if (parsed0 && parsed1) {
        const [englishText, arabicText] = isArabicText(parsed0.text)
          ? [parsed1.text, parsed0.text]
          : [parsed0.text, parsed1.text];
        if (englishText && arabicText) {
          subtitles.push({
            startTime: parsed0.startTime,
            endTime: parsed0.endTime,
            englishText,
            arabicText,
            index: 0,
          });
        }
      }
    }
    // Handle listening format: alternating Eng/Ar pairs (any even number of blocks)
    else if (blocks.length >= 2) {
      for (let i = 0; i < blocks.length - 1; i += 2) {
        const parsedA = parseBlock(blocks[i]);
        const parsedB = parseBlock(blocks[i + 1]);
        if (!parsedA || !parsedB) continue;

        const [englishText, arabicText] = isArabicText(parsedA.text)
          ? [parsedB.text, parsedA.text]
          : [parsedA.text, parsedB.text];

        if (englishText || arabicText) {
          subtitles.push({
            startTime: parsedA.startTime,
            endTime: parsedA.endTime,
            englishText: englishText || "",
            arabicText: arabicText || "",
            index: subtitles.length,
          });
        }
      }
    }

    return subtitles;
  }, [parseBlock]);

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
