import { useState, useEffect, useRef } from "react";
import AudioControls from "../AudioControls";
import ExerciseArea from "../ExerciseArea";
import FeedbackDisplay from "../FeedbackDisplay";
import MobilePracticeOverlay from "../../Pronunce/mobile/MobilePracticeOverlay";
import MobileResultsDialog from "../../Pronunce/mobile/MobileResultsDialog";
import MobileReplayOverlay from "../../Pronunce/mobile/MobileReplayOverlay";
import ListeningProgressBar from "../ListeningProgressBar";
import soundEffects from "../../../utils/soundEffects";
import dataService from "../../../services/dataService";
import useSubtitleSync from "../../../hooks/useSubtitleSync";
import { useMobilePracticeOverlayController } from "../../../hooks/useMobilePracticeOverlayController";

// Supports two modes:
// 1) Legacy lesson/exercises flow (lesson prop)
// 2) Per-question flow (correctText + onListenAgain + onComplete)
const DictationPhase = ({
  lesson,
  correctText,
  onListenAgain,
  onComplete,
  isDesktop = false,
  onScoreUpdate,
  onAnswerUpdate,
  lessonId,
  questionId,
  currentPart = 0,
  totalParts = 5,
}) => {
  // Helper functions to extract English text from subtitles
  const hasArabic = (s = "") => /[\u0600-\u06FF]/.test(s);
  const hasLatin = (s = "") => /[A-Za-z]/.test(s);

  const pickEnglish = (sub) => {
    const a = (sub?.englishText || sub?.text || "").trim();
    const b = (sub?.arabicText || "").trim();
    // Prefer the field that contains Latin letters and NOT Arabic
    if (hasLatin(a) && !hasArabic(a)) return a;
    if (hasLatin(b) && !hasArabic(b)) return b;
    // fallback: if one has more Latin letters, take it
    const latinCount = (x) => (x.match(/[A-Za-z]/g) || []).length;
    return latinCount(a) >= latinCount(b) ? a : b;
  };

  // Determine mode before any state depends on it
  const isQuestionMode = !!correctText;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showStartOverlay, setShowStartOverlay] = useState(!isQuestionMode);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    accuracy: 0,
  });

  // Pronunciation gating state (Listening per-question flow)
  const [typingScore, setTypingScore] = useState(null);
  const [videoTextToPronounce, setVideoTextToPronounce] = useState("");
  const [combinedScoreCommitted, setCombinedScoreCommitted] = useState(false);
  const [showPronResultsDialog, setShowPronResultsDialog] = useState(false);
  const [showPronReplayOverlay, setShowPronReplayOverlay] = useState(false);
  // Track if we should reopen practice overlay after video replay (persists in sessionStorage)
  const shouldReopenPracticeRef = useRef(false);
  const hasTriedReopenRef = useRef(false);

  // Controller for pronunciation overlay (single source of truth)
  const pronunciationController = useMobilePracticeOverlayController();
  const {
    show: showPracticeOverlay,
    open: openPracticeOverlay,
    close: closePracticeOverlay,
    resetResults: resetPracticeResults,
    sentence: practiceSentence,
    isRecording,
    recordingTime,
    speechDetected,
    isProcessing,
    audioStream,
    hasRecording,
    recordedAudio,
    isPlayingRecording,
    isRecordingPaused,
    pronunciationScoreObject,
    recognizedText,
    missingWords,
    lastScore,
    playRecordedAudio,
    togglePauseRecordedAudio,
    speakText,
    handleMicClick: controllerHandleMicClick,
    handleStopRecording: controllerHandleStopRecording,
    handleDeleteRecording: controllerHandleDeleteRecording,
    handlePracticeComplete: baseHandlePracticeComplete,
  } = pronunciationController;

  // Dummy videoRef for subtitle loading (we don't need video sync in dictation phase)
  const videoRef = useRef(null);

  // Load subtitles to get video text for pronunciation
  const { subtitles, loadSubtitlesForQuestion } = useSubtitleSync(videoRef);

  const exercisesList = lesson?.questions || lesson?.exercises || [];
  const currentExercise = isQuestionMode
    ? { text: correctText }
    : exercisesList[currentExerciseIndex];
  const isLastExercise = isQuestionMode
    ? true
    : currentExerciseIndex === exercisesList.length - 1;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update progress when exercise index changes
  useEffect(() => {
    if (isQuestionMode) return;
    if (currentExerciseIndex > 0 && exercisesList.length > 0) {
      const progress = Math.round(
        (currentExerciseIndex / exercisesList.length) * 100
      );
      dataService
        .updateLessonProgress(lesson.id, progress)
        .catch(console.error);
    }
  }, [isQuestionMode, currentExerciseIndex, lesson?.id, exercisesList.length]);

  // Load subtitles for current question to get video text
  useEffect(() => {
    if (isQuestionMode && lessonId && questionId) {
      loadSubtitlesForQuestion(lessonId, questionId);
    }
  }, [isQuestionMode, lessonId, questionId, loadSubtitlesForQuestion]);

  // Extract video text from subtitles when they're loaded
  useEffect(() => {
    if (subtitles && subtitles.length > 0) {
      // Extract English text from each subtitle segment and deduplicate
      const parts = subtitles.map(pickEnglish).filter(Boolean);
      const deduped = [...new Set(parts.map((t) => t.trim()))];
      const allText = deduped.join(" ").trim();
      if (allText) {
        setVideoTextToPronounce(allText);
      }
    }
  }, [subtitles]);

  // Reset pronunciation gating when question changes
  useEffect(() => {
    if (!isQuestionMode) return;
    closePracticeOverlay();
    setShowPronResultsDialog(false);
    setShowPronReplayOverlay(false);
    shouldReopenPracticeRef.current = false;
    setCombinedScoreCommitted(false);
    // Don't clear videoTextToPronounce here; it's loaded from subtitles effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Reset the "tried reopen" flag when question changes
  useEffect(() => {
    if (!isQuestionMode) return;
    hasTriedReopenRef.current = false;
  }, [isQuestionMode, questionId]);

  // Check if we should reopen practice overlay when component mounts or videoTextToPronounce becomes available
  // This handles the case when component remounts after video replay
  useEffect(() => {
    if (!isQuestionMode) return;

    // Check sessionStorage flag (set before replay) - this persists across remounts
    const shouldReopen =
      sessionStorage.getItem("listening_shouldReopenPractice") === "true";

    if (!shouldReopen) {
      hasTriedReopenRef.current = false;
      return;
    }

    // Prevent multiple attempts in the same mount cycle
    if (hasTriedReopenRef.current) return;

    // Get target text from sessionStorage (stored before replay) or current state
    const storedText = sessionStorage.getItem("listening_practiceTargetText");
    const targetText = storedText || videoTextToPronounce || "";

    // If practice overlay should reopen and we have target text and overlay is not already open
    if (targetText.trim() && !showPracticeOverlay && !showPronResultsDialog) {
      // Use a longer delay to ensure:
      // 1. Component is fully mounted
      // 2. Phase transition animation is complete
      // 3. Controller is fully initialized
      const timer = setTimeout(() => {
        // Double-check conditions before opening (defensive)
        const stillShouldReopen =
          sessionStorage.getItem("listening_shouldReopenPractice") === "true";
        if (!stillShouldReopen) return;

        // Prevent multiple attempts
        if (hasTriedReopenRef.current) return;
        hasTriedReopenRef.current = true;

        // Use stored text if available (more reliable), otherwise use current state
        const textToUse = storedText || videoTextToPronounce || "";
        if (textToUse.trim() && !showPracticeOverlay) {
          try {
            openPracticeOverlay({ english: textToUse, phonetic: "" });
            // Clear flags only after successful open
            sessionStorage.removeItem("listening_shouldReopenPractice");
            sessionStorage.removeItem("listening_practiceTargetText");
            shouldReopenPracticeRef.current = false;
            hasTriedReopenRef.current = false;
          } catch (error) {
            console.error("Error reopening practice overlay:", error);
            hasTriedReopenRef.current = false;
            // Don't clear flags on error - allow retry
          }
        } else {
          hasTriedReopenRef.current = false;
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    isQuestionMode,
    videoTextToPronounce,
    showPracticeOverlay,
    showPronResultsDialog,
    openPracticeOverlay,
  ]);

  const handleStartDictation = () => {
    setShowStartOverlay(false);
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer.trim()) {
      alert("Please type your answer first!");
      return;
    }

    // Use video content (English from SRT) as target; fallback to correctText if subtitles not loaded
    let targetText = videoTextToPronounce;
    if (!targetText && subtitles && subtitles.length > 0) {
      const parts = subtitles.map(pickEnglish).filter(Boolean);
      const deduped = [...new Set(parts.map((t) => t.trim()))];
      targetText = deduped.join(" ").trim();
    }
    if (!targetText) targetText = currentExercise.text;
    if (!targetText) {
      alert("Could not load the correct answer. Please try again.");
      return;
    }

    const analysis = analyzeAnswer(userAnswer.trim(), targetText);
    const score = analysis.accuracy;
    const isCorrect = analysis.isPerfect;
    setFeedback({ type: "writing", analysis, isCorrect });

    // Store typing score (don't update parent yet - wait for pronunciation gating)
    setTypingScore(score);

    // Reset pronunciation gating state for this attempt
    setShowPronResultsDialog(false);
    setCombinedScoreCommitted(false);
    closePracticeOverlay();
    resetPracticeResults();

    // Capture video text at submission time (use current videoTextToPronounce)
    // It should already be set from subtitles, but ensure we have it
    if (!videoTextToPronounce && subtitles && subtitles.length > 0) {
      // Extract English text from each subtitle segment and deduplicate
      const parts = subtitles.map(pickEnglish).filter(Boolean);
      const deduped = [...new Set(parts.map((t) => t.trim()))];
      const allText = deduped.join(" ").trim();
      if (allText) {
        setVideoTextToPronounce(allText);
      }
    }

    // Update answer in parent (but not score yet - wait for pronunciation)
    if (isQuestionMode && onAnswerUpdate) {
      onAnswerUpdate(userAnswer.trim());
    }

    // Play sound effect
    if (isCorrect) {
      soundEffects.playRightAnswer();
    } else {
      soundEffects.playWrongAnswer();
    }

    // Update stats
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      accuracy: Math.round(
        ((stats.correct + (isCorrect ? 1 : 0)) / (stats.total + 1)) * 100
      ),
    };
    setStats(newStats);

    setShowFeedback(true);
  };

  const handleNext = async () => {
    if (isQuestionMode) {
      // In per-question mode delegate next to parent
      if (onComplete) {
        await onComplete();
      }
      return;
    }
    if (isLastExercise) {
      await dataService.completeLesson(lesson.id);
      if (onComplete) {
        await onComplete();
      }
    } else {
      setCurrentExerciseIndex((prev) => prev + 1);
      setUserAnswer("");
      setShowFeedback(false);
      setFeedback(null);

      const progress = Math.round(
        ((currentExerciseIndex + 1) / exercisesList.length) * 100
      );
      await dataService.updateLessonProgress(lesson.id, progress);
    }
  };

  const handleReset = () => {
    setUserAnswer("");
    setShowFeedback(false);
    setFeedback(null);
  };

  const handleRetry = () => {
    setUserAnswer("");
    setShowFeedback(false);
    setFeedback(null);
    // Reset pronunciation gating state
    setTypingScore(null);
    setVideoTextToPronounce("");
    setCombinedScoreCommitted(false);
    setShowPronResultsDialog(false);
    closePracticeOverlay();
    resetPracticeResults();
  };

  const showAlertMessage = (message) => {
    // Keep it minimal: reuse browser alert (existing overlay expects an alert callback)
    // Pronunciation tool pages use a custom alert container; Listening doesn't.
    alert(message);
  };

  /**
   * Handle "Next" click on feedback display.
   * Close dictation feedback FIRST, then open pronunciation overlay.
   */
  const handleFeedbackNext = () => {
    if (!isQuestionMode) {
      handleNext();
      return;
    }
    // Build target text from subtitles (ENGLISH ONLY)
    let targetText = "";
    if (subtitles && subtitles.length > 0) {
      const parts = subtitles
        .map(pickEnglish)
        .filter(Boolean)
        .map((t) => t.trim());
      const deduped = [...new Set(parts)];
      targetText = deduped.join(" ").trim();
    }

    // Fallback to stored videoTextToPronounce if subtitles not available
    if (!targetText) {
      targetText = videoTextToPronounce || "";
    }

    if (!targetText.trim()) {
      showAlertMessage(
        "Couldn't load the video text for pronunciation. Please try again."
      );
      return;
    }

    // Close dictation results overlay FIRST to avoid stacking issues
    setShowFeedback(false);
    setFeedback(null);

    // Open pronunciation overlay AFTER dictation is unmounted
    // Use setTimeout(0) instead of queueMicrotask to ensure DOM paint/unmount completes
    setTimeout(() => {
      openPracticeOverlay({ english: targetText, phonetic: "" });
    }, 0);
  };

  const handlePracticeClose = () => {
    // Close without proceeding (user can still retry or stay on question)
    closePracticeOverlay();
  };

  /**
   * Handle stop recording from overlay - process and show results.
   */
  const handleStopRecording = async () => {
    const result = await controllerHandleStopRecording();
    if (result) {
      // Show results dialog (overlay stays open in state but won't render due to guard)
      setShowPronResultsDialog(true);
    }
  };

  /**
   * Handle practice complete callback from overlay.
   * Show results dialog (keep overlay state but don't render it).
   */
  const handlePracticeComplete = (results) => {
    // Normalize exactly like MobileLessonPage
    const normalized = baseHandlePracticeComplete(results);
    // This updates controller's lastScore, recognizedText, missingWords etc
    // Show results dialog (overlay stays open in state but won't render due to guard)
    setShowPronResultsDialog(true);
    // Keep practice overlay visible so results dialog can show (like MobileLessonPage)
  };

  /**
   * Handle Continue/Next in pronunciation results dialog.
   * Compute combined score and navigate to next question.
   */
  const handlePronResultsContinue = async () => {
    if (combinedScoreCommitted || typingScore === null) return;

    const pScore = lastScore ?? 0;
    const combinedScore = Math.round((typingScore + pScore) / 2);

    if (isQuestionMode && onScoreUpdate) {
      onScoreUpdate(combinedScore);
    }
    setCombinedScoreCommitted(true);

    setShowPronResultsDialog(false);
    closePracticeOverlay();

    // Navigate to next question (per-question flow)
    await handleNext();
  };

  /**
   * Handle Retry in pronunciation results dialog.
   * Retry pronunciation only (reset pronunciation phase, not dictation).
   */
  const handlePronResultsRetry = async () => {
    setShowPronResultsDialog(false);

    // Clear pronunciation recording and results
    controllerHandleDeleteRecording();
    resetPracticeResults();

    // Close overlay to reset state
    closePracticeOverlay();

    // Re-open practice overlay after a short delay (like MobileLessonPage)
    setTimeout(() => {
      // Re-open with the same target text
      const targetText = videoTextToPronounce || "";
      if (targetText.trim()) {
        openPracticeOverlay({ english: targetText, phonetic: "" });
      }
    }, 300);
  };

  /**
   * Handle Listen click for pronunciation overlay.
   */
  const handleListenClick = () => {
    if (videoTextToPronounce) {
      speakText(videoTextToPronounce);
    }
  };

  /**
   * Handle Listen Slow click for pronunciation overlay.
   */
  const handleListenSlowClick = () => {
    if (videoTextToPronounce) {
      speakText(videoTextToPronounce, 0.7, 1);
    }
  };

  /**
   * Handle replay click in pronunciation phase.
   * Replay the original listening audio/video, then reopen practice overlay when video ends.
   */
  const handlePronReplayClick = async () => {
    setShowPronReplayOverlay(false);
    // Close practice overlay temporarily while replaying
    closePracticeOverlay();

    // Store target text in sessionStorage so we can use it after remount
    const targetText = videoTextToPronounce || "";
    if (targetText.trim()) {
      sessionStorage.setItem("listening_practiceTargetText", targetText);
    }

    // Set flag to reopen practice overlay after video replay completes
    // Use ref so it persists across component remounts (when phase switches)
    shouldReopenPracticeRef.current = true;

    // Store in sessionStorage as backup (in case component fully unmounts)
    sessionStorage.setItem("listening_shouldReopenPractice", "true");

    // Call onListenAgain to replay the audio/video
    // On mobile, this switches to video phase, replays video, then returns to dictation when video ends
    // On desktop, this just replays the video (which is always visible)
    if (onListenAgain) {
      await onListenAgain();
    }
  };

  // Build pronunciation overlay element (only show when results dialog is NOT open)
  const pronunciationOverlayEl =
    isQuestionMode && !showPronResultsDialog ? (
      <>
        <MobilePracticeOverlay
          show={showPracticeOverlay}
          sentence={practiceSentence}
          onClose={handlePracticeClose}
          onComplete={handlePracticeComplete}
          onListenClick={handleListenClick}
          onListenSlowClick={handleListenSlowClick}
          onMicClick={controllerHandleMicClick}
          onStopRecording={handleStopRecording}
          onPlayRecording={playRecordedAudio}
          onDeleteRecording={controllerHandleDeleteRecording}
          onShowAlert={showAlertMessage}
          audioStream={audioStream}
          isRecording={isRecording}
          recordingTime={recordingTime}
          speechDetected={speechDetected}
          isProcessing={isProcessing}
          pronunciationScore={pronunciationScoreObject}
          transcription={recognizedText}
          hasRecording={hasRecording}
        />
        {/* Replay Overlay - shown when practice overlay is open, but NOT when results dialog is open */}
        <MobileReplayOverlay
          show={
            showPronReplayOverlay &&
            showPracticeOverlay &&
            !showPronResultsDialog
          }
          onReplayClick={handlePronReplayClick}
        />
      </>
    ) : null;

  // Build pronunciation results dialog element
  const pronunciationResultsDialogEl = isQuestionMode ? (
    <MobileResultsDialog
      show={showPronResultsDialog}
      score={lastScore}
      recognizedText={recognizedText}
      missingWords={missingWords}
      isProcessing={isProcessing}
      targetText={videoTextToPronounce}
      recordedBlob={recordedAudio}
      onRetry={handlePronResultsRetry}
      onContinue={handlePronResultsContinue}
      onClose={() => setShowPronResultsDialog(false)}
      onListenClick={handleListenClick}
      onPlayRecording={playRecordedAudio}
      isPlayingRecording={isPlayingRecording}
      isRecordingPaused={isRecordingPaused}
      togglePauseRecordedAudio={togglePauseRecordedAudio}
    />
  ) : null;

  // Show replay overlay when practice overlay opens (like MobileLessonPage)
  useEffect(() => {
    if (isQuestionMode && showPracticeOverlay && !showPronResultsDialog) {
      // Show replay overlay when practice overlay opens
      setShowPronReplayOverlay(true);
    } else {
      setShowPronReplayOverlay(false);
    }
  }, [isQuestionMode, showPracticeOverlay, showPronResultsDialog]);

  // Determine current stage for progress bar
  const getCurrentStage = () => {
    if (showPronResultsDialog) return 5; // Result (pronunciation)
    if (showPracticeOverlay) return 4; // Speaking
    if (showFeedback) return 3; // Result (dictation)
    return 2; // Dictation
  };

  // While pronunciation overlay OR results dialog is open, FULLY UNMOUNT dictation UI
  // This prevents any stacking/z-index/click issues
  if (isQuestionMode && (showPracticeOverlay || showPronResultsDialog)) {
    return (
      <>
        {/* Progress Bar - Always visible at top, even during practice overlay */}
        {!isDesktop && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-[1060]">
            <ListeningProgressBar
              currentPart={currentPart}
              totalParts={totalParts}
              currentStage={getCurrentStage()}
              stageNames={["Listening", "Dictation", "Result", "Speaking", "Result"]}
            />
          </div>
        )}
        {pronunciationOverlayEl}
        {pronunciationResultsDialogEl}
      </>
    );
  }

  const analyzeAnswer = (userInput, correctText) => {
    // Normalize both texts for comparison
    const normalizedUserInput = userInput.toLowerCase().replace(/[^\w\s]/g, "");
    const normalizedCorrectText = correctText
      .toLowerCase()
      .replace(/[^\w\s]/g, "");

    // Split into words
    const userWords = normalizedUserInput
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const correctWords = normalizedCorrectText
      .split(/\s+/)
      .filter((word) => word.length > 0);

    let correctCount = 0;
    let mistakes = 0;
    let missing = 0;
    let extra = 0;

    // Create analysis arrays for highlighting
    const userAnalysis = [];
    const correctAnalysis = [];

    // Compare word by word
    const maxLength = Math.max(userWords.length, correctWords.length);

    for (let i = 0; i < maxLength; i++) {
      const userWord = userWords[i];
      const correctWord = correctWords[i];

      if (!userWord && correctWord) {
        // Missing word
        missing++;
        correctAnalysis.push(
          `<span class="word-missing">${correctWord}</span>`
        );
      } else if (userWord && !correctWord) {
        // Extra word
        extra++;
        userAnalysis.push(`<span class="word-extra">${userWord}</span>`);
      } else if (userWord === correctWord) {
        // Correct word
        correctCount++;
        userAnalysis.push(`<span class="word-correct">${userWord}</span>`);
        correctAnalysis.push(
          `<span class="word-correct">${correctWord}</span>`
        );
      } else {
        // Incorrect word
        mistakes++;
        userAnalysis.push(`<span class="word-incorrect">${userWord}</span>`);
        correctAnalysis.push(
          `<span class="word-should-be">${correctWord}</span>`
        );
      }
    }

    // Calculate accuracy
    const accuracy =
      correctWords.length > 0
        ? Math.round((correctCount / correctWords.length) * 100)
        : 0;

    return {
      correctWords: correctCount,
      totalWords: correctWords.length,
      mistakes,
      missing,
      extra,
      accuracy,
      userAnalysis: userAnalysis.join(" "),
      correctAnalysis: correctAnalysis.join(" "),
      isPerfect: accuracy === 100,
      userAnswer: userInput,
      correctAnswer: correctText,
    };
  };

  if (!currentExercise) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          No exercises available
        </h2>
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-teal-500 to-teal-700 text-white border-none px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:from-teal-600 hover:to-teal-800"
        >
          Return to Lessons
        </button>
      </div>
    );
  }

  const progressPercentage = isQuestionMode
    ? 100
    : exercisesList.length > 0
    ? ((currentExerciseIndex + 1) / exercisesList.length) * 100
    : 0;

  // Mobile dictation layout
  if (isMobile && showStartOverlay) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#ffc515] to-[#ffd84d] flex items-center justify-center z-50">
        <div className="text-center px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 mb-6 inline-block">
            <span className="text-6xl">✏️</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Dictation phase
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Get ready to type what you hear in English
          </p>
          <button
            onClick={handleStartDictation}
            className="bg-white text-[#ffc515] px-8 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Tap To Start
          </button>
        </div>
      </div>
    );
  }

  // Desktop combined view - normal layout (not overlay)
  if (isQuestionMode && isDesktop) {
    return (
      <div className="p-6 bg-white">
        {!showFeedback ? (
          <>
            {/* Textarea */}
            <div className="mb-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-l-[16px] rounded-r-full overflow-hidden shadow-sm">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type what you heard in English..."
                  className="w-full min-h-[120px] bg-transparent text-gray-800 placeholder-gray-400 px-5 py-4 focus:outline-none focus:border-[#ffc515] resize-none text-base"
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setShowFeedback(false);
                  setFeedback(null);
                  onListenAgain && onListenAgain();
                }}
                className="px-6 py-2 rounded-full border-2 border-gray-300 text-gray-400 bg-white hover:bg-gray-400 hover:text-white hover:border-gray-400 font-medium"
              >
                Listen again
              </button>
              <button
                onClick={handleAnswerSubmit}
                disabled={!userAnswer.trim()}
                className={`${
                  !userAnswer.trim() ? "opacity-50 cursor-not-allowed" : ""
                } px-11 py-2 rounded-full font-semibold text-white bg-[#ffc515] hover:bg-[#fff] hover:text-[#ffc515] hover:border-[#ffc515] hover:border-2`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <FeedbackDisplay
            feedback={feedback}
            onNext={handleFeedbackNext}
            onRetry={onListenAgain}
            isLastExercise={isLastExercise}
            lessonTitle={lesson?.title}
          />
        )}
        {pronunciationOverlayEl}
        {pronunciationResultsDialogEl}
      </div>
    );
  }

  // Mobile overlay container in question mode
  if (isQuestionMode && !isDesktop) {
    return (
      <>
        <div className="fixed inset-0 z-[1050] pointer-events-none">
          <div className="relative h-full w-full flex flex-col justify-end">
            {/* Progress Bar - Always visible at top */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-[1060] pointer-events-auto">
              <ListeningProgressBar
                currentPart={currentPart}
                totalParts={totalParts}
                currentStage={getCurrentStage()}
                stageNames={["Listening", "Dictation", "Result", "Speaking", "Result"]}
              />
            </div>

            {!showFeedback && (
              <div className="pointer-events-auto px-4 pb-6">
                {/* Unified white rounded card container */}
                <div className="bg-white rounded-[24px] px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
                  {/* Title section */}
                  <div className="text-center mb-4">
                    <div className="text-[#ffc515] font-extrabold text-lg leading-none mb-1">
                      Your Turn!
                    </div>
                    <div className="text-gray-600 text-sm">
                      Type what you heard in English.
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="mb-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type what you heard in English..."
                        className="w-full max-h-[55px] bg-transparent text-gray-800 placeholder-gray-400 px-5 py-3.5 focus:outline-none resize-none"
                        spellCheck="false"
                        autoCorrect="off"
                        autoCapitalize="off"
                        data-gramm="false"
                        data-gramm_editor="false"
                        data-enable-grammarly="false"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setShowFeedback(false);
                        setFeedback(null);
                        onListenAgain && onListenAgain();
                      }}
                      className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all"
                    >
                      Listen again
                    </button>
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!userAnswer.trim()}
                      className={`${
                        !userAnswer.trim() ? "opacity-50 cursor-not-allowed" : ""
                      } px-8 py-3 rounded-full font-semibold text-white bg-[#ffc515] hover:bg-[#ffd84d] transition-all shadow-[0_10px_20px_rgba(255,197,21,0.35)]`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showFeedback && feedback && (
              <div className="pointer-events-auto p-4">
                <FeedbackDisplay
                  feedback={feedback}
                  onNext={handleFeedbackNext}
                  onRetry={onListenAgain}
                  isLastExercise={isLastExercise}
                  lessonTitle={lesson?.title}
                />
              </div>
            )}
          </div>
        </div>
        {pronunciationOverlayEl}
        {pronunciationResultsDialogEl}
      </>
    );
  }

  // Legacy layout (desktop/old data)
  return (
    <div className="max-w-[800px] mx-auto">
      {/* Title Section */}
      <div className="text-center mb-6">
        <h2 className="text-4xl sm:text-5xl font-bold text-[#FDCB3E] mb-4 flex items-center justify-center gap-3">
          <span className="text-4xl sm:text-5xl">✏️</span>
          Dictation Phase
        </h2>
      </div>

      {/* Progress Section */}
      {!showFeedback && (
        <div className="mb-6">
          <div className="relative w-full h-1 bg-gray-300 rounded-full mb-2">
            <div
              className="absolute top-1/2 left-0 w-4 h-4 -translate-y-1/2 rounded-full bg-[#FDCB3E] transition-all duration-300"
              style={{ left: "0%" }}
            />
            <div
              className="absolute top-1/2 w-4 h-4 -translate-y-1/2 rounded-full bg-[#FDCB3E] transition-all duration-300"
              style={{ left: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio Section */}
      {!showFeedback && (
        <div className="mb-6">
          <AudioControls
            audioUrl={currentExercise.audio}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onVolumeChange={(volume) => {}}
            onSpeedChange={(speed) => {}}
          />
        </div>
      )}

      {/* Exercise Area - Writing Mode Only */}
      {!showFeedback && (
        <ExerciseArea
          mode="writing"
          exercise={currentExercise}
          userAnswer={userAnswer}
          onAnswerChange={setUserAnswer}
          onSubmit={handleAnswerSubmit}
          onReset={handleReset}
          showFeedback={showFeedback}
        />
      )}

      {/* Feedback Display */}
      {showFeedback && feedback && (
        <FeedbackDisplay
          feedback={feedback}
          onNext={handleFeedbackNext}
          onRetry={handleRetry}
          isLastExercise={isLastExercise}
        />
      )}
      {pronunciationOverlayEl}
      {pronunciationResultsDialogEl}
    </div>
  );
};

export default DictationPhase;
