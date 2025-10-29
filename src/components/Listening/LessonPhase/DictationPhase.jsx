import { useState, useEffect } from "react";
import AudioControls from "../AudioControls";
import ExerciseArea from "../ExerciseArea";
import FeedbackDisplay from "../FeedbackDisplay";
import soundEffects from "../../../utils/soundEffects";
import dataService from "../../../services/dataService";

const DictationPhase = ({ lesson, onComplete }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    accuracy: 0,
  });

  const currentExercise = lesson.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === lesson.exercises.length - 1;

  // Update progress when exercise index changes
  useEffect(() => {
    if (currentExerciseIndex > 0) {
      const progress = Math.round(
        (currentExerciseIndex / lesson.exercises.length) * 100
      );
      dataService.updateLessonProgress(lesson.id, progress);
    }
  }, [currentExerciseIndex, lesson.id, lesson.exercises.length]);

  // Icon components
  const PencilIcon = ({ className = "" }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const CheckmarkIcon = ({ className = "" }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  const modes = [
    {
      id: "writing",
      name: "Writing Mode",
      icon: PencilIcon,
      description: "type what you hear",
    },
    {
      id: "choice",
      name: "Multiple Choice",
      icon: CheckmarkIcon,
      description: "choose what you hear",
    },
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setUserAnswer("");
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedback(null);
  };

  const handleAnswerSubmit = () => {
    if (!selectedMode) return;

    let isCorrect = false;
    let score = 0;

    if (selectedMode === "writing") {
      if (!userAnswer.trim()) {
        alert("Please type your answer first!");
        return;
      }
      const analysis = analyzeAnswer(userAnswer.trim(), currentExercise.text);
      score = analysis.accuracy;
      isCorrect = analysis.isPerfect;
      setFeedback({ type: "writing", analysis, isCorrect });
    } else {
      if (selectedChoice === null) {
        alert("Please select an answer first!");
        return;
      }
      isCorrect = selectedChoice === 0; // First choice is always correct
      score = isCorrect ? 100 : 0;
      setFeedback({
        type: "choice",
        isCorrect,
        correctAnswer: currentExercise.text,
      });
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

  const handleNext = () => {
    if (isLastExercise) {
      // Mark lesson as completed
      dataService.completeLesson(lesson.id);
      onComplete();
    } else {
      setCurrentExerciseIndex((prev) => prev + 1);
      setUserAnswer("");
      setSelectedChoice(null);
      setShowFeedback(false);
      setFeedback(null);

      // Update progress
      const progress = Math.round(
        ((currentExerciseIndex + 1) / lesson.exercises.length) * 100
      );
      dataService.updateLessonProgress(lesson.id, progress);
    }
  };

  const handleReset = () => {
    setUserAnswer("");
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedback(null);
  };

  const handleRetry = () => {
    setUserAnswer("");
    setSelectedChoice(null);
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

  const progressPercentage =
    ((currentExerciseIndex + 1) / lesson.exercises.length) * 100;

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
            onVolumeChange={(volume) => console.log("Volume:", volume)}
            onSpeedChange={(speed) => console.log("Speed:", speed)}
          />
        </div>
      )}

      {/* Mode Selection - Always visible */}
      {!showFeedback && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-6 w-full">
          {modes.map((mode, index) => {
            const IconComponent = mode.icon;
            const isActive = selectedMode === mode.id;
            const isFirst = index === 0; // Writing Mode (left)
            const isSecond = index === 1; // Multiple Choice (right)

            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`
                  w-full
                  ${isActive ? "bg-[#FDCB3E]" : "bg-white"}
                  ${
                    isFirst
                      ? "rounded-r-full rounded-l-xl sm:rounded-l-2xl border-t border-b border-r border-slate-200"
                      : "rounded-l-full rounded-r-xl sm:rounded-r-2xl border-t border-b border-l border-slate-200"
                  }
                  ${
                    isActive
                      ? ""
                      : "shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                  }
                  h-12 sm:h-14 lg:h-16 xl:h-18 
                  flex items-center 
                  ${isFirst ? "justify-end" : "justify-start"}
                  px-4 sm:px-6 lg:px-8 xl:px-12
                  cursor-pointer transition-all duration-300
                  ${!isActive ? "hover:bg-gray-50" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <IconComponent
                    className={isActive ? "text-gray-800" : "text-slate-700"}
                  />
                  <div className="text-left leading-tight flex flex-col justify-center">
                    <div className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-slate-700">
                      {mode.name}
                    </div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
                      {mode.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Exercise Area */}
      {selectedMode && !showFeedback && (
        <ExerciseArea
          mode={selectedMode}
          exercise={currentExercise}
          userAnswer={userAnswer}
          onAnswerChange={setUserAnswer}
          selectedChoice={selectedChoice}
          onChoiceSelect={setSelectedChoice}
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
