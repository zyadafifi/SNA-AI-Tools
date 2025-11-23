import { useState, useEffect, useRef } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Headphones, PenTool } from "lucide-react";
import dataService from "../services/dataService";
import ListeningPhase from "../components/Listening/LessonPhase/ListeningPhase";
import DictationPhase from "../components/Listening/LessonPhase/DictationPhase";
import TipsPanel from "../components/Listening/TipsPanel";
import CompletionDialog from "../components/Listening/CompletionDialog";

export const ListeningLessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState("video");
  const [showTips, setShowTips] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [questionScores, setQuestionScores] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const userInteractionRef = useRef(false);
  const videoRefForAutoPlay = useRef(null);
  const [shouldReplayVideo, setShouldReplayVideo] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      const lessonId = parseInt(id);
      const foundLesson = await dataService.getLessonById(lessonId);
      if (foundLesson) {
        // Check if lesson is unlocked
        const isUnlocked = await dataService.isLessonUnlocked(lessonId);
        if (!isUnlocked) {
          alert("This lesson is locked. Complete the previous lesson first!");
          navigate("/listening/home");
          return;
        }
        setLesson(foundLesson);
        const qs = await dataService.getLessonQuestions(lessonId);
        setQuestions(qs);
        // Derive current question from saved progress (20% per question)
        const progress = foundLesson.progress || 0;
        const derivedIndex = Math.min(4, Math.floor(progress / 20));
        setCurrentQuestionIndex(derivedIndex);
      } else {
        navigate("/listening/home");
      }
    };
    loadLesson();
  }, [id, navigate]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  const phases = [
    { id: "listening", name: "Listening", icon: Headphones },
    { id: "dictation", name: "Dictation", icon: PenTool },
  ];

  const handleLessonComplete = async () => {
    await dataService.completeLesson(parseInt(id));
    // Dialog will be shown by handleDictationCompleted
  };

  const handleDialogClose = () => {
    setShowCompletionDialog(false);
    navigate("/listening/home");
  };

  const handleScoreUpdate = (score) => {
    setQuestionScores((prev) => {
      const newScores = [...prev];
      newScores[currentQuestionIndex] = score;
      return newScores;
    });
  };

  const handleAnswerUpdate = (answer) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answer;
      return newAnswers;
    });
  };

  // Safe video play function that waits for video to be ready
  const safeVideoPlay = async () => {
    if (!videoRefForAutoPlay.current) {
      return false;
    }

    try {
      // Try to play immediately - browser will buffer while playing
      await videoRefForAutoPlay.current.play();
      return true;
    } catch (error) {
      // If immediate play fails, wait a bit and try again
      if (error.name === "NotAllowedError" || error.name === "AbortError") {
        try {
          // Wait for video to be ready (reduced timeout for faster response)
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 1500); // 1.5 seconds

            const onCanPlay = () => {
              clearTimeout(timeout);
              videoRefForAutoPlay.current?.removeEventListener(
                "canplay",
                onCanPlay
              );
              resolve();
            };

            videoRefForAutoPlay.current?.addEventListener("canplay", onCanPlay);
          });

          // Try to play again
          if (videoRefForAutoPlay.current) {
            await videoRefForAutoPlay.current.play();
            return true;
          }
        } catch (retryError) {
          return false;
        }
      } else if (error.name === "NotSupportedError") {
        console.error("Video format not supported");
        return false;
      }
    }

    return false;
  };

  const handleListenAgain = async () => {
    // For mobile, switch back to video phase to replay the current question's video
    if (isMobile) {
      setShouldReplayVideo(true);
      setCurrentPhase("video");
    } else {
      // For desktop, replay video immediately (video is always visible)
      if (videoRefForAutoPlay.current) {
        try {
          videoRefForAutoPlay.current.currentTime = 0;
          await videoRefForAutoPlay.current.play();
        } catch (error) {
          console.error("Video replay error:", error);
        }
      }
    }
  };

  const handleDictationCompleted = async () => {
    const total = Math.max(1, questions.length || 5);
    const nextIndex = currentQuestionIndex + 1;
    const lessonId = parseInt(id);
    // Update progress: 20% per question
    const newProgress = Math.min(100, Math.round((nextIndex / total) * 100));
    await dataService.updateLessonProgress(lessonId, newProgress);
    if (nextIndex >= total) {
      // Mark lesson as complete and show dialog
      await handleLessonComplete();
      setShowCompletionDialog(true);
      return;
    }
    setCurrentQuestionIndex(nextIndex);
    setCurrentPhase("video");
    // Note: Auto-play is handled by ListeningPhase component's useEffect
    // when currentStepIndex > 0 and user has interacted
  };

  // Mobile layout - full screen for both phases
  if (isMobile) {
    return (
      <div className="min-h-screen bg-black">
        {/* Always render the video full-screen; overlay dictation on top when needed */}
        {questions[currentQuestionIndex] && (
          <ListeningPhase
            lesson={lesson}
            lessonId={lesson?.id}
            questionId={questions[currentQuestionIndex]?.id}
            videoSrc={questions[currentQuestionIndex].videoSrc}
            totalSteps={questions.length}
            currentStepIndex={currentQuestionIndex}
            onComplete={() => setCurrentPhase("dictation")}
            hasUserInteracted={hasUserInteracted}
            setHasUserInteracted={setHasUserInteracted}
            userInteractionRef={userInteractionRef}
            videoRefForAutoPlay={videoRefForAutoPlay}
            shouldReplayVideo={shouldReplayVideo}
            onReplayComplete={() => setShouldReplayVideo(false)}
          />
        )}

        {currentPhase === "dictation" && questions[currentQuestionIndex] && (
          <DictationPhase
            lesson={lesson}
            correctText={questions[currentQuestionIndex].text}
            onComplete={handleDictationCompleted}
            onListenAgain={handleListenAgain}
            onScoreUpdate={handleScoreUpdate}
            onAnswerUpdate={handleAnswerUpdate}
          />
        )}

        {/* Completion Dialog */}
        <CompletionDialog
          show={showCompletionDialog}
          onClose={handleDialogClose}
          onContinue={handleDialogClose}
          lessonTitle={lesson?.title}
          totalQuestions={questions.length || 5}
          completedQuestions={questions.length || 5}
          averageScore={
            questionScores.length > 0
              ? Math.round(
                  questionScores.reduce((sum, score) => sum + (score || 0), 0) /
                    questionScores.length
                )
              : 0
          }
          questions={questions}
          questionScores={questionScores}
          userAnswers={userAnswers}
        />
      </div>
    );
  }

  // Desktop layout - combined video and dictation view
  return (
    <div className="gradient-background">
      <div className="max-w-4xl mx-auto px-4 py-6 lg:px-6">
        {/* Progress Indicator - All bullets solid yellow, connected by light gray line */}
        <div className="mb-5">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: questions.length || 5 }).map((_, index) => {
              return (
                <React.Fragment key={index}>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffc515] border-2 border-[#ffc515]" />
                  {index < (questions.length || 5) - 1 && (
                    <div className="h-0.5 w-10 bg-gray-300" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Listening Phase Title */}
        <div className="mb-5 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Headphones className="w-9 h-9 text-[#ffc515]" strokeWidth={2.5} />
            <h2 className="text-4xl font-bold text-[#ffc515] leading-tight">
              Listening Phase
            </h2>
          </div>
        </div>

        {/* Combined Video and Dictation Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-300 p-4">
          {/* Subtitle */}
          <p className="text-gray-600 text-base text-center mb-4">
            Watch the video below to improve your listening skills
          </p>

          {/* Video Section */}
          <div className="bg-black rounded-2xl p-1">
            {questions[currentQuestionIndex] && (
              <ListeningPhase
                lesson={lesson}
                lessonId={lesson?.id}
                questionId={questions[currentQuestionIndex]?.id}
                videoSrc={questions[currentQuestionIndex].videoSrc}
                totalSteps={questions.length}
                currentStepIndex={currentQuestionIndex}
                onComplete={() => {}}
                isDesktop={true}
                hasUserInteracted={hasUserInteracted}
                setHasUserInteracted={setHasUserInteracted}
                userInteractionRef={userInteractionRef}
                videoRefForAutoPlay={videoRefForAutoPlay}
                shouldReplayVideo={shouldReplayVideo}
                onReplayComplete={() => setShouldReplayVideo(false)}
              />
            )}
          </div>

          {/* Dictation Section - Always visible on desktop */}
          {questions[currentQuestionIndex] && (
            <DictationPhase
              lesson={lesson}
              correctText={questions[currentQuestionIndex].text}
              onComplete={handleDictationCompleted}
              onListenAgain={handleListenAgain}
              isDesktop={true}
              onScoreUpdate={handleScoreUpdate}
              onAnswerUpdate={handleAnswerUpdate}
            />
          )}
        </div>
      </div>

      {/* Tips Panel */}
      <TipsPanel isOpen={showTips} onClose={() => setShowTips(false)} />

      {/* Completion Dialog */}
      <CompletionDialog
        show={showCompletionDialog}
        onClose={handleDialogClose}
        onContinue={handleDialogClose}
        lessonTitle={lesson?.title}
        totalQuestions={questions.length || 5}
        completedQuestions={questions.length || 5}
        averageScore={
          questionScores.filter((s) => s !== undefined && s !== null).length > 0
            ? Math.round(
                questionScores
                  .filter((s) => s !== undefined && s !== null)
                  .reduce((sum, score) => sum + score, 0) /
                  questionScores.filter((s) => s !== undefined && s !== null)
                    .length
              )
            : 0
        }
        questions={questions}
        questionScores={questionScores}
        userAnswers={userAnswers}
      />
    </div>
  );
};
