import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useNewSpeechRecognition } from "../hooks/useNewSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import ProgressBar from "../components/Pronunce/ProgressBar";
import DesktopVideoSection from "../components/Pronunce/desktop/conversation/DesktopVideoSection";
import DesktopPracticeSection from "../components/Pronunce/desktop/conversation/DesktopPracticeSection";
import DesktopResultsDialog from "../components/Pronunce/desktop/conversation/DesktopResultsDialog";
import DesktopCompletionModal from "../components/Pronunce/desktop/conversation/DesktopCompletionModal";
import "./DesktopConversationPage.css";

export const DesktopConversationPage = () => {
  const { lessonNumber, topicId, conversationId } = useParams();
  const navigate = useNavigate();
  const {
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
    updateTopicProgress,
    updateLessonProgressByTopics,
  } = useProgress();

  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [lessonsData, setLessonsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [lastScore, setLastScore] = useState(null);
  const [isRecordingCancelled, setIsRecordingCancelled] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

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
    conversationId ? parseInt(conversationId) : 0,
    conversation?.sentences?.length || 0
  );

  const {
    isRecording,
    isSpeaking,
    isPaused,
    isPlayingRecording,
    isRecordingPaused,
    recordedAudio,
    recordingTime,
    speechDetected,
    audioStream,
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    playRecordedAudio,
    pauseRecordedAudio,
    resumeRecordedAudio,
    togglePauseRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    togglePauseSpeaking,
    ultraFastPause,
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

  // Load conversation data
  useEffect(() => {
    if (!lessonsData) return;

    const currentLesson = lessonsData.lessons.find(
      (l) => l.lessonNumber === parseInt(lessonNumber)
    );

    if (currentLesson) {
      setLesson(currentLesson);
      setCurrentLesson(currentLesson.lessonNumber);

      const currentTopic = currentLesson.topics.find(
        (t) => t.id === parseInt(topicId)
      );

      if (currentTopic) {
        setTopic(currentTopic);
        setCurrentTopic(currentTopic.id);

        const currentConversation = currentTopic.conversations.find(
          (c) => c.id === parseInt(conversationId)
        );

        if (currentConversation) {
          setConversation(currentConversation);
          setCurrentConversation(currentConversation.id);
        } else {
          console.error("Conversation not found with ID:", conversationId);
        }
      } else {
        console.error("Topic not found with ID:", topicId);
      }
    } else {
      console.error("Lesson not found with number:", lessonNumber);
    }
    setIsLoading(false);
  }, [
    lessonNumber,
    topicId,
    conversationId,
    lessonsData,
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
  ]);

  // Set video source when conversation changes
  useEffect(() => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (currentSentence.videoSrc) {
        setVideoSource(currentSentence.videoSrc);
      }
    }
  }, [conversation, currentSentenceIndex, setVideoSource]);

  // Handle conversation completion
  const handleConversationCompleted = useCallback(
    (completedConversationId, finalScore) => {
      if (topic && lesson && lessonsData) {
        // Update topic progress
        const topicResult = updateTopicProgress(parseInt(topicId), topic);

        // If topic is completed, update lesson progress
        if (topicResult.completed) {
          const lessonResult = updateLessonProgressByTopics(
            parseInt(lessonNumber),
            lessonsData.lessons
          );
        }
      }
    },
    [
      topic,
      lesson,
      lessonsData,
      topicId,
      lessonNumber,
      updateTopicProgress,
      updateLessonProgressByTopics,
    ]
  );

  // Show completion modal when conversation is completed
  useEffect(() => {
    if (
      isConversationCompleted &&
      currentSentenceIndex >= conversation?.sentences?.length - 1
    ) {
      setShowCompletionModal(true);

      // Trigger conversation completion handling
      if (conversation && topic && lesson) {
        handleConversationCompleted(conversation.id, overallScore);
      }
    } else {
      setShowCompletionModal(false);
    }
  }, [
    isConversationCompleted,
    currentSentenceIndex,
    conversation,
    topic,
    lesson,
    overallScore,
    handleConversationCompleted,
  ]);

  // Handle video end
  const handleVideoEnd = () => {
    // Video ended, ready for practice
  };

  // Handle listen button click
  const handleListenClick = () => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      speakText(currentSentence.english);
    }
  };

  // Handle microphone button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
      setShowRecordingUI(false);
    } else {
      startRecording();
      setShowRecordingUI(true);
      setIsRecordingCancelled(false); // Reset cancelled state when starting new recording
    }
  };

  // Handle stop recording
  const handleStopRecording = async () => {
    const audioBlob = await stopRecordingAndGetBlob();
    setShowRecordingUI(false);

    // Start processing state
    setIsProcessingAudio(true);

    // Play submission sound effect
    await playSubmissionSound();

    if (audioBlob && conversation?.sentences?.[currentSentenceIndex]) {
      const currentSentence = conversation.sentences[currentSentenceIndex];

      try {
        const result = await calculatePronunciationScore(
          audioBlob,
          currentSentence.english
        );

        if (result) {
          setLastScore(result.score);
          setRecognizedText(result.recognizedText || "");
          setShowResultsDialog(true);
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        // Handle error case - you might want to show an error message
      } finally {
        // Always clear processing state
        setIsProcessingAudio(false);
      }
    } else {
      // Clear processing state if no audio or sentence
      setIsProcessingAudio(false);
    }
  };

  // Handle delete recording
  const handleDeleteRecording = async () => {
    clearRecording();
    setShowRecordingUI(false);
    setIsRecordingCancelled(true);

    // Play custom cancellation sound effect
    await playCancellationSound();
  };

  // Play custom cancellation sound - simple and reliable approach
  const playCancellationSound = async () => {
    try {
      // Use Web Audio API for reliable sound generation
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();

      // iOS: Ensure context is resumed if suspended
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const playTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = "sine";

        // Create envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const currentTime = audioContext.currentTime;

      // Play two beeps for cancellation
      playTone(400, currentTime, 0.1); // First beep - higher pitch
      playTone(300, currentTime + 0.12, 0.1); // Second beep - lower pitch, slightly delayed
    } catch (error) {
      // Fallback: Use soundEffects for consistent behavior
      console.warn("Error playing cancellation sound:", error);
      try {
        const soundEffects = (await import("../utils/soundEffects")).default;
        await soundEffects.playWrongAnswer();
      } catch (e) {
        console.warn("Fallback sound failed:", e);
      }
    }
  };

  // Play custom submission sound - positive confirmation sound
  const playSubmissionSound = async () => {
    try {
      // Use Web Audio API for reliable sound generation
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();

      // iOS: Ensure context is resumed if suspended
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const playTone = (frequency, startTime, duration, volume = 0.2) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = "sine";

        // Create envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const currentTime = audioContext.currentTime;

      // Play ascending chord for positive submission feedback
      playTone(523, currentTime, 0.15, 0.15); // C5 - first note
      playTone(659, currentTime + 0.05, 0.15, 0.15); // E5 - second note
      playTone(784, currentTime + 0.1, 0.2, 0.2); // G5 - final note (longer)
    } catch (error) {
      // Fallback: Use soundEffects for consistent behavior
      console.warn("Error playing submission sound:", error);
      try {
        const soundEffects = (await import("../utils/soundEffects")).default;
        await soundEffects.playRightAnswer();
      } catch (e) {
        console.warn("Fallback sound failed:", e);
      }
    }
  };

  // Handle retry
  const handleRetry = () => {
    setShowResultsDialog(false);
    clearRecording();
    setRecognizedText("");
    setIsProcessingAudio(false); // Ensure processing state is cleared
    retrySentence();
  };

  // Handle continue to next sentence
  const handleContinue = () => {
    setShowResultsDialog(false);
    clearRecording();
    setIsProcessingAudio(false); // Ensure processing state is cleared

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      completeSentence(currentSentenceIndex, lastScore);

      // Move to next sentence if not completed
      if (currentSentenceIndex < conversation.sentences.length - 1) {
        const nextSentenceIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextSentenceIndex);

        // Auto-play next video with proper waiting
        setTimeout(async () => {
          if (conversation.sentences[nextSentenceIndex]?.videoSrc) {
            setVideoSource(conversation.sentences[nextSentenceIndex].videoSrc);
            
            // Wait for video to be ready before playing
            setTimeout(async () => {
              if (!videoRef.current) return;

              try {
                // Wait for video to be ready if it's not already
                if (videoRef.current.readyState < 3) {
                  await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                      reject(new Error("Video load timeout"));
                    }, 5000);

                    const onCanPlay = () => {
                      clearTimeout(timeout);
                      videoRef.current?.removeEventListener("canplay", onCanPlay);
                      resolve();
                    };

                    videoRef.current?.addEventListener("canplay", onCanPlay);
                  });
                }

                if (videoRef.current) {
                  await videoRef.current.play();
                }
              } catch (error) {
                if (error.name === "AbortError") {
                  console.error("Auto-play was interrupted");
                } else {
                  console.error("Auto-play error:", error);
                }
              }
            }, 300);
          }
        }, 100);
      }
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate(`/pronounce/home`);
  };

  // Handle close completion modal
  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    navigate(`/pronounce/home`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="desktop-conversation-page">
        <div className="main-container">
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading practice session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !topic || !conversation) {
    return (
      <div className="desktop-conversation-page">
        <div className="main-container">
          <div className="error-message">
            <h3>Content Not Found</h3>
            <p>
              {!lesson && `Lesson ${lessonNumber} not found. `}
              {!topic && `Topic ${topicId} not found. `}
              {!conversation && `Conversation ${conversationId} not found. `}
            </p>
            <button onClick={handleBackToHome} className="btn btn-primary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSentence = conversation.sentences[currentSentenceIndex];

  return (
    <div className="desktop-conversation-page">
      <div className="main-container">
        <div className="content-wrapper">
          {/* Dynamic Progress Bar Section */}
          <div className="learning-progress-section">
            <div className="progress-header">
              <div className="progress-icon">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="progress-label">Learning Progress</span>
            </div>

            <div className="progress-bar-container">
              <ProgressBar
                currentSentenceIndex={currentSentenceIndex}
                sentenceProgress={0}
                sentences={conversation.sentences}
                completedSentences={completedSentences.size}
              />
            </div>

            <div className="sentence-counter">
              <span className="current-sentence">
                {currentSentenceIndex + 1}
              </span>
              <span className="counter-separator">of</span>
              <span className="total-sentences">
                {conversation.sentences.length}
              </span>
              <span className="counter-label">sentences</span>
            </div>
          </div>

          {/* Watch & Learn Section */}
          <DesktopVideoSection
            videoRef={videoRef}
            currentSentence={currentSentence}
            isPlaying={isPlaying}
            videoLoading={videoLoading}
            videoError={videoError}
            onPlay={play}
            onReplay={replay}
            onVideoEnd={handleVideoEnd}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onVideoPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
          />

          {/* Practice Section */}
          <DesktopPracticeSection
            currentSentence={currentSentence}
            isRecording={isRecording}
            isSpeaking={isSpeaking}
            isPaused={isPaused}
            isPlayingRecording={isPlayingRecording}
            isRecordingPaused={isRecordingPaused}
            onListenClick={handleListenClick}
            onMicClick={handleMicClick}
            onPlayRecording={playRecordedAudio}
            onPauseClick={ultraFastPause}
            onPauseRecording={togglePauseRecordedAudio}
            showRecordingUI={showRecordingUI}
            recordingTime={recordingTime}
            onStopRecording={handleStopRecording}
            onDeleteRecording={handleDeleteRecording}
            isRecordingCancelled={isRecordingCancelled}
            audioStream={audioStream}
            isProcessingAudio={isProcessingAudio}
          />
        </div>
      </div>

      {/* Results Dialog */}
      {showResultsDialog && (
        <DesktopResultsDialog
          show={showResultsDialog}
          score={lastScore}
          recognizedText={recognizedText}
          targetText={currentSentence?.english}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          isPlayingRecording={isPlayingRecording}
          isRecordingPaused={isRecordingPaused}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onClose={() => setShowResultsDialog(false)}
          onListenClick={handleListenClick}
          onPlayRecording={playRecordedAudio}
          onPauseClick={ultraFastPause}
          onPauseRecording={togglePauseRecordedAudio}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <DesktopCompletionModal
          show={showCompletionModal}
          overallScore={overallScore}
          onClose={handleCloseCompletionModal}
        />
      )}
    </div>
  );
};
