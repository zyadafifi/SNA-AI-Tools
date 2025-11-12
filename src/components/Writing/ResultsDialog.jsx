import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

export default function ResultsDialog({
  show,
  onClose,
  overallScore,
  grammarResult,
  compiledArticle,
}) {
  if (!show || !grammarResult) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return "from-green-500 to-emerald-600";
    if (score >= 75) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Excellent! Your writing is outstanding.";
    if (score >= 75) return "Good job! Your writing is well done.";
    if (score >= 60) return "Not bad! Keep practicing to improve.";
    return "Keep working on it! Practice makes perfect.";
  };

  const spellingIssues =
    grammarResult.issues?.filter((issue) => issue.type === "spelling") || [];
  const grammarIssues =
    grammarResult.issues?.filter((issue) => issue.type === "grammar") || [];
  const styleIssues =
    grammarResult.issues?.filter((issue) => issue.type === "style") || [];

  const wordCount = compiledArticle
    ? compiledArticle.split(/\s+/).filter((w) => w.length > 0).length
    : 0;

  const totalIssues = grammarResult.issues?.length || 0;
  const issueRate =
    wordCount > 0 ? ((totalIssues / wordCount) * 100).toFixed(1) : 0;

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-teal-500 to-blue-500 p-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Lesson Complete!</h2>
                    <p className="text-white/90 text-sm">
                      Your writing analysis results
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6">
                {/* Score Display */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-center mb-8"
                >
                  <div
                    className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r ${getScoreColor(
                      overallScore
                    )} flex items-center justify-center shadow-lg mb-4`}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">
                        {overallScore}
                      </div>
                      <div className="text-sm text-white/90">/100</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getScoreMessage(overallScore)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {totalIssues === 0
                      ? "Perfect! No issues found."
                      : `Found ${totalIssues} issue${
                          totalIssues > 1 ? "s" : ""
                        } in your writing.`}
                  </p>
                </motion.div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-red-50 rounded-xl p-4 border border-red-200 text-center"
                  >
                    <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {spellingIssues.length}
                    </div>
                    <div className="text-xs text-red-600 font-medium">
                      Spelling
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center"
                  >
                    <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">
                      {grammarIssues.length}
                    </div>
                    <div className="text-xs text-yellow-600 font-medium">
                      Grammar
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center"
                  >
                    <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {wordCount}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Words
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center"
                  >
                    <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {issueRate}%
                    </div>
                    <div className="text-xs text-purple-600 font-medium">
                      Error Rate
                    </div>
                  </motion.div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Detailed Breakdown
                  </h4>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Words Written
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {wordCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Issues Found
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {totalIssues}
                      </span>
                    </div>
                    {styleIssues.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Style Suggestions
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {styleIssues.length}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Analysis Source
                      </span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {grammarResult.source === "languagetool"
                          ? "LanguageTool API"
                          : "Custom Checker"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <motion.button
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 cursor-pointer"
                  style={{ background: "var(--gradient-primary)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Full Results
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
