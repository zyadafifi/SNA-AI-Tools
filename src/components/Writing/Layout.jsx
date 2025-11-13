import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Home } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="gradient-background">
      {/* Header */}
      <motion.div
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300"
                style={{ background: "var(--gradient-primary)" }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
              <motion.span
                className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Insightful
              </motion.span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-all duration-200 font-medium cursor-pointer group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Home</span>
              </Link>
            </nav>
          </div>
        </div>
      </motion.div>

      <motion.main
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
