import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Lock, Clock, Ban } from "lucide-react";
import { useProgress } from "../../contexts/WritingProgressContext";

export default function TopicCards() {
  const { getTopicProgress, startTopic, topics, loading, error } =
    useProgress();

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Topics
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="bg-[#F8F8F8] rounded-2xl p-12 py-16 relative overflow-hidden">
            {/* Gradient overlay on the left */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(255, 251, 235, 0.8) 0%, rgba(255, 251, 235, 0.4) 30%, transparent 60%)",
              }}
            />
            <div className="relative z-10 text-center">
              <h1 className="text-4xl font-bold text-[#4A4A4A] mb-6">
                English Learning Topics
              </h1>
              <p className="text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
                Master English step by step. Complete each topic to unlock the
                next one.
              </p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {topics.map((topic, index) => {
            const topicProgress = getTopicProgress(topic.id);
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`bg-gray-50 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full min-h-[320px] relative group ${
                  topicProgress.isUnlocked ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Card Content */}
                <div className="flex flex-col h-full space-y-4">
                  {/* Title - Fixed height */}
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight h-14 flex items-start">
                    {topic.title}
                  </h3>

                  {/* Description - Fixed height */}
                  <p className="text-sm text-gray-600 leading-relaxed h-16 flex items-start">
                    {topic.description}
                  </p>

                  {/* Duration */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{topic.duration}</span>
                    </div>
                  </div>

                  {/* Progress Bar (for all unlocked topics) */}
                  {topicProgress.isUnlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                          Progress
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {topicProgress.phase === "not-started"
                            ? "Not Started"
                            : topicProgress.phase === "article-read"
                            ? "Article Read"
                            : topicProgress.phase === "questions-completed"
                            ? "Completed"
                            : "Start"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            background: "var(--gradient-primary)",
                            width:
                              topicProgress.phase === "not-started"
                                ? "0%"
                                : topicProgress.phase === "article-read"
                                ? "50%"
                                : topicProgress.phase === "questions-completed"
                                ? "100%"
                                : "0%",
                          }}
                        />
                      </div>
                      {/* Phase indicators */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span
                          className={
                            topicProgress.phase === "not-started"
                              ? "text-teal-600 font-medium"
                              : ""
                          }
                        >
                          Start
                        </span>
                        <span
                          className={
                            topicProgress.phase === "article-read"
                              ? "text-teal-600 font-medium"
                              : ""
                          }
                        >
                          Article
                        </span>
                        <span
                          className={
                            topicProgress.phase === "questions-completed"
                              ? "text-teal-600 font-medium"
                              : ""
                          }
                        >
                          Complete
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Spacer to push button to bottom */}
                  <div className="flex-grow"></div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {topicProgress.isUnlocked ? (
                      topicProgress.phase === "not-started" ? (
                        <Link to={`/article/${topic.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startTopic(topic.id)}
                            className="w-full text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <Play className="w-4 h-4" />
                            <span>Start Reading</span>
                          </motion.button>
                        </Link>
                      ) : topicProgress.phase === "article-read" ? (
                        <Link to={`/questions/${topic.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <Play className="w-4 h-4" />
                            <span>Answer Questions</span>
                          </motion.button>
                        </Link>
                      ) : topicProgress.phase === "questions-completed" ? (
                        <Link to={`/results/${topic.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <Play className="w-4 h-4" />
                            <span>View Results</span>
                          </motion.button>
                        </Link>
                      ) : (
                        <Link to={`/article/${topic.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startTopic(topic.id)}
                            className="w-full text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <Play className="w-4 h-4" />
                            <span>Start Reading</span>
                          </motion.button>
                        </Link>
                      )
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-200 text-gray-500 font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 cursor-not-allowed relative"
                      >
                        <div className="relative w-4 h-4 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-yellow-500 group-hover:opacity-0 transition-opacity absolute" />
                          <Ban className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute" />
                        </div>
                        <span>Locked</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
