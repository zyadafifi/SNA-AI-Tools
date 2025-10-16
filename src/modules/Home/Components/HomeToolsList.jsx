import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import PropTypes from "prop-types";

export const HomeToolsList = ({ tools }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  return (
    <section id="tools">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            key={tool.id}
            className="relative group mb-5 sm:mb-10 last:mb-0"
            onMouseEnter={() => setHoveredCard(tool.id)}
            onMouseLeave={() => setHoveredCard(null)}
            id={`${tool.link.replace("/", "")}`}
          >
            <div
              className={`relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border transition-all duration-500 ${
                hoveredCard === tool.id
                  ? "scale-[1.02] shadow-2xl border-white/40 bg-white/90"
                  : "shadow-lg border-gray-200/50"
              }`}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-all duration-700 blur-2xl`}
                />
              </div>

              <div className="relative z-10">
                {/* Icon with floating animation */}
                <div
                  className={`inline-flex p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${
                    tool.color
                  } mb-5 sm:mb-6 shadow-lg transform transition-all duration-500 ${
                    hoveredCard === tool.id
                      ? "scale-110 -rotate-6 shadow-2xl"
                      : "scale-100 rotate-0"
                  }`}
                >
                  <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                </div>

                {/* Title with gradient on hover */}
                <h3
                  className={`text-2xl sm:text-3xl font-bold mb-2 transition-all duration-300 ${
                    hoveredCard === tool.id
                      ? "bg-gradient-to-r bg-clip-text text-transparent from-gray-900 via-gray-700 to-gray-900"
                      : "text-gray-900"
                  }`}
                >
                  {tool.title}
                </h3>
                <p className="text-base arabic_font sm:text-lg text-gray-700 font-semibold mb-4">
                  {tool.titleAr}
                </p>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">
                  {tool.description}
                </p>
                <p className="text-sm arabic_font sm:text-base text-gray-600 mb-6 leading-relaxed">
                  {tool.descriptionAr}
                </p>

                {/* Features with stagger animation */}
                <div className="space-y-3 mb-6 sm:mb-8">
                  {tool.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 transform transition-all duration-300 ${
                        hoveredCard === tool.id ? "translate-x-2" : ""
                      }`}
                      style={{ transitionDelay: `${idx * 60}ms` }}
                    >
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Modern button with icon */}
                <Link
                  to={tool.link}
                  className="group/btn relative w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${tool.color}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />

                  <span className="relative">Get Started</span>
                  <ChevronRight className="relative w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
};

HomeToolsList.propTypes = {
  tools: PropTypes.array,
};
