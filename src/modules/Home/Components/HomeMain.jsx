import { useState } from "react";
import {
  Volume2,
  Headphones,
  PenTool,
  BookOpen,
  ChevronRight,
  Sparkles,
  Mic2,
  PlayCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const HomeMain = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const tools = [
    {
      id: 1,
      icon: Volume2,
      title: "Pronunciation Tool",
      titleAr: "النطق",
      description:
        "Master perfect pronunciation with AI-powered feedback and real-time correction",
      descriptionAr:
        "أتقن النطق الصحيح مع تعليقات الذكاء الاصطناعي والتصحيح الفوري",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Voice Recognition", "Accent Analysis", "Progress Tracking"],
      link: "/pronounce/home",
    },
    {
      id: 2,
      icon: Headphones,
      title: "Listening Tool",
      titleAr: "الاستماع",
      description:
        "Enhance your listening skills with native speakers and adaptive content",
      descriptionAr: "حسّن مهارات الاستماع مع متحدثين أصليين ومحتوى تفاعلي",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Native Audio", "Speed Control", "Comprehension Tests"],
      link: "/listening/home",
    },
    {
      id: 3,
      icon: PenTool,
      title: "Writing Tool",
      titleAr: "الكتابة",
      description:
        "Improve your writing with intelligent grammar checking and style suggestions",
      descriptionAr: "طوّر كتابتك مع فحص القواعد الذكي واقتراحات الأسلوب",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Grammar Check", "Style Tips", "Vocabulary Builder"],
      link: "/writing/home",
    },
    {
      id: 4,
      icon: BookOpen,
      title: "Reading Tool",
      titleAr: "القراءة",
      description:
        "Build reading fluency with leveled content and interactive comprehension",
      descriptionAr: "ابنِ طلاقة القراءة مع محتوى متدرج وفهم تفاعلي",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Adaptive Levels", "Instant Translation", "Reading Analytics"],
      link: "/reading",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-5">
      <div className="max-w-4xl mx-auto lg:max-w-6xl xl:max-w-7xl">
        {/* ===================== HERO SECTION ===================== */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative overflow-hidden rounded-3xl p-4 lg:p-6 bg-gradient-to-br from-[#275151] via-[#63a29b] to-[#275151] text-white mb-8 sm:mb-12 md:mb-16"
        >
          {/* 🌌 Animated Background Gradient */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 z-0"
            animate={{
              background: [
                "linear-gradient(135deg, #275151, #63a29b, #275151)",
                "linear-gradient(225deg, #275151, #5fa59b, #63a29b)",
                "linear-gradient(315deg, #275151, #63a29b, #275151)",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* ✨ Glow & pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-black/10 blur-3xl"
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 opacity-15 [mask-image:radial-gradient(white,transparent_75%)]"
            style={{
              backgroundImage:
                "radial-gradient(1px 1px at 20px 20px, rgba(255,255,255,.3) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "200px 200px"] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* 🧠 Content */}
          <div className="relative z-10 grid gap-8 lg:grid-cols-1 lg:gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase bg-white/15 px-3 py-1.5 rounded-full backdrop-blur">
                <Sparkles className="w-4 h-4" /> Powered by AI • SNA Method
              </p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-balance"
              >
                Speak English with Confidence
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-2 arabic_font text-xl sm:text-2xl md:text-3xl font-bold text-white/95"
                dir="rtl"
              >
                اتكلم إنجليزي بثقة — من غير حفظ عشوائي
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-4 md:mt-6 text-white/90 text-base sm:text-lg leading-relaxed "
              >
                Train your pronunciation, listening, writing, and reading in one
                place. Built for real-life conversations with instant feedback
                and adaptive content.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="arabic_font text-white/90 text-sm sm:text-base mt-2 "
                dir="rtl"
              >
                درّب النطق، والاستماع، والكتابة، والقراءة في مكان واحد — بتغذية
                راجعة فورية ومحتوى يتكيّف مع مستواك.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link
                  to="/pronounce/home"
                  className="inline-flex items-center arabic_font justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-base bg-white text-[#167f78] hover:bg-white/90 active:scale-95 transition"
                >
                  <Mic2 className="w-5 h-5" /> ابدأ الآن
                </Link>
                <a
                  href="#tools"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-base bg-black/15 text-white hover:bg-black/20 active:scale-95 transition"
                >
                  <PlayCircle className="w-5 h-5" /> Explore Tools
                </a>
              </motion.div>
            </div>
            {/* Trust/Stats */}{" "}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 ">
              {" "}
              <div className="rounded-xl bg-white/10 px-4 py-3 flex flex-col items-center justify-center">
                {" "}
                <p className="text-2xl font-extrabold">10k+</p>{" "}
                <p className="text-xs text-white/80">Active Learners</p>{" "}
              </div>{" "}
              <div className="rounded-xl bg-white/10 px-4 py-3 flex flex-col items-center justify-center">
                {" "}
                <p className="text-2xl font-extrabold">4 Skills</p>{" "}
                <p className="text-xs text-white/80">One Integrated Suite</p>{" "}
              </div>{" "}
              <div className="rounded-xl bg-white/10 px-4 py-3 col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
                {" "}
                <p className="text-2xl font-extrabold">Real‑time</p>{" "}
                <p className="text-xs text-white/80">Feedback & Tracking</p>{" "}
              </div>{" "}
            </div>
            {/* 🌟 Feature Tiles */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {tools.slice(0, 4).map((tool, idx) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
                    >
                      <a
                        href={`#${tool.link.replace("/", "")}`}
                        className="flex flex-col items-center justify-center text-center group relative rounded-2xl px-2 py-4 md:p-6 bg-white/10 border border-white/15 hover:bg-white/15 transition-all backdrop-blur shadow-sm hover:shadow-md"
                      >
                        <div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                            tool.color || "from-emerald-400/30 to-teal-500/30"
                          } opacity-20 group-hover:opacity-30 transition-opacity`}
                        />
                        <div className="relative z-10">
                          <div className="inline-flex p-3 rounded-xl bg-white/20">
                            {Icon && <Icon className="w-6 h-6 text-white" />}
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-white/90 mb-1">
                              {tool.title}
                            </p>
                            <p
                              className="arabic_font text-xs text-white/80"
                              dir="rtl"
                            >
                              {tool.titleAr}
                            </p>
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Divider shimmer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          {/* Keyframes for backup */}
          <style>{`
        @keyframes patternMove {
          0% { background-position: 0px 0px; }
          100% { background-position: 200px 200px; }
        }
      `}</style>
        </motion.header>

        {/* ===================== SECTION TITLE ===================== */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Language Learning Tools
          </h2>
          <p className="text-lg sm:text-xl arabic_font text-gray-700 font-semibold">
            أدوات احترافية لإتقان اللغة
          </p>
        </div>

        {/* ===================== TOOLS LIST ===================== */}
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
      </div>
    </div>
  );
};
