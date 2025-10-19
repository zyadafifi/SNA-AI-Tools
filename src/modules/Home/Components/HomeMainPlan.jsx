import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readingData } from "../../../config/readingData/readingData";

// Duolingo-style icons
const StarIcon = ({ filled = false, size = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={size}>
    <path
      d="M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.64L12 17.77 6.05 20.82l1.14-6.64L2.39 9.49l6.64-.97L12 2.5z"
      className={filled ? "fill-white" : "fill-transparent"}
      stroke={filled ? "white" : "currentColor"}
      strokeWidth={filled ? 0 : 1.5}
    />
  </svg>
);

const BookIcon = ({ size = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={size} fill="currentColor">
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
  </svg>
);

const TreasureChestIcon = ({ size = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={size} fill="currentColor">
    <path d="M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z" />
  </svg>
);

const TrophyIcon = ({ size = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={size} fill="currentColor">
    <path d="M7 4V2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2h3c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-1v6c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h3zm2-2h6v2H9V2zm-1 4h8v2H8V6zm0 4h8v6H8v-6z" />
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

  // Create lesson nodes with different types for variety
  const createLessonNodes = (total) => {
    const nodes = [];
    for (let i = 0; i < total; i++) {
      let iconType = "star";
      let isSpecial = false;

      // Add variety: some book lessons, treasure chest, and trophy
      if (i === 2) iconType = "book";
      else if (i === 5) {
        iconType = "treasure";
        isSpecial = true;
      } else if (i === total - 1) {
        iconType = "trophy";
        isSpecial = true;
      }

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

  const renderIcon = (iconType, isUnlocked, size = "w-6 h-6") => {
    const iconProps = { size, filled: isUnlocked };

    switch (iconType) {
      case "book":
        return <BookIcon {...iconProps} />;
      case "treasure":
        return <TreasureChestIcon {...iconProps} />;
      case "trophy":
        return <TrophyIcon {...iconProps} />;
      default:
        return <StarIcon {...iconProps} />;
    }
  };

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="relative flex flex-col items-center space-y-8">
        {nodes.map((node, index) => {
          const isUnlocked = node.index < unlockedCount;
          const isCurrent = node.index === unlockedCount - 1;
          const isNextUp = node.index === unlockedCount;
          const isLocked = node.index >= unlockedCount;

          // Snake pattern: alternate left and right, but center on mobile
          const isEven = node.index % 2 === 0;
          const horizontalOffset = isEven
            ? "translate-x-16"
            : "-translate-x-16";
          const mobileOffset = ""; // No offset on mobile

          return (
            <div
              key={node.index}
              className={`
                relative flex flex-col items-center
                ${horizontalOffset} md:${horizontalOffset}
                ${mobileOffset} md:${horizontalOffset}
                transition-all duration-500 ease-in-out
              `}
            >
              {/* START label for current lesson */}
              {isNextUp && (
                <div className="mb-3 bg-white border-2 border-slate-400 rounded-full px-4 py-2 shadow-md">
                  <span className="text-slate-600 font-semibold text-sm">
                    ابدأ
                  </span>
                </div>
              )}

              {/* Lesson node */}
              <div className="relative">
                <div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    transition-all duration-300 ease-in-out
                    shadow-lg border-4
                    ${
                      isUnlocked || isNextUp
                        ? "bg-gradient-to-b from-slate-500 to-slate-700 border-slate-600 shadow-slate-300"
                        : "bg-gray-200 border-gray-300 shadow-gray-200"
                    }
                    ${isNextUp ? "ring-4 ring-slate-200 ring-opacity-60" : ""}
                    ${isLocked ? "opacity-50" : "opacity-100"}
                    hover:scale-110 hover:shadow-xl hover:shadow-slate-400/50
                    ${
                      isUnlocked || isNextUp
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
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

              {/* Lesson number label */}
              <div className="mt-2 text-xs font-medium text-slate-500">
                {node.index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
