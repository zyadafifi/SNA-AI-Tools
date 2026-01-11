import { useCallback, useMemo, useState } from "react";
import { useNewSpeechRecognition } from "./useNewSpeechRecognition";
import { usePronunciationScoring } from "./usePronunciationScoring";

/**
 * Controller for MobilePracticeOverlay - SINGLE SOURCE OF TRUTH
 *
 * This hook owns ALL recording / processing / scoring logic.
 * MobilePracticeOverlay is a pure UI component that just renders
 * and calls callbacks from this controller.
 *
 * Usage:
 *   const controller = useMobilePracticeOverlayController();
 *   controller.open({ text: "Hello world", phonetic: "həˈloʊ wɜːrld" });
 *   // ... pass controller props to MobilePracticeOverlay
 */
export const useMobilePracticeOverlayController = (opts = {}) => {
  const { onComplete: onCompleteExternal, onClose: onCloseExternal } = opts;

  // Overlay visibility state
  const [show, setShow] = useState(false);
  const [sentence, setSentence] = useState({ english: "", phonetic: "" });

  // Results state
  const [recognizedText, setRecognizedText] = useState("");
  const [missingWords, setMissingWords] = useState([]);
  const [lastScore, setLastScore] = useState(null);

  // Recording hook
  const {
    isRecording,
    isSpeaking,
    recordedAudio,
    recordingTime,
    speechDetected,
    audioStream,
    isPlayingRecording,
    isRecordingPaused,
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    playRecordedAudio,
    togglePauseRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    cleanup: cleanupRecording,
  } = useNewSpeechRecognition();

  // Scoring hook
  const { isProcessing, calculatePronunciationScore } =
    usePronunciationScoring();

  // Reset results state
  const resetResults = useCallback(() => {
    setRecognizedText("");
    setMissingWords([]);
    setLastScore(null);
  }, []);

  /**
   * Open the overlay with a sentence.
   * Accepts: string | { english, phonetic } | { text, phonetic }
   */
  const open = useCallback(
    (input) => {
      // Normalize input
      let english = "";
      let phonetic = "";

      if (typeof input === "string") {
        english = input;
      } else if (input) {
        english = input.english ?? input.text ?? "";
        phonetic = input.phonetic ?? "";
      }

      setSentence({ english, phonetic });
      setShow(true);

      // Reset state for fresh recording
      resetResults();
      clearRecording();
    },
    [resetResults, clearRecording]
  );

  /**
   * Close the overlay.
   */
  const close = useCallback(async () => {
    setShow(false);
    try {
      await cleanupRecording();
    } catch (e) {
      // ignore cleanup errors
    }
    clearRecording();
    if (onCloseExternal) onCloseExternal();
  }, [cleanupRecording, clearRecording, onCloseExternal]);

  /**
   * Handle mic button click - toggle recording.
   */
  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  /**
   * Handle stop recording - stop and process audio.
   * This is called when user submits their recording.
   */
  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecordingAndGetBlob();
    if (!blob) return null;

    // Process the recording
    const targetText = sentence.english || sentence.text || "";
    const result = await calculatePronunciationScore(blob, targetText);

    // Store results
    setLastScore(result.score);
    setRecognizedText(result.recognizedText || "");
    setMissingWords(result.missingWords || []);

    return result;
  }, [stopRecordingAndGetBlob, sentence, calculatePronunciationScore]);

  /**
   * Handle delete recording - cancel and clear.
   */
  const handleDeleteRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    clearRecording();
    resetResults();
  }, [clearRecording, isRecording, stopRecording, resetResults]);

  /**
   * Handle practice complete - called by overlay when user finishes.
   * Normalizes results and calls external callback.
   */
  const handlePracticeComplete = useCallback(
    (results) => {
      const normalized = {
        score: results?.score ?? lastScore ?? 0,
        recognizedText: results?.recognizedText || recognizedText || "",
        missingWords: results?.missingWords || missingWords || [],
      };

      // Update local state
      setLastScore(normalized.score);
      setRecognizedText(normalized.recognizedText);
      setMissingWords(normalized.missingWords);

      // Call external callback
      if (onCompleteExternal) onCompleteExternal(normalized);

      return normalized;
    },
    [lastScore, recognizedText, missingWords, onCompleteExternal]
  );

  /**
   * Build pronunciationScoreObject in the shape overlay expects.
   */
  const pronunciationScoreObject = useMemo(() => {
    if (lastScore === null) return null;
    return {
      score: lastScore,
      transcriptWords: (recognizedText || "").split(" ").filter(Boolean),
      matchedTranscriptIndices: [],
      missingWords: missingWords,
    };
  }, [lastScore, recognizedText, missingWords]);

  return {
    // Overlay state
    show,
    sentence,
    open,
    close,
    resetResults,

    // Recording state (pass to overlay)
    isRecording,
    isSpeaking,
    recordingTime,
    speechDetected,
    isProcessing,
    audioStream,
    recordedAudio,
    isPlayingRecording,
    isRecordingPaused,

    // Whether user has a recording available
    hasRecording: !!recordedAudio,

    // Speech helpers
    speakText,
    stopSpeaking,

    // Recording actions (internal use)
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    clearRecording,
    cleanup: cleanupRecording,

    // Results
    lastScore,
    recognizedText,
    missingWords,
    pronunciationScoreObject,

    // Handlers for overlay callbacks
    handleMicClick,
    handleStopRecording,
    handleDeleteRecording,
    playRecordedAudio,
    togglePauseRecordedAudio,
    handlePracticeComplete,
  };
};
