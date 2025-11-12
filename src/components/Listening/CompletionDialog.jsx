import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, CheckCircle, Star, Download } from "lucide-react";
import { generateAndDownloadListeningLessonPDF } from "../../utils/pdfExporter";

export default function CompletionDialog({
  show,
  onClose,
  onContinue,
  lessonTitle,
  totalQuestions,
  completedQuestions,
  averageScore = 0,
  questions = [],
  questionScores = [],
  userAnswers = [],
}) {
  if (!show) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "from-[#ffc515] to-[#ffd84d]";
    if (score >= 75) return "from-[#ffd84d] to-[#ffc515]";
    return "from-[#cc6a15] to-[#ffc515]";
  };

  const getMessage = () => {
    if (averageScore >= 90) {
      return "Excellent! Outstanding performance!";
    }
    if (averageScore >= 75) {
      return "Great job! Well done!";
    }
    if (averageScore >= 60) {
      return "Good work! Keep practicing!";
    }
    return "Keep working on it! Practice makes perfect!";
  };

  const handleExportReport = () => {
    const lessonData = {
      lessonTitle: lessonTitle || "Listening Lesson",
      questions: questions,
      questionScores: questionScores,
      userAnswers: userAnswers,
      averageScore: averageScore,
      totalQuestions: totalQuestions,
      completedQuestions: completedQuestions,
    };

    const filename = `${lessonTitle || "listening-lesson"}-report.pdf`
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();

    generateAndDownloadListeningLessonPDF(lessonData, filename);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#ffc515] to-[#ffd84d] p-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Lesson Complete!</h2>
                    <p className="text-white/90 text-sm">
                      Congratulations on finishing this lesson
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6">
                {/* Completion Display */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-center mb-8"
                >
                  <div className="w-32 h-32 mx-auto relative flex items-center justify-center mb-4">
                    {/* Circular Progress Ring */}
                    <svg
                      className="w-32 h-32 transform -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#FFC107"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 54}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 54 * (1 - averageScore / 100)
                        }`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    {/* Percentage text */}
                    <div className="absolute text-2xl font-bold text-gray-900 whitespace-nowrap">
                      {averageScore}%
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getMessage()}
                  </h3>
                  {lessonTitle && (
                    <p className="text-gray-600 text-sm mb-4">{lessonTitle}</p>
                  )}
                  <p className="text-gray-600 text-sm">
                    Average score across all exercises
                  </p>
                </motion.div>

                {/* Statistics */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-[#ffc515]" />
                      <span className="text-sm text-gray-600">
                        Exercises Completed
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {completedQuestions} / {totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-[#ffc515]" />
                      <span className="text-sm text-gray-600">
                        Average Score
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {averageScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleExportReport}
                    className="flex-1 py-2 px-4 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </motion.button>
                  <motion.button
                    onClick={onContinue}
                    className="flex-1 py-2 px-4 rounded-full text-sm font-medium text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
                    style={{ background: "var(--gradient-primary)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back to Lessons
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
