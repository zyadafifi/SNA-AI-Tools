import { motion } from "framer-motion";
import { Sparkles, Mic2, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const HomeHeroSection = ({ tools }) => {
  return (
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
            place. Built for real-life conversations with instant feedback and
            adaptive content.
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
  );
};

HomeHeroSection.propTypes = {
  tools: PropTypes.array,
};
