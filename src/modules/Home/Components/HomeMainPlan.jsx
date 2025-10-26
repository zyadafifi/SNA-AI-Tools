import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readingData } from "../../../config/readingData/readingData";

// ============================================
// ICONS COMPONENTS
// ============================================
const StarIcon = ({ filled = false, size = "w-12 h-12" }) => (
  <svg viewBox="0 0 24 24" className={size}>
    <path
      d="M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.64L12 17.77 6.05 20.82l1.14-6.64L2.39 9.49l6.64-.97L12 2.5z"
      className={filled ? "fill-white" : "fill-gray-400"}
      stroke={filled ? "white" : "#D1D5DB"}
      strokeWidth={1.5}
    />
  </svg>
);

// ============================================
// CURVED PATH SVG - Connects nodes with curves
// ============================================
const CurvedConnector = ({ from, to, isActive }) => {
  const curveOffset = (to.x - from.x) / 2;

  const path = `
    M ${from.x} ${from.y}
    C ${from.x + curveOffset} ${from.y + 30},
      ${to.x - curveOffset} ${to.y - 30},
      ${to.x} ${to.y}
  `;

  return (
    <path
      d={path}
      fill="none"
      stroke="#E5E7EB"
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
};

// ============================================
// LESSON NODE - Single circular node
// ============================================
const LessonNode = ({ node, position, onNodeClick }) => {
  const { isUnlocked, isCurrent, nextCategoryLabel, isClickable, linkTo } =
    node;

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Next Label */}
      {isCurrent && nextCategoryLabel && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-white border-2 border-yellow-500 rounded-full px-4 py-2 shadow-lg whitespace-nowrap">
            <div className="text-center">
              <span className="text-orange-500 font-bold text-sm block">
                ابدأ
              </span>
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-yellow-500"></div>
        </div>
      )}

      {/* Node Circle */}
      <div className="relative">
        {/* Outer ring for active node */}
        {isCurrent && (
          <div
            className="absolute inset-0 rounded-full border-4 border-yellow-500 animate-pulse"
            style={{ width: "96px", height: "96px", left: "-8px", top: "-8px" }}
          ></div>
        )}

        {/* Main circle */}
        <div
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-lg relative
            ${
              isUnlocked || isCurrent
                ? "bg-gradient-to-b from-yellow-400 to-orange-500 cursor-pointer hover:scale-105"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
          onClick={() => isClickable && onNodeClick(node)}
        >
          {/* Icon */}
          <div className="relative z-10">
            <StarIcon filled={isUnlocked || isCurrent} size="w-10 h-10" />
          </div>
        </div>

        {/* Clickable Link Overlay */}
        {isClickable && linkTo && (
          <Link
            to={linkTo}
            className="absolute inset-0 rounded-full z-20"
            style={{ width: "80px", height: "80px" }}
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// ZIGZAG PATH UI COMPONENT
// ============================================
const ZigzagPathUI = ({ nodes, onNodeClick = () => {} }) => {
  const calculatePositions = (nodes) => {
    const positions = [];
    const centerX = 200;
    const startY = 100;
    const verticalSpacing = 140;
    const horizontalOffset = 80;

    nodes.forEach((node, index) => {
      let x = centerX;

      if (index % 2 === 1) {
        x = centerX - horizontalOffset;
      } else if (index > 0) {
        x = centerX + horizontalOffset;
      }

      positions.push({
        x,
        y: startY + index * verticalSpacing,
      });
    });

    return positions;
  };

  const positions = calculatePositions(nodes);
  const svgHeight =
    positions.length > 0 ? positions[positions.length - 1].y + 100 : 500;

  return (
    <div className="relative w-full flex justify-center py-8 overflow-hidden">
      <div
        className="relative"
        style={{ width: "400px", height: `${svgHeight}px` }}
      >
        {/* SVG for curved connectors */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {positions.map((pos, index) => {
            if (index === positions.length - 1) return null;
            const nextPos = positions[index + 1];

            return (
              <CurvedConnector
                key={`connector-${index}`}
                from={pos}
                to={nextPos}
                isActive={nodes[index].isUnlocked}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <LessonNode
            key={node.id}
            node={node}
            position={positions[index]}
            onNodeClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// DATA LOGIC - Progress tracking
// ============================================
const useProgressData = () => {
  const getProgressFromLocalStorage = () => {
    try {
      const listeningProgress = JSON.parse(
        localStorage.getItem("sna-lesson-progress") || "[]"
      );
      const listeningCompleted = listeningProgress.filter(
        (lesson) => lesson.isCompleted
      ).length;

      const pronunciationData = JSON.parse(
        localStorage.getItem("pronunciationMasterProgress") || "{}"
      );
      const pronunciationTopics = pronunciationData.topics || {};
      const pronunciationCompleted = Object.values(pronunciationTopics).filter(
        (topic) => topic.completed
      ).length;

      const readingProgress = JSON.parse(
        localStorage.getItem("quizProgress") || "{}"
      );
      const readingCompleted = Object.keys(readingProgress).length;
      console.log(Object.keys(readingProgress));
      
      const writingProgress = JSON.parse(
        localStorage.getItem("sna-writing-tool-progress") || "{}"
      );
      const writingCompleted = Object.values(writingProgress).filter(
        (item) => item.isUnlocked
      ).length;

      return {
        listening: listeningCompleted,
        pronunciation: pronunciationCompleted,
        reading: readingCompleted,
        writing: writingCompleted,
      };
    } catch (error) {
      console.error("Error reading progress from localStorage:", error);
      return {
        listening: 0,
        pronunciation: 0,
        reading: 0,
        writing: 0,
      };
    }
  };

  return getProgressFromLocalStorage();
};

const calculateNextStepLogic = (completedCounts, lengths) => {
  const minCompleted = Math.min(
    completedCounts.listening,
    completedCounts.pronunciation,
    completedCounts.reading,
    completedCounts.writing
  );

  const currentLesson = minCompleted + 1;

  const needsCompletion = {
    listening:
      completedCounts.listening < currentLesson &&
      currentLesson <= lengths.listening,
    pronunciation:
      completedCounts.pronunciation < currentLesson &&
      currentLesson <= lengths.pronounce,
    reading:
      completedCounts.reading < currentLesson &&
      currentLesson <= lengths.reading,
    writing:
      completedCounts.writing < currentLesson &&
      currentLesson <= lengths.writing,
  };

  let nextCategory = null;
  if (needsCompletion.listening) nextCategory = "listening";
  else if (needsCompletion.pronunciation) nextCategory = "pronunciation";
  else if (needsCompletion.reading) nextCategory = "reading";
  else if (needsCompletion.writing) nextCategory = "writing";

  const allCurrentCompleted = !Object.values(needsCompletion).some(Boolean);
  const nextNodeIndex = allCurrentCompleted ? minCompleted + 1 : minCompleted;

  return {
    currentLesson,
    minCompleted,
    needsCompletion,
    nextCategory,
    nextNodeIndex,
  };
};

const getCategoryNameArabic = (category) => {
  const names = {
    listening: "الاستماع",
    pronunciation: "النطق",
    reading: "القراءة",
    writing: "الكتابة",
  };
  return names[category] || category;
};

const createNodesFromData = (total, currentIndex, nextCategory) => {
  const nodes = [];

  for (let i = 0; i < total; i++) {
    const isUnlocked = i < currentIndex;
    const isCurrent = i === currentIndex;

    nodes.push({
      id: `lesson-${i}`,
      index: i,
      label: `Lesson ${i + 1}`,
      iconType: "star",
      isUnlocked,
      isCurrent,
      isClickable: isUnlocked || isCurrent,
      linkTo: isUnlocked || isCurrent ? `/plan/slug/lesson-${i + 1}` : null,
      nextCategoryLabel: isCurrent ? nextCategory : null,
    });
  }

  return nodes;
};

// ============================================
// MAIN COMPONENT
// ============================================
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

  const completedCounts = useProgressData();

  const nextStepInfo = useMemo(
    () => calculateNextStepLogic(completedCounts, lengths),
    [completedCounts, lengths]
  );


  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);
  const maxKey = useMemo(
    () =>
      Object.keys(lengths).reduce((a, b) => (lengths[a] > lengths[b] ? a : b)),
    [lengths]
  );
  const total = lengths[maxKey] || 0;

  const nodes = useMemo(() => {
    if (total === 0) return [];

    return createNodesFromData(
      total,
      nextStepInfo.nextNodeIndex,
      nextStepInfo.nextCategory
        ? getCategoryNameArabic(nextStepInfo.nextCategory)
        : null
    );
  }, [total, nextStepInfo]);

  const handleNodeClick = (node) => {
    console.log("Node clicked:", node);
  };

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

  return <ZigzagPathUI nodes={nodes} onNodeClick={handleNodeClick} />;
}
