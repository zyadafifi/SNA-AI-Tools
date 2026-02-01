import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readingData } from "../../../config/readingData/readingData";
import { Loading } from "../../../components/Loading";

// ============================================
// ICONS COMPONENTS
// ============================================
const HeadphonesIcon = ({ active, size = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={size} fill="none">
    <path
      d="M4 12a8 8 0 0 1 16 0v7a2 2 0 0 1-2 2h-1v-7h3"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 12v7a2 2 0 0 0 2 2h1v-7H4"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MicIcon = ({ active, size = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={size} fill="none">
    <path
      d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 11a7 7 0 0 1-14 0"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18v3"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 21h8"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BookIcon = ({ active, size = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={size} fill="none">
    <path
      d="M4 19a2 2 0 0 0 2 2h14V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14Z"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M8 7h8M8 11h8"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PencilIcon = ({ active, size = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={size} fill="none">
    <path
      d="M12 20h9"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
      stroke={active ? "white" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ToolIcon = ({ category, active, size = "w-10 h-10" }) => {
  switch (category) {
    case "listening":
      return <HeadphonesIcon active={active} size={size} />;
    case "pronunciation":
      return <MicIcon active={active} size={size} />;
    case "reading":
      return <BookIcon active={active} size={size} />;
    case "writing":
      return <PencilIcon active={active} size={size} />;
    default:
      return <BookIcon active={active} size={size} />;
  }
};

// ============================================
// CURVED PATH SVG - Connects nodes with curves
// ============================================
const CurvedConnector = ({ from, to, isActive }) => {
  const curveOffset = (to.x - from.x) / 1;

  const path = `
    M ${from.x} ${from.y}
    C ${from.x + curveOffset} ${from.y + 20},
      ${to.x + curveOffset} ${to.y - 30},
      ${to.x} ${to.y}
  `;

  return (
    <path
      d={path}
      fill="none"
      stroke={isActive ? "var(--primary-color)" : "#E5E7EB"}
      strokeWidth={isActive ? "6" : "10"}
      strokeLinecap="round"
      style={{
        filter: isActive ? "drop-shadow(0px 6px 6px rgba(0,0,0,0.25))" : "none",
      }}
    />
  );
};

// ============================================
// HELPERS
// ============================================
const getCategoryNameArabic = (category) => {
  const names = {
    listening: "الاستماع",
    pronunciation: "النطق",
    reading: "القراءة",
    writing: "الكتابة",
  };
  return names[category] || category;
};

// ============================================
// LESSON NODE - Single circular node (3D)
// ============================================
const LessonNode = ({ node, position, onNodeClick }) => {
  const { isUnlocked, isCurrent, isClickable, linkTo } = node;

  const CircleContent = (
    <div className="relative" style={{ transformStyle: "preserve-3d" }}>
      {/* Outer ring for active node */}
      {isCurrent && (
        <div
          className="absolute inset-0 rounded-full border-4 border-[var(--primary-color)] animate-pulse"
          style={{
            width: "96px",
            height: "96px",
            left: "-8px",
            top: "-6px",
            transform: "translateZ(10px) rotateX(26.87deg)",
            boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Depth layer */}
      <div
        className="absolute rounded-full"
        style={{
          width: "80px",
          height: "80px",
          transform: "translateY(12px) rotateX(26.87deg) translateZ(-6px)",
          background: "rgba(0,0,0,0.18)",
          filter: "blur(2px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Main circle */}
      <div
        style={{
          transform: "rotateX(26.87deg) translateZ(8px)",
          boxShadow: `0px 10px 0px 0px ${
            isUnlocked || isCurrent ? "var(--secondary-color)" : "gray"
          }`,
          filter: isCurrent
            ? "drop-shadow(0px 14px 12px rgba(0,0,0,0.35))"
            : "none",
        }}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg relative z-10
          ${
            isUnlocked || isCurrent
              ? "bg-gradient-to-b from-yellow-400 to-orange-500 hover:scale-105 hover:-translate-y-1"
              : "bg-gray-300"
          }
        `}
      >
        <div className="relative z-10">
          {/* ✅ Dynamic icon by category */}
          <ToolIcon
            category={node.category}
            active={isUnlocked || isCurrent}
            size="w-10 h-10"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Current Label */}
      {isCurrent && (
        <div className="absolute -top-[74px] left-1/2 -translate-x-1/2 z-50">
  <div className="relative">
    <div
      className="
        flex items-center gap-2
        bg-white/80 backdrop-blur-md
        border border-white/60
        rounded-2xl px-4 py-2
        shadow-[0_16px_30px_rgba(0,0,0,0.18)]
        whitespace-nowrap
      "
    >
      {/* mini badge */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-b from-yellow-400 to-orange-500 shadow-md flex items-center justify-center">
        <span className="text-white text-xs font-black">GO</span>
      </div>

      <span className="arabic_font text-slate-800 font-extrabold text-sm">
        {node.category === "listening"
          ? `ابدأ الاستماع درس ${node.lessonNo}`
          : `ابدأ ${getCategoryNameArabic(node.category)} درس ${node.lessonNo}`}
      </span>
    </div>

    {/* glow line */}
    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-yellow-400/30 to-orange-500/30 blur-md -z-10" />

    {/* pointer */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-45 w-4 h-4 bg-white/80 border border-white/60 backdrop-blur-md" />
  </div>
</div>

      )}

      {/* ✅ Click behavior */}
      {isClickable && linkTo ? (
        <Link
          to={linkTo}
          className="block"
          onClick={() => onNodeClick?.(node)}
          aria-label={node.label}
        >
          {CircleContent}
        </Link>
      ) : (
        <div className="cursor-not-allowed opacity-90">{CircleContent}</div>
      )}
    </div>
  );
};

// ============================================
// ZIGZAG PATH UI COMPONENT (3D container)
// ============================================
const ZigzagPathUI = ({ nodes, onNodeClick = () => {} }) => {
  const calculatePositions = (nodes) => {
    const positions = [];
    const centerX = 210;
    const startY = 110;
    const verticalSpacing = 145;
    const horizontalOffset = 85;

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
    positions.length > 0 ? positions[positions.length - 1].y + 140 : 520;

  return (
    <div className="container relative w-full flex justify-center py-10 overflow-hidden">
      <div
        className="relative"
        style={{
          width: "420px",
          height: `${svgHeight}px`,
          perspective: "900px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* SVG Connectors */}
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
        {nodes.map((node) => (
          <LessonNode
            key={node.id}
            node={node}
            position={positions[node.index]}
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
const useProgressData = (lengths) => {
  const safeParse = (raw, fallback) => {
    try {
      return JSON.parse(raw ?? "");
    } catch {
      return fallback;
    }
  };

  // Pronounce: عدّ المفاتيح الرقمية فقط (1,2,3...) وتجاهل conversations/sentences...etc
  const countNumericCompleted = (obj) => {
    if (!obj || typeof obj !== "object") return 0;

    return Object.entries(obj).reduce((count, [key, value]) => {
      const isNumericKey = /^\d+$/.test(key);
      if (!isNumericKey) return count;

      const completed = !!value?.completed;
      return count + (completed ? 1 : 0);
    }, 0);
  };

  const getProgressFromLocalStorage = () => {
    try {
      // =======================
      // Listening Progress
      // =======================
      const listeningRaw = localStorage.getItem("sna-lesson-progress");
      const listeningArr = safeParse(listeningRaw, []);
      const listeningCompleted = Array.isArray(listeningArr)
        ? listeningArr.filter((lesson) => lesson?.isCompleted === true).length
        : 0;

      // =======================
      // Pronunciation Progress
      // =======================
      const pronounceRaw = localStorage.getItem("pronunciationMasterProgress");
      const pronounceObj = safeParse(pronounceRaw, {});
      const pronunciationCompleted = countNumericCompleted(pronounceObj);

      // =======================
      // Reading Progress
      // =======================
      const readingRaw = localStorage.getItem("quizProgress");
      const readingObj = safeParse(readingRaw, {});
      const readingCompleted =
        readingObj && typeof readingObj === "object"
          ? Object.values(readingObj).filter((lesson) => lesson?.completed === true)
              .length
          : 0;

      // =======================
      // Writing Progress
      // =======================
      const writingRaw = localStorage.getItem("sna-writing-tool-progress");
      const writingObj = safeParse(writingRaw, {});
      const writingCompleted =
        writingObj && typeof writingObj === "object"
          ? Object.values(writingObj).filter(
              (item) => item?.phase === "questions-completed"
            ).length
          : 0;

      console.log("📊 Progress Summary (from localStorage shapes):", {
        listening: `${listeningCompleted}/${lengths.listening}`,
        pronunciation: `${pronunciationCompleted}/${lengths.pronounce}`,
        reading: `${readingCompleted}/${lengths.reading}`,
        writing: `${writingCompleted}/${lengths.writing}`,
      });

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

// ============================================
// NEW LOGIC - Interleaved ordering
// ============================================
const CATEGORY_ORDER = ["listening", "pronunciation", "reading", "writing"];

/**
 * NOTE: بنمرر getPathByCategory كـ argument عشان تقدر تستخدم data جوه الـ component
 */
const buildInterleavedNodes = (lengths, completedCounts, getPathByCategory) => {
  const maxLen = Math.max(
    lengths.listening || 0,
    lengths.pronounce || 0,
    lengths.reading || 0,
    lengths.writing || 0
  );

  const lenByCat = {
    listening: lengths.listening || 0,
    pronunciation: lengths.pronounce || 0,
    reading: lengths.reading || 0,
    writing: lengths.writing || 0,
  };

  const doneByCat = {
    listening: completedCounts.listening || 0,
    pronunciation: completedCounts.pronunciation || 0,
    reading: completedCounts.reading || 0,
    writing: completedCounts.writing || 0,
  };

  // steps: L1,P1,R1,W1,L2,P2...
  const steps = [];
  for (let lessonNo = 1; lessonNo <= maxLen; lessonNo++) {
    for (const cat of CATEGORY_ORDER) {
      if (lessonNo <= (lenByCat[cat] || 0)) {
        steps.push({ category: cat, lessonNo });
      }
    }
  }

  // current = أول خطوة لسه مش مكتملة داخل قسمها
  let currentIndex = -1;
  for (let i = 0; i < steps.length; i++) {
    const { category, lessonNo } = steps[i];
    if (lessonNo > (doneByCat[category] || 0)) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex === -1) currentIndex = steps.length - 1;

  return steps.map((step, i) => {
    const isUnlocked = step.lessonNo <= (doneByCat[step.category] || 0);
    const isCurrent = i === currentIndex;
    const isClickable = isUnlocked || isCurrent;

    return {
      id: `${step.category}-${step.lessonNo}-${i}`,
      index: i,
      category: step.category,
      lessonNo: step.lessonNo,
      label: `${getCategoryNameArabic(step.category)} ${step.lessonNo}`,
      iconType: step.category, // ✅ (optional) category-based icon
      isUnlocked,
      isCurrent,
      isClickable,
      linkTo: isClickable ? getPathByCategory(step.category, step.lessonNo) : null,
      nextCategoryLabel: isCurrent ? getCategoryNameArabic(step.category) : null,
    };
  });
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

  const completedCounts = useProgressData(lengths);

  // ✅ getPathByCategory جوه الـ component عشان يشوف data
  const getPathByCategory = (category, lessonNo) => {
    switch (category) {
      case "listening":
        return `/listening/lesson/${lessonNo}`;

      case "pronunciation":
        return `/pronounce/lesson/${lessonNo}`;

      case "reading":
        return `/reading/show-lesson-first-round/${lessonNo}/1`;

      case "writing": {
        const writingId = data?.writing?.topics?.[lessonNo - 1]?.id;
        return writingId ? `/article/${writingId}` : `/article/${lessonNo}`;
      }

      default:
        return `/plan/slug/lesson-${lessonNo}`;
    }
  };

  const total = useMemo(() => {
    const maxLen = Math.max(
      lengths.listening || 0,
      lengths.pronounce || 0,
      lengths.reading || 0,
      lengths.writing || 0
    );

    let count = 0;
    for (let n = 1; n <= maxLen; n++) {
      if (n <= lengths.listening) count++;
      if (n <= lengths.pronounce) count++;
      if (n <= lengths.reading) count++;
      if (n <= lengths.writing) count++;
    }
    return count;
  }, [lengths]);

  const nodes = useMemo(() => {
    if (total === 0) return [];
    return buildInterleavedNodes(lengths, completedCounts, getPathByCategory);
  }, [total, lengths, completedCounts, data]);

  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);

  const handleNodeClick = (node) => {
    console.log("Node clicked:", node);
  };

  if (isLoading) return <Loading />;

  if (hasErrors) {
    return (
      <div className="mb-8 text-center py-8">
        <div className="text-red-600">Error loading data. Please try again.</div>
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
