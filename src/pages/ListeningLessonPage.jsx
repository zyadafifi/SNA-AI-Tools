import { useState, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Headphones, PenTool } from "lucide-react";
import dataService from "../services/dataService";
import ListeningPhase from "../components/Listening/LessonPhase/ListeningPhase";
import DictationPhase from "../components/Listening/LessonPhase/DictationPhase";
import TipsPanel from "../components/Listening/TipsPanel";

export const ListeningLessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState("video");
  const [showTips, setShowTips] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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
    alert("Congratulations! You have completed this lesson!");
    navigate("/listening/home");
  };

  const handleDictationCompleted = async () => {
    const total = Math.max(1, questions.length || 5);
    const nextIndex = currentQuestionIndex + 1;
    const lessonId = parseInt(id);
    // Update progress: 20% per question
    const newProgress = Math.min(100, Math.round((nextIndex / total) * 100));
    await dataService.updateLessonProgress(lessonId, newProgress);
    if (nextIndex >= total) {
      await handleLessonComplete();
      return;
    }
    setCurrentQuestionIndex(nextIndex);
    setCurrentPhase("video");
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
          />
        )}

        {currentPhase === "dictation" && questions[currentQuestionIndex] && (
          <DictationPhase
            lesson={lesson}
            correctText={questions[currentQuestionIndex].text}
            onComplete={handleDictationCompleted}
            onListenAgain={() => setCurrentPhase("video")}
          />
        )}
      </div>
    );
  }

  // Desktop layout - combined video and dictation view
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'url("/assets/images/gradient-background.png") #fff',
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "left",
      }}
    >
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
              />
            )}
          </div>

          {/* Dictation Section - Always visible on desktop */}
          {questions[currentQuestionIndex] && (
            <DictationPhase
              lesson={lesson}
              correctText={questions[currentQuestionIndex].text}
              onComplete={handleDictationCompleted}
              onListenAgain={() => {
                // Video will restart when user clicks play button
                // The video is always visible on desktop, so no phase switching needed
              }}
              isDesktop={true}
            />
          )}
        </div>
      </div>

      {/* Tips Panel */}
      <TipsPanel isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
};
