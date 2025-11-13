import { useState, useEffect } from "react";
import AudioControls from "../AudioControls";
import ExerciseArea from "../ExerciseArea";
import FeedbackDisplay from "../FeedbackDisplay";
import soundEffects from "../../../utils/soundEffects";
import dataService from "../../../services/dataService";

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
}) => {
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

  const handleStartDictation = () => {
    setShowStartOverlay(false);
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer.trim()) {
      alert("Please type your answer first!");
      return;
    }

    const analysis = analyzeAnswer(userAnswer.trim(), currentExercise.text);
    const score = analysis.accuracy;
    const isCorrect = analysis.isPerfect;
    setFeedback({ type: "writing", analysis, isCorrect });

    // Update score and answer in parent if in question mode
    if (isQuestionMode && onScoreUpdate) {
      onScoreUpdate(score);
    }
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
  };

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
            Get ready to type what you hear
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
                  placeholder="type the sentence you heard here........"
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
            onNext={handleNext}
            onRetry={onListenAgain}
            isLastExercise={isLastExercise}
            lessonTitle={lesson?.title}
          />
        )}
      </div>
    );
  }

  // Mobile overlay container in question mode
  if (isQuestionMode && !isDesktop) {
    return (
      <div className="fixed inset-0 z-[1050] pointer-events-none">
        <div className="relative h-full w-full flex flex-col justify-end">
          {!showFeedback && (
            <div className="pointer-events-auto px-4 pb-6">
              {/* Header pill */}
              <div className="flex justify-center mb-3">
                <div className="bg-white/50 backdrop-blur-sm text-gray-800 rounded-[24px] px-6 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.15)] inline-flex items-center gap-3">
                  <div>
                    <div className="text-gray-800 font-extrabold text-lg leading-none text-center">
                      Your Turn!
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      <span className="text-lg">🖊️</span> type what you heard
                    </div>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="-ml-6 w-[105%] max-w-none">
                <div className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-l-[24px] rounded-r-[999px] overflow-hidden">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="type the sentence you heard here........"
                    className="w-full min-h-[88px] bg-transparent text-black-800 placeholder-black px-5 py-3.5 focus:outline-none resize-none"
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
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedback(null);
                    onListenAgain && onListenAgain();
                  }}
                  className="px-6 py-3 rounded-full border border-white text-white bg-transparent hover:bg-white/10 transition-all"
                >
                  Listen again
                </button>
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!userAnswer.trim()}
                  className={`${
                    !userAnswer.trim() ? "opacity-50 cursor-not-allowed" : ""
                  } px-8 py-3 rounded-full font-semibold text-gray-900 bg-[#ffc515] hover:bg-[#ffd84d] transition-all shadow-[0_10px_20px_rgba(255,197,21,0.35)]`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {showFeedback && feedback && (
            <div className="pointer-events-auto p-4">
              <FeedbackDisplay
                feedback={feedback}
                onNext={handleNext}
                onRetry={onListenAgain}
                isLastExercise={isLastExercise}
                lessonTitle={lesson?.title}
              />
            </div>
          )}
        </div>
      </div>
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
          onNext={handleNext}
          onRetry={handleRetry}
          isLastExercise={isLastExercise}
        />
      )}
    </div>
  );
};

export default DictationPhase;
