import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Writing/Layout";
import { Card, Input } from "../components/Writing/ui";
import { useProgress } from "../contexts/WritingProgressContext";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Send,
} from "lucide-react";

// 6 main questions, each with 3 sub-questions (18 total questions)
const questionsStructure = [
  {
    id: "why",
    category: "Why",
    subQuestions: [
      "Why is this topic important to you personally?",
      "Why do you think others should care about this topic?",
      "Why did you choose to explore this particular subject?",
    ],
  },
  {
    id: "what",
    category: "What",
    subQuestions: [
      "What are the main aspects of this topic that interest you most?",
      "What have you learned that you didn't know before?",
      "What would you like to explore further about this topic?",
    ],
  },
  {
    id: "when",
    category: "When",
    subQuestions: [
      "When did you first become interested in this topic?",
      "When do you typically engage with or think about this subject?",
      "When do you plan to apply what you've learned?",
    ],
  },
  {
    id: "where",
    category: "Where",
    subQuestions: [
      "Where do you see this topic having the most impact in your life?",
      "Where have you encountered this subject before?",
      "Where would you like to see improvements or changes related to this topic?",
    ],
  },
  {
    id: "who",
    category: "Who",
    subQuestions: [
      "Who are the people most affected by or involved in this topic?",
      "Who has influenced your understanding of this subject?",
      "Who would you share your knowledge about this topic with?",
    ],
  },
  {
    id: "how",
    category: "How",
    subQuestions: [
      "How do you plan to apply what you've learned in your daily life?",
      "How has your perspective on this topic changed after reading the article?",
      "How would you explain this topic to someone who knows nothing about it?",
    ],
  },
];

export default function Questions() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { advancePhase } = useProgress();

  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [answers, setAnswers] = useState({});

  const handleQuestionToggle = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleAnswerChange = (questionKey, answer) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: answer }));
  };

  const handleSubmit = () => {
    // Since canSubmit is only true when all questions are answered, no need for validation
    // Advance to results phase and store answers
    advancePhase(topicId);
    sessionStorage.setItem("userAnswers", JSON.stringify(answers));
    navigate(`/results/${topicId}`);
  };

  const answeredCount = Object.values(answers).filter(
    (answer) => answer.trim().length > 0
  ).length;
  const totalQuestions = questionsStructure.length * 3; // 18 total questions
  const canSubmit = answeredCount === totalQuestions;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-5xl font-bold font-display bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Guided Reflection
          </motion.h1>

          <motion.p
            className="text-xl text-surface-600 max-w-2xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Take your time to reflect on the article you just read. Please
            answer all questions to complete your reflection and proceed to the
            results.
          </motion.p>

          <motion.div
            className="inline-flex items-center space-x-4 bg-white rounded-2xl px-6 py-4 shadow-soft border border-surface-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-surface-700">
                Progress
              </span>
            </div>
            <div className="text-2xl font-bold text-primary-600">
              {answeredCount}
            </div>
            <div className="text-surface-400">/</div>
            <div className="text-surface-600">{totalQuestions}</div>
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-surface-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full ${
                canSubmit
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-primary-500 to-accent-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              transition={{ duration: 0.8, delay: 1.0 }}
            />
          </div>
          {canSubmit && (
            <motion.div
              className="text-center mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              <span className="text-sm font-medium text-green-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                All questions completed!
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Questions Accordion */}
        <motion.div
          className="space-y-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {questionsStructure.map((questionGroup, groupIndex) => {
            const answeredInGroup = questionGroup.subQuestions.filter(
              (_, index) =>
                answers[`${questionGroup.id}-${index}`]?.trim().length > 0
            ).length;

            return (
              <motion.div
                key={questionGroup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + groupIndex * 0.1 }}
              >
                <Card className="overflow-hidden p-0">
                  {/* Main Question Header */}
                  <motion.button
                    onClick={() => handleQuestionToggle(questionGroup.id)}
                    className="w-full px-6 py-6 text-left bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 transition-all duration-300 flex items-center justify-between cursor-pointer group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {answeredInGroup ===
                        questionGroup.subQuestions.length ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : answeredInGroup > 0 ? (
                          <div className="w-6 h-6 rounded-full border-2 border-primary-500 flex items-center justify-center">
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                          </div>
                        ) : (
                          <Circle className="w-6 h-6 text-surface-400" />
                        )}
                        <span className="text-xl font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">
                          {questionGroup.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-soft"
                        animate={{
                          scale:
                            expandedQuestion === questionGroup.id ? 1.05 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-sm font-medium text-primary-600">
                          {answeredInGroup} /{" "}
                          {questionGroup.subQuestions.length}
                        </span>
                      </motion.div>

                      <motion.div
                        animate={{
                          rotate:
                            expandedQuestion === questionGroup.id ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {expandedQuestion === questionGroup.id ? (
                          <ChevronUp className="w-5 h-5 text-primary-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-surface-600" />
                        )}
                      </motion.div>
                    </div>
                  </motion.button>

                  {/* Sub-questions */}
                  <AnimatePresence>
                    {expandedQuestion === questionGroup.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-surface-200 bg-white"
                      >
                        {questionGroup.subQuestions.map(
                          (subQuestion, index) => (
                            <motion.div
                              key={index}
                              className="p-6 border-b border-surface-100 last:border-b-0"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-semibold text-primary-600">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-surface-800 font-medium mb-4 text-lg leading-relaxed">
                                    {subQuestion}
                                  </p>
                                  <Input
                                    as="textarea"
                                    rows={4}
                                    placeholder="Share your thoughts here..."
                                    value={
                                      answers[`${questionGroup.id}-${index}`] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleAnswerChange(
                                        `${questionGroup.id}-${index}`,
                                        e.target.value
                                      )
                                    }
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          className="text-center mt-8 p-4 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Answered: {answeredCount} / {totalQuestions} questions
            </p>
            <p className="text-xs text-gray-500">
              {canSubmit
                ? "All questions completed! Ready to submit!"
                : `Please answer all ${totalQuestions} questions to continue`}
            </p>
          </div>
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`min-w-[200px] px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              !canSubmit
                ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-blue-600 focus:ring-teal-500 cursor-pointer"
            }`}
            whileHover={!canSubmit ? {} : { y: -2, scale: 1.02 }}
            whileTap={!canSubmit ? {} : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-center">
              <Send className="mr-2 w-5 h-5" />
              Submit Reflection
            </div>
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
}
