import { motion } from "framer-motion";
import logo from "/assets/images/logo.png";

export const HomeSectionTitle = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="relative overflow-hidden py-11 rounded-3xl"
    >
      <div className="flex items-center justify-center">
        <div className="w-44 mb-4">
          <img className="w-full" src={logo} alt="" />
        </div>
      </div>
      {/* Background with Custom Colors */}

      {/* Floating Circles Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10 animate-float"
          style={{ backgroundColor: "#63a29b" }}
        ></div>

        <div
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full opacity-10 animate-float-delayed"
          style={{ backgroundColor: "#275151" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-10 animate-float"
          style={{ backgroundColor: "#63a29b", animationDelay: "2s" }}
        ></div>
      </div>

      {/* Content Container */}
      <div className="relative text-center px-4 max-w-5xl mx-auto">
        {/* Top Badge with Icon */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 backdrop-blur-md"
          style={{
            backgroundColor: "#ffc51563",
            borderColor: "#cc6a15",
          }}
        >
          <svg
            className="w-4 h-4"
            style={{ color: "var(--main-text-color)" }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          <span
            className="text-sm font-bold tracking-wide"
            style={{ color: "var(--main-text-color)" }}
          >
            PROFESSIONAL LEARNING
          </span>
        </div>

        {/* Main Heading with Line Effect */}
        <div className="mb-6">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-2 leading-tight tracking-tight">
            <span style={{ color: "var(--primary-color)" }}>Language</span>
            <br />
            <span className="relative inline-block">
              <span style={{ color: "var(--secondary-color)" }}>
                Learning Tools
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9C50 3 100 1 150 5C200 9 250 7 298 4"
                  stroke="#ffc515"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
        </div>

        {/* Arabic Text with Decorative Elements */}
        <div className="relative inline-block mb-8">
          <div
            className="absolute -right-8 top-0 w-6 h-6 rounded opacity-50"
            style={{ backgroundColor: "#ffc515" }}
          ></div>
          <div
            className="absolute -left-8 bottom-0 w-6 h-6 rounded opacity-50"
            style={{ backgroundColor: "#cc6a15" }}
          ></div>

          <p
            className="text-2xl arabic_font sm:text-3xl md:text-4xl font-bold px-8 py-4"
            style={{
              color: "#ffc515",
            }}
          >
            أدوات احترافية لإتقان اللغة
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {["Smart Learning", "AI-Powered", "Track Progress"].map(
            (feature, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: "#ffc51563",
                  borderColor: "#cc6a15",
                  color: "var(--main-text-color)",
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>

        {/* Bottom Decorative Line */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <div
            className="h-0.5 w-20 rounded-full"
            style={{ backgroundColor: "#ffc515" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#ffc515" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#cc6a15" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#ffc515" }}
          ></div>
          <div
            className="h-0.5 w-20 rounded-full"
            style={{ backgroundColor: "#ffc515" }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap");

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(15px) translateX(-15px);
          }
          66% {
            transform: translateY(-10px) translateX(10px);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
};
