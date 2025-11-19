import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useNewSpeechRecognition } from "../hooks/useNewSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { useMobileFeatures } from "../hooks/useMobileFeatures";
import useSubtitleSync from "../hooks/useSubtitleSync";
import ProgressBar from "../components/Pronunce/ProgressBar";
import MobileBackButton from "../components/Pronunce/mobile/MobileBackButton";
import MobileSubtitleContainer from "../components/Pronunce/mobile/MobileSubtitleContainer";
import MobileReplayOverlay from "../components/Pronunce/mobile/MobileReplayOverlay";
import MobilePracticeOverlay from "../components/Pronunce/mobile/MobilePracticeOverlay";
import MobileCompletionCard from "../components/Pronunce/mobile/MobileCompletionCard";
import MobileResultsDialog from "../components/Pronunce/mobile/MobileResultsDialog";
import MobileAlertContainer from "../components/Pronunce/mobile/MobileAlertContainer";
import { FaMicrophone, FaRegLightbulb } from "react-icons/fa";
import "./MobileLessonPage.css";

export const MobileLessonPage = () => {
  const { lessonNumber } = useParams();
  const navigate = useNavigate();
  const { setCurrentLesson, completeLesson } = useProgress();

  const [lesson, setLesson] = useState(null);
  const [lessonsData, setLessonsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPracticeOverlay, setShowPracticeOverlay] = useState(false);
  const [showReplayOverlay, setShowReplayOverlay] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [lessonCompletedStatus, setLessonCompletedStatus] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showIOSAudioOverlay, setShowIOSAudioOverlay] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768
  );
  const [recognizedText, setRecognizedText] = useState("");
  const [missingWords, setMissingWords] = useState([]);
  const [lastScore, setLastScore] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [videoLoadAttempts, setVideoLoadAttempts] = useState(0);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);

  // Add ref for managing user interaction
  const userInteractionRef = useRef(false);

  // Hooks
  const {
    currentSentenceIndex,
    sentenceScores,
    completedSentences,
    overallScore,
    progressPercentage,
    isConversationCompleted,
    isCurrentSentenceCompleted,
    completeSentence,
    retrySentence,
    resetConversation,
    setCurrentSentenceIndex,
  } = useConversationProgress(
    lessonNumber ? parseInt(lessonNumber) : 0,
    lesson?.sentences?.length || 0
  );

  const {
    isRecording,
    isSpeaking,
    recordedAudio,
    recordingTime,
    speechDetected,
    audioStream, // Add audioStream like desktop
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    playRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    cleanup,
  } = useNewSpeechRecognition();

  const {
    isProcessing,
    calculatePronunciationScore,
    getScoreColor,
    getScoreMessage,
  } = usePronunciationScoring();

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading: videoLoading,
    hasError: videoError,
    play,
    pause,
    replay,
    setVideoSource,
    seekTo,
    setVolume,
    toggleMute,
    formatTime,
    getProgress,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadStart,
    handleCanPlay,
  } = useVideoPlayer();

  const {
    isMobile,
    viewportHeight,
    setupMobileAccessibility,
    enableVideoAudio,
    mobileSpeakSentence,
    playMobileRecordedAudioSlow,
    showMobileAlert,
    hideMobileAlert,
  } = useMobileFeatures();

  // Subtitle synchronization hook
  const {
    currentSubtitle,
    subtitles,
    isSubtitlesActive,
    isLoading: subtitleLoading,
    error: subtitleError,
    loadSubtitlesForSentence,
    clearSubtitles,
  } = useSubtitleSync(videoRef);

  // Enhanced video play function with user interaction check
  const safeVideoPlay = async () => {
    if (!videoRef.current) {
      console.error("Video ref is null");
      return false;
    }

    try {
      await videoRef.current.play();
      return true;
    } catch (error) {
      console.error("Video play failed:", error.name, error.message);
      // Don't show overlay again after initial interaction
      if (error.name === "NotSupportedError") {
        console.error("Video format not supported or video failed to load");
        return false;
      } else {
        console.error("Other video play error:", error);
        return false;
      }
    }
  };

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        const response = await fetch("/assets/pronounceData.json");
        const data = await response.json();
        setLessonsData(data);
      } catch (error) {
        console.error("Error loading lessons data:", error);
      }
    };

    loadLessonsData();
  }, []);

  // Load lesson data
  useEffect(() => {
    if (!lessonsData) return;

    const currentLesson = lessonsData.lessons.find(
      (l) => l.lessonNumber === parseInt(lessonNumber)
    );

    if (currentLesson) {
      setLesson(currentLesson);
      setCurrentLesson(currentLesson.lessonNumber);
    } else {
      console.error("Lesson not found with number:", lessonNumber);
    }
    setIsLoading(false);
  }, [lessonNumber, lessonsData, setCurrentLesson]);

  // Retry video loading function
  const retryVideoLoad = useCallback(
    (videoSrc, attempts = 0) => {
      const maxAttempts = 3;
      if (attempts >= maxAttempts) {
        console.error(
          `Failed to load video after ${maxAttempts} attempts:`,
          videoSrc
        );
        return;
      }

      setVideoLoadAttempts(attempts + 1);
      setVideoSource(videoSrc);

      // Set a timeout to retry if video doesn't load
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState < 3) {
          retryVideoLoad(videoSrc, attempts + 1);
        }
      }, 3000);
    },
    [setVideoSource]
  );

  // Set video source when lesson changes
  useEffect(() => {
    if (lesson && lesson.sentences && lesson.sentences[currentSentenceIndex]) {
      const currentSentence = lesson.sentences[currentSentenceIndex];
      if (
        currentSentence.videoSrc &&
        currentSentence.videoSrc !== currentVideoSrc
      ) {
        setCurrentVideoSrc(currentSentence.videoSrc);
        setVideoLoadAttempts(0);
        retryVideoLoad(currentSentence.videoSrc);

        // Load subtitles for current sentence (mobile only)
        if (isMobile) {
          loadSubtitlesForSentence(
            parseInt(lessonNumber),
            currentSentenceIndex + 1 // SRT files are 1-based
          );
        }

        // Wait for video to load before attempting to play
        const handleCanPlayThrough = () => {
          // Just show overlay if not interacted, don't autoplay
          if (!hasUserInteracted && !userInteractionRef.current) {
            setShowIOSAudioOverlay(true);
          }
          // Video is ready but paused - user must click to play
          videoRef.current?.removeEventListener(
            "canplaythrough",
            handleCanPlayThrough
          );
        };

        if (videoRef.current) {
          videoRef.current.addEventListener(
            "canplaythrough",
            handleCanPlayThrough
          );
        }
      } else {
      }
    }
  }, [
    lesson,
    currentSentenceIndex,
    currentVideoSrc,
    hasUserInteracted,
    retryVideoLoad,
    isMobile,
    lessonNumber,
    loadSubtitlesForSentence,
  ]);

  // Handle lesson completion and update progress
  const handleLessonCompleted = useCallback(
    (finalScore) => {
      if (lesson && lessonsData) {
        // Mark lesson as completed
        completeLesson(lesson.lessonNumber);
        setLessonCompletedStatus(true);
      }
    },
    [lesson, lessonsData, completeLesson]
  );

  // Set up global lesson completion callback
  useEffect(() => {
    window.onLessonCompleted = handleLessonCompleted;
    return () => {
      window.onLessonCompleted = null;
    };
  }, [handleLessonCompleted]);

  // Show completion card only when lesson is actually completed
  useEffect(() => {
    if (
      isConversationCompleted &&
      currentSentenceIndex >= lesson?.sentences?.length - 1
    ) {
      setShowCompletionCard(true);

      // Trigger lesson completion handling
      if (lesson) {
        handleLessonCompleted(overallScore);
      }
    } else {
      setShowCompletionCard(false);
    }
  }, [
    isConversationCompleted,
    currentSentenceIndex,
    lesson,
    overallScore,
    handleLessonCompleted,
  ]);

  // Detect if we're on mobile and set initial overlay state
  useEffect(() => {
    if (isMobile && !hasUserInteracted && !userInteractionRef.current) {
      // On mobile, show the overlay if user hasn't interacted yet
      setShowIOSAudioOverlay(true);
    } else if (!isMobile && !hasUserInteracted) {
      // On desktop, user interaction might not be required
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }
  }, [isMobile, hasUserInteracted]);

  const handleBackClick = () => {
    navigate(`/pronounce/home`);
  };

  const handleVideoEnd = () => {
    setShowReplayOverlay(true);
    // Show practice overlay immediately (no delay)
    setShowPracticeOverlay(true);
  };

  const handleReplayClick = async () => {
    setShowReplayOverlay(false);
    setShowPracticeOverlay(false); // Hide practice overlay when replaying

    // Reset video to beginning and play immediately
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Video replay error:", error);
      }
    }
  };

  const handlePracticeClose = () => {
    setShowPracticeOverlay(false);
  };

  const handleListenClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (lesson && lesson.sentences && lesson.sentences[currentSentenceIndex]) {
      const currentSentence = lesson.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english);
      } else {
        speakText(currentSentence.english);
      }
    }
  };

  const handleListenSlowClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (lesson && lesson.sentences && lesson.sentences[currentSentenceIndex]) {
      const currentSentence = lesson.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english, true);
      } else {
        speakText(currentSentence.english, 0.7, 1);
      }
    }
  };

  const handleMicClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStopRecording = async () => {
    // Just stop the recording - let MobilePracticeOverlay handle the processing
    await stopRecordingAndGetBlob();
  };

  const handleRetry = async () => {
    setShowResultsDialog(false);

    // Explicit cleanup before retry
    await cleanup();

    clearRecording();
    setRecognizedText("");
    setMissingWords([]);
    // Reset practice overlay states
    setShowPracticeOverlay(false);
    // Keep replay overlay visible - don't hide it on retry
    // setShowReplayOverlay(false); // Removed to keep replay button visible
    // Reset the sentence for retry
    retrySentence();
    // Longer delay to ensure cleanup completed
    setTimeout(() => {
      setShowPracticeOverlay(true);
    }, 800);
  };

  const handleContinue = async () => {
    setShowResultsDialog(false);
    clearRecording();

    if (lesson && lesson.sentences && lesson.sentences[currentSentenceIndex]) {
      const currentSentence = lesson.sentences[currentSentenceIndex];
      completeSentence(currentSentenceIndex, lastScore);

      // Move to next sentence if not completed
      // Note: completeSentence already updates currentSentenceIndex internally
      if (currentSentenceIndex < lesson.sentences.length - 1) {
        const nextSentenceIndex = currentSentenceIndex + 1;

        // Hide practice overlay and replay overlay
        setShowPracticeOverlay(false);
        setShowReplayOverlay(false);

        // Load subtitles for next sentence (mobile only)
        if (isMobile) {
          loadSubtitlesForSentence(
            parseInt(lessonNumber),
            nextSentenceIndex + 1 // SRT files are 1-based
          );
        }

        // Auto-play next video after first sentence is completed
        setTimeout(() => {
          if (hasUserInteracted || userInteractionRef.current) {
            setTimeout(async () => {
              if (lesson.sentences[nextSentenceIndex]?.videoSrc) {
                setVideoSource(lesson.sentences[nextSentenceIndex].videoSrc);
                // Auto-play the next video
                setTimeout(async () => {
                  try {
                    await safeVideoPlay();
                  } catch (error) {
                    console.error("Auto-play error:", error);
                  }
                }, 300);
              }
            }, 500);
          }
        }, 0);
      }
    }
  };

  const handleBackToLessons = () => {
    // Save progress before navigating back
    if (lesson) {
      // Progress is already saved through the ProgressContext
    }
    navigate(`/pronounce/home`);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const handleIOSAudioClick = async () => {
    // Mark interaction and hide overlay
    setHasUserInteracted(true);
    userInteractionRef.current = true;
    setShowIOSAudioOverlay(false);

    // Prepare video and play immediately
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      // Play video immediately after clicking overlay
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Video play error:", error);
      }
    }
  };

  const handleDeleteRecording = () => {
    // Actually stop the recording to reset isRecording state
    if (isRecording) {
      stopRecording();
    }
    clearRecording();
    // Keep practice overlay visible (like desktop) - just reset to initial state
    // The MobilePracticeOverlay will handle showing the initial controls
  };

  const handlePracticeComplete = (results) => {
    // Handle results from MobilePracticeOverlay
    setLastScore(results.score);
    setRecognizedText(results.recognizedText);
    setMissingWords([]); // MobilePracticeOverlay doesn't calculate missing words
    setShowResultsDialog(true);
    // Keep practice overlay visible so results dialog can show
  };

  const handleVideoClick = async () => {
    // Don't allow video interaction when replay overlay is visible
    if (showReplayOverlay) {
      return;
    }

    // Don't allow play if initial overlay is still showing
    if (showIOSAudioOverlay) {
      return; // User must click overlay first
    }

    if (!hasUserInteracted) {
      // Show overlay instead of playing
      setShowIOSAudioOverlay(true);
      return;
    }

    // Now handle normal play/pause
    if (videoRef.current) {
      if (videoRef.current.paused) {
        await safeVideoPlay();
      } else {
        pause();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <div className="spinner"></div>
          <span>Loading practice session...</span>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <span>
            Lesson {lessonNumber} not found.
            <br />
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "var(--sna-primary)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
          </span>
        </div>
      </div>
    );
  }

  const currentSentence = lesson.sentences[currentSentenceIndex];

  return (
    <>
      <div className="mobile-video-container">
        {/* Dynamic Progress Bar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md z-10">
          <ProgressBar
            currentSentenceIndex={currentSentenceIndex}
            sentenceProgress={0}
            sentences={lesson.sentences}
            completedSentences={completedSentences.size}
            isMobile={true}
          />
        </div>

        {/* Back Button */}
        <MobileBackButton onBackClick={handleBackClick} />

        {/* Video Element */}
        <div className="video-container-wrapper">
          <video
            ref={videoRef}
            className="mobile-lesson-video"
            playsInline
            preload="metadata"
            muted={!hasUserInteracted}
            webkit-playsinline="true"
            crossOrigin="anonymous"
            onClick={handleVideoClick}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleVideoEnd}
            onError={(e) => {
              console.error("Video error event:", e.target.error);
              if (e.target.error) {
                console.error("Error code:", e.target.error.code);
                console.error("Error message:", e.target.error.message);
              }
              handleError(e);
            }}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
          >
            <source src={currentSentence?.videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Error Indicator */}
          {videoError && (
            <div className="video-error-overlay">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Video failed to load. Please check your connection.</span>
            </div>
          )}
        </div>

        {/* Initial Tap to Start Overlay with Dark Backdrop */}
        {showIOSAudioOverlay && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1040] cursor-pointer"
            onClick={handleIOSAudioClick}
          >
            <div className="w-full px-5" onClick={(e) => e.stopPropagation()}>
              <div
                className="mx-auto max-w-[320px] sm:max-w-[360px] bg-white/90 backdrop-blur-md rounded-[20px] p-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                onClick={handleIOSAudioClick}
              >
                <div className="flex items-center justify-center gap-2 text-gray-800 mb-1.5">
                  <FaMicrophone className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold">
                    Pronunciation Practice
                  </h2>
                </div>
                <p className="text-gray-600 text-[13px] leading-relaxed">
                  Tap to watch this video and learn
                  <br />
                  how to pronounce correctly
                </p>
                <div className="mt-4 flex items-start gap-2.5 text-left">
                  <FaRegLightbulb className="w-5 h-5 text-[#ffc515] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 text-[13px] leading-relaxed">
                    After watching, you'll practice speaking the sentence
                    yourself
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subtitle Container - Only shows SRT subtitles */}
        <MobileSubtitleContainer
          currentSubtitle={currentSubtitle}
          showVideoSubtitles={true}
          isMobile={isMobile}
        />

        {/* Replay Overlay */}
        <MobileReplayOverlay
          show={showReplayOverlay}
          onReplayClick={handleReplayClick}
        />

        {/* Practice Overlay */}
        <MobilePracticeOverlay
          show={showPracticeOverlay}
          sentence={currentSentence}
          isRecording={isRecording}
          recordingTime={recordingTime}
          speechDetected={speechDetected}
          isProcessing={isProcessing}
          audioStream={audioStream}
          pronunciationScore={
            lastScore
              ? {
                  score: lastScore,
                  transcriptWords: recognizedText.split(" "),
                  matchedTranscriptIndices: [],
                  missingWords: missingWords,
                }
              : null
          }
          transcription={recognizedText}
          onClose={handlePracticeClose}
          onComplete={handlePracticeComplete}
          onListenClick={handleListenClick}
          onListenSlowClick={handleListenSlowClick}
          onMicClick={handleMicClick}
          onStopRecording={handleStopRecording}
          onPlayRecording={playRecordedAudio}
          onDeleteRecording={handleDeleteRecording}
          onShowAlert={showAlertMessage}
        />

        {/* Completion Card */}
        <MobileCompletionCard
          show={showCompletionCard}
          overallScore={overallScore}
          onBackToLessons={handleBackToLessons}
          lessonCompleted={lessonCompletedStatus}
        />

        {/* Alert Container */}
        <MobileAlertContainer
          show={showAlert}
          message={alertMessage}
          onClose={hideAlert}
        />
      </div>

      {/* Mobile Results Dialog - Outside mobile-video-container */}
      {showResultsDialog && (
        <MobileResultsDialog
          show={showResultsDialog}
          score={lastScore}
          recognizedText={recognizedText}
          missingWords={missingWords}
          isProcessing={isProcessing}
          targetText={lesson?.sentences?.[currentSentenceIndex]?.english}
          recordedBlob={recordedAudio}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onClose={() => setShowResultsDialog(false)}
          onListenClick={handleListenClick}
          onPlayRecording={playRecordedAudio}
        />
      )}
    </>
  );
};
