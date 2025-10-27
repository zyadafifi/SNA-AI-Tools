import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dataService from "../services/dataService";
import ListeningPhase from "../components/Listening/LessonPhase/ListeningPhase";
import DictationPhase from "../components/Listening/LessonPhase/DictationPhase";
import Header from "../components/Listening/Header";
import TipsPanel from "../components/Listening/TipsPanel";

export const ListeningLessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState("listening");
  const [showTips, setShowTips] = useState(false);
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const foundLesson = dataService.getLessonById(parseInt(id));
    if (foundLesson) {
      // Check if lesson is unlocked
      if (!dataService.isLessonUnlocked(parseInt(id))) {
        alert("This lesson is locked. Complete the previous lesson first!");
        navigate("/listening/home");
        return;
      }
      setLesson(foundLesson);
    } else {
      navigate("/listening/home");
    }
  }, [id, navigate]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  const phases = [
    { id: "listening", name: "Listening", icon: "🎧" },
    { id: "dictation", name: "Dictation", icon: "✏️" },
  ];

  const handleLessonComplete = () => {
    dataService.completeLesson(parseInt(id));
    alert("Congratulations! You have completed this lesson!");
    navigate("/listening/home");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onToggleTips={() => setShowTips(!showTips)} />

      <div className="max-w-md mx-auto px-4 py-4 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Lesson Overview Card */}
        <div className="bg-[#ffc515] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-[0_8px_25px_rgba(255,197,21,0.3)]">
          <div className="text-center text-white">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mb-4 sm:mb-6 leading-relaxed">
              {lesson.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-white/30 flex-1">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {lesson.duration}
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-white/30 flex-1">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {lesson.exercises.length} exercises
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-white/30 flex-1">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  Lesson {lesson.id} of 60
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          {phases.map((phase) => (
            <div
              key={phase.id}
              onClick={() => setCurrentPhase(phase.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl cursor-pointer transition-all duration-300 font-semibold text-xs sm:text-sm flex-1 justify-center touch-manipulation ${
                currentPhase === phase.id
                  ? "bg-[#ffc515] text-white shadow-[0_4px_12px_rgba(255,197,21,0.3)]"
                  : "bg-white text-gray-600 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              }`}
            >
              <span className="text-sm sm:text-base">{phase.icon}</span>
              <span className="text-xs sm:text-sm">{phase.name}</span>
            </div>
          ))}
        </div>

        {/* Phase Content */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_8px_25px_rgba(0,0,0,0.1)] border border-gray-100 min-h-[300px] sm:min-h-[400px]">
          {currentPhase === "listening" && (
            <ListeningPhase
              lesson={lesson}
              onComplete={() => setCurrentPhase("dictation")}
            />
          )}

          {currentPhase === "dictation" && (
            <DictationPhase lesson={lesson} onComplete={handleLessonComplete} />
          )}
        </div>
      </div>

      {/* Tips Panel */}
      <TipsPanel isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
};
