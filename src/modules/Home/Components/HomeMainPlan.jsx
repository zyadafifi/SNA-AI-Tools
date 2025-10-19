import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readingData } from "../../../config/readingData/readingData";

// Duolingo-style icons
const StarIcon = ({ filled = false, size = "w-6 h-6", className = "" }) => (
  <svg viewBox="0 0 24 24" className={`${size} ${className}`}>
    <path
      d="M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.64L12 17.77 6.05 20.82l1.14-6.64L2.39 9.49l6.64-.97L12 2.5z"
      className={filled ? "fill-white" : "fill-transparent"}
      stroke={filled ? "white" : "currentColor"}
      strokeWidth={filled ? 0 : 1.5}
    />
  </svg>
);

const BookIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
  </svg>
);

const TreasureChestIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z" />
  </svg>
);

const TrophyIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M7 4V2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2h3c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-1v6c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h3zm2-2h6v2H9V2zm-1 4h8v2H8V6zm0 4h8v6H8v-6z" />
  </svg>
);

const HeartIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const ShieldIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

const LightningIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

const GemIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M6 2L2 7l10 13 10-13-4-5H6zm2.03 2L12 4.97 15.97 4H8.03z" />
  </svg>
);

const CrownIcon = ({ size = "w-6 h-6", className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${size} ${className}`}
    fill="currentColor"
  >
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 2.1L12 8l-3.1 2.7-2.1-2.1L7.7 14z" />
  </svg>
);

export function HomeMainPlan() {
  const [data, setData] = useState({
    pronounce: null,
    writing: null,
    listening: null,
  });
  const [loading, setLoading] = useState({
    pronounce: true,
    writing: true,
    listening: true,
  });
  const [errors, setErrors] = useState({
    pronounce: null,
    writing: null,
    listening: null,
  });

  const fetchData = async (url, key) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      setData((p) => ({ ...p, [key]: json }));
      setErrors((p) => ({ ...p, [key]: null }));
    } catch (e) {
      setErrors((p) => ({ ...p, [key]: e.message }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  useEffect(() => {
    fetchData("/assets/pronounceData.json", "pronounce");
    fetchData("/assets/writingData.json", "writing");
    fetchData("/assets/listeningData.json", "listening");
  }, []);

  const lengths = useMemo(
    () => ({
      pronounce: data.pronounce?.lessons?.length || 0,
      writing: data.writing?.topics?.length || 0,
      listening: data.listening?.lessons?.length || 0,
      reading: readingData?.length || 0,
    }),
    [data]
  );

  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);
  const maxKey = useMemo(
    () =>
      Object.keys(lengths).reduce((a, b) => (lengths[a] > lengths[b] ? a : b)),
    [lengths]
  );
  const total = lengths[maxKey] || 0;

  const [unlockedCount, setUnlockedCount] = useState(() => {
    const saved = localStorage.getItem("planUnlockedCount");
    return saved ? Number(saved) : 1;
  });
  useEffect(
    () => localStorage.setItem("planUnlockedCount", String(unlockedCount)),
    [unlockedCount]
  );

  if (isLoading) {
    return (
      <div className="mb-8 text-center py-8">
        <div className="animate-pulse text-gray-600">Loading lessons…</div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="mb-8 text-center py-8">
        <div className="text-red-600">
          Error loading data. Please try again.
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="mb-8 text-center py-8">
        <div className="text-gray-600">No lessons available yet.</div>
      </div>
    );
  }

  // Create lesson nodes with distinct icons for each lesson
  const createLessonNodes = (total) => {
    const iconTypes = [
      "star",
      "book",
      "trophy",
      "heart",
      "shield",
      "lightning",
      "gem",
      "crown",
    ];
    const nodes = [];

    for (let i = 0; i < total; i++) {
      const iconType = iconTypes[i % iconTypes.length];
      const isSpecial = i === total - 1; // Last lesson is special

      nodes.push({
        index: i,
        label: `Lesson ${i + 1}`,
        iconType,
        isSpecial,
      });
    }
    return nodes;
  };

  const nodes = createLessonNodes(total);

  const renderIcon = (iconType, isUnlocked, size = "w-8 h-8") => {
    const iconProps = { size, filled: isUnlocked };
    const iconClass = isUnlocked ? "text-white" : "text-gray-500";

    switch (iconType) {
      case "book":
        return <BookIcon {...iconProps} className={iconClass} />;
      case "trophy":
        return <TrophyIcon {...iconProps} className={iconClass} />;
      case "heart":
        return <HeartIcon {...iconProps} className={iconClass} />;
      case "shield":
        return <ShieldIcon {...iconProps} className={iconClass} />;
      case "lightning":
        return <LightningIcon {...iconProps} className={iconClass} />;
      case "gem":
        return <GemIcon {...iconProps} className={iconClass} />;
      case "crown":
        return <CrownIcon {...iconProps} className={iconClass} />;
      default:
        return <StarIcon {...iconProps} className={iconClass} />;
    }
  };

  return (
    <div className="flex justify-center py-8 px-4">
      <div className="relative flex flex-col items-center space-y-12">
        {nodes.map((node, index) => {
          const isUnlocked = node.index < unlockedCount;
          const isCurrent = node.index === unlockedCount - 1;
          const isNextUp = node.index === unlockedCount;
          const isLocked = node.index >= unlockedCount;

          // ========================================
          // SIMPLE ALTERNATING LESSON PATH
          // ========================================
          // Pattern: Simple alternating left-right zig-zag pattern like Duolingo
          // - Lesson 1: Center
          // - Lesson 2: Right
          // - Lesson 3: Left
          // - Lesson 4: Right
          // - Lesson 5: Left
          // - Lesson 6: Right
          // And so on...
          //
          // Visual representation:
          // Lesson 1: ↑ (center)
          // Lesson 2:  → (right)
          // Lesson 3: ← (left)
          // Lesson 4:  → (right)
          // Lesson 5: ← (left)
          // Lesson 6:  → (right)

          // Simple alternating pattern: even indices are center, odd indices alternate
          const isEven = index % 2 === 0;
          let horizontalOffset = isEven
            ? "translate-x-0"
            : index % 4 === 1
            ? "translate-x-8"
            : "-translate-x-8";

          // On mobile, reduce the offset proportionally
          const mobileOffset = horizontalOffset
            .replace("-translate-x-8", "-translate-x-4")
            .replace("translate-x-8", "translate-x-4");

          return (
            <div
              key={node.index}
              className={`
                relative flex flex-col items-center
                ${mobileOffset} md:${horizontalOffset}
                transition-all duration-500 ease-in-out
              `}
            >
              {/* START label for current lesson - positioned above the active node */}
              {isCurrent && (
                <div className="mb-4 relative">
                  <div className="bg-white border-2 border-[var(--primary-color)] rounded-full px-4 py-2 shadow-lg">
                    <span className="text-[var(--secondary-color)] font-bold text-sm uppercase">
                      START
                    </span>
                  </div>
                  {/* Small triangle pointer pointing down to the node */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-[var(--primary-color)]"></div>
                </div>
              )}

              {/* Lesson node */}
              <div className="relative">
                <div
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center
                    transition-all duration-300 ease-in-out
                    shadow-lg
                    ${
                      isUnlocked
                        ? "bg-gradient-to-b from-[var(--primary-color)] to-[var(--secondary-color)] shadow-[var(--primary-color)]/30 hover:scale-105 hover:shadow-xl hover:shadow-[var(--primary-color)]/50 cursor-pointer"
                        : isNextUp
                        ? "bg-gradient-to-b from-[var(--primary-color)] to-[var(--secondary-color)] shadow-[var(--primary-color)]/30 ring-4 ring-[var(--primary-color)]/20 ring-opacity-60 hover:scale-105 hover:shadow-xl hover:shadow-[var(--primary-color)]/50 cursor-pointer"
                        : "bg-gray-200 shadow-gray-200 opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  {renderIcon(node.iconType, isUnlocked || isNextUp)}
                </div>

                {/* Clickable link overlay */}
                {(isUnlocked || isNextUp) && (
                  <Link
                    to={`/plan/slug/lesson-${node.index + 1}`}
                    onClick={() => {
                      if (isNextUp) {
                        setUnlockedCount((c) => Math.min(c + 1, total));
                      }
                    }}
                    className="absolute inset-0 rounded-full z-10"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
