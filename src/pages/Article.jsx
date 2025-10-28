import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Writing/Layout";
import { Button, Card } from "../components/Writing/ui";
import { useProgress } from "../contexts/WritingProgressContext";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  User,
  Calendar,
  Target,
} from "lucide-react";

// Default article for fallback
const defaultArticle = {
  title: "Selected Topic",
  content: `This is a sample article about your selected topic. In a real implementation, each topic would have its own comprehensive 300-word article covering the key aspects, benefits, challenges, and practical applications of the subject matter.

The article would provide valuable insights and information that help readers understand the topic better before they begin answering the guided questions. This reading phase is crucial as it gives context and background knowledge that will inform their responses.

Each article is carefully crafted to be engaging, informative, and thought-provoking, encouraging readers to reflect on how the topic relates to their own experiences and perspectives. The content serves as a foundation for the deeper exploration that follows in the question-answering phase.

The articles cover various aspects of the topic, including its importance, practical applications, common challenges, and potential benefits. This comprehensive approach ensures that readers have a well-rounded understanding before proceeding to share their own thoughts and experiences.

By reading the article first, users can provide more informed and thoughtful responses to the questions that follow, leading to a richer and more meaningful reflection experience. This structured approach helps maximize the learning and self-discovery potential of the platform.

The combination of reading and reflection creates a powerful learning experience that goes beyond simple question-and-answer formats. It encourages critical thinking, personal connection, and deeper understanding of important life topics.

This methodology has been proven effective in educational settings and personal development programs, making it an ideal approach for this platform's goals of promoting thoughtful reflection and personal growth through structured learning experiences.`,
};

export default function Article() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { advancePhase } = useProgress();
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/assets/pronounceData.json")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading articles:", error);
        setLoading(false);
      });
  }, []);

  const article = articles[topicId] || defaultArticle;
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleArticleComplete = () => {
    advancePhase(topicId);
    // Navigate to questions page after marking as read
    navigate(`/questions/${topicId}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Article Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <motion.div
              className="inline-flex items-center space-x-2 text-sm text-gray-500 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Reading Article</span>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {article.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Take a moment to read through this article. When you're ready,
              proceed to answer the guided questions that will help you reflect
              on the content.
            </motion.p>
          </motion.div>

          {/* Article Content */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-8 bg-white shadow-lg">
                <div className="prose prose-lg max-w-none">
                  <motion.div
                    className="text-gray-700 leading-relaxed whitespace-pre-line text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                  >
                    {article.content}
                  </motion.div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Reading Progress */}
                <Card className="p-6 bg-white shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Reading Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="text-sm text-gray-600">
                        Reading Article
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-400">
                        Answer Questions
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-400">
                        View Results
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Article Info */}
                <Card className="p-6 bg-white shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Article Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        5 minutes to read
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Published today
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">300 words</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Button
              onClick={handleArticleComplete}
              variant="gradient"
              size="lg"
              className="inline-flex items-center min-w-[200px] bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 cursor-pointer"
            >
              Mark as Read
              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.div>
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              size="lg"
              className="inline-flex items-center min-w-[200px] cursor-pointer"
            >
              Back to Topics
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
